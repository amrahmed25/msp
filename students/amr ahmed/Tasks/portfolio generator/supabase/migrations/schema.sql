-- ============================================================
-- PortfolioHub — Complete Supabase PostgreSQL Schema
-- Run this entire file in the Supabase SQL Editor.
-- ============================================================

-- ============================================================
-- STORAGE BUCKETS
-- ============================================================
-- Create the following buckets manually in the Supabase Dashboard
-- under Storage → New Bucket, or via the Supabase CLI / API:
--
--  1. avatars
--     • Public read: YES
--     • Authenticated write: YES
--     • Max file size: 5 MB
--     • Allowed MIME types: image/*
--
--  2. covers
--     • Public read: YES
--     • Authenticated write: YES
--     • Max file size: 10 MB
--     • Allowed MIME types: image/*
--
--  3. project-images
--     • Public read: YES
--     • Authenticated write: YES
--     • Max file size: 10 MB
--     • Allowed MIME types: image/*
--
--  4. community-images
--     • Public read: YES
--     • Authenticated write: YES
--     • Max file size: 10 MB
--     • Allowed MIME types: image/*
-- ============================================================


-- ============================================================
-- EXTENSIONS
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "pgcrypto";


-- ============================================================
-- TABLE: profiles
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id            UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name     TEXT,
    username      TEXT        UNIQUE,
    title         TEXT,
    bio           TEXT,
    avatar_url    TEXT,
    cover_url     TEXT,
    location      TEXT,
    role          TEXT,
    website       TEXT,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.profiles IS 'Public user profile data. One row per auth.users row.';
COMMENT ON COLUMN public.profiles.username IS 'Used as the public portfolio slug / vanity URL segment.';
COMMENT ON COLUMN public.profiles.role IS 'Professional role descriptor, e.g. developer, designer, marketer.';


-- ============================================================
-- TABLE: portfolios
-- ============================================================
CREATE TABLE IF NOT EXISTS public.portfolios (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    template_id     TEXT        NOT NULL DEFAULT 'minimal',
    title           TEXT        NOT NULL,
    slug            TEXT        UNIQUE NOT NULL,
    is_published    BOOLEAN     NOT NULL DEFAULT FALSE,
    custom_domain   TEXT,
    theme_color     TEXT        NOT NULL DEFAULT '#2563EB',
    seo_title       TEXT,
    seo_description TEXT,
    view_count      INTEGER     NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.portfolios IS 'Portfolio instances owned by a user.';
COMMENT ON COLUMN public.portfolios.slug IS 'URL-safe unique identifier used in the public portfolio URL.';
COMMENT ON COLUMN public.portfolios.template_id IS 'References a front-end template key, e.g. minimal, creative, developer.';
COMMENT ON COLUMN public.portfolios.view_count IS 'Incremented via the increment_view_count() RPC; never decremented.';


-- ============================================================
-- TABLE: portfolio_projects
-- ============================================================
CREATE TABLE IF NOT EXISTS public.portfolio_projects (
    id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    portfolio_id UUID        NOT NULL REFERENCES public.portfolios(id) ON DELETE CASCADE,
    title        TEXT        NOT NULL,
    description  TEXT,
    image_url    TEXT,
    tech_tags    TEXT[]      NOT NULL DEFAULT '{}',
    github_url   TEXT,
    demo_url     TEXT,
    order_index  INTEGER     NOT NULL DEFAULT 0,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.portfolio_projects IS 'Projects showcased within a portfolio.';


-- ============================================================
-- TABLE: portfolio_services
-- ============================================================
CREATE TABLE IF NOT EXISTS public.portfolio_services (
    id           UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
    portfolio_id UUID           NOT NULL REFERENCES public.portfolios(id) ON DELETE CASCADE,
    name         TEXT           NOT NULL,
    description  TEXT,
    image_url    TEXT,
    icon         TEXT,
    price        DECIMAL(10, 2),
    price_label  TEXT,
    contact_url  TEXT,
    order_index  INTEGER        NOT NULL DEFAULT 0,
    created_at   TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.portfolio_services IS 'Services offered by the portfolio owner.';
COMMENT ON COLUMN public.portfolio_services.price_label IS 'Human-readable price prefix, e.g. "Starting at", "Per hour".';


-- ============================================================
-- TABLE: portfolio_skills
-- ============================================================
CREATE TABLE IF NOT EXISTS public.portfolio_skills (
    id           UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
    portfolio_id UUID    NOT NULL REFERENCES public.portfolios(id) ON DELETE CASCADE,
    name         TEXT    NOT NULL,
    level        INTEGER NOT NULL DEFAULT 80 CHECK (level >= 0 AND level <= 100),
    category     TEXT    NOT NULL DEFAULT 'General',
    order_index  INTEGER NOT NULL DEFAULT 0
);

COMMENT ON TABLE public.portfolio_skills IS 'Skills and proficiency levels for a portfolio.';
COMMENT ON COLUMN public.portfolio_skills.level IS 'Proficiency percentage 0–100.';


-- ============================================================
-- TABLE: portfolio_experience
-- ============================================================
CREATE TABLE IF NOT EXISTS public.portfolio_experience (
    id           UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
    portfolio_id UUID    NOT NULL REFERENCES public.portfolios(id) ON DELETE CASCADE,
    job_title    TEXT    NOT NULL,
    company      TEXT    NOT NULL,
    start_date   DATE,
    end_date     DATE,
    is_current   BOOLEAN NOT NULL DEFAULT FALSE,
    description  TEXT,
    location     TEXT,
    order_index  INTEGER NOT NULL DEFAULT 0
);

COMMENT ON TABLE public.portfolio_experience IS 'Work experience entries for a portfolio.';


-- ============================================================
-- TABLE: portfolio_education
-- ============================================================
CREATE TABLE IF NOT EXISTS public.portfolio_education (
    id             UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
    portfolio_id   UUID    NOT NULL REFERENCES public.portfolios(id) ON DELETE CASCADE,
    degree         TEXT    NOT NULL,
    institution    TEXT    NOT NULL,
    field_of_study TEXT,
    start_year     INTEGER,
    end_year       INTEGER,
    description    TEXT,
    order_index    INTEGER NOT NULL DEFAULT 0
);

COMMENT ON TABLE public.portfolio_education IS 'Education history entries for a portfolio.';


-- ============================================================
-- TABLE: portfolio_certifications
-- ============================================================
CREATE TABLE IF NOT EXISTS public.portfolio_certifications (
    id             UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
    portfolio_id   UUID    NOT NULL REFERENCES public.portfolios(id) ON DELETE CASCADE,
    name           TEXT    NOT NULL,
    issuer         TEXT,
    issue_date     DATE,
    expiry_date    DATE,
    credential_url TEXT,
    order_index    INTEGER NOT NULL DEFAULT 0
);

COMMENT ON TABLE public.portfolio_certifications IS 'Professional certifications for a portfolio.';


-- ============================================================
-- TABLE: portfolio_links
-- ============================================================
CREATE TABLE IF NOT EXISTS public.portfolio_links (
    id           UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
    portfolio_id UUID    NOT NULL REFERENCES public.portfolios(id) ON DELETE CASCADE,
    platform     TEXT    NOT NULL,
    url          TEXT    NOT NULL,
    label        TEXT,
    icon         TEXT,
    order_index  INTEGER NOT NULL DEFAULT 0,
    is_hidden    BOOLEAN NOT NULL DEFAULT FALSE
);

COMMENT ON TABLE public.portfolio_links IS 'Social / external links attached to a portfolio.';
COMMENT ON COLUMN public.portfolio_links.platform IS 'Platform key, e.g. linkedin, github, twitter, dribbble.';


-- ============================================================
-- TABLE: community_posts
-- ============================================================
CREATE TABLE IF NOT EXISTS public.community_posts (
    id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id      UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    portfolio_id UUID        REFERENCES public.portfolios(id) ON DELETE SET NULL,
    content      TEXT        NOT NULL,
    image_url    TEXT,
    category     TEXT        NOT NULL DEFAULT 'Other',
    tags         TEXT[]      NOT NULL DEFAULT '{}',
    is_published BOOLEAN     NOT NULL DEFAULT TRUE,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.community_posts IS 'Community feed posts created by users.';
COMMENT ON COLUMN public.community_posts.portfolio_id IS 'Optional link to a portfolio being showcased in the post.';


-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_portfolios_user_id          ON public.portfolios(user_id);
CREATE INDEX IF NOT EXISTS idx_portfolios_slug             ON public.portfolios(slug);
CREATE INDEX IF NOT EXISTS idx_portfolios_is_published     ON public.portfolios(is_published);

CREATE INDEX IF NOT EXISTS idx_portfolio_projects_pid      ON public.portfolio_projects(portfolio_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_services_pid      ON public.portfolio_services(portfolio_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_skills_pid        ON public.portfolio_skills(portfolio_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_experience_pid    ON public.portfolio_experience(portfolio_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_education_pid     ON public.portfolio_education(portfolio_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_certifications_pid ON public.portfolio_certifications(portfolio_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_links_pid         ON public.portfolio_links(portfolio_id);

CREATE INDEX IF NOT EXISTS idx_community_posts_user_id     ON public.community_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_community_posts_category    ON public.community_posts(category);
CREATE INDEX IF NOT EXISTS idx_community_posts_created_at  ON public.community_posts(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_profiles_username           ON public.profiles(username);


-- ============================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================

-- ------------------------------------------------------------
-- 1. handle_new_user()
--    Creates a profiles row whenever a new user signs up.
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    _username TEXT;
BEGIN
    -- Derive a base username from the part of the email before the @
    _username := split_part(NEW.email, '@', 1);

    -- Remove characters that are not alphanumeric, underscores, or hyphens
    _username := regexp_replace(_username, '[^a-zA-Z0-9_\-]', '', 'g');

    -- Ensure uniqueness by appending a short random suffix if the username is taken
    WHILE EXISTS (SELECT 1 FROM public.profiles WHERE username = _username) LOOP
        _username := split_part(NEW.email, '@', 1)
                     || '_'
                     || substr(replace(gen_random_uuid()::TEXT, '-', ''), 1, 6);
        _username := regexp_replace(_username, '[^a-zA-Z0-9_\-]', '', 'g');
    END LOOP;

    INSERT INTO public.profiles (id, full_name, username, created_at, updated_at)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
        _username,
        NOW(),
        NOW()
    );

    RETURN NEW;
END;
$$;

-- Drop trigger if it already exists so this migration is idempotent
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();


-- ------------------------------------------------------------
-- 2. update_updated_at()
--    Stamps updated_at with NOW() on every UPDATE.
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at := NOW();
    RETURN NEW;
END;
$$;

-- Apply to: profiles
DROP TRIGGER IF EXISTS trg_profiles_updated_at ON public.profiles;
CREATE TRIGGER trg_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at();

-- Apply to: portfolios
DROP TRIGGER IF EXISTS trg_portfolios_updated_at ON public.portfolios;
CREATE TRIGGER trg_portfolios_updated_at
    BEFORE UPDATE ON public.portfolios
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at();

-- Apply to: portfolio_projects
DROP TRIGGER IF EXISTS trg_portfolio_projects_updated_at ON public.portfolio_projects;
CREATE TRIGGER trg_portfolio_projects_updated_at
    BEFORE UPDATE ON public.portfolio_projects
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at();

-- Apply to: portfolio_services
DROP TRIGGER IF EXISTS trg_portfolio_services_updated_at ON public.portfolio_services;
CREATE TRIGGER trg_portfolio_services_updated_at
    BEFORE UPDATE ON public.portfolio_services
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at();

-- Apply to: community_posts
DROP TRIGGER IF EXISTS trg_community_posts_updated_at ON public.community_posts;
CREATE TRIGGER trg_community_posts_updated_at
    BEFORE UPDATE ON public.community_posts
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at();


-- ------------------------------------------------------------
-- 3. increment_view_count(portfolio_slug TEXT)
--    RPC callable by anonymous / authenticated roles.
--    Safely increments view_count for a published portfolio.
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.increment_view_count(portfolio_slug TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    UPDATE public.portfolios
    SET    view_count = view_count + 1
    WHERE  slug        = portfolio_slug
      AND  is_published = TRUE;
END;
$$;

-- Grant execute to all roles so public visitors can call it via RPC
GRANT EXECUTE ON FUNCTION public.increment_view_count(TEXT) TO anon, authenticated;


-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

-- ---- profiles -----------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Public can read all profiles (for portfolio discovery)
CREATE POLICY "profiles_select_public"
    ON public.profiles
    FOR SELECT
    USING (TRUE);

-- Authenticated users may only insert their own profile row
CREATE POLICY "profiles_insert_own"
    ON public.profiles
    FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Authenticated users may only update their own profile row
CREATE POLICY "profiles_update_own"
    ON public.profiles
    FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);


-- ---- portfolios ---------------------------------------------
ALTER TABLE public.portfolios ENABLE ROW LEVEL SECURITY;

-- Authenticated users see all of their own portfolios;
-- everyone else (anon + authenticated) can see published ones.
CREATE POLICY "portfolios_select"
    ON public.portfolios
    FOR SELECT
    USING (
        is_published = TRUE
        OR auth.uid() = user_id
    );

-- Authenticated users may create portfolios for themselves only
CREATE POLICY "portfolios_insert_own"
    ON public.portfolios
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Owners may update their own portfolios
CREATE POLICY "portfolios_update_own"
    ON public.portfolios
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Owners may delete their own portfolios
CREATE POLICY "portfolios_delete_own"
    ON public.portfolios
    FOR DELETE
    USING (auth.uid() = user_id);


-- ---- portfolio_projects -------------------------------------
ALTER TABLE public.portfolio_projects ENABLE ROW LEVEL SECURITY;

-- Public can read projects in published portfolios; owners can read all
CREATE POLICY "portfolio_projects_select"
    ON public.portfolio_projects
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.portfolios p
            WHERE p.id = portfolio_projects.portfolio_id
              AND (p.is_published = TRUE OR p.user_id = auth.uid())
        )
    );

-- Only portfolio owner may insert
CREATE POLICY "portfolio_projects_insert_own"
    ON public.portfolio_projects
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.portfolios p
            WHERE p.id = portfolio_projects.portfolio_id
              AND p.user_id = auth.uid()
        )
    );

-- Only portfolio owner may update
CREATE POLICY "portfolio_projects_update_own"
    ON public.portfolio_projects
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.portfolios p
            WHERE p.id = portfolio_projects.portfolio_id
              AND p.user_id = auth.uid()
        )
    );

-- Only portfolio owner may delete
CREATE POLICY "portfolio_projects_delete_own"
    ON public.portfolio_projects
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.portfolios p
            WHERE p.id = portfolio_projects.portfolio_id
              AND p.user_id = auth.uid()
        )
    );


-- ---- portfolio_services -------------------------------------
ALTER TABLE public.portfolio_services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "portfolio_services_select"
    ON public.portfolio_services
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.portfolios p
            WHERE p.id = portfolio_services.portfolio_id
              AND (p.is_published = TRUE OR p.user_id = auth.uid())
        )
    );

CREATE POLICY "portfolio_services_insert_own"
    ON public.portfolio_services
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.portfolios p
            WHERE p.id = portfolio_services.portfolio_id
              AND p.user_id = auth.uid()
        )
    );

CREATE POLICY "portfolio_services_update_own"
    ON public.portfolio_services
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.portfolios p
            WHERE p.id = portfolio_services.portfolio_id
              AND p.user_id = auth.uid()
        )
    );

CREATE POLICY "portfolio_services_delete_own"
    ON public.portfolio_services
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.portfolios p
            WHERE p.id = portfolio_services.portfolio_id
              AND p.user_id = auth.uid()
        )
    );


-- ---- portfolio_skills ---------------------------------------
ALTER TABLE public.portfolio_skills ENABLE ROW LEVEL SECURITY;

CREATE POLICY "portfolio_skills_select"
    ON public.portfolio_skills
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.portfolios p
            WHERE p.id = portfolio_skills.portfolio_id
              AND (p.is_published = TRUE OR p.user_id = auth.uid())
        )
    );

CREATE POLICY "portfolio_skills_insert_own"
    ON public.portfolio_skills
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.portfolios p
            WHERE p.id = portfolio_skills.portfolio_id
              AND p.user_id = auth.uid()
        )
    );

CREATE POLICY "portfolio_skills_update_own"
    ON public.portfolio_skills
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.portfolios p
            WHERE p.id = portfolio_skills.portfolio_id
              AND p.user_id = auth.uid()
        )
    );

CREATE POLICY "portfolio_skills_delete_own"
    ON public.portfolio_skills
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.portfolios p
            WHERE p.id = portfolio_skills.portfolio_id
              AND p.user_id = auth.uid()
        )
    );


-- ---- portfolio_experience -----------------------------------
ALTER TABLE public.portfolio_experience ENABLE ROW LEVEL SECURITY;

CREATE POLICY "portfolio_experience_select"
    ON public.portfolio_experience
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.portfolios p
            WHERE p.id = portfolio_experience.portfolio_id
              AND (p.is_published = TRUE OR p.user_id = auth.uid())
        )
    );

CREATE POLICY "portfolio_experience_insert_own"
    ON public.portfolio_experience
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.portfolios p
            WHERE p.id = portfolio_experience.portfolio_id
              AND p.user_id = auth.uid()
        )
    );

CREATE POLICY "portfolio_experience_update_own"
    ON public.portfolio_experience
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.portfolios p
            WHERE p.id = portfolio_experience.portfolio_id
              AND p.user_id = auth.uid()
        )
    );

CREATE POLICY "portfolio_experience_delete_own"
    ON public.portfolio_experience
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.portfolios p
            WHERE p.id = portfolio_experience.portfolio_id
              AND p.user_id = auth.uid()
        )
    );


-- ---- portfolio_education ------------------------------------
ALTER TABLE public.portfolio_education ENABLE ROW LEVEL SECURITY;

CREATE POLICY "portfolio_education_select"
    ON public.portfolio_education
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.portfolios p
            WHERE p.id = portfolio_education.portfolio_id
              AND (p.is_published = TRUE OR p.user_id = auth.uid())
        )
    );

CREATE POLICY "portfolio_education_insert_own"
    ON public.portfolio_education
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.portfolios p
            WHERE p.id = portfolio_education.portfolio_id
              AND p.user_id = auth.uid()
        )
    );

CREATE POLICY "portfolio_education_update_own"
    ON public.portfolio_education
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.portfolios p
            WHERE p.id = portfolio_education.portfolio_id
              AND p.user_id = auth.uid()
        )
    );

CREATE POLICY "portfolio_education_delete_own"
    ON public.portfolio_education
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.portfolios p
            WHERE p.id = portfolio_education.portfolio_id
              AND p.user_id = auth.uid()
        )
    );


-- ---- portfolio_certifications --------------------------------
ALTER TABLE public.portfolio_certifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "portfolio_certifications_select"
    ON public.portfolio_certifications
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.portfolios p
            WHERE p.id = portfolio_certifications.portfolio_id
              AND (p.is_published = TRUE OR p.user_id = auth.uid())
        )
    );

CREATE POLICY "portfolio_certifications_insert_own"
    ON public.portfolio_certifications
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.portfolios p
            WHERE p.id = portfolio_certifications.portfolio_id
              AND p.user_id = auth.uid()
        )
    );

CREATE POLICY "portfolio_certifications_update_own"
    ON public.portfolio_certifications
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.portfolios p
            WHERE p.id = portfolio_certifications.portfolio_id
              AND p.user_id = auth.uid()
        )
    );

CREATE POLICY "portfolio_certifications_delete_own"
    ON public.portfolio_certifications
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.portfolios p
            WHERE p.id = portfolio_certifications.portfolio_id
              AND p.user_id = auth.uid()
        )
    );


-- ---- portfolio_links ----------------------------------------
ALTER TABLE public.portfolio_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "portfolio_links_select"
    ON public.portfolio_links
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.portfolios p
            WHERE p.id = portfolio_links.portfolio_id
              AND (p.is_published = TRUE OR p.user_id = auth.uid())
        )
    );

CREATE POLICY "portfolio_links_insert_own"
    ON public.portfolio_links
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.portfolios p
            WHERE p.id = portfolio_links.portfolio_id
              AND p.user_id = auth.uid()
        )
    );

CREATE POLICY "portfolio_links_update_own"
    ON public.portfolio_links
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.portfolios p
            WHERE p.id = portfolio_links.portfolio_id
              AND p.user_id = auth.uid()
        )
    );

CREATE POLICY "portfolio_links_delete_own"
    ON public.portfolio_links
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.portfolios p
            WHERE p.id = portfolio_links.portfolio_id
              AND p.user_id = auth.uid()
        )
    );


-- ---- community_posts ----------------------------------------
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;

-- Anyone can read published posts
CREATE POLICY "community_posts_select_public"
    ON public.community_posts
    FOR SELECT
    USING (is_published = TRUE OR auth.uid() = user_id);

-- Authenticated users can create posts for themselves
CREATE POLICY "community_posts_insert_own"
    ON public.community_posts
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Authors can update their own posts
CREATE POLICY "community_posts_update_own"
    ON public.community_posts
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Authors can delete their own posts
CREATE POLICY "community_posts_delete_own"
    ON public.community_posts
    FOR DELETE
    USING (auth.uid() = user_id);


-- ============================================================
-- END OF SCHEMA
-- ============================================================
