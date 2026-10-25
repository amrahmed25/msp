/**
 * Inline SVG icon set used by the portfolio templates.
 * Templates render inside a sandboxed iframe, so icons are inlined (no CDN).
 */
const PATHS = {
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>',
  phone: '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"/>',
  globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>',
  github: '<path d="M9 19c-4 1.5-4-2-6-2m12 4v-3.5a3 3 0 0 0-.8-2.3c2.8-.3 5.8-1.4 5.8-6.2a4.8 4.8 0 0 0-1.3-3.3 4.4 4.4 0 0 0-.1-3.3s-1.1-.3-3.5 1.3a12 12 0 0 0-6.2 0C6.5 2.8 5.4 3.1 5.4 3.1a4.4 4.4 0 0 0-.1 3.3A4.8 4.8 0 0 0 4 9.7c0 4.8 3 5.9 5.8 6.2A3 3 0 0 0 9 18.2V21"/>',
  linkedin: '<path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/>',
  link: '<path d="M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1"/><path d="M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1"/>',
  external: '<path d="M14 4h6v6M20 4l-9 9"/><path d="M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>',
  graduation: '<path d="M22 10L12 5 2 10l10 5z"/><path d="M6 12v5c3 2 9 2 12 0v-5"/>',
  award: '<circle cx="12" cy="9" r="6"/><path d="M8.5 14L7 22l5-3 5 3-1.5-8"/>',
  briefcase: '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>',
  image: '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/>',
  arrowDown: '<path d="M12 5v14M5 12l7 7 7-7"/>',
  send: '<path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4z"/>',
  check: '<path d="M20 6L9 17l-5-5"/>',
  alert: '<path d="M10.3 3.9L2 18a2 2 0 0 0 1.7 3h16.6A2 2 0 0 0 22 18L13.7 3.9a2 2 0 0 0-3.4 0z"/><path d="M12 9v4M12 17h.01"/>',
  pin: '<path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/>',
  whatsapp: '<path d="M3 21l1.7-5A9 9 0 1 1 8 19.3z"/><path d="M9 10c0 3 2 5 5 5l1.5-1.5-2-1-1 .7a3 3 0 0 1-1.7-1.7l.7-1-1-2z"/>',
  twitter: '<path d="M4 4l16 16M20 4L4 20"/>',
  dribbble: '<circle cx="12" cy="12" r="9"/><path d="M3.5 9.5c5 .5 11-1 14.5-4.5M8 3.5c3 3.5 6 9 7 17M3.5 14.5c5-2 11-1 17 1"/>',
  behance: '<path d="M3 6h6a3 3 0 0 1 0 6H3zM3 12h7a3 3 0 0 1 0 6H3zM14 9h7M15 15h6a3 3 0 0 0-6-1"/>',
  code: '<path d="M16 18l6-6-6-6M8 6l-6 6 6 6"/>'
};

const PLATFORM_ICON = {
  github: 'github', linkedin: 'linkedin', twitter: 'twitter', x: 'twitter',
  dribbble: 'dribbble', behance: 'behance', whatsapp: 'whatsapp',
  email: 'mail', mail: 'mail', website: 'globe', portfolio: 'globe'
};

export function icon(name, size = 20) {
  const p = PATHS[name] || PATHS.link;
  return `<svg class="ico" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${p}</svg>`;
}

export function platformIcon(platform, size = 20) {
  return icon(PLATFORM_ICON[String(platform || '').toLowerCase()] || 'link', size);
}
