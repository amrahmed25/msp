/**
 * Template: Freelancer.
 * Conversion-focused landing page: persistent "Hire me" bar, services as priced
 * cards right after the hero, inset-image project cards, expertise meters, and a
 * contact band with the form. Stats are computed from the user's own data.
 */
import { esc, safeUrl, normalizeUrl, paragraphs, dateRange, yearRange, hasSection } from './helpers.js';
import { icon, platformIcon } from './icons.js';
import { firstName, initialsOf, truncate, extAttr, tagList, levelOf, safeSite, contactItems, socialsHtml, contactFormHtml, yearsOfExperience, navControls } from './parts.js';

export const meta = {
  id: 'freelancer', name: 'Freelancer',
  description: 'Hire-me landing page: priced service cards first, inset project cards, expertise meters and a contact band.',
  cssPaths: ['css/templates/base.css', 'css/templates/freelancer.css'],
  fontsUrl: 'https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,700;12..96,800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap',
  thumb: 'linear-gradient(180deg, #FFFFFF 0 46%, #0B1F4B 46% 100%)',
  defaultTheme: 'light', supportsAccent: true
};

const ORDER = ['services', 'projects', 'about', 'skills', 'experience', 'education', 'contact'];
const NAV = {
  services: 'Services', projects: 'Work', about: 'About', skills: 'Expertise',
  experience: 'Experience', education: 'Credentials', contact: 'Contact'
};
const HEAD = {
  services: ['Services', 'What I can do for you'], projects: ['Selected work', 'Recent projects'],
  about: ['About', 'Who you will be working with'], skills: ['Expertise', 'Tools I work with'],
  experience: ['Experience', 'Track record'], education: ['Credentials', 'Education and certifications']
};

const BODY = {
  services: m => `
    <div class="fl-services">${m.services.map(s => {
      const cta = safeUrl(normalizeUrl(s.contact_url)) || (m.email ? `mailto:${m.email}` : '');
      const img = safeUrl(s.image_url);
      const price = s.price != null ? Number(s.price).toLocaleString('en-US') : '';
      return `
      <article class="fl-service">
        ${img ? `<div class="fl-service-img"><img src="${esc(img)}" alt="${esc(s.name)}" loading="lazy"></div>` : `<span class="fl-service-ico">${icon('briefcase', 22)}</span>`}
        <h3>${esc(s.name)}</h3>
        ${s.description ? `<p class="fl-service-desc">${esc(s.description)}</p>` : ''}
        ${(s.price_label || price) ? `<p class="fl-price">${s.price_label ? `<small>${esc(s.price_label)}</small>` : ''}<strong>${esc(price)}</strong></p>` : ''}
        ${cta ? `<a class="ph-btn ph-btn-primary" href="${esc(cta)}"${extAttr(cta)}>Get in touch</a>` : ''}
      </article>`;
    }).join('')}
    </div>`,

  projects: m => `
    <div class="fl-projects">${m.projects.map(p => {
      const img = safeUrl(p.image_url), gh = safeUrl(normalizeUrl(p.github_url)), demo = safeUrl(normalizeUrl(p.demo_url));
      return `
      <article class="fl-project">
        <div class="fl-project-media">${img ? `<img src="${esc(img)}" alt="${esc(p.title)}" loading="lazy">` : `<span>${icon('image', 38)}</span>`}</div>
        <div class="fl-project-body">
          <h3>${esc(p.title)}</h3>
          ${p.description ? `<p>${esc(p.description)}</p>` : ''}
          ${(p.tech_tags || []).length ? `<div class="fl-chips">${tagList(p.tech_tags, 'fl-chip')}</div>` : ''}
          ${(gh || demo) ? `<div class="fl-project-links">${demo ? `<a class="fl-textlink" href="${esc(demo)}"${extAttr(demo)}>View live ${icon('external', 14)}</a>` : ''}${gh ? `<a class="fl-textlink fl-textlink-soft" href="${esc(gh)}"${extAttr(gh)}>Source ${icon('code', 14)}</a>` : ''}</div>` : ''}
        </div>
      </article>`;
    }).join('')}
    </div>`,

  about: m => {
    const site = safeSite(m);
    const facts = [
      m.location ? `<li>${icon('pin', 17)}<span>${esc(m.location)}</span></li>` : '',
      m.currentCompany ? `<li>${icon('briefcase', 17)}<span>${esc(m.currentCompany)}</span></li>` : '',
      m.email ? `<li>${icon('mail', 17)}<a href="mailto:${esc(m.email)}">${esc(m.email)}</a></li>` : '',
      site ? `<li>${icon('globe', 17)}<a href="${esc(site)}"${extAttr(site)}>${esc(site.replace(/^https?:\/\//, ''))}</a></li>` : ''
    ].filter(Boolean);
    return `
    <div class="fl-about">
      <div class="fl-prose">${paragraphs(m.about).map(p => `<p>${esc(p)}</p>`).join('')}</div>
      ${facts.length ? `<ul class="fl-facts">${facts.join('')}</ul>` : ''}
    </div>`;
  },

  skills: m => `
    <div class="fl-skills">${m.skillGroups.map(g => `
      <div class="fl-skillgroup">
        <h3>${esc(g.category)}</h3>
        <ul>${g.items.map(s => {
          const lv = levelOf(s);
          return lv === null
            ? `<li class="fl-skill-plain"><span>${esc(s.name)}</span></li>`
            : `<li><label><span>${esc(s.name)}</span><span class="fl-skill-pct">${lv}%</span></label><progress max="100" value="${lv}" aria-label="${esc(s.name)} ${lv}%"></progress></li>`;
        }).join('')}</ul>
      </div>`).join('')}
    </div>`,

  experience: m => `
    <ol class="fl-jobs">${m.experience.map(e => `
      <li class="fl-job">
        <span class="fl-job-badge" aria-hidden="true">${esc(initialsOf(e.company))}</span>
        <div>
          <div class="fl-job-head"><h3>${esc(e.job_title)}</h3><span class="fl-pill">${esc(dateRange(e.start_date, e.end_date, e.is_current))}</span></div>
          <p class="fl-job-org">${esc(e.company)}${e.location ? ' \u00b7 ' + esc(e.location) : ''}</p>
          ${e.description ? `<p class="fl-job-desc">${esc(e.description)}</p>` : ''}
        </div>
      </li>`).join('')}
    </ol>`,

  education: m => {
    const edu = m.education.map(e => `
      <li><span class="fl-cred-ico">${icon('graduation', 20)}</span>
        <div><h3>${esc(e.degree)}${e.field_of_study ? ' in ' + esc(e.field_of_study) : ''}</h3><p>${esc(e.institution)}</p><p class="fl-cred-date">${esc(yearRange(e.start_year, e.end_year))}</p></div></li>`).join('');
    const certs = m.show.certifications ? m.certifications.map(c => {
      const url = safeUrl(normalizeUrl(c.credential_url));
      return `
      <li><span class="fl-cred-ico">${icon('award', 20)}</span>
        <div><h3>${esc(c.name)}</h3><p>${esc(c.issuer || '')}</p><p class="fl-cred-date">${esc(dateRange(c.issue_date, c.expiry_date, false))}${url ? ` \u00b7 <a href="${esc(url)}"${extAttr(url)}>Verify</a>` : ''}</p></div></li>`;
    }).join('') : '';
    return `<ul class="fl-creds">${edu}${certs}</ul>`;
  }
};

const section = (m, k) => `
<section id="${k}" class="fl-sec">
  <div class="fl-wrap">
    <header class="fl-sec-head"><p class="fl-eyebrow">${esc(HEAD[k][0])}</p><h2>${esc(HEAD[k][1])}</h2></header>
    ${BODY[k](m)}
  </div>
</section>`;

function contactBand(m) {
  const items = contactItems(m);
  const direct = items.filter(i => i.icon === 'mail' || i.icon === 'whatsapp');
  const others = items.filter(i => i.icon !== 'mail' && i.icon !== 'whatsapp');
  const form = contactFormHtml(m, { cls: 'fl-form', btn: 'ph-btn ph-btn-primary', labels: { send: 'Send message' } });
  return `
<section id="contact" class="fl-contact">
  <div class="fl-wrap fl-contact-grid${form ? '' : ' fl-contact-single'}">
    <div class="fl-contact-copy">
      <h2>Start a project</h2>
      <p>Tell me what you need and I will get back to you with next steps.</p>
      ${direct.length ? `<div class="fl-direct">${direct.map((i, n) => `<a class="ph-btn ${n === 0 ? 'ph-btn-primary' : 'fl-btn-light'}" href="${esc(i.href)}"${extAttr(i.href)}>${platformIcon(i.icon, 17)} ${esc(i.label === 'Email' ? i.value : i.label)}</a>`).join('')}</div>` : ''}
      ${others.length ? `<ul class="fl-contact-links">${others.map(i => `<li><a href="${esc(i.href)}"${extAttr(i.href)}>${platformIcon(i.icon, 18)} <span>${esc(i.label)}</span></a></li>`).join('')}</ul>` : ''}
    </div>${form}
  </div>
</section>`;
}

export function render(m) {
  const present = ORDER.filter(k => hasSection(m, k));
  const first = firstName(m);
  const navKeys = present.filter(k => k !== 'contact');
  const links = navKeys.map(k => `<a href="#${k}">${NAV[k]}</a>`).join('');
  const hireHref = hasSection(m, 'contact') ? '#contact' : (m.email ? `mailto:${esc(m.email)}` : '');
  const years = yearsOfExperience(m);
  const stats = [
    [years > 0 ? String(years) : '', 'Years of experience'],
    [hasSection(m, 'projects') ? String(m.projects.length) : '', 'Projects delivered'],
    [hasSection(m, 'skills') ? String(m.skills.length) : '', 'Skills'],
    [m.show.certifications && m.certifications.length ? String(m.certifications.length) : '', 'Certifications']
  ].filter(s => s[0]).slice(0, 4);
  const photo = m.avatar
    ? `<img src="${esc(m.avatar)}" alt="${esc(m.name)}">`
    : `<span aria-hidden="true">${esc(initialsOf(m.name))}</span>`;

  return `
<a id="top"></a>
<nav class="fl-bar" aria-label="Primary">
  <a class="fl-logo" href="#top"><span class="fl-logo-mark" aria-hidden="true">${esc(initialsOf(m.name).slice(0, 1))}</span>${esc(first)}</a>
  <div class="fl-bar-links">${links}</div>
  <div class="fl-bar-right">
    ${hireHref ? `<a class="ph-btn ph-btn-primary fl-hire" href="${hireHref}">Hire me</a>` : ''}
    ${navControls()}
  </div>
</nav>
<div class="mobile-nav" id="mobileNav">${links}</div>
<main>
<header class="fl-hero">
  <div class="fl-wrap fl-hero-grid">
    <div class="fl-hero-copy">
      <h1>${esc(m.name)}</h1>
      ${m.title ? `<p class="fl-role">${esc(m.title)}</p>` : ''}
      ${m.about ? `<p class="fl-lead">${esc(truncate(m.about, 180))}</p>` : ''}
      <div class="ph-actions">
        ${hireHref ? `<a class="ph-btn ph-btn-primary" href="${hireHref}">Hire me</a>` : ''}
        ${hasSection(m, 'services') ? '<a class="ph-btn" href="#services">View services</a>' : (hasSection(m, 'projects') ? '<a class="ph-btn" href="#projects">See my work</a>' : '')}
      </div>
      ${socialsHtml(m, { wrap: 'fl-socials', item: 'fl-social', size: 18 })}
    </div>
    <div class="fl-hero-visual">
      <div class="fl-photo">${photo}</div>
      ${m.currentCompany ? `<div class="fl-float fl-float-co"><small>Currently at</small><strong>${esc(m.currentCompany)}</strong></div>` : ''}
      ${m.location ? `<div class="fl-float fl-float-loc">${icon('pin', 16)}<strong>${esc(m.location)}</strong></div>` : ''}
    </div>
  </div>
  ${stats.length ? `<div class="fl-wrap"><dl class="fl-stats">${stats.map(([n, l]) => `<div><dt>${esc(l)}</dt><dd>${esc(n)}</dd></div>`).join('')}</dl></div>` : ''}
</header>
${present.map(k => (k === 'contact' ? contactBand(m) : section(m, k))).join('\n')}
</main>
<footer class="fl-footer"><div class="fl-wrap"><p>${esc(m.name)}${m.title ? ' \u00b7 ' + esc(m.title) : ''}${m.location ? ' \u00b7 ' + esc(m.location) : ''}</p></div></footer>
${m.email ? `<a class="ph-btn ph-btn-primary fl-sticky" href="${hireHref}">Hire me</a>` : ''}`;
}
