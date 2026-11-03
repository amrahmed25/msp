/**
 * templates.js
 * Template gallery: lists every template from the renderer registry, shows a
 * live preview rendered with sample content, and creates a portfolio from the
 * chosen template.
 */
import supabase from './supabase-client.js';
import { showToast } from './utils.js';
import { TEMPLATES, normalizeData, buildDocument } from './portfolio-renderer.js';
import { createPortfolio } from './portfolio-service.js';
import { SAMPLE_DATA } from './sample-data.js';

const FEATURES = {
  reference: ['Light and dark theme', 'Portrait hero with quick info', 'Project cards and contact form'],
  developer: ['Dark, code-editor styling', 'Terminal-style intro', 'Skills and projects first'],
  creative: ['Large editorial typography', 'Project-first layout', 'Airy, visual design'],
  freelancer: ['Services and pricing up front', 'Clear hire-me calls to action', 'Credentials section']
};

let currentUser = null;
let previewTemplateId = null;
let lastFocus = null;

const $ = id => document.getElementById(id);

function siteBase() {
  return new URL('./', document.baseURI).href;
}

function sampleDoc(templateId, { interactive }) {
  const raw = { ...SAMPLE_DATA, portfolio: { ...SAMPLE_DATA.portfolio, template_id: templateId } };
  return buildDocument(normalizeData(raw), { baseUrl: siteBase(), static: !interactive });
}

/** Tiny element helper; all text goes through textContent so nothing is parsed as HTML. */
function h(tag, props = {}, ...kids) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(props)) {
    if (v === null || v === undefined || v === false) continue;
    if (k === 'class') node.className = v;
    else if (k.startsWith('on')) node.addEventListener(k.slice(2).toLowerCase(), v);
    else node.setAttribute(k, v);
  }
  kids.flat().forEach(c => c !== null && c !== undefined && node.append(c.nodeType ? c : document.createTextNode(String(c))));
  return node;
}

async function resolveUser() {
  try {
    const { data } = await supabase.auth.getSession();
    currentUser = data?.session?.user || null;
  } catch (_) {
    currentUser = null;
  }
}

function buildCard({ meta }) {
  const thumb = h('iframe', {
    class: 'template-thumb-frame', title: `${meta.name} template preview`, sandbox: '', tabindex: '-1',
    loading: 'lazy', 'aria-hidden': 'true'
  });
  thumb.srcdoc = sampleDoc(meta.id, { interactive: false });

  const open = () => openPreview(meta.id);
  return h('article', { class: 'template-card', 'data-template-id': meta.id },
    h('button', { type: 'button', class: 'template-card-preview', 'aria-label': `Preview the ${meta.name} template`, onclick: open },
      h('div', { class: 'template-thumb-scale' }, thumb)),
    h('div', { class: 'template-card-body' },
      h('h3', { class: 'template-card-name' }, meta.name),
      h('p', { class: 'template-card-desc' }, meta.description),
      h('ul', { class: 'template-features-list' }, (FEATURES[meta.id] || []).map(f => h('li', { class: 'template-feature-item' }, f))),
      h('div', { class: 'template-card-actions' },
        h('button', { type: 'button', class: 'btn btn-outline template-preview-btn', onclick: open }, 'Preview'),
        h('button', { type: 'button', class: 'btn btn-primary template-use-btn', onclick: e => useTemplate(meta.id, e.currentTarget) }, 'Use template'))));
}

function renderGallery() {
  const grid = $('template-grid');
  grid.replaceChildren(...Object.values(TEMPLATES).map(buildCard));
  fitThumbnails(grid);
  const badge = document.querySelector('.templates-hero-badge');
  if (badge) badge.textContent = `${Object.keys(TEMPLATES).length} Professional Templates`;
}

/** Scales each 1280px-wide thumbnail to its card width. */
function fitThumbnails(grid) {
  const apply = el => {
    const w = el.clientWidth;
    if (w) el.style.setProperty('--thumb-scale', String(w / 1280));
  };
  const targets = grid.querySelectorAll('.template-card-preview');
  targets.forEach(apply);
  if ('ResizeObserver' in window) {
    const ro = new ResizeObserver(entries => entries.forEach(e => apply(e.target)));
    targets.forEach(el => ro.observe(el));
  } else {
    window.addEventListener('resize', () => targets.forEach(apply));
  }
}

/* ---------- preview modal ---------- */

function openPreview(templateId) {
  const tpl = TEMPLATES[templateId];
  if (!tpl) return;
  previewTemplateId = templateId;
  lastFocus = document.activeElement;
  $('preview-modal-title').textContent = tpl.meta.name;
  $('preview-modal-desc').textContent = tpl.meta.description;

  const frame = h('iframe', {
    class: 'preview-modal-iframe', title: `${tpl.meta.name} template preview`,
    sandbox: 'allow-scripts allow-popups allow-popups-to-escape-sandbox'
  });
  frame.srcdoc = sampleDoc(templateId, { interactive: true });
  $('preview-modal-body').replaceChildren(frame);

  $('preview-features').replaceChildren(...(FEATURES[templateId] || []).map(f => h('span', { class: 'preview-feature-pill' }, f)));

  const overlay = $('template-preview-overlay');
  overlay.classList.add('active');
  document.body.style.overflow = 'hidden';
  $('preview-modal-close').focus();
}

function closePreview() {
  $('template-preview-overlay').classList.remove('active');
  $('preview-modal-body').replaceChildren(); // stop the preview and free memory
  document.body.style.overflow = '';
  previewTemplateId = null;
  if (lastFocus && lastFocus.focus) lastFocus.focus();
}

function initModal() {
  const overlay = $('template-preview-overlay');
  $('preview-modal-close').addEventListener('click', closePreview);
  overlay.addEventListener('click', e => { if (e.target === overlay) closePreview(); });
  document.addEventListener('keydown', e => {
    if (!overlay.classList.contains('active')) return;
    if (e.key === 'Escape') { closePreview(); return; }
    if (e.key === 'Tab') { // keep focus inside the dialog
      const f = [...overlay.querySelectorAll('button, [href], iframe')].filter(x => !x.disabled);
      if (!f.length) return;
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });
  ['preview-use-btn', 'preview-use-btn-bottom'].forEach(id =>
    $(id).addEventListener('click', e => { if (previewTemplateId) useTemplate(previewTemplateId, e.currentTarget); }));
}

/* ---------- choosing a template ---------- */

async function useTemplate(templateId, button) {
  if (!TEMPLATES[templateId]) return;
  if (!currentUser) {
    // Come back here after signing in; init() resumes the choice from ?use=
    const next = `${window.location.pathname}?use=${encodeURIComponent(templateId)}`;
    window.location.href = `login.html?next=${encodeURIComponent(next)}`;
    return;
  }
  if (button) button.disabled = true;
  try {
    const id = await createPortfolio({ user: currentUser, title: 'My Portfolio', templateId });
    showToast('Portfolio created. Opening the builder...', 'success');
    window.location.href = `portfolio-builder.html?id=${encodeURIComponent(id)}`;
  } catch (err) {
    console.error('[Templates] Create portfolio failed:', err);
    showToast(err.message || 'Could not create your portfolio. Please try again.', 'error');
    if (button) button.disabled = false;
  }
}

export async function init() {
  await resolveUser();
  renderGallery();
  initModal();
  const wanted = new URLSearchParams(window.location.search).get('use');
  if (wanted && TEMPLATES[wanted] && currentUser) {
    // Returning from login: drop the parameter so a refresh does not create another portfolio.
    window.history.replaceState({}, '', window.location.pathname);
    useTemplate(wanted, null);
  }
}

document.addEventListener('DOMContentLoaded', init);
