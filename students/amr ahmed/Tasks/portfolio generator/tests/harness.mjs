import { JSDOM } from 'jsdom';
import esbuild from 'esbuild';
import fs from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';
const HERE = path.dirname(fileURLToPath(import.meta.url));
export const ROOT = path.resolve(HERE, '..');
const mockPlugin = { name: 'mock', setup(b) { b.onResolve({ filter: /supabase-client\.js$/ }, () => ({ path: path.join(HERE, 'mock-supabase.js') })); } };

/** Bundles a page module for the test browser, replacing the Supabase client with the in-memory mock. */
export async function bundle(entry) {
  const r = await esbuild.build({ entryPoints: [`${ROOT}/${entry}`], bundle: true, write: false, format: 'iife', logLevel: 'silent', plugins: [mockPlugin] });
  return r.outputFiles[0].text;
}

/** Same, but also calls an exported function (what the page's inline bootstrap would do). */
export async function bundleCall(entry, fn) {
  const r = await esbuild.build({
    stdin: { contents: `import * as m from './${entry}'; window.__mod = Promise.resolve(m); m.${fn}();`, resolveDir: ROOT, loader: 'js' },
    bundle: true, write: false, format: 'iife', logLevel: 'silent', plugins: [mockPlugin]
  });
  return r.outputFiles[0].text;
}
export function seed() {
  const now = new Date().toISOString();
  return {
    profiles: [{ id: 'U1', full_name: '', username: 'u1' }, { id: 'U2', full_name: 'Other', username: 'u2' }],
    portfolios: [
      { id: 'P1', user_id: 'U1', title: 'My Portfolio', slug: 'u1abc-demo-x1y2', template_id: 'reference', is_published: false, theme_color: '#2563EB', view_count: 0, sections: {}, created_at: now },
      { id: 'P2', user_id: 'U2', title: 'Other', slug: 'taken', template_id: 'reference', is_published: true, theme_color: '#2563EB', view_count: 0, sections: {}, created_at: now }
    ],
    portfolio_projects: [], portfolio_services: [], portfolio_skills: [], portfolio_experience: [],
    portfolio_education: [], portfolio_certifications: [], portfolio_links: [], community_posts: []
  };
}
export async function openPage(file, query, db, user, code, pathOverride) {
  let html = fs.readFileSync(`${ROOT}/${file}`, 'utf8')
    .replace(/<script[^>]*src="js\/[^"]*"[^>]*><\/script>/g, '')
    .replace(/<script src="https:[^>]*><\/script>/g, '');
  const dom = new JSDOM(html, { url: `http://localhost:8080${pathOverride || '/' + file}${query}`, runScripts: 'outside-only', pretendToBeVisual: true });
  const w = dom.window;
  w.__MOCKDB__ = db; w.__MOCKUSER__ = user; w.confirm = () => true;
  w.PORTFOLIOHUB_CONFIG = { supabaseUrl: 'https://x.supabase.co', supabaseAnonKey: 'k' };
  const errors = [];
  w.addEventListener('error', e => errors.push(String(e.message)));
  w.console.error = (...a) => errors.push(a.map(String).join(' '));
  w.eval(code);
  return { dom, w, doc: w.document, errors };
}
export const sleep = ms => new Promise(r => setTimeout(r, ms));
export function type(w, el, value) { el.value = value; el.dispatchEvent(new w.Event('input', { bubbles: true })); }
export function click(w, el) { el.dispatchEvent(new w.MouseEvent('click', { bubbles: true })); }
