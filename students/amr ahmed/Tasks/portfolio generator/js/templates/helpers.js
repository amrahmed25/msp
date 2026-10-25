/** Pure helpers shared by the renderer and every template (no imports, so no cycles). */

/* ---------- escaping & URL safety ---------- */

export function esc(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}


/** Returns a URL only when it uses an allowed scheme, otherwise ''. */
export function safeUrl(url, { allowMail = false, allowTel = false } = {}) {
  const v = String(url ?? '').trim();

  if (!v) return '';
  if (/^https?:\/\//i.test(v)) return v;
  if (allowMail && /^mailto:[^\s]+$/i.test(v)) return v;
  if (allowTel && /^tel:[+\d\s-]+$/i.test(v)) return v;

  return '';
}


/** Adds https:// to bare domains typed by users ("github.com/me"). */
export function normalizeUrl(url) {
  const v = String(url ?? '').trim();

  if (!v) return '';

  // Avoid treating internal application paths as external URLs.
  if (
    /^(?:\.\.\/|\/|#)/.test(v) ||
    /^(?:index\.html?|dashboard|home)(?:[?#].*)?$/i.test(v)
  ) {
    return '';
  }

  if (/^[a-z][a-z0-9+.-]*:/i.test(v)) return v;

  return /^[^\s/]+\.[^\s/]+/.test(v) ? 'https://' + v : '';
}


export function paragraphs(text) {
  return String(text ?? '').split(/\n{2,}|\r\n\r\n/).map(s => s.trim()).filter(Boolean);
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
export function monthYear(d) {
  if (!d) return '';
  const m = /^(\d{4})-(\d{2})/.exec(String(d));
  if (!m) return '';
  return `${MONTHS[Number(m[2]) - 1] || ''} ${m[1]}`.trim();
}

export function dateRange(start, end, isCurrent) {
  const a = monthYear(start);
  const b = isCurrent ? 'Present' : monthYear(end);
  if (a && b) return `${a} \u2013 ${b}`;
  return a || b || '';
}

export function yearRange(start, end) {
  if (start && end) return `${start} \u2013 ${end}`;
  return String(start || end || '');
}


/** True when a section is visible AND has content worth showing. */
export function hasSection(m, key) {
  if (!m.show[key]) return false;
  switch (key) {
    case 'about': return !!m.about;
    case 'skills': return m.skills.length > 0;
    case 'experience': return m.experience.length > 0;
    case 'projects': return m.projects.length > 0;
    case 'services': return m.services.length > 0;
    case 'education': return m.education.length > 0 || m.certifications.length > 0;
    case 'certifications': return m.certifications.length > 0;
    case 'links': return m.links.length > 0;
    case 'contact': return !!(m.email || m.whatsapp || m.links.length);
    default: return false;
  }
}

