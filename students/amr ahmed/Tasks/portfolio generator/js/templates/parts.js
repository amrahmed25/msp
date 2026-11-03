/**
 * Small render helpers shared by the redesigned Developer, Creative and Freelancer
 * templates. Pure functions: they only read the portfolio model `m` and return
 * markup, so every template keeps rendering the signed-in user's own data.
 * The contact form keeps the ids/field names that runtime.js binds to.
 */
import { esc, safeUrl, normalizeUrl } from './helpers.js';
import { icon, platformIcon } from './icons.js';

export const extAttr = href => (/^https?:/i.test(href) ? ' target="_blank" rel="noopener noreferrer"' : '');

export const firstName = m => {
  const n = String(m.name || '').trim();
  return n.split(/\s+/)[0] || n;
};

export const initialsOf = name =>
  String(name || '').split(/\s+/).filter(Boolean).slice(0, 2).map(w => Array.from(w)[0].toUpperCase()).join('') || '?';

export const truncate = (text, max) => {
  const t = String(text || '');
  return t.length > max ? t.slice(0, max - 3).trimEnd() + '...' : t;
};

export const tagList = (list, cls) =>
  (list || []).filter(Boolean).map(t => `<span class="${cls}">${esc(t)}</span>`).join('');

/** 0-100 integer, or null when the skill has no usable level. */
export function levelOf(skill) {
  const raw = skill && skill.level;
  if (raw === null || raw === undefined || raw === '') return null;
  const n = Number(raw);
  return Number.isFinite(n) ? Math.max(0, Math.min(100, Math.round(n))) : null;
}

/** Whole calendar years since the earliest experience start date (0 when unknown). */
export function yearsOfExperience(m) {
  const years = (m.experience || [])
    .map(e => /^(\d{4})/.exec(String(e.start_date || '')))
    .filter(Boolean).map(r => Number(r[1]));
  if (!years.length) return 0;
  return Math.max(0, new Date().getFullYear() - Math.min(...years));
}

export function safeSite(m) {
  return safeUrl(normalizeUrl(m.website));
}

/** Email, WhatsApp and every valid link, normalised for contact lists. */
export function contactItems(m) {
  const out = [];
  if (m.email) out.push({ icon: 'mail', label: 'Email', value: m.email, href: `mailto:${m.email}` });
  const wa = String(m.whatsapp || '').replace(/\D/g, '');
  if (wa) out.push({ icon: 'whatsapp', label: 'WhatsApp', value: m.whatsapp, href: `https://wa.me/${wa}` });
  (m.links || []).forEach(l => {
    const href = safeUrl(normalizeUrl(l.url));
    if (!href) return;
    out.push({ icon: l.platform, label: l.label || l.platform, value: href.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, ''), href });
  });
  return out;
}

/** Icon-only social links (valid URLs only) plus email. */
export function socialsHtml(m, { wrap = 'ph-socials', item = 'ph-social', size = 18, limit = 6 } = {}) {
  const items = (m.links || []).map(l => {
    const href = safeUrl(normalizeUrl(l.url));
    if (!href) return '';
    const label = l.label || l.platform;
    return `<a class="${item}" href="${esc(href)}"${extAttr(href)} aria-label="${esc(label)}" title="${esc(label)}">${platformIcon(l.platform, size)}</a>`;
  }).filter(Boolean).slice(0, limit);
  if (m.email) items.push(`<a class="${item}" href="mailto:${esc(m.email)}" aria-label="Email" title="Email">${icon('mail', size)}</a>`);
  return items.length ? `<div class="${wrap}">${items.join('')}</div>` : '';
}

/** Contact form opens a prefilled Gmail compose page; no backend is required. */
/** Contact form is handled exclusively by runtime.js. */
export function contactFormHtml(m, o = {}) {
  if (!m.email) return '';

  const L = Object.assign(
    {
      name: 'Your name',
      email: 'Email address',
      subject: 'Subject',
      message: 'Message',
      send: 'Send message'
    },
    o.labels || {}
  );

  const ph = key =>
    o.placeholders && o.placeholders[key]
      ? ` placeholder="${esc(o.placeholders[key])}"`
      : '';

  const ownerEmail = String(m.email || '').trim();

  return `
    <form
      class="${esc(o.cls || 'ph-form')}"
      id="contactForm"
      data-email="${esc(ownerEmail)}"
      novalidate
    >
      <label for="fname">${esc(L.name)}</label>
      <input
        id="fname"
        name="name"
        type="text"
        autocomplete="name"
        required${ph('name')}
      >

      <label for="femail">${esc(L.email)}</label>
      <input
        id="femail"
        name="email"
        type="email"
        autocomplete="email"
        required${ph('email')}
      >

      <label for="fsubject">${esc(L.subject)}</label>
      <input
        id="fsubject"
        name="subject"
        type="text"${ph('subject')}
      >

      <label for="fmessage">${esc(L.message)}</label>
      <textarea
        id="fmessage"
        name="message"
        rows="5"
        required${ph('message')}
      ></textarea>

      <button
        class="${esc(o.btn || 'ph-btn ph-btn-primary')}"
        type="submit"
        id="sendBtn"
      >${esc(L.send)} ${icon('send', 15)}</button>

      <div
        id="formMsg"
        class="form-msg"
        role="status"
        aria-live="polite"
        hidden
      ></div>
    </form>`;
}

/** Theme + hamburger controls with the ids runtime.js looks for. */
export const navControls = () =>
  `<button class="theme-btn" id="themeBtn" type="button" aria-label="Toggle dark theme" aria-pressed="false" title="Toggle theme"></button>` +
  `<button class="hamburger" id="hamburgerBtn" type="button" aria-label="Toggle menu" aria-expanded="false"><span></span><span></span><span></span></button>`;
