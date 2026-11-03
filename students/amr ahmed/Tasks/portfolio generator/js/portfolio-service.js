/**
 * portfolio-service.js
 * Shared data operations used by more than one page.
 */
import supabase from './supabase-client.js';
import { resolveTemplateId } from './portfolio-renderer.js';

function slugBase(title) {
  const base = String(title || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40);
  return base || 'portfolio'; // titles in non-Latin scripts reduce to an empty string
}

/**
 * Creates a portfolio for `user` and returns its id.
 * Retries with a fresh random suffix if the generated slug collides.
 * Throws on any other failure so callers can show a message.
 */
export async function createPortfolio({ user, title, templateId }) {
  const cleanTitle = String(title || '').trim();
  if (!user) throw new Error('You must be signed in.');
  if (!cleanTitle) throw new Error('Please enter a portfolio title.');

  const template = resolveTemplateId(templateId);
  let lastError = null;
  for (let attempt = 0; attempt < 3; attempt++) {
    const slug = `${user.id.slice(0, 6).toLowerCase()}-${slugBase(cleanTitle)}-${Math.random().toString(36).slice(2, 6)}`;
    const { data, error } = await supabase
      .from('portfolios')
      .insert({ user_id: user.id, title: cleanTitle, slug, template_id: template, is_published: false })
      .select('id')
      .single();
    if (!error) return data.id;
    lastError = error;
    if (error.code !== '23505') break; // only slug collisions are worth retrying
  }
  throw lastError;
}

/**
 * Public URL for a published portfolio.
 * Clean /u/<slug> URLs need the rewrite rules in vercel.json or _redirects, which
 * local servers and GitHub Pages do not have, so those get the query-string form.
 */
export function publicUrl(slug) {
  const { origin, hostname, pathname } = window.location;
  const noRewrite = /^(localhost|127\.|\[::1\])/.test(hostname) || hostname.endsWith('.github.io');
  if (!noRewrite) return `${origin}/u/${encodeURIComponent(slug)}`;
  const dir = pathname.replace(/[^/]*$/, '');
  return `${origin}${dir}public-portfolio.html?u=${encodeURIComponent(slug)}`;
}
