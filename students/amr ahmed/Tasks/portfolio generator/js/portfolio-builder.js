/**
 * portfolio-builder.js
 * Editor for a single portfolio: section forms, live preview, autosave,
 * image uploads and publishing. Plain ES modules, Supabase for persistence.
 *
 * Data rules:
 *  - Every read/write is scoped to the signed-in user (and protected by RLS).
 *  - Child rows (skills, projects, ...) are inserted/updated first and deleted
 *    last, so a failed save can never lose existing data.
 */
import supabase, { requireAuth } from './supabase-client.js';
import { showToast, debounce, copyToClipboard } from './utils.js';
import { publicUrl } from './portfolio-service.js';
import { TEMPLATES, DEFAULT_TEMPLATE, DEFAULT_ACCENT, resolveTemplateId, normalizeData, buildDocument } from './portfolio-renderer.js';

/* ------------------------------------------------------------------ */
/* Constants                                                           */
/* ------------------------------------------------------------------ */

const SLUG_RE = /^[a-z0-9][a-z0-9-]{1,59}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_BYTES = { avatars: 5 * 1024 * 1024, covers: 10 * 1024 * 1024, 'project-images': 10 * 1024 * 1024 };
const AUTOSAVE_MS = 1500;

/** child tables managed as ordered lists */
const LISTS = {
  skills:         { table: 'portfolio_skills',         cols: ['name', 'level', 'category'] },
  experience:     { table: 'portfolio_experience',     cols: ['job_title', 'company', 'location', 'start_date', 'end_date', 'is_current', 'description'] },
  education:      { table: 'portfolio_education',      cols: ['degree', 'institution', 'field_of_study', 'start_year', 'end_year', 'description'] },
  certifications: { table: 'portfolio_certifications', cols: ['name', 'issuer', 'issue_date', 'expiry_date', 'credential_url'] },
  projects:       { table: 'portfolio_projects',       cols: ['title', 'description', 'image_url', 'tech_tags', 'github_url', 'demo_url'] },
  services:       { table: 'portfolio_services',       cols: ['name', 'description', 'price', 'price_label', 'contact_url'] },
  links:          { table: 'portfolio_links',          cols: ['platform', 'url', 'label', 'is_hidden'] }
};

const PLATFORMS = ['github', 'linkedin', 'twitter', 'dribbble', 'behance', 'website', 'other'];
const ACCENTS = [DEFAULT_ACCENT, '#1E3A8A', '#0EA5E9', '#7C3AED', '#059669', '#DC2626', '#E05C2A'];

const SECTION_META = {
  personal:       { title: 'Personal Info',       desc: 'Basic information shown on your portfolio.' },
  about:          { title: 'About & Bio',         desc: 'Tell visitors who you are and what you do.' },
  skills:         { title: 'Skills',              desc: 'Group your skills by category.' },
  experience:     { title: 'Experience',          desc: 'Work history and training.' },
  education:      { title: 'Education',           desc: 'Degrees and academic background.' },
  certifications: { title: 'Certifications',      desc: 'Certificates and credentials.' },
  projects:       { title: 'Projects',            desc: 'Showcase the work you are proud of.' },
  services:       { title: 'Services',            desc: 'What clients can hire you for.' },
  links:          { title: 'Social Links',        desc: 'Profiles and external links.' },
  template:       { title: 'Template & Settings', desc: 'Choose a template, colour, visible sections and your public URL.' }
};

/* ------------------------------------------------------------------ */
/* State                                                               */
/* ------------------------------------------------------------------ */

const state = {
  user: null,
  portfolio: null,          // portfolios row (edited in place)
  profile: null,            // profiles row (edited in place, excluding avatar_url)
  lists: {},                // key -> array of items ({ _key, id?, ...cols })
  removed: {},              // key -> array of ids deleted locally
  current: 'personal',
  dirty: false,
  saving: false,
  pendingSave: false,
  showErrors: false,
  previewScrollY: 0,
  device: 'desktop'
};

let keySeq = 0;
const nextKey = () => `k${++keySeq}`;
const $ = id => document.getElementById(id);

/* ------------------------------------------------------------------ */
/* DOM helper (no innerHTML with user data anywhere in this file)      */
/* ------------------------------------------------------------------ */

function h(tag, props = {}, ...kids) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(props || {})) {
    if (v === null || v === undefined || v === false) continue;
    if (k === 'class') node.className = v;
    else if (k.startsWith('on') && typeof v === 'function') node.addEventListener(k.slice(2).toLowerCase(), v);
    else if (k === 'list' || k === 'form') node.setAttribute(k, v);
    else if (k in node && !k.includes('-')) node[k] = v;
    else node.setAttribute(k, v === true ? '' : v);
  }
  kids.flat(Infinity).forEach(c => {
    if (c === null || c === undefined || c === false) return;
    node.append(c.nodeType ? c : document.createTextNode(String(c)));
  });
  return node;
}

function svgIcon(pathD, size = 15) {
  const ns = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(ns, 'svg');
  svg.setAttribute('width', size); svg.setAttribute('height', size);
  svg.setAttribute('viewBox', '0 0 24 24'); svg.setAttribute('fill', 'none');
  svg.setAttribute('stroke', 'currentColor'); svg.setAttribute('stroke-width', '2');
  svg.setAttribute('stroke-linecap', 'round'); svg.setAttribute('stroke-linejoin', 'round');
  svg.setAttribute('aria-hidden', 'true');
  const p = document.createElementNS(ns, 'path'); p.setAttribute('d', pathD);
  svg.append(p);
  return svg;
}
const ICON = {
  plus: 'M12 5v14M5 12h14', trash: 'M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14',
  up: 'M12 19V5M5 12l7-7 7 7', down: 'M12 5v14M5 12l7 7 7-7', upload: 'M12 16V4M6 10l6-6 6 6M4 20h16'
};

/* ------------------------------------------------------------------ */
/* Validators                                                          */
/* ------------------------------------------------------------------ */

const v = {
  required: label => val => (String(val ?? '').trim() ? '' : `${label} is required.`),
  email: val => (!val || EMAIL_RE.test(String(val).trim()) ? '' : 'Enter a valid email address.'),
  url: val => {
    const s = String(val ?? '').trim();
    if (!s) return '';
    try {
      const u = new URL(/^[a-z][a-z0-9+.-]*:/i.test(s) ? s : `https://${s}`);
      return /^https?:$/.test(u.protocol) && u.hostname.includes('.') ? '' : 'Enter a valid http(s) link.';
    } catch (_) { return 'Enter a valid http(s) link.'; }
  },
  phone: val => (!val || /^\+?[\d\s()-]{6,20}$/.test(String(val).trim()) ? '' : 'Enter a valid phone number.'),
  slug: val => (SLUG_RE.test(String(val ?? '')) ? '' : 'Use 2-60 lowercase letters, numbers or hyphens, starting with a letter or number.'),
  year: val => (val === '' || val == null || (Number(val) >= 1950 && Number(val) <= 2100) ? '' : 'Enter a year between 1950 and 2100.'),
  max: n => val => (String(val ?? '').length <= n ? '' : `Keep this under ${n} characters.`)
};
const all = (...fns) => val => { for (const f of fns) { const e = f(val); if (e) return e; } return ''; };

/* ------------------------------------------------------------------ */
/* Form field builders                                                 */
/* ------------------------------------------------------------------ */

let fieldSeq = 0;

/**
 * Generic labelled control.
 * opts: label, kind ('input'|'textarea'|'select'), type, value, options, rows,
 *       maxlength, placeholder, hint, validate, onInput(value), req, autocomplete, min, max
 */
function field(opts) {
  const id = `f${++fieldSeq}`;
  const kind = opts.kind || 'input';
  const common = { id, class: kind === 'textarea' ? 'form-textarea' : kind === 'select' ? 'form-select' : 'form-input' };
  let control;
  if (kind === 'textarea') {
    control = h('textarea', { ...common, rows: opts.rows || 4, maxlength: opts.maxlength, placeholder: opts.placeholder || '', value: opts.value ?? '' });
  } else if (kind === 'select') {
    control = h('select', common, (opts.options || []).map(o => {
      const [val, text] = Array.isArray(o) ? o : [o, o];
      return h('option', { value: val, selected: String(val) === String(opts.value ?? '') }, text);
    }));
  } else {
    control = h('input', {
      ...common, type: opts.type || 'text', value: opts.value ?? '', placeholder: opts.placeholder || '',
      maxlength: opts.maxlength, autocomplete: opts.autocomplete || 'off', min: opts.min, max: opts.max, step: opts.step,
      list: opts.list
    });
  }
  const err = h('p', { class: 'form-hint field-error', id: `${id}-err`, role: 'alert', hidden: true });
  control.setAttribute('aria-describedby', `${id}-err`);
  const check = () => {
    const msg = opts.validate ? opts.validate(control.value) : '';
    err.textContent = msg; err.hidden = !msg;
    err.style.color = 'var(--danger)';
    control.setAttribute('aria-invalid', msg ? 'true' : 'false');
    return msg;
  };
  control.addEventListener('input', () => { opts.onInput && opts.onInput(control.value); if (!err.hidden || state.showErrors) check(); });
  control.addEventListener('change', () => { if (kind === 'select') opts.onInput && opts.onInput(control.value); });
  control.addEventListener('blur', check);
  if (state.showErrors && opts.validate) check();

  return h('div', { class: 'form-group' },
    h('label', { class: 'form-label', for: id }, opts.label, opts.req ? h('span', { class: 'req' }, ' *') : null),
    control,
    opts.hint ? h('p', { class: 'form-hint' }, opts.hint) : null,
    err
  );
}

function checkbox(label, checked, onChange) {
  const id = `f${++fieldSeq}`;
  return h('label', { class: 'checkbox-label', for: id },
    h('input', { id, type: 'checkbox', checked: !!checked, onChange: e => onChange(e.target.checked) }),
    ' ', label);
}

function button(label, props = {}, icon) {
  return h('button', { type: 'button', ...props }, icon ? svgIcon(icon) : null, label ? h('span', {}, label) : null);
}

/* ------------------------------------------------------------------ */
/* Save status + dirty tracking                                        */
/* ------------------------------------------------------------------ */

function setStatus(kind, text) {
  const box = $('save-status');
  box.classList.remove('saving', 'saved', 'error');
  box.classList.add(kind);
  box.setAttribute('role', 'status');
  box.setAttribute('aria-live', 'polite');
  $('save-status-text').textContent = text;
}

const autosave = debounce(() => save({ silent: true }), AUTOSAVE_MS);

let rev = 0;
function markDirty() {
  rev += 1;
  state.dirty = true;
  setStatus('saving', 'Unsaved changes');
  refreshPreview();
  autosave();
}

/* ------------------------------------------------------------------ */
/* Live preview (sandboxed iframe, same renderer as the public page)   */
/* ------------------------------------------------------------------ */

let previewFrame = null;

function siteBase() {
  return new URL('./', window.location.href).href; // directory of this page, ends with '/'
}

function currentModel() {
  return normalizeData({
    // Keep account avatar_url completely isolated from portfolio rendering
    profile: { ...state.profile, avatar_url: '' },
    portfolio: state.portfolio,
    ...Object.fromEntries(Object.keys(LISTS).map(k => [k, state.lists[k]]))
  });
}

function ensurePreviewFrame() {
  if (previewFrame) return previewFrame;
  previewFrame = h('iframe', {
    id: 'preview-iframe', title: 'Portfolio preview',
    sandbox: 'allow-scripts allow-popups allow-popups-to-escape-sandbox allow-top-navigation-by-user-activation',
    style: 'width:100%;height:100%;border:0;display:block;background:#fff;'
  });
  $('preview-content').replaceChildren(previewFrame);
  return previewFrame;
}

const refreshPreview = debounce(() => {
  try {
    const frame = ensurePreviewFrame();
    frame.srcdoc = buildDocument(currentModel(), { baseUrl: siteBase(), preview: true, scrollY: state.previewScrollY });
  } catch (err) {
    console.error('[Builder] Preview failed:', err);
    $('preview-content').replaceChildren(h('p', { class: 'empty-state' }, 'The preview could not be rendered.'));
  } finally {
    $('preview-loading').classList.remove('active');
  }
}, 250);

window.addEventListener('message', e => {
  const d = e.data;
  if (!previewFrame || e.source !== previewFrame.contentWindow) return;
  if (d && d.source === 'ph-preview' && d.type === 'scroll' && Number.isFinite(d.y)) state.previewScrollY = d.y;
});

function initPreviewControls() {
  document.querySelectorAll('.device-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.device-btn').forEach(b => b.classList.toggle('active', b === btn));
      state.device = btn.dataset.device;
      const f = $('preview-frame');
      f.classList.remove('mobile', 'tablet');
      if (state.device !== 'desktop') f.classList.add(state.device);
    });
  });
  const open = on => {
    $('right-panel').classList.toggle('preview-open', on);
    $('preview-close-btn').style.display = on ? '' : 'none';
    if (on) refreshPreview();
  };
  $('mobile-preview-btn').addEventListener('click', () => open(!$('right-panel').classList.contains('preview-open')));
  $('preview-close-btn').addEventListener('click', () => open(false));
}

/* ------------------------------------------------------------------ */
/* Image upload                                                        */
/* ------------------------------------------------------------------ */

async function uploadImage(bucket, file) {
  if (!IMAGE_TYPES.includes(file.type)) throw new Error('Use a JPG, PNG, WebP or GIF image.');
  if (file.size > MAX_BYTES[bucket]) throw new Error(`That image is too large. The limit is ${Math.round(MAX_BYTES[bucket] / 1048576)} MB.`);
  const ext = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/gif': 'gif' }[file.type];
  const path = `${state.user.id}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { error } = await supabase.storage.from(bucket).upload(path, file, { cacheControl: '3600', upsert: false, contentType: file.type });
  if (error) throw error;
  return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
}

/**
 * Updates a portfolio image column (profile_image_url or cover_url) in memory,
 * refreshes the live preview immediately, and persists it directly to public.portfolios
 * scoped by portfolio id and authenticated user_id.
 */
async function savePortfolioImageColumn(column, url) {
  const prev = state.portfolio[column] || '';
  state.portfolio[column] = url || '';
  refreshPreview();
  setStatus('saving', 'Saving...');
  try {
    const { error } = await supabase
      .from('portfolios')
      .update({ [column]: nullable(url) })
      .eq('id', state.portfolio.id)
      .eq('user_id', state.user.id);
    if (error) throw error;
    setStatus(state.dirty ? 'saving' : 'saved', state.dirty ? 'Unsaved changes' : 'All changes saved');
  } catch (err) {
    state.portfolio[column] = prev;
    refreshPreview();
    setStatus('error', 'Save failed. Click to retry');
    throw err;
  }
}

/** Image picker with preview, upload progress and remove. */
function imageField({ label, bucket, value, onChange, hint, round }) {
  const id = `f${++fieldSeq}`;
  const preview = h('img', { class: 'upload-preview' + (round ? '' : ' cover-preview'), alt: '', hidden: !value, src: value || '' });
  const text = h('div', { class: 'upload-text' }, h('span', {}, 'Click to upload'), ' (JPG, PNG, WebP or GIF)');
  const spinner = h('div', { class: 'upload-spinner' }, 'Uploading...');
  const input = h('input', { id, type: 'file', accept: IMAGE_TYPES.join(','), 'aria-label': label });
  const remove = button('Remove image', {
    class: 'btn btn-sm btn-danger',
    hidden: !value,
    onClick: async () => {
      try {
        await onChange('');
        preview.src = '';
        preview.hidden = true;
        remove.hidden = true;
        input.value = '';
      } catch (err) {
        console.error('[Builder] Remove image failed:', err);
        showToast(err.message || 'Could not remove image. Please try again.', 'error');
      }
    }
  });

  const openFilePicker = e => {
    if (e.target === input || spinner.classList.contains('active')) return;
    input.click();
  };

  const zone = h('div', {
    class: 'upload-zone',
    role: 'button',
    tabindex: '0',
    'aria-label': `Upload ${label}`,
    onClick: openFilePicker,
    onKeydown: e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openFilePicker(e);
      }
    }
  }, preview, text, spinner, input);

  input.addEventListener('change', async () => {
    const file = input.files && input.files[0];
    if (!file) return;
    spinner.classList.add('active');
    try {
      const url = await uploadImage(bucket, file);
      await onChange(url);
      preview.src = url;
      preview.hidden = false;
      remove.hidden = false;
      showToast('Image uploaded.', 'success');
    } catch (err) {
      console.error('[Builder] Upload failed:', err);
      showToast(err.message || 'Upload failed. Please try again.', 'error');
    } finally {
      spinner.classList.remove('active');
      input.value = '';
    }
  });

  return h('div', { class: 'form-group' },
    h('label', { class: 'form-label', for: id, onClick: openFilePicker }, label), zone,
    hint ? h('p', { class: 'form-hint' }, hint) : null, remove);
}

/* ------------------------------------------------------------------ */
/* Section renderers                                                   */
/* ------------------------------------------------------------------ */

function setProfile(key, val) { state.profile[key] = val; markDirty(); }
function setPortfolio(key, val) { state.portfolio[key] = val; markDirty(); }

function renderPersonal() {
  const p = state.profile, pf = state.portfolio;
  return [
    imageField({
      label: 'Profile photo',
      bucket: 'avatars',
      value: pf.profile_image_url,
      round: true,
      onChange: val => savePortfolioImageColumn('profile_image_url', val)
    }),
    imageField({
      label: 'Cover image',
      bucket: 'covers',
      value: pf.cover_url,
      onChange: val => savePortfolioImageColumn('cover_url', val),
      hint: 'Optional. Used by templates that show a cover.'
    }),
    field({ label: 'Full name', req: true, value: p.full_name, maxlength: 80, autocomplete: 'name', validate: v.required('Full name'), onInput: val => setProfile('full_name', val) }),
    field({ label: 'Headline', value: pf.headline, maxlength: 100, placeholder: 'Frontend Developer', hint: 'Shown under your name.', onInput: val => setPortfolio('headline', val) }),
    h('div', { class: 'form-row' },
      field({ label: 'Location', value: p.location, maxlength: 80, placeholder: 'City, Country', onInput: val => setProfile('location', val) }),
      field({ label: 'Website', value: p.website, maxlength: 200, placeholder: 'https://example.com', validate: v.url, onInput: val => setProfile('website', val) })),
    h('div', { class: 'form-row' },
      field({ label: 'Contact email', type: 'email', value: pf.contact_email, maxlength: 120, autocomplete: 'email', validate: v.email, hint: 'Powers the contact form and email links.', onInput: val => setPortfolio('contact_email', val) }),
      field({ label: 'Phone / WhatsApp', type: 'tel', value: pf.whatsapp, maxlength: 20, placeholder: '+20 100 000 0000', validate: v.phone, onInput: val => setPortfolio('whatsapp', val) }))
  ];
}

function renderAbout() {
  return [
    field({ label: 'About you', kind: 'textarea', rows: 10, value: state.portfolio.about, maxlength: 3000,
      hint: 'Separate paragraphs with a blank line. Up to 3000 characters.', onInput: val => setPortfolio('about', val) })
  ];
}

/* ---------- generic ordered list editor ---------- */

function listEditor(key, { empty, addLabel, newItem, title, subtitle, fields }) {
  const items = state.lists[key];
  const wrap = h('div', { class: 'list-editor' });
  const rerender = () => { wrap.replaceWith(listEditor(key, { empty, addLabel, newItem, title, subtitle, fields })); };

  const move = (i, d) => {
    const j = i + d;
    if (j < 0 || j >= items.length) return;
    [items[i], items[j]] = [items[j], items[i]];
    items.forEach(it => { it._dirty = true; });
    markDirty(); rerender();
  };
  const del = i => {
    const it = items[i];
    if (!window.confirm(`Remove "${title(it) || 'this item'}"? This is saved automatically.`)) return;
    items.splice(i, 1);
    if (it.id) (state.removed[key] ||= []).push(it.id);
    markDirty(); rerender();
  };

  if (!items.length) wrap.append(h('div', { class: 'empty-state' }, empty));
  items.forEach((it, i) => {
    const head = h('div', { class: 'list-item-card-header' },
      h('div', {}, h('div', { class: 'list-item-title' }, title(it) || 'Untitled'), h('div', { class: 'list-item-subtitle' }, subtitle ? subtitle(it) : '')),
      h('div', { class: 'list-item-actions' },
        button('', { class: 'icon-btn', title: 'Move up', 'aria-label': 'Move up', disabled: i === 0, onClick: () => move(i, -1) }, ICON.up),
        button('', { class: 'icon-btn', title: 'Move down', 'aria-label': 'Move down', disabled: i === items.length - 1, onClick: () => move(i, 1) }, ICON.down),
        button('', { class: 'icon-btn danger', title: 'Remove', 'aria-label': 'Remove', onClick: () => del(i) }, ICON.trash)));
    const touch = (k, val, headTitle) => {
      it[k] = val; it._dirty = true;
      if (headTitle) head.querySelector('.list-item-title').textContent = title(it) || 'Untitled';
      markDirty();
    };
    wrap.append(h('div', { class: 'list-item-card' }, head, fields(it, touch)));
  });
  wrap.append(button(addLabel, { class: 'add-item-btn', onClick: () => { items.push({ _key: nextKey(), _dirty: true, ...newItem() }); markDirty(); rerender(); } }, ICON.plus));
  return wrap;
}

const toMonth = d => (d ? String(d).slice(0, 7) : '');
const fromMonth = m => (/^\d{4}-\d{2}$/.test(m) ? `${m}-01` : null);
const toDate = d => (d ? String(d).slice(0, 10) : '');

function renderSkills() {
  const cats = [...new Set(state.lists.skills.map(s => s.category).filter(Boolean))];
  const dl = h('datalist', { id: 'skill-categories' }, cats.map(c => h('option', { value: c })));
  return [dl, listEditor('skills', {
    empty: 'No skills yet. Add your first skill below.', addLabel: 'Add skill',
    newItem: () => ({ name: '', level: 80, category: cats[0] || 'General' }),
    title: s => s.name, subtitle: s => s.category,
    fields: (s, t) => [
      h('div', { class: 'form-row' },
        field({ label: 'Skill', req: true, value: s.name, maxlength: 60, validate: v.required('Skill name'), onInput: val => t('name', val, true) }),
        field({ label: 'Category', value: s.category, maxlength: 40, list: 'skill-categories', onInput: val => t('category', val.trim() || 'General') })),
      (() => {
        const f = field({ label: `Proficiency: ${s.level}%`, type: 'range', min: 0, max: 100, step: 5, value: s.level,
          onInput: val => { t('level', Number(val)); f.querySelector('label').textContent = `Proficiency: ${val}%`; } });
        return f;
      })()
    ]
  })];
}

function renderExperience() {
  return [listEditor('experience', {
    empty: 'No experience yet.', addLabel: 'Add experience',
    newItem: () => ({ job_title: '', company: '', location: '', start_date: null, end_date: null, is_current: false, description: '' }),
    title: e => e.job_title, subtitle: e => e.company,
    fields: (e, t) => [
      h('div', { class: 'form-row' },
        field({ label: 'Role', req: true, value: e.job_title, maxlength: 100, validate: v.required('Role'), onInput: val => t('job_title', val, true) }),
        field({ label: 'Company', req: true, value: e.company, maxlength: 100, validate: v.required('Company'), onInput: val => t('company', val) })),
      field({ label: 'Location', value: e.location, maxlength: 80, onInput: val => t('location', val) }),
      h('div', { class: 'form-row' },
        field({ label: 'Start', type: 'month', value: toMonth(e.start_date), onInput: val => t('start_date', fromMonth(val)) }),
        field({ label: 'End', type: 'month', value: toMonth(e.end_date), onInput: val => t('end_date', fromMonth(val)) })),
      checkbox('I currently work here', e.is_current, c => t('is_current', c)),
      field({ label: 'Description', kind: 'textarea', rows: 3, value: e.description, maxlength: 1500, onInput: val => t('description', val) })
    ]
  })];
}

function renderEducation() {
  return [listEditor('education', {
    empty: 'No education yet.', addLabel: 'Add education',
    newItem: () => ({ degree: '', institution: '', field_of_study: '', start_year: null, end_year: null, description: '' }),
    title: e => e.degree, subtitle: e => e.institution,
    fields: (e, t) => [
      h('div', { class: 'form-row' },
        field({ label: 'Degree', req: true, value: e.degree, maxlength: 120, validate: v.required('Degree'), onInput: val => t('degree', val, true) }),
        field({ label: 'Institution', req: true, value: e.institution, maxlength: 120, validate: v.required('Institution'), onInput: val => t('institution', val) })),
      field({ label: 'Field of study', value: e.field_of_study, maxlength: 120, onInput: val => t('field_of_study', val) }),
      h('div', { class: 'form-row' },
        field({ label: 'Start year', type: 'number', min: 1950, max: 2100, value: e.start_year ?? '', validate: v.year, onInput: val => t('start_year', val === '' ? null : Number(val)) }),
        field({ label: 'End year', type: 'number', min: 1950, max: 2100, value: e.end_year ?? '', validate: v.year, onInput: val => t('end_year', val === '' ? null : Number(val)) }))
    ]
  })];
}

function renderCertifications() {
  return [listEditor('certifications', {
    empty: 'No certifications yet.', addLabel: 'Add certification',
    newItem: () => ({ name: '', issuer: '', issue_date: null, expiry_date: null, credential_url: '' }),
    title: c => c.name, subtitle: c => c.issuer,
    fields: (c, t) => [
      h('div', { class: 'form-row' },
        field({ label: 'Name', req: true, value: c.name, maxlength: 140, validate: v.required('Certification name'), onInput: val => t('name', val, true) }),
        field({ label: 'Issuer', value: c.issuer, maxlength: 120, onInput: val => t('issuer', val) })),
      h('div', { class: 'form-row' },
        field({ label: 'Issued', type: 'date', value: toDate(c.issue_date), onInput: val => t('issue_date', val || null) }),
        field({ label: 'Expires', type: 'date', value: toDate(c.expiry_date), onInput: val => t('expiry_date', val || null) })),
      field({ label: 'Credential link', value: c.credential_url, maxlength: 300, validate: v.url, onInput: val => t('credential_url', val) })
    ]
  })];
}

function renderProjects() {
  return [listEditor('projects', {
    empty: 'No projects yet. Add one to show your work.', addLabel: 'Add project',
    newItem: () => ({ title: '', description: '', image_url: '', tech_tags: [], github_url: '', demo_url: '' }),
    title: p => p.title, subtitle: p => (p.tech_tags || []).join(', '),
    fields: (p, t) => [
      field({ label: 'Title', req: true, value: p.title, maxlength: 100, validate: v.required('Project title'), onInput: val => t('title', val, true) }),
      field({ label: 'Description', kind: 'textarea', rows: 3, value: p.description, maxlength: 1200, onInput: val => t('description', val) }),
      field({ label: 'Technologies', value: (p.tech_tags || []).join(', '), maxlength: 200, hint: 'Comma separated, for example React, Supabase, CSS.',
        onInput: val => t('tech_tags', val.split(',').map(s => s.trim()).filter(Boolean).slice(0, 15)) }),
      imageField({ label: 'Project image', bucket: 'project-images', value: p.image_url, onChange: val => t('image_url', val) }),
      h('div', { class: 'form-row' },
        field({ label: 'GitHub link', value: p.github_url, maxlength: 300, validate: v.url, onInput: val => t('github_url', val) }),
        field({ label: 'Live demo link', value: p.demo_url, maxlength: 300, validate: v.url, onInput: val => t('demo_url', val) }))
    ]
  })];
}

function renderServices() {
  return [listEditor('services', {
    empty: 'No services yet.', addLabel: 'Add service',
    newItem: () => ({ name: '', description: '', price: null, price_label: '', contact_url: '' }),
    title: s => s.name, subtitle: s => s.price_label,
    fields: (s, t) => [
      field({ label: 'Service', req: true, value: s.name, maxlength: 100, validate: v.required('Service name'), onInput: val => t('name', val, true) }),
      field({ label: 'Description', kind: 'textarea', rows: 3, value: s.description, maxlength: 800, onInput: val => t('description', val) }),
      h('div', { class: 'form-row' },
        field({ label: 'Price label', value: s.price_label, maxlength: 40, placeholder: 'Starting at', onInput: val => t('price_label', val) }),
        field({ label: 'Price', type: 'number', min: 0, step: '0.01', value: s.price ?? '', onInput: val => t('price', val === '' ? null : Number(val)) })),
      field({ label: 'Contact link', value: s.contact_url, maxlength: 300, validate: v.url, onInput: val => t('contact_url', val) })
    ]
  })];
}

function renderLinks() {
  return [listEditor('links', {
    empty: 'No links yet.', addLabel: 'Add link',
    newItem: () => ({ platform: 'github', url: '', label: '', is_hidden: false }),
    title: l => l.label || l.platform, subtitle: l => l.url,
    fields: (l, t) => [
      h('div', { class: 'form-row' },
        field({ label: 'Platform', kind: 'select', options: PLATFORMS, value: l.platform, onInput: val => t('platform', val, true) }),
        field({ label: 'Label', value: l.label, maxlength: 40, placeholder: 'Optional', onInput: val => t('label', val, true) })),
      field({ label: 'URL', req: true, value: l.url, maxlength: 300, placeholder: 'https://github.com/you', validate: all(v.required('URL'), v.url), onInput: val => t('url', val) }),
      checkbox('Hide this link on my portfolio', l.is_hidden, c => t('is_hidden', c))
    ]
  })];
}

function renderTemplate() {
  const pf = state.portfolio;
  const selected = resolveTemplateId(pf.template_id);
  const grid = h('div', { class: 'template-grid', role: 'radiogroup', 'aria-label': 'Template' });
  Object.values(TEMPLATES).forEach(({ meta }) => {
    const card = h('button', {
      type: 'button', class: 'template-card' + (meta.id === selected ? ' selected' : ''),
      role: 'radio', 'aria-checked': String(meta.id === selected),
      onClick: () => { pf.template_id = meta.id; markDirty(); renderSection(); }
    },
      h('div', { class: 'template-thumb', style: `background:${meta.thumb || '#E2E8F0'};height:90px;` }),
      h('div', { class: 'template-info' }, h('div', { class: 'template-name' }, meta.name), h('div', { class: 'template-desc' }, meta.description)));
    grid.append(card);
  });

  const meta = TEMPLATES[selected].meta;
  const swatches = h('div', { class: 'color-swatches', role: 'radiogroup', 'aria-label': 'Accent colour' },
    ACCENTS.map((c, i) => h('button', {
      type: 'button', class: 'color-swatch' + ((pf.theme_color || DEFAULT_ACCENT).toLowerCase() === c.toLowerCase() ? ' selected' : ''),
      style: `background:${c}`, role: 'radio', title: i === 0 ? 'Template default' : c, 'aria-label': i === 0 ? 'Template default colour' : `Accent ${c}`,
      'aria-checked': String((pf.theme_color || DEFAULT_ACCENT).toLowerCase() === c.toLowerCase()),
      onClick: () => { pf.theme_color = c; markDirty(); renderSection(); }
    })));

  const sectionKeys = ['about', 'skills', 'experience', 'projects', 'services', 'education', 'certifications'];
  const sections = pf.sections || (pf.sections = {});
  const toggles = h('div', {}, sectionKeys.map(k => checkbox(SECTION_META[k].title, sections[k] !== false, on => { sections[k] = on; markDirty(); })));

  const slugField = field({ label: 'Public URL name', req: true, value: pf.slug, maxlength: 60, validate: v.slug,
    hint: `Your portfolio will live at ${publicUrl(pf.slug || 'your-name')}`, onInput: val => { pf.slug = val.trim().toLowerCase(); markDirty(); } });

  return [
    h('div', { class: 'form-group' }, h('div', { class: 'form-label' }, 'Template'), grid),
    meta.supportsAccent ? h('div', { class: 'form-group' }, h('div', { class: 'form-label' }, 'Accent colour'), swatches) : null,
    h('div', { class: 'form-group' }, h('div', { class: 'form-label' }, 'Visible sections'), toggles,
      h('p', { class: 'form-hint' }, 'Sections without content are hidden automatically.')),
    slugField
  ];
}

const RENDERERS = {
  personal: renderPersonal, about: renderAbout, skills: renderSkills, experience: renderExperience,
  education: renderEducation, certifications: renderCertifications, projects: renderProjects,
  services: renderServices, links: renderLinks, template: renderTemplate
};

function renderSection() {
  const key = state.current;
  const meta = SECTION_META[key];
  $('mid-panel-title').textContent = meta.title;
  $('mid-panel-desc').textContent = meta.desc;
  $('section-form-container').replaceChildren(...RENDERERS[key]());
  document.querySelectorAll('.section-tab').forEach(b => {
    const on = b.dataset.section === key;
    b.classList.toggle('active', on);
    b.setAttribute('aria-current', on ? 'page' : 'false');
  });
  document.querySelectorAll('.mobile-tab').forEach(b => b.classList.toggle('active', b.dataset.section === key));
}

function showSection(key) {
  state.current = key;
  renderSection();
  $('mid-panel').scrollTop = 0;
}

function initNavigation() {
  document.querySelectorAll('.section-tab').forEach(b => b.addEventListener('click', () => showSection(b.dataset.section)));
  const bar = $('mobile-tab-bar');
  Object.keys(SECTION_META).forEach(k => bar.append(h('button', { type: 'button', class: 'mobile-tab', role: 'tab', 'data-section': k, onClick: () => showSection(k) }, SECTION_META[k].title)));
}

/* ------------------------------------------------------------------ */
/* URLs live in portfolio-service.js (publicUrl)                          */
/* ------------------------------------------------------------------ */

/* ------------------------------------------------------------------ */
/* Validation + persistence                                            */
/* ------------------------------------------------------------------ */

const INFO_COLS = {
  skills: ['name'], experience: ['job_title', 'company', 'description', 'location'],
  education: ['degree', 'institution', 'field_of_study'], certifications: ['name', 'issuer', 'credential_url'],
  projects: ['title', 'description', 'github_url', 'demo_url', 'image_url'], services: ['name', 'description'], links: ['url', 'label']
};

/** A brand-new item the user has not typed into yet is a draft: it is neither saved nor validated. */
const isDraft = (key, it) => !it.id && INFO_COLS[key].every(c => !String(it[c] ?? '').trim());

const REQUIRED = {
  skills: [['name', 'Skill name']], experience: [['job_title', 'Role'], ['company', 'Company']],
  education: [['degree', 'Degree'], ['institution', 'Institution']], certifications: [['name', 'Certification name']],
  projects: [['title', 'Project title']], services: [['name', 'Service name']], links: [['url', 'Link URL']]
};
const URL_COLS = { certifications: ['credential_url'], projects: ['github_url', 'demo_url'], services: ['contact_url'], links: ['url'] };

function validateAll() {
  const errors = [];
  const add = (section, message) => errors.push({ section, message });
  const pf = state.portfolio, p = state.profile;
  if (!String(pf.title || '').trim()) add('personal', 'Give your portfolio a title.');
  const check = (section, fn, val) => { const m = fn(val); if (m) add(section, m); };
  check('personal', v.required('Full name'), p.full_name);
  check('personal', v.url, p.website);
  check('personal', v.email, pf.contact_email);
  check('personal', v.phone, pf.whatsapp);
  check('template', v.slug, pf.slug);
  for (const key of Object.keys(LISTS)) {
    state.lists[key].forEach(it => {
      if (isDraft(key, it)) return;
      (REQUIRED[key] || []).forEach(([col, label]) => check(key, v.required(label), it[col]));
      (URL_COLS[key] || []).forEach(col => check(key, v.url, it[col]));
      if (key === 'education') { check(key, v.year, it.start_year); check(key, v.year, it.end_year); }
    });
  }
  return errors;
}

const nullable = val => { const s = typeof val === 'string' ? val.trim() : val; return s === '' || s === undefined ? null : s; };
const urlCols = new Set(['url', 'github_url', 'demo_url', 'credential_url', 'contact_url']);

function toRow(key, it, index) {
  const row = {};
  LISTS[key].cols.forEach(c => {
    let val = it[c];
    if (c === 'tech_tags') val = Array.isArray(val) ? val : [];
    else if (c === 'is_current' || c === 'is_hidden') val = !!val;
    else if (c === 'level') val = Math.max(0, Math.min(100, Number(val) || 0));
    else if (c === 'category') val = String(val || '').trim() || 'General';
    else if (c === 'platform') val = String(val || 'other');
    else if (urlCols.has(c)) val = nullable(val) && normalizeUrlValue(val);
    else val = nullable(val);
    row[c] = val;
  });
  if (key === 'experience' && row.is_current) row.end_date = null;
  row.order_index = index;
  return row;
}
const normalizeUrlValue = val => {
  const s = String(val).trim();
  return /^[a-z][a-z0-9+.-]*:/i.test(s) ? s : `https://${s}`;
};

async function saveCore() {
  const pf = state.portfolio, p = state.profile;
  const { error: pErr } = await supabase.from('portfolios').update({
    title: pf.title.trim(),
    headline: nullable(pf.headline),
    about: nullable(pf.about),
    contact_email: nullable(pf.contact_email),
    whatsapp: nullable(pf.whatsapp),
    profile_image_url: nullable(pf.profile_image_url),
    cover_url: nullable(pf.cover_url),
    template_id: resolveTemplateId(pf.template_id),
    theme_color: pf.theme_color || DEFAULT_ACCENT,
    sections: pf.sections || {},
    slug: pf.slug
  }).eq('id', pf.id).eq('user_id', state.user.id);
  if (pErr) throw pErr;

  // Do not include avatar_url here so the account profile picture is never modified by the portfolio builder
  const { error: prErr } = await supabase.from('profiles').upsert({
    id: state.user.id,
    full_name: nullable(p.full_name),
    location: nullable(p.location),
    website: nullable(p.website) && normalizeUrlValue(p.website)
  }, { onConflict: 'id' });
  if (prErr) throw prErr;
}

async function saveList(key) {
  const { table } = LISTS[key];
  const pid = state.portfolio.id;
  const items = state.lists[key].filter(it => !isDraft(key, it));
  const inserts = [], updates = [];
  items.forEach((it, idx) => {
    const row = toRow(key, it, idx);
    if (!it.id) inserts.push({ it, row: { ...row, portfolio_id: pid } });
    else if (it._dirty) updates.push({ it, row });
  });
  if (inserts.length) {
    const { data, error } = await supabase.from(table).insert(inserts.map(x => x.row)).select('id');
    if (error) throw error;
    inserts.forEach((x, i) => { x.it.id = data[i].id; x.it._dirty = false; });
  }
  for (const { it, row } of updates) {
    const { error } = await supabase.from(table).update(row).eq('id', it.id).eq('portfolio_id', pid);
    if (error) throw error;
    it._dirty = false;
  }
}

async function deleteRemoved(key) {
  const ids = state.removed[key] || [];
  if (!ids.length) return;
  const { error } = await supabase.from(LISTS[key].table).delete().in('id', ids).eq('portfolio_id', state.portfolio.id);
  if (error) throw error;
  state.removed[key] = [];
}

function describeError(err) {
  const msg = String(err?.message || err || '');
  if (err?.code === '23505') return { text: 'That public URL name is already taken. Choose another one.', section: 'template' };
  if (err?.code === '23514') return { text: 'That public URL name is not valid. Use lowercase letters, numbers and hyphens.', section: 'template' };
  if (err?.status === 401 || /jwt|token|not authenticated/i.test(msg)) return { text: 'Your session expired. Please sign in again.', auth: true };
  if (err?.code === '42501' || err?.status === 403) return { text: 'You do not have permission to change this portfolio.' };
  if (err instanceof TypeError || /failed to fetch|network|load failed/i.test(msg)) return { text: 'Network problem. Your changes are still on this page; check your connection and try again.' };
  return { text: msg || 'Something went wrong while saving.' };
}

function redirectToLogin() {
  const returnTo = encodeURIComponent(window.location.pathname + window.location.search);
  setTimeout(() => { window.location.href = `login.html?returnTo=${returnTo}`; }, 1800);
}

let chain = Promise.resolve(true);

async function doSave({ silent = false, force = false } = {}) {
  if (!state.dirty && !force) return true;
  const errors = validateAll();
  if (errors.length) {
    state.showErrors = true;
    setStatus('error', 'Fix the highlighted fields to save');
    if (errors[0].section !== state.current) showSection(errors[0].section); else renderSection();
    if (!silent) showToast(errors[0].message, 'error');
    return false;
  }
  const startRev = rev;
  state.saving = true;
  setStatus('saving', 'Saving...');
  try {
    await saveCore();
    for (const key of Object.keys(LISTS)) await saveList(key);
    for (const key of Object.keys(LISTS)) await deleteRemoved(key);
    state.showErrors = false;
    state.dirty = rev !== startRev;
    setStatus(state.dirty ? 'saving' : 'saved', state.dirty ? 'Unsaved changes' : 'All changes saved');
    return true;
  } catch (err) {
    console.error('[Builder] Save failed:', err);
    const d = describeError(err);
    setStatus('error', 'Save failed. Click to retry');
    showToast(d.text, 'error', 6000);
    if (d.section && d.section !== state.current) showSection(d.section);
    if (d.auth) redirectToLogin();
    return false;
  } finally {
    state.saving = false;
  }
}

function save(opts = {}) {
  chain = chain.then(() => doSave(opts));
  return chain;
}

/* ------------------------------------------------------------------ */
/* Publishing                                                          */
/* ------------------------------------------------------------------ */

function renderPublishState() {
  const live = !!state.portfolio.is_published;
  $('publish-btn-text').textContent = live ? 'Unpublish' : 'Publish';
  $('publish-btn').title = live ? 'Make this portfolio private' : 'Publish portfolio';
  let link = $('view-live-btn');
  if (live) {
    if (!link) {
      link = h('a', { id: 'view-live-btn', class: 'header-btn', target: '_blank', rel: 'noopener noreferrer' }, h('span', {}, 'View live'));
      $('publish-btn').before(link);
    }
    link.href = publicUrl(state.portfolio.slug);
  } else if (link) link.remove();
}

async function togglePublish() {
  const btn = $('publish-btn');
  const next = !state.portfolio.is_published;
  if (next && !window.confirm('Publishing makes this portfolio visible to anyone with the link. Continue?')) return;
  btn.disabled = true;
  try {
    if (!(await save({ force: true }))) return;
    const { error } = await supabase.from('portfolios').update({ is_published: next })
      .eq('id', state.portfolio.id).eq('user_id', state.user.id);
    if (error) throw error;
    state.portfolio.is_published = next;
    renderPublishState();
    if (next) {
      const url = publicUrl(state.portfolio.slug);
      const copied = await copyToClipboard(url).catch(() => false);
      showToast(copied ? 'Published. The link was copied to your clipboard.' : 'Published.', 'success');
    } else {
      showToast('Portfolio is now private.', 'success');
    }
  } catch (err) {
    console.error('[Builder] Publish failed:', err);
    const d = describeError(err);
    showToast(d.text, 'error', 6000);
    if (d.auth) redirectToLogin();
  } finally {
    btn.disabled = false;
  }
}

/* ------------------------------------------------------------------ */
/* Loading                                                             */
/* ------------------------------------------------------------------ */

function showFatal(message, { retry } = {}) {
  $('section-form-container').replaceChildren(
    h('div', { class: 'empty-state', role: 'alert' },
      h('p', {}, message),
      h('p', {}, retry ? button('Try again', { class: 'btn btn-primary', onClick: retry }) : null,
        ' ', h('a', { class: 'btn', href: 'dashboard.html' }, 'Back to dashboard'))));
  $('publish-btn').disabled = true;
  $('portfolio-title-input').disabled = true;
  setStatus('error', 'Could not load portfolio');
}

async function pickPortfolioId(userId) {
  const requested = new URLSearchParams(window.location.search).get('id');
  if (requested) return requested;
  const { data, error } = await supabase.from('portfolios').select('id').eq('user_id', userId)
    .order('updated_at', { ascending: false }).limit(1).maybeSingle();
  if (error) throw error;
  return data ? data.id : null;
}

async function load() {
  const user = await requireAuth();
  state.user = user;

  const id = await pickPortfolioId(user.id);
  if (!id) return showFatal('You do not have a portfolio yet. Create one from the dashboard first.');

  const { data: pf, error: pfErr } = await supabase.from('portfolios').select('*').eq('id', id).eq('user_id', user.id).maybeSingle();
  if (pfErr && pfErr.code !== '22P02') throw pfErr; // 22P02 = malformed id in the URL
  if (!pf) return showFatal('That portfolio was not found, or you do not have access to it.');

  const { data: profile, error: prErr } = await supabase.from('profiles').select('id, full_name, location, website').eq('id', user.id).maybeSingle();
  if (prErr) throw prErr;

  const keys = Object.keys(LISTS);
  const results = await Promise.all(keys.map(k =>
    supabase.from(LISTS[k].table).select('*').eq('portfolio_id', pf.id).order('order_index', { ascending: true })));
  results.forEach((r, i) => { if (r.error) throw r.error; state.lists[keys[i]] = (r.data || []).map(row => ({ ...row, _key: nextKey(), tech_tags: row.tech_tags || [] })); });

  state.portfolio = {
    ...pf,
    profile_image_url: pf.profile_image_url || '',
    cover_url: pf.cover_url || '',
    sections: pf.sections && typeof pf.sections === 'object' ? pf.sections : {},
    template_id: resolveTemplateId(pf.template_id)
  };
  state.profile = profile || { id: user.id, full_name: '', location: '', website: '' };
  if (!state.profile.full_name && user.user_metadata?.full_name) state.profile.full_name = user.user_metadata.full_name;
  keys.forEach(k => { state.removed[k] = []; });
}

/* ------------------------------------------------------------------ */
/* Init                                                                */
/* ------------------------------------------------------------------ */

async function init() {
  setStatus('saving', 'Loading...');
  initNavigation();
  initPreviewControls();
  try {
    await load();
  } catch (err) {
    console.error('[Builder] Load failed:', err);
    const d = describeError(err);
    showFatal(`Could not load your portfolio. ${d.text}`, { retry: () => window.location.reload() });
    return;
  }
  if (!state.portfolio) return; // showFatal already rendered

  const title = $('portfolio-title-input');
  title.value = state.portfolio.title || '';
  title.maxLength = 80;
  title.setAttribute('aria-label', 'Portfolio title');
  title.addEventListener('input', () => { state.portfolio.title = title.value; markDirty(); });
  title.addEventListener('blur', () => { if (!title.value.trim()) { title.value = state.portfolio.title = 'My Portfolio'; markDirty(); } });

  $('publish-btn').addEventListener('click', togglePublish);
  $('save-status').addEventListener('click', () => { if ($('save-status').classList.contains('error')) save({ force: true }); });
  $('save-status').style.cursor = 'default';

  window.addEventListener('keydown', e => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') { e.preventDefault(); save({ force: true }); }
  });
  window.addEventListener('beforeunload', e => {
    if (state.dirty || state.saving) { e.preventDefault(); e.returnValue = ''; }
  });
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden' && state.dirty) save({ silent: true }); });
  supabase.auth.onAuthStateChange(evt => { if (evt === 'SIGNED_OUT') window.location.href = 'login.html'; });

  renderPublishState();
  renderSection();
  setStatus('saved', 'All changes saved');
  $('preview-loading').classList.add('active');
  refreshPreview();
}

init();