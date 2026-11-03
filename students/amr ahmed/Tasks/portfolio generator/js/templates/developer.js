/**
 * Template: Developer.
 * A code-workspace layout: fixed "explorer" sidebar, terminal hero, every section a
 * file tab. Skills render as a JSON block with meters, projects as repo rows,
 * experience as a commit-style log. Dark by default. All content comes from the model `m`.
 */
import { esc, safeUrl, normalizeUrl, paragraphs, dateRange, yearRange, hasSection } from './helpers.js';
import { icon, platformIcon } from './icons.js';
import { firstName, initialsOf, extAttr, tagList, levelOf, safeSite, contactItems, socialsHtml, contactFormHtml, navControls } from './parts.js';

export const meta = {
  id: 'developer', name: 'Developer',
  description: 'Code-workspace layout: file-explorer sidebar, terminal hero, JSON skills and a commit-style experience log.',
  cssPaths: ['css/templates/base.css', 'css/templates/developer.css'],
  fontsUrl: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap',
  thumb: 'linear-gradient(90deg, #0F1A36 0 28%, #080E1C 28% 100%)',
  defaultTheme: 'dark', supportsAccent: true
};

const ORDER = ['about', 'skills', 'projects', 'experience', 'education', 'services', 'contact'];
const FILE = {
  about: 'about.md', skills: 'skills.json', projects: 'projects/', experience: 'experience.log',
  education: 'education.md', services: 'services.yml', contact: 'contact.sh'
};
const TITLE = {
  about: 'About', skills: 'Tech stack', projects: 'Selected work', experience: 'Experience',
  education: 'Education', services: 'Services', contact: 'Get in touch'
};
const ICON = { about: 'globe', skills: 'code', projects: 'external', experience: 'briefcase', education: 'graduation', services: 'award', contact: 'mail' };

const str = v => `<span class="dev-str">"${esc(v)}"</span>`;
const punc = v => `<span class="dev-punc">${v}</span>`;
const kv = (k, v) => v ? `<span class="dev-line"><span class="dev-key">${k}</span>${punc(':')} ${str(v)}${punc(',')}</span>` : '';
const kvList = (k, list) => list.length
  ? `<span class="dev-line"><span class="dev-key">${k}</span>${punc(': [')}${list.map(str).join(punc(', '))}${punc('],')}</span>` : '';
const meter = lv => {
  const f = Math.round(lv / 10);
  return `<span class="dev-meter" role="img" aria-label="${lv}%">${'\u2588'.repeat(f)}<i>${'\u2591'.repeat(10 - f)}</i></span>`;
};

const BODY = {
  about: m => {
    const site = safeSite(m);
    const facts = [
      ['location', m.location ? esc(m.location) : ''],
      ['company', m.currentCompany ? esc(m.currentCompany) : ''],
      ['email', m.email ? `<a href="mailto:${esc(m.email)}">${esc(m.email)}</a>` : ''],
      ['website', site ? `<a href="${esc(site)}"${extAttr(site)}>${esc(site.replace(/^https?:\/\//, ''))}</a>` : '']
    ].filter(f => f[1]);
    return `
    <div class="dev-about">
      <div class="dev-prose">${paragraphs(m.about).map(p => `<p>${esc(p)}</p>`).join('')}</div>
      ${facts.length ? `<dl class="dev-facts">${facts.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join('')}</dl>` : ''}
    </div>`;
  },

  skills: m => `
    <div class="dev-skills">${m.skillGroups.map(g => `
      <div class="dev-skillgroup">
        <h3>${str(g.category)}${punc(': [')}</h3>
        <ul>${g.items.map(s => {
          const lv = levelOf(s);
          return `<li><span class="dev-skill-name">${esc(s.name)}</span>${lv === null ? '' : `${meter(lv)}<span class="dev-pct">${lv}</span>`}</li>`;
        }).join('')}</ul>
        <p class="dev-punc">]</p>
      </div>`).join('')}
    </div>`,

  projects: m => `
    <div class="dev-repos">${m.projects.map(p => {
      const img = safeUrl(p.image_url), gh = safeUrl(normalizeUrl(p.github_url)), demo = safeUrl(normalizeUrl(p.demo_url));
      return `
      <article class="dev-repo">
        <div class="dev-repo-media">${img ? `<img src="${esc(img)}" alt="${esc(p.title)}" loading="lazy">` : `<span>${icon('image', 28)}</span>`}</div>
        <div class="dev-repo-body">
          <h3>${icon('code', 16)} ${esc(p.title)}</h3>
          ${p.description ? `<p>${esc(p.description)}</p>` : ''}
          ${(p.tech_tags || []).length ? `<div class="dev-tags">${tagList(p.tech_tags, 'dev-tag')}</div>` : ''}
          ${(gh || demo) ? `<div class="dev-repo-links">${demo ? `<a class="dev-link dev-link-main" href="${esc(demo)}"${extAttr(demo)}>Live demo ${icon('external', 13)}</a>` : ''}${gh ? `<a class="dev-link" href="${esc(gh)}"${extAttr(gh)}>Source ${icon('code', 13)}</a>` : ''}</div>` : ''}
        </div>
      </article>`;
    }).join('')}
    </div>`,

  experience: m => `
    <ol class="dev-log">${m.experience.map(e => `
      <li>
        <div class="dev-log-head"><h3>${esc(e.job_title)}</h3><span class="dev-at">@ ${esc(e.company)}${e.location ? ' / ' + esc(e.location) : ''}</span></div>
        <time>${esc(dateRange(e.start_date, e.end_date, e.is_current))}</time>
        ${e.description ? `<p>${esc(e.description)}</p>` : ''}
      </li>`).join('')}
    </ol>`,

  education: m => {
    const edu = m.education.map(e => `
      <li><span class="dev-row-ico">${icon('graduation', 18)}</span>
        <div><h3>${esc(e.degree)}${e.field_of_study ? ' in ' + esc(e.field_of_study) : ''}</h3><p>${esc(e.institution)}</p></div>
        <span class="dev-row-date">${esc(yearRange(e.start_year, e.end_year))}</span></li>`).join('');
    const certs = m.show.certifications ? m.certifications.map(c => {
      const url = safeUrl(normalizeUrl(c.credential_url));
      return `
      <li><span class="dev-row-ico">${icon('award', 18)}</span>
        <div><h3>${esc(c.name)}</h3><p>${esc(c.issuer || '')}${url ? ` <a href="${esc(url)}"${extAttr(url)}>credential</a>` : ''}</p></div>
        <span class="dev-row-date">${esc(dateRange(c.issue_date, c.expiry_date, false))}</span></li>`;
    }).join('') : '';
    return `<ul class="dev-rows">${edu}${certs}</ul>`;
  },

  services: m => `
    <div class="dev-svcs">${m.services.map(s => {
      const cta = safeUrl(normalizeUrl(s.contact_url)) || (m.email ? `mailto:${m.email}` : '');
      const price = s.price != null ? Number(s.price).toLocaleString('en-US') : '';
      return `
      <article class="dev-svc">
        <h3><span class="dev-punc">- </span>${esc(s.name)}</h3>
        ${s.description ? `<p>${esc(s.description)}</p>` : ''}
        ${(s.price_label || price) ? `<p class="dev-price"><span>${esc(s.price_label || '')}</span> ${esc(price)}</p>` : ''}
        ${cta ? `<a class="dev-link" href="${esc(cta)}"${extAttr(cta)}>Get in touch ${icon('send', 13)}</a>` : ''}
      </article>`;
    }).join('')}
    </div>`,

  contact: m => {
    const items = contactItems(m);
    const form = contactFormHtml(m, {
      cls: 'dev-form', btn: 'ph-btn ph-btn-primary',
      labels: { name: 'name', email: 'email', subject: 'subject', message: 'message', send: 'Send message' }
    });
    return `
    <div class="dev-contact${form ? '' : ' dev-contact-single'}">
      <div>
        <p class="dev-cmd"><b>$</b> ./contact.sh --list</p>
        <ul class="dev-contact-list">${items.map(i => `
          <li><a href="${esc(i.href)}"${extAttr(i.href)}><span class="dev-row-ico">${platformIcon(i.icon, 18)}</span><span><small>${esc(i.label)}</small><strong>${esc(i.value)}</strong></span></a></li>`).join('')}
        </ul>
      </div>${form}
    </div>`;
  }
};

const panel = (m, k) => `
<section id="${k}" class="dev-panel">
  <div class="dev-tabbar"><span class="dev-tab">${icon(ICON[k], 14)} ${FILE[k]}</span></div>
  <div class="dev-panel-body">
    <h2><span class="dev-comment">//</span> ${esc(TITLE[k])}</h2>
    ${BODY[k](m)}
  </div>
</section>`;

export function render(m) {
  const present = ORDER.filter(k => hasSection(m, k));
  const first = firstName(m);
  const files = present.map(k => `<a href="#${k}"><span class="dev-fi">${icon(ICON[k], 15)}</span>${FILE[k]}</a>`).join('');
  const stack = (m.skills || []).map(s => s.name).filter(Boolean).slice(0, 4);
  const avatar = m.avatar
    ? `<img src="${esc(m.avatar)}" alt="${esc(m.name)}">`
    : `<span aria-hidden="true">${esc(initialsOf(m.name))}</span>`;

  return `
<a id="top"></a>
<div class="dev-shell">
  <aside class="dev-side">
    <a class="dev-brand" href="#top"><span class="dev-brand-mark">&gt;_</span> ~/${esc(first.toLowerCase())}</a>
    <nav class="dev-files" aria-label="Primary"><p class="dev-side-title">Explorer</p>${files}</nav>
    <div class="dev-side-tools">${navControls()}</div>
  </aside>
  <div class="mobile-nav" id="mobileNav">${present.map(k => `<a href="#${k}">${FILE[k]}</a>`).join('')}</div>
  <main class="dev-main">
    <header class="dev-hero">
      <div class="dev-term">
        <div class="dev-term-bar"><i></i><i></i><i></i><span>${esc(first.toLowerCase())}@portfolio: ~</span></div>
        <div class="dev-term-body">
          <div class="dev-term-text">
            <p class="dev-cmd"><b>$</b> whoami</p>
            <h1>${esc(m.name)}</h1>
            ${m.title ? `<p class="dev-role">${esc(m.title)}</p>` : ''}
            <p class="dev-cmd"><b>$</b> cat profile.json</p>
            <div class="dev-json" aria-hidden="true">
              <span class="dev-line">${punc('{')}</span>
              ${kv('name', m.name)}${kv('role', m.title)}${kv('location', m.location)}${kv('company', m.currentCompany)}${kvList('stack', stack)}
              <span class="dev-line">${punc('}')}<span class="dev-cursor"></span></span>
            </div>
            <div class="ph-actions">
              ${hasSection(m, 'projects') ? '<a class="ph-btn ph-btn-primary" href="#projects">View projects</a>' : ''}
              ${hasSection(m, 'contact') ? '<a class="ph-btn" href="#contact">Contact me</a>' : ''}
            </div>
            ${socialsHtml(m, { wrap: 'dev-socials', item: 'dev-social', size: 17 })}
          </div>
          <figure class="dev-avatar"><div class="dev-avatar-img">${avatar}</div><figcaption>${icon('image', 13)} avatar</figcaption></figure>
        </div>
      </div>
    </header>
    ${present.map(k => panel(m, k)).join('\n')}
    <footer class="dev-footer"><p>${esc(m.name)}${m.title ? ' / ' + esc(m.title) : ''}${m.location ? ' / ' + esc(m.location) : ''}</p></footer>
  </main>
</div>`;
}
