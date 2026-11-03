/**
 * Template: Creative.
 * Editorial layout: oversized stacked name, arch portrait, and every section as a
 * two-column spread (title on the left, content on the right). Projects lead as
 * large case studies; skills are set as typographic text, not chips or bars.
 * All content comes from the model `m`.
 */
import { esc, safeUrl, normalizeUrl, paragraphs, dateRange, yearRange, hasSection } from './helpers.js';
import { icon, platformIcon } from './icons.js';
import { firstName, initialsOf, truncate, extAttr, tagList, levelOf, safeSite, contactItems, socialsHtml, contactFormHtml, navControls } from './parts.js';

export const meta = {
  id: 'creative', name: 'Creative',
  description: 'Editorial spreads with a giant stacked name, arch portrait, large case studies and typographic skills.',
  cssPaths: ['css/templates/base.css', 'css/templates/creative.css'],
  fontsUrl: 'https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,600;1,9..144,400;1,9..144,600&family=DM+Sans:wght@400;500;700&display=swap',
  thumb: 'linear-gradient(160deg, #F7F8FC 0 56%, #2F4BFF 56% 100%)',
  defaultTheme: 'light', supportsAccent: true
};

const ORDER = ['projects', 'about', 'skills', 'experience', 'services', 'education', 'contact'];
const NAV = {
  projects: 'Work', about: 'About', skills: 'Toolbox', experience: 'Experience',
  services: 'Services', education: 'Education', contact: 'Contact'
};
const HEAD = {
  projects: 'Selected work', about: 'About', skills: 'Toolbox', experience: 'Experience',
  services: 'Services', education: 'Education', contact: 'Say hello'
};

const BODY = {
  projects: m => `
    <div class="cre-cases">${m.projects.map(p => {
      const img = safeUrl(p.image_url), gh = safeUrl(normalizeUrl(p.github_url)), demo = safeUrl(normalizeUrl(p.demo_url));
      return `
      <article class="cre-case">
        <div class="cre-case-media">${img ? `<img src="${esc(img)}" alt="${esc(p.title)}" loading="lazy">` : `<span>${icon('image', 44)}</span>`}</div>
        <div class="cre-case-text">
          <h3>${esc(p.title)}</h3>
          <div>
            ${p.description ? `<p>${esc(p.description)}</p>` : ''}
            ${(p.tech_tags || []).length ? `<p class="cre-case-tags">${tagList(p.tech_tags, 'cre-tag')}</p>` : ''}
            ${(gh || demo) ? `<p class="cre-case-links">${demo ? `<a href="${esc(demo)}"${extAttr(demo)}>Visit project ${icon('external', 14)}</a>` : ''}${gh ? `<a href="${esc(gh)}"${extAttr(gh)}>Source code ${icon('code', 14)}</a>` : ''}</p>` : ''}
          </div>
        </div>
      </article>`;
    }).join('')}
    </div>`,

  about: m => {
    const [lead, ...rest] = paragraphs(m.about);
    const site = safeSite(m);
    const facts = [
      m.location ? `<li>${icon('pin', 15)} ${esc(m.location)}</li>` : '',
      m.currentCompany ? `<li>${icon('briefcase', 15)} ${esc(m.currentCompany)}</li>` : '',
      m.email ? `<li>${icon('mail', 15)} <a href="mailto:${esc(m.email)}">${esc(m.email)}</a></li>` : '',
      site ? `<li>${icon('globe', 15)} <a href="${esc(site)}"${extAttr(site)}>${esc(site.replace(/^https?:\/\//, ''))}</a></li>` : ''
    ].filter(Boolean);
    return `
    <p class="cre-statement">${esc(lead || '')}</p>
    ${rest.length ? `<div class="cre-cols">${rest.map(p => `<p>${esc(p)}</p>`).join('')}</div>` : ''}
    ${facts.length ? `<ul class="cre-facts">${facts.join('')}</ul>` : ''}`;
  },

  skills: m => `
    <div class="cre-skills">${m.skillGroups.map(g => `
      <div class="cre-skillgroup">
        <h3>${esc(g.category)}</h3>
        <p>${g.items.map(s => {
          const lv = levelOf(s);
          const tier = lv === null ? 2 : lv >= 80 ? 3 : lv >= 50 ? 2 : 1;
          return `<span class="cre-sk cre-sk-${tier}">${esc(s.name)}</span>`;
        }).join('')}</p>
      </div>`).join('')}
    </div>`,

  experience: m => `
    <ol class="cre-rows">${m.experience.map(e => `
      <li>
        <p class="cre-date">${esc(dateRange(e.start_date, e.end_date, e.is_current))}</p>
        <div><h3>${esc(e.job_title)}</h3><p class="cre-org">${esc(e.company)}${e.location ? ', ' + esc(e.location) : ''}</p></div>
        ${e.description ? `<p class="cre-desc">${esc(e.description)}</p>` : ''}
      </li>`).join('')}
    </ol>`,

  services: m => `
    <ul class="cre-offers">${m.services.map(s => {
      const cta = safeUrl(normalizeUrl(s.contact_url)) || (m.email ? `mailto:${m.email}` : '');
      const price = s.price != null ? Number(s.price).toLocaleString('en-US') : '';
      return `
      <li>
        <div><h3>${esc(s.name)}</h3>${s.description ? `<p>${esc(s.description)}</p>` : ''}${cta ? `<a href="${esc(cta)}"${extAttr(cta)}>Ask about this ${icon('send', 14)}</a>` : ''}</div>
        ${(s.price_label || price) ? `<p class="cre-price"><small>${esc(s.price_label || '')}</small>${esc(price)}</p>` : ''}
      </li>`;
    }).join('')}
    </ul>`,

  education: m => {
    const edu = m.education.map(e => `
      <li><p class="cre-date">${esc(yearRange(e.start_year, e.end_year))}</p>
        <div><h3>${esc(e.degree)}${e.field_of_study ? ' in ' + esc(e.field_of_study) : ''}</h3><p class="cre-org">${esc(e.institution)}</p></div></li>`).join('');
    const certs = m.show.certifications ? m.certifications.map(c => {
      const url = safeUrl(normalizeUrl(c.credential_url));
      return `
      <li><p class="cre-date">${esc(dateRange(c.issue_date, c.expiry_date, false))}</p>
        <div><h3>${esc(c.name)}</h3><p class="cre-org">${esc(c.issuer || '')}${url ? ` <a href="${esc(url)}"${extAttr(url)}>Credential</a>` : ''}</p></div></li>`;
    }).join('') : '';
    return `<ul class="cre-rows cre-rows-compact">${edu}${certs}</ul>`;
  },

  contact: m => {
    const items = contactItems(m);
    const lead = items[0];
    const form = contactFormHtml(m, { cls: 'cre-form', btn: 'ph-btn ph-btn-primary', labels: { send: 'Send message' } });
    return `
    ${lead ? `<a class="cre-bigmail" href="${esc(lead.href)}"${extAttr(lead.href)}>${esc(lead.value)}</a>` : ''}
    <div class="cre-contact${form ? '' : ' cre-contact-single'}">
      <ul class="cre-contact-list">${items.slice(lead ? 1 : 0).map(i => `
        <li><a href="${esc(i.href)}"${extAttr(i.href)}>${platformIcon(i.icon, 18)}<span>${esc(i.label)}<small>${esc(i.value)}</small></span></a></li>`).join('')}
      </ul>${form}
    </div>`;
  }
};

const spread = (m, k) => `
<section id="${k}" class="cre-spread">
  <div class="cre-wrap cre-spread-grid">
    <header class="cre-spread-head"><h2>${esc(HEAD[k])}</h2></header>
    <div class="cre-spread-body">${BODY[k](m)}</div>
  </div>
</section>`;

export function render(m) {
  const present = ORDER.filter(k => hasSection(m, k));
  const first = firstName(m);
  const words = String(m.name || '').split(/\s+/).filter(Boolean);
  const links = present.map(k => `<a href="#${k}">${NAV[k]}</a>`).join('');
  const portrait = m.avatar
    ? `<img src="${esc(m.avatar)}" alt="${esc(m.name)}">`
    : `<span aria-hidden="true">${esc(initialsOf(m.name))}</span>`;
  return `
<a id="top"></a>
<nav class="cre-nav" aria-label="Primary">
  <a class="cre-logo" href="#top">${esc(first)}</a>
  <div class="cre-nav-links">${links}</div>
  <div class="cre-nav-right">${navControls()}</div>
</nav>
<div class="mobile-nav" id="mobileNav">${links}</div>
<main>
<header class="cre-hero">
  <div class="cre-wrap cre-hero-grid">
    <div class="cre-hero-main">
      ${m.title ? `<p class="cre-kicker">${esc(m.title)}</p>` : ''}
      <h1 class="cre-name">${words.map(w => `<span class="cre-word"><span>${esc(w)}</span></span>`).join('')}</h1>
      <div class="cre-intro">
        ${m.about ? `<p>${esc(truncate(m.about, 200))}</p>` : ''}
        <div class="ph-actions">
          ${hasSection(m, 'projects') ? '<a class="ph-btn ph-btn-primary" href="#projects">See my work</a>' : ''}
          ${hasSection(m, 'contact') ? '<a class="ph-btn" href="#contact">Say hello</a>' : ''}
        </div>
        ${socialsHtml(m, { wrap: 'cre-socials', item: 'cre-social', size: 18 })}
      </div>
    </div>
    <div class="cre-arch">${portrait}</div>
  </div>
</header>
${present.map(k => spread(m, k)).join('\n')}
</main>
<footer class="cre-footer"><div class="cre-wrap"><p>${esc(m.name)}${m.title ? ', ' + esc(m.title) : ''}${m.location ? ', ' + esc(m.location) : ''}</p></div></footer>`;
}
