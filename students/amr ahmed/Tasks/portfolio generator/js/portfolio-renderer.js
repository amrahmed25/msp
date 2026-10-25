
/**
 * portfolio-renderer.js
 * Turns database rows into a self-contained HTML document for one of the
 * portfolio templates. The same code feeds the builder live preview and the
 * public portfolio page, so what the owner sees is what visitors get.
 */

import * as reference from './templates/reference.js';
import * as developer from './templates/developer.js';
import * as creative from './templates/creative.js';
import * as freelancer from './templates/freelancer.js';

import {
  esc,
  safeUrl,
  normalizeUrl,
  hasSection
} from './templates/helpers.js';

export { esc, safeUrl, normalizeUrl, hasSection };

export {
  paragraphs,
  monthYear,
  dateRange,
  yearRange
} from './templates/helpers.js';

/** Registry of available templates. Order = order shown in the gallery. */
export const TEMPLATES = {
  reference,
  developer,
  creative,
  freelancer
};

export const DEFAULT_TEMPLATE = 'reference';
export const DEFAULT_ACCENT = '#2563EB';

/** Unknown / legacy ids (for example 'minimal') fall back to the default. */
export function resolveTemplateId(id) {
  return Object.prototype.hasOwnProperty.call(TEMPLATES, id)
    ? id
    : DEFAULT_TEMPLATE;
}

/* ---------- data model ---------- */

export const SECTION_KEYS = [
  'about',
  'skills',
  'experience',
  'projects',
  'services',
  'education',
  'certifications',
  'links',
  'contact'
];

/**
 * Builds the view model every template renders from.
 * Accepts the raw rows from Supabase (any may be missing or null).
 */
export function normalizeData(raw = {}) {
  const profile = raw.profile || {};
  const pf = raw.portfolio || {};

  const byOrder = (a, b) =>
    (a.order_index ?? 0) - (b.order_index ?? 0);

  const list = key =>
    Array.isArray(raw[key])
      ? raw[key].slice().sort(byOrder)
      : [];

  const sections =
    pf.sections && typeof pf.sections === 'object'
      ? pf.sections
      : {};

  const visible = key => sections[key] !== false;

  const skills = list('skills');
  const groups = [];

  skills.forEach(skill => {
    const category =
      (skill.category || 'General').trim() || 'General';

    let group = groups.find(
      item => item.category === category
    );

    if (!group) {
      group = {
        category,
        items: []
      };

      groups.push(group);
    }

    group.items.push(skill);
  });

  const name =
    (profile.full_name || '').trim() ||
    pf.title ||
    'Your Name';

  const experience = list('experience');
  const email = (pf.contact_email || '').trim();

  /*
   * Portfolio images are independent of account profile images.
   *
   * Profile image:
   * portfolios.profile_image_url
   *
   * Cover image:
   * portfolios.cover_url
   *
   * Intentionally do not fall back to profiles.avatar_url
   * or profiles.cover_url.
   */
  const portfolioAvatarUrl = safeUrl(
    pf.profile_image_url
  );

  const portfolioCoverUrl = safeUrl(
    pf.cover_url
  );

  const hasValidThemeColor =
    /^#[0-9a-f]{6}$/i.test(pf.theme_color || '');

  const usesDefaultAccent =
    !hasValidThemeColor ||
    pf.theme_color.toLowerCase() ===
      DEFAULT_ACCENT.toLowerCase();

  const title = (
    pf.headline ||
    profile.title ||
    ''
  ).trim();

  const about = (
    pf.about ||
    profile.bio ||
    ''
  ).trim();

  return {
    templateId: resolveTemplateId(
      pf.template_id
    ),

    slug: pf.slug || '',

    themeColor: hasValidThemeColor
      ? pf.theme_color
      : DEFAULT_ACCENT,

    /*
     * An empty accent means the template should use
     * its own default colors.
     */
    accent: usesDefaultAccent
      ? ''
      : pf.theme_color,

    name,

    title,

    about,

    // Portfolio-specific image only.
    // An empty value allows the template placeholder to render.
    avatar: portfolioAvatarUrl,

    // Portfolio-specific cover only.
    cover: portfolioCoverUrl,

    location: (
      profile.location || ''
    ).trim(),

    website: safeUrl(
      normalizeUrl(profile.website)
    ),

    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
      ? email
      : '',

    whatsapp: (
      pf.whatsapp || ''
    ).replace(/[^\d+]/g, ''),

    seoTitle:
      pf.seo_title ||
      `${name}${pf.headline ? ' | ' + pf.headline : ''}`,

    seoDescription:
      pf.seo_description ||
      (pf.about || profile.bio || '').slice(0, 160),

    projects: list('projects'),

    services: list('services'),

    skills,

    skillGroups: groups,

    experience,

    currentCompany:
      (experience.find(item => item.is_current) || {})
        .company || '',

    education: list('education'),

    certifications: list('certifications'),

    links: list('links').filter(
      link =>
        !link.is_hidden &&
        safeUrl(normalizeUrl(link.url))
    ),

    show: Object.fromEntries(
      SECTION_KEYS.map(key => [
        key,
        visible(key)
      ])
    )
  };
}

/* ---------- document assembly ---------- */

/**
 * Builds the complete HTML document string for a portfolio.
 *
 * @param {object} model Result of normalizeData().
 * @param {object} opts
 * @param {string} opts.baseUrl Absolute URL of the site root.
 * @param {string} [opts.templateId] Optional template override.
 * @param {'light'|'dark'} [opts.theme] Optional theme override.
 */
export function buildDocument(model, opts = {}) {
  const id = resolveTemplateId(
    opts.templateId || model.templateId
  );

  const tpl = TEMPLATES[id];
  const base = opts.baseUrl || '/';

  const body = tpl.render(model);

  const fonts = tpl.meta.fontsUrl
    ? `
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link
        rel="preconnect"
        href="https://fonts.gstatic.com"
        crossorigin
      >
      <link
        href="${esc(tpl.meta.fontsUrl)}"
        rel="stylesheet"
      >
    `
    : '';

  const cssPaths =
    tpl.meta.cssPaths ||
    [tpl.meta.cssPath];

  const stylesheets = cssPaths
    .map(
      path =>
        `<link rel="stylesheet" href="${esc(base + path)}">`
    )
    .join('\n');

  const staticStyles = opts.static
    ? `
      <style>
        .fade-in {
          opacity: 1 !important;
          transform: none !important;
          transition: none !important;
        }

        html {
          scroll-behavior: auto !important;
        }
      </style>
    `
    : '';

  const theme =
    (opts.theme || tpl.meta.defaultTheme) === 'dark'
      ? 'dark'
      : 'light';

  const previewAttribute = opts.preview
    ? ' data-preview="1"'
    : '';

  const scrollAttribute = opts.scrollY
    ? ` data-scroll="${Number(opts.scrollY) | 0}"`
    : '';

  const accentAttribute = model.accent
    ? ` style="--user-accent:${esc(model.accent)}"`
    : '';

  const runtimeScript = opts.static
    ? ''
    : `<script src="${esc(base + 'js/templates/runtime.js')}"></script>`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(model.seoTitle)}</title>
<meta name="description" content="${esc(model.seoDescription)}">
${fonts}
${stylesheets}
${staticStyles}
</head>
<body data-theme="${theme}" data-template="${esc(id)}"${previewAttribute}${scrollAttribute}${accentAttribute}>
${body}
${runtimeScript}
</body>
</html>`;
}
