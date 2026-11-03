/**
 * Section partials shared by the Developer, Creative and Freelancer templates.
 * They emit neutral "ph-*" markup; each template's stylesheet decides the look.
 * (The Reference template keeps its own markup to stay faithful to the original page.)
 */
import { esc, safeUrl, normalizeUrl, paragraphs, dateRange, yearRange, hasSection } from './helpers.js';
import { icon, platformIcon } from './icons.js';

export const NAV_ORDER = [
  ['about', 'About'], ['services', 'Services'], ['skills', 'Skills'], ['experience', 'Experience'],
  ['projects', 'Projects'], ['education', 'Education'], ['contact', 'Contact']
];

export const tags = list => (list || []).filter(Boolean).map(t => `<span class="ph-tag">${esc(t)}</span>`).join('');
export const initials = name => name.split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join('') || '?';
const ext = href => (/^https?:/.test(href) ? ' target="_blank" rel="noopener noreferrer"' : '');

export function sectionBlock(id, label, heading, inner, extraClass = '') {
  return `
<section id="${id}" class="ph-section ${extraClass}">
  <div class="ph-container">
    <header class="ph-section-head fade-in"><p class="ph-eyebrow">${esc(label)}</p><h2>${esc(heading)}</h2></header>
    ${inner}
  </div>
</section>`;
}

export function navBar(m, sections) {
  const first = esc(m.name.split(/\s+/)[0] || m.name);
  const items = sections.map(
  ([k, l]) =>
    `<a href="#${k}" onclick="event.preventDefault(); document.getElementById('${k}')?.scrollIntoView({ behavior: 'smooth' });">${esc(l)}</a>`
);
  return `
<nav class="ph-nav" aria-label="Primary">
  <a class="ph-logo" href="#top">${first}</a>
  <div class="ph-nav-links">${items.join('')}</div>
  <div class="ph-nav-right">
    <button class="theme-btn" id="themeBtn" type="button" aria-label="Toggle dark theme" aria-pressed="false" title="Toggle theme"></button>
    <button class="hamburger" id="hamburgerBtn" type="button" aria-label="Toggle menu" aria-expanded="false"><span></span><span></span><span></span></button>
  </div>
</nav>
<div class="mobile-nav" id="mobileNav">${items.join('')}</div>`;
}

export function socialRow(m, size = 18) {
  const items = m.links.slice(0, 6).map(l => {
    const href = safeUrl(normalizeUrl(l.url));
    const label = l.label || l.platform;
    return `<a class="ph-social" href="${esc(href)}"${ext(href)} aria-label="${esc(label)}" title="${esc(label)}">${platformIcon(l.platform, size)}</a>`;
  });
  if (m.email) items.push(`<a class="ph-social" href="mailto:${esc(m.email)}" aria-label="Email" title="Email">${icon('mail', size)}</a>`);
  return items.length ? `<div class="ph-socials">${items.join('')}</div>` : '';
}

export function portrait(m, cls = 'ph-portrait') {
  return m.avatar
    ? `<div class="${cls}"><img src="${esc(m.avatar)}" alt="${esc(m.name)}"></div>`
    : `<div class="${cls} ph-portrait-empty" aria-hidden="true">${esc(initials(m.name))}</div>`;
}

export const aboutBody = m => `
    <div class="ph-about fade-in">
      <div class="ph-prose">${paragraphs(m.about).map(p => `<p>${esc(p)}</p>`).join('')}</div>
      <dl class="ph-facts">
        ${m.location ? `<div><dt>Location</dt><dd>${esc(m.location)}</dd></div>` : ''}
        ${m.email ? `<div><dt>Email</dt><dd><a href="mailto:${esc(m.email)}">${esc(m.email)}</a></dd></div>` : ''}
        ${m.website ? `<div><dt>Website</dt><dd><a href="${esc(m.website)}" target="_blank" rel="noopener noreferrer">${esc(m.website.replace(/^https?:\/\//, ''))}</a></dd></div>` : ''}
        ${m.currentCompany ? `<div><dt>Currently at</dt><dd>${esc(m.currentCompany)}</dd></div>` : ''}
      </dl>
    </div>`;

export const skillsBody = m => `
    <div class="ph-skill-grid">${m.skillGroups.map(g => `
      <div class="ph-card fade-in"><h3>${esc(g.category)}</h3><div class="ph-tags">${tags(g.items.map(s => s.name))}</div></div>`).join('')}
    </div>`;

export const experienceBody = m => `
    <ol class="ph-timeline">${m.experience.map(e => `
      <li class="ph-timeline-item fade-in">
        <div class="ph-timeline-date">${esc(dateRange(e.start_date, e.end_date, e.is_current))}</div>
        <div>
          <h3>${esc(e.job_title)}</h3>
          <p class="ph-muted">${esc(e.company)}${e.location ? ' \u00b7 ' + esc(e.location) : ''}</p>
          ${e.description ? `<p>${esc(e.description)}</p>` : ''}
        </div>
      </li>`).join('')}
    </ol>`;

export const projectsBody = m => `
    <div class="ph-project-grid">${m.projects.map(p => {
      const img = safeUrl(p.image_url), gh = safeUrl(normalizeUrl(p.github_url)), demo = safeUrl(normalizeUrl(p.demo_url));
      return `
      <article class="ph-project fade-in">
        <div class="ph-project-media">${img ? `<img src="${esc(img)}" alt="${esc(p.title)}" loading="lazy">` : `<span class="ph-project-empty">${icon('image', 36)}</span>`}</div>
        <div class="ph-project-body">
          <h3>${esc(p.title)}</h3>
          ${p.description ? `<p>${esc(p.description)}</p>` : ''}
          ${(p.tech_tags || []).length ? `<div class="ph-tags">${tags(p.tech_tags)}</div>` : ''}
          ${(gh || demo) ? `<div class="ph-actions">${demo ? `<a class="ph-btn ph-btn-primary" href="${esc(demo)}"${ext(demo)}>Live demo ${icon('external', 14)}</a>` : ''}${gh ? `<a class="ph-btn" href="${esc(gh)}"${ext(gh)}>Source ${icon('code', 14)}</a>` : ''}</div>` : ''}
        </div>
      </article>`;
    }).join('')}
    </div>`;

export const servicesBody = m => `
  <div class="ph-service-grid">
    ${(m.services || []).map(s => {
      const cta = safeUrl(normalizeUrl(s.contact_url)) || (m.email ? `mailto:${m.email}` : '');
      const price = s.price != null ? Number(s.price).toLocaleString('en-US') : '';

      return `
        <article class="ph-card ph-service fade-in">
          <h3 class="ph-service-title">${esc(s.name)}</h3>

          ${s.description ? `
            <p class="ph-service-description">${esc(s.description)}</p>
          ` : ''}

          ${(s.price_label || price) ? `
            <p class="ph-price">
              <span>${esc(s.price_label || '')}</span>
              ${esc(price)}
            </p>
          ` : ''}

          ${cta ? `
            <a class="ph-btn" href="${esc(cta)}"${ext(cta)}>Get in touch</a>
          ` : ''}
        </article>
      `;
    }).join('')}
  </div>
`;



export function educationBody(m) {
  const edu = m.education.map(e => `
      <div class="ph-card ph-edu fade-in"><span class="ph-edu-icon">${icon('graduation', 22)}</span>
        <h3>${esc(e.degree)}${e.field_of_study ? ' in ' + esc(e.field_of_study) : ''}</h3>
        <p class="ph-muted">${esc(e.institution)}</p><p class="ph-small">${esc(yearRange(e.start_year, e.end_year))}</p></div>`).join('');
  const certs = m.show.certifications ? m.certifications.map(c => {
    const url = safeUrl(normalizeUrl(c.credential_url));
    return `
      <div class="ph-card ph-edu fade-in"><span class="ph-edu-icon">${icon('award', 22)}</span>
        <h3>${esc(c.name)}</h3><p class="ph-muted">${esc(c.issuer || '')}</p>
        <p class="ph-small">${esc(dateRange(c.issue_date, c.expiry_date, false))}${url ? ` \u00b7 <a href="${esc(url)}" target="_blank" rel="noopener noreferrer">Credential</a>` : ''}</p></div>`;
  }).join('') : '';
  return `<div class="ph-edu-grid">${edu}${certs}</div>`;
}

export function contactBody(m, lead = 'Have a project in mind or just want to say hello? Reach out using any of the options below.') {
  const cards = [];
  if (m.email) cards.push(['mail', 'Email', m.email, `mailto:${m.email}`]);
  if (m.whatsapp) cards.push(['whatsapp', 'WhatsApp', m.whatsapp, `https://wa.me/${m.whatsapp.replace(/^\+/, '')}`]);
  m.links.forEach(l => {
    const href = safeUrl(normalizeUrl(l.url));
    cards.push([l.platform, l.label || l.platform, href.replace(/^https?:\/\/(www\.)?/, ''), href]);
  });
  const list = cards.map(([ic, lbl, val, href]) => `
        <a class="ph-contact-card" href="${esc(href)}"${ext(href)}><span class="ph-contact-icon">${platformIcon(ic, 20)}</span>
          <span><span class="ph-small">${esc(lbl)}</span><br><strong>${esc(val)}</strong></span></a>`).join('');
  const form = m.email ? `
      <form class="ph-form" id="contactForm" data-email="${esc(m.email)}" novalidate>
        <label for="fname">Your name</label><input id="fname" name="name" type="text" autocomplete="name">
        <label for="femail">Email address</label><input id="femail" name="email" type="email" autocomplete="email">
        <label for="fsubject">Subject</label><input id="fsubject" name="subject" type="text">
        <label for="fmessage">Message</label><textarea id="fmessage" name="message" rows="5"></textarea>
        <button class="ph-btn ph-btn-primary" type="submit" id="sendBtn">Send message ${icon('send', 15)}</button>
        <div id="formMsg" class="form-msg" role="status" hidden></div>
      </form>` : '';
  return `
    <div class="ph-contact fade-in${form ? '' : ' ph-contact-single'}">
      <div><p class="ph-lead">${esc(lead)}</p><div class="ph-contact-list">${list}</div></div>${form}
    </div>`;
}

export const SECTION_BODIES = {
  about: aboutBody, services: servicesBody, skills: skillsBody, experience: experienceBody,
  projects: projectsBody, education: educationBody, contact: contactBody
};

/** Renders the given section keys (only those with content) with per-template headings. */
export function renderSections(m, order, headings) {
  return order.filter(k => hasSection(m, k)).map(k => {
    const [label, heading, extra] = headings[k];
    return sectionBlock(k, label, heading, SECTION_BODIES[k](m), extra || '');
  }).join('\n');
}

export function footer(m) {
  return `<footer class="ph-footer"><p>${esc(m.name)}${m.title ? ' \u00b7 ' + esc(m.title) : ''}${m.location ? ' \u00b7 ' + esc(m.location) : ''}</p></footer>`;
}
