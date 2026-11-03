/**
 * PortfolioHub — Supabase Client Module
 * Reads credentials from PORTFOLIOHUB_CONFIG (injected by js/config.js via a
 * regular <script> tag loaded BEFORE this ESM module).
 */

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const cfg = window.PORTFOLIOHUB_CONFIG;

if (!cfg || !cfg.supabaseUrl || !cfg.supabaseAnonKey || cfg.supabaseUrl.startsWith('YOUR_')) {
  throw new Error(
    '[PortfolioHub] Supabase is not configured. Load js/config.js (a classic <script>) ' +
    'before any module and set supabaseUrl / supabaseAnonKey.'
  );
}
const { supabaseUrl, supabaseAnonKey } = cfg;

/** Shared Supabase client instance */
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});

export default supabase;

/**
 * Signs the current user out and returns to the home page.
 */
export async function signOut(redirectTo = '/index.html') {
  const { error } = await supabase.auth.signOut();
  if (error) console.error('[PortfolioHub] signOut failed:', error);
  window.location.href = redirectTo;
}

/**
 * Returns the currently authenticated user object, or null if not signed in.
 * @returns {Promise<import('@supabase/supabase-js').User | null>}
 */
export async function getUser() {
  const { data, error } = await supabase.auth.getSession();
  if (error || !data.session) return null;
  return data.session.user;
}

/**
 * Ensures the visitor is authenticated. If not, redirects to the given path.
 * @param {string} [redirectPath='/login.html']
 * @returns {Promise<import('@supabase/supabase-js').User>} The authenticated user
 */
export async function requireAuth(redirectPath = 'login.html') {
  const user = await getUser();
  if (!user) {
    // Preserve the page the user was trying to reach so we can redirect back
    const returnTo = encodeURIComponent(window.location.pathname + window.location.search);
    window.location.href = `${redirectPath}?returnTo=${returnTo}`;
    // Return a never-resolving promise so code below requireAuth() doesn't run
    return new Promise(() => {});
  }
  return user;
}
