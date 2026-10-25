/**
 * public-portfolio.js
 * Public page for a published portfolio. Looks the portfolio up by slug,
 * renders it with the same renderer the builder preview uses, and wires the
 * share bar. Works for both /u/<slug> (rewritten) and public-portfolio.html?u=<slug>.
 */
import supabase from './supabase-client.js';
import { showToast, copyToClipboard } from './utils.js';
import { normalizeData, buildDocument } from './portfolio-renderer.js';

const $ = sel => document.querySelector(sel);
const STATES = ['state-not-found', 'state-not-published', 'state-error'];

const CHILD_TABLES = {
  projects: 'portfolio_projects', services: 'portfolio_services', skills: 'portfolio_skills',
  experience: 'portfolio_experience', education: 'portfolio_education',
  certifications: 'portfolio_certifications', links: 'portfolio_links'
};

function readSlug() {
  const m = window.location.pathname.match(/\/u\/([^/]+)\/?$/);
  const raw = m ? decodeURIComponent(m[1]) : new URLSearchParams(window.location.search).get('u') || '';
  return raw.trim().toLowerCase();
}

function showState(id) {
  $('#portfolio-container').style.display = 'none';
  STATES.forEach(s => document.getElementById(s).classList.toggle('visible', s === id));
}

function hideLoading() {
  const overlay = $('#loading-overlay');
  if (!overlay) return;
  overlay.classList.add('hidden');
  setTimeout(() => overlay.remove(), 450);
}

function setMeta(name, content) {
  let el = document.querySelector(`meta[name="${name}"], meta[property="${name}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(name.startsWith('og:') ? 'property' : 'name', name);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function applyMeta(model, avatar) {
  document.title = `${model.seoTitle} | PortfolioHub`;
  setMeta('description', model.seoDescription || `${model.name}'s portfolio on PortfolioHub.`);
  setMeta('og:title', model.seoTitle);
  setMeta('og:description', model.seoDescription || `Explore ${model.name}'s portfolio.`);
  if (avatar) setMeta('og:image', avatar);
}

function renderFrame(model) {
  const container = $('#portfolio-container');
  container.style.display = '';
  const frame = document.createElement('iframe');
  frame.id = 'portfolio-frame';
  frame.title = `${model.name}'s portfolio`;
  // Same sandbox as the builder preview: scripts run, but cannot touch this page or its session.
  frame.setAttribute('sandbox', 'allow-scripts allow-popups allow-popups-to-escape-sandbox allow-top-navigation-by-user-activation');
  frame.srcdoc = buildDocument(model, { baseUrl: new URL('./', document.baseURI).href });
  container.replaceChildren(frame);
}

async function loadPortfolio(slug) {
  try {
    const { data: portfolio, error } = await supabase.from('portfolios').select('*').eq('slug', slug).maybeSingle();
    if (error) throw error;
    if (!portfolio) { hideLoading(); showState('state-not-found'); return; }
    if (!portfolio.is_published) { hideLoading(); showState('state-not-published'); return; }

    const keys = Object.keys(CHILD_TABLES);
    const [profileRes, ...childRes] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', portfolio.user_id).maybeSingle(),
      ...keys.map(k => {
        let q = supabase.from(CHILD_TABLES[k]).select('*').eq('portfolio_id', portfolio.id);
        if (k === 'links') q = q.eq('is_hidden', false);
        return q.order('order_index', { ascending: true });
      })
    ]);
    if (profileRes.error) throw profileRes.error;
    childRes.forEach(r => { if (r.error) throw r.error; });

    const raw = { portfolio, profile: profileRes.data || {} };
    keys.forEach((k, i) => { raw[k] = childRes[i].data || []; });
    const model = normalizeData(raw);

    renderFrame(model);
    applyMeta(model, model.avatar);
    hideLoading();

    // Count the view; a failure here must never affect the page.
    try { await supabase.rpc('increment_view_count', { portfolio_slug: slug }); } catch (_) { /* ignore */ }
  } catch (err) {
    console.error('[PortfolioHub] Failed to load portfolio:', err);
    hideLoading();
    showState('state-error');
  }
}

function initShare() {
  const url = window.location.href;
  $('#btn-copy-link').addEventListener('click', async () => {
    const ok = await copyToClipboard(url);
    showToast(ok ? 'Link copied to clipboard.' : 'Could not copy the link.', ok ? 'success' : 'error');
  });
  if (navigator.share) {
    const btn = $('#btn-native-share');
    btn.style.display = 'inline-flex';
    btn.addEventListener('click', async () => {
      try { await navigator.share({ title: document.title, url }); }
      catch (e) { if (e.name !== 'AbortError') showToast('Could not share.', 'error'); }
    });
  }
}

function init() {
  initShare();
  const slug = readSlug();
  if (!slug) {
    document.title = 'Portfolio Not Found | PortfolioHub';
    hideLoading();
    showState('state-not-found');
    return;
  }
  $('#btn-retry').addEventListener('click', () => window.location.reload());
  loadPortfolio(slug);
}

init();
