-- ============================================================
-- PortfolioHub — Migration 002
-- Run AFTER schema.sql, in the Supabase SQL Editor.
-- Additive and idempotent: safe to run more than once, drops no tables
-- and deletes no data.
-- ============================================================

-- ------------------------------------------------------------
-- 1. Portfolio content columns used by the builder and templates
-- ------------------------------------------------------------
ALTER TABLE public.portfolios ADD COLUMN IF NOT EXISTS headline      TEXT;
ALTER TABLE public.portfolios ADD COLUMN IF NOT EXISTS about         TEXT;
ALTER TABLE public.portfolios ADD COLUMN IF NOT EXISTS cover_url     TEXT;
ALTER TABLE public.portfolios ADD COLUMN IF NOT EXISTS contact_email TEXT;
ALTER TABLE public.portfolios ADD COLUMN IF NOT EXISTS whatsapp      TEXT;
-- Which sections the owner wants visible, e.g. {"skills":true,"services":false}.
-- A missing key means "visible".
ALTER TABLE public.portfolios ADD COLUMN IF NOT EXISTS sections      JSONB NOT NULL DEFAULT '{}'::jsonb;

-- New default template. Existing rows keep their stored value; the front end
-- maps unknown ids (e.g. 'minimal') to the reference template.
ALTER TABLE public.portfolios ALTER COLUMN template_id SET DEFAULT 'reference';

-- Slug format guard (lowercase letters, digits, hyphens). NOT VALID so
-- existing rows are not rechecked or rejected.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'portfolios_slug_format') THEN
    ALTER TABLE public.portfolios
      ADD CONSTRAINT portfolios_slug_format CHECK (slug ~ '^[a-z0-9][a-z0-9-]{1,59}$') NOT VALID;
  END IF;
END $$;

-- ------------------------------------------------------------
-- 2. community_posts -> profiles relationship
--    community_posts.user_id points at auth.users, which PostgREST
--    cannot embed. A second FK to profiles(id) lets the client select
--    `profiles(full_name, title, avatar_url)` in one query.
-- ------------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'community_posts_user_id_profiles_fkey') THEN
    ALTER TABLE public.community_posts
      ADD CONSTRAINT community_posts_user_id_profiles_fkey
      FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Same for portfolios -> profiles (explore page embeds profiles).
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'portfolios_user_id_profiles_fkey') THEN
    ALTER TABLE public.portfolios
      ADD CONSTRAINT portfolios_user_id_profiles_fkey
      FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Backfill: any auth user without a profile row (signup happened before the
-- trigger existed) gets one. Does nothing for users who already have a profile.
INSERT INTO public.profiles (id, full_name, username)
SELECT u.id,
       COALESCE(u.raw_user_meta_data->>'full_name', ''),
       regexp_replace(split_part(u.email, '@', 1), '[^a-zA-Z0-9_\-]', '', 'g')
         || '_' || substr(replace(gen_random_uuid()::text, '-', ''), 1, 6)
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
WHERE p.id IS NULL
ON CONFLICT DO NOTHING;

CREATE INDEX IF NOT EXISTS idx_community_posts_portfolio_id ON public.community_posts(portfolio_id);

-- ------------------------------------------------------------
-- 3. Row Level Security: make the policies re-runnable and tighten them
-- ------------------------------------------------------------
-- 3a. Child tables: anonymous visitors may read children of PUBLISHED
--     portfolios only. The original policies already do this; we re-create the
--     links policy so hidden links never leak to visitors.
DROP POLICY IF EXISTS "portfolio_links_select" ON public.portfolio_links;
CREATE POLICY "portfolio_links_select"
  ON public.portfolio_links FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.portfolios p
      WHERE p.id = portfolio_links.portfolio_id
        AND (
          (p.is_published = TRUE AND portfolio_links.is_hidden = FALSE)
          OR p.user_id = auth.uid()
        )
    )
  );

-- 3b. A post may only point at a portfolio the author owns.
DROP POLICY IF EXISTS "community_posts_insert_own" ON public.community_posts;
CREATE POLICY "community_posts_insert_own"
  ON public.community_posts FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND (
      portfolio_id IS NULL
      OR EXISTS (SELECT 1 FROM public.portfolios p WHERE p.id = portfolio_id AND p.user_id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "community_posts_update_own" ON public.community_posts;
CREATE POLICY "community_posts_update_own"
  ON public.community_posts FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id
    AND (
      portfolio_id IS NULL
      OR EXISTS (SELECT 1 FROM public.portfolios p WHERE p.id = portfolio_id AND p.user_id = auth.uid())
    )
  );

-- 3c. Stop owners from changing ownership or the stored view counter
--     through a plain UPDATE on portfolios.
CREATE OR REPLACE FUNCTION public.protect_portfolio_columns()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.user_id IS DISTINCT FROM OLD.user_id THEN
    RAISE EXCEPTION 'portfolio owner cannot be changed';
  END IF;
  IF NEW.view_count IS DISTINCT FROM OLD.view_count AND auth.uid() IS NOT NULL THEN
    NEW.view_count := OLD.view_count;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_protect_portfolio_columns ON public.portfolios;
CREATE TRIGGER trg_protect_portfolio_columns
  BEFORE UPDATE ON public.portfolios
  FOR EACH ROW EXECUTE FUNCTION public.protect_portfolio_columns();

-- ------------------------------------------------------------
-- 4. Storage buckets and policies
--    Public read (these images are meant to be public), writes limited to
--    the owner's own folder: <user_id>/<filename>.
-- ------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) VALUES
  ('avatars',          'avatars',          TRUE,  5242880,  ARRAY['image/jpeg','image/png','image/webp','image/gif']),
  ('covers',           'covers',           TRUE,  10485760, ARRAY['image/jpeg','image/png','image/webp','image/gif']),
  ('project-images',   'project-images',   TRUE,  10485760, ARRAY['image/jpeg','image/png','image/webp','image/gif']),
  ('community-images', 'community-images', TRUE,  10485760, ARRAY['image/jpeg','image/png','image/webp','image/gif'])
ON CONFLICT (id) DO UPDATE
  SET public             = EXCLUDED.public,
      file_size_limit    = EXCLUDED.file_size_limit,
      allowed_mime_types = EXCLUDED.allowed_mime_types;

DO $$
DECLARE
  b TEXT;
BEGIN
  FOREACH b IN ARRAY ARRAY['avatars','covers','project-images','community-images'] LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON storage.objects', b || '_public_read');
    EXECUTE format('DROP POLICY IF EXISTS %I ON storage.objects', b || '_owner_insert');
    EXECUTE format('DROP POLICY IF EXISTS %I ON storage.objects', b || '_owner_update');
    EXECUTE format('DROP POLICY IF EXISTS %I ON storage.objects', b || '_owner_delete');

    EXECUTE format($f$CREATE POLICY %I ON storage.objects FOR SELECT
                      USING (bucket_id = %L)$f$, b || '_public_read', b);
    EXECUTE format($f$CREATE POLICY %I ON storage.objects FOR INSERT TO authenticated
                      WITH CHECK (bucket_id = %L AND (storage.foldername(name))[1] = auth.uid()::text)$f$,
                   b || '_owner_insert', b);
    EXECUTE format($f$CREATE POLICY %I ON storage.objects FOR UPDATE TO authenticated
                      USING (bucket_id = %L AND (storage.foldername(name))[1] = auth.uid()::text)$f$,
                   b || '_owner_update', b);
    EXECUTE format($f$CREATE POLICY %I ON storage.objects FOR DELETE TO authenticated
                      USING (bucket_id = %L AND (storage.foldername(name))[1] = auth.uid()::text)$f$,
                   b || '_owner_delete', b);
  END LOOP;
END $$;

-- ============================================================
-- END OF MIGRATION 002
-- ============================================================
