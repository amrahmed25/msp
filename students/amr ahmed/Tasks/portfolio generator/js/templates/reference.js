/**
 * Template: Reference
 * A data-driven recreation of the owner's own portfolio page (the supplied
 * index.html): Syne + DM Sans, cream/navy palette, light and dark theme.
 * Styles live in css/templates/reference.css.
 */
import { esc, safeUrl, normalizeUrl, paragraphs, dateRange, yearRange, hasSection } from './helpers.js';
import { icon, platformIcon } from './icons.js';

export const meta = {
  id: 'reference',
  name: 'Reference',
  description: 'Editorial layout with a hero portrait, skill groups, project cards and a contact form. Light and dark theme.',
  cssPath: 'css/templates/reference.css',
  thumb: 'linear-gradient(135deg, #f4f2ee 0%, #1d3a6e 100%)',
  supportsAccent: true,
  fontsUrl: 'https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap'
};

const NAV = [
  ['about', 'About'], ['skills', 'Skills'], ['services', 'Services'], ['experience', 'Experience'],
  ['projects', 'Projects'], ['education', 'Education'], ['contact', 'Contact']
];

function initials(name) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join('') || '?';
}

function tags(list) {
  return (list || []).filter(Boolean).map(t => `<span class="tag">${esc(t)}</span>`).join('');
}

function heroTitle(title) {
  const words = title.split(/\s+/).filter(Boolean);
  if (!words.length) return '';
  const [first, ...rest] = words;
  return `<br><span class="accent">${esc(first)}</span>${rest.length ? ' ' + esc(rest.join(' ')) : ''}`;
}

function sectionHead(label, heading) {
  return `<div class="section-header fade-in"><div class="section-label">${esc(label)}</div><h2>${esc(heading)}</h2></div>`;
}

function renderHero(m) {
  const socials = m.links.slice(0, 4).map(l => {
    const href = safeUrl(normalizeUrl(l.url));
    const label = l.label || l.platform;
    return `<a href="${esc(href)}" target="_blank" rel="noopener noreferrer" class="social-link" title="${esc(label)}" aria-label="${esc(label)}">${platformIcon(l.platform, 18)}</a>`;
  }).join('');
  const mail = m.email
    ? `<a href="mailto:${esc(m.email)}" class="social-link" title="Email" aria-label="Email">${icon('mail', 18)}</a>` : '';
  const portrait = m.avatar
    ? `<img src="${esc(m.avatar)}" alt="${esc(m.name)}">`
    : `<div class="hero-initials" aria-hidden="true">${esc(initials(m.name))}</div>`;
  const currently = m.currentCompany
    ? `<div class="hero-tag-card"><div class="label">Currently at</div><div class="val">${esc(m.currentCompany)}</div></div>` : '';
  const buttons = [
    hasSection(m, 'projects') ? `<a href="#projects" class="btn-main">View Projects ${icon('arrowDown', 16)}</a>` : '',
    hasSection(m, 'contact') ? `<a href="#contact" class="btn-outline">Get In Touch</a>` : ''
  ].join('');
  return `
<section id="hero">
  <div class="hero-grid container">
    <div class="hero-text fade-in">
      <h1>Hi, I'm <span class="highlight">${esc(m.name)}</span>${heroTitle(m.title)}</h1>
      ${m.about ? `<p class="hero-desc">${esc(m.about.length > 220 ? m.about.slice(0, 217).trimEnd() + '...' : m.about)}</p>` : ''}
      ${buttons ? `<div class="hero-btns">${buttons}</div>` : ''}
      ${(socials || mail) ? `<div class="hero-socials">${socials}${mail}</div>` : ''}
    </div>
    <div class="hero-img-wrap fade-in">
      <div class="hero-img-frame">${portrait}</div>
      ${currently}
    </div>
  </div>
</section>`;
}

function renderAbout(m) {
  const stats = [
    [m.projects.length, 'Projects'], [m.skills.length, 'Skills'],
    [m.experience.length, 'Experience'], [m.certifications.length, 'Certifications']
  ].filter(([n]) => n > 0).slice(0, 4)
    .map(([n, l]) => `<div class="stat-card"><div class="stat-num">${n}</div><div class="stat-label">${esc(l)}</div></div>`).join('');

  const rows = [['Name', esc(m.name)]];
  if (m.location) rows.push(['Location', esc(m.location)]);
  if (m.email) rows.push(['Email', `<a href="mailto:${esc(m.email)}">${esc(m.email)}</a>`]);
  if (m.whatsapp) rows.push(['Phone', `<a href="tel:${esc(m.whatsapp)}">${esc(m.whatsapp)}</a>`]);
  if (m.website) rows.push(['Website', `<a href="${esc(m.website)}" target="_blank" rel="noopener noreferrer">${esc(m.website.replace(/^https?:\/\//, ''))}</a>`]);
  m.links.forEach(l => {
    const href = safeUrl(normalizeUrl(l.url));
    rows.push([l.label || l.platform, `<a href="${esc(href)}" target="_blank" rel="noopener noreferrer">View Profile</a>`]);
  });
  const info = rows.map(([k, v]) => `<li><span class="key">${esc(k)}</span><span class="val">${v}</span></li>`).join('');

  return `
<section id="about">
  <div class="container">
    ${sectionHead('About Me', m.title || 'A little about me')}
    <div class="about-grid">
      <div class="about-text fade-in">
        ${paragraphs(m.about).map(p => `<p>${esc(p)}</p>`).join('')}
        ${stats ? `<div class="stats-grid">${stats}</div>` : ''}
      </div>
      <div class="about-right fade-in">
        <h3>Quick Info</h3>
        <ul class="info-list">${info}</ul>
      </div>
    </div>
  </div>
</section>`;
}

function renderSkills(m) {
  const cards = m.skillGroups.map(g => `
      <div class="skill-category fade-in">
        <h4>${esc(g.category)}</h4>
        <div class="tags">${tags(g.items.map(s => s.name))}</div>
      </div>`).join('');
  return `
<section id="skills">
  <div class="container">
    ${sectionHead('Skills', 'What I Work With')}
    <div class="skills-grid">${cards}</div>
  </div>
</section>`;
}

function renderServices(m) {
  const cards = m.services.map(s => `
      <div class="skill-category fade-in">
        <h4>${esc(s.name)}</h4>
        ${s.description ? `<p class="svc-desc">${esc(s.description)}</p>` : ''}
        ${(s.price_label || s.price != null) ? `<div class="svc-price">${esc(s.price_label || '')}${s.price != null ? ' ' + esc(Number(s.price).toLocaleString('en-US')) : ''}</div>` : ''}
      </div>`).join('');
  return `
<section id="services">
  <div class="container">
    ${sectionHead('Services', 'What I Offer')}
    <div class="skills-grid">${cards}</div>
  </div>
</section>`;
}

function renderExperience(m) {
  const cards = m.experience.map(e => `
    <div class="exp-card fade-in">
      <div class="exp-dot"></div>
      <div>
        <div class="exp-title">${esc(e.job_title)}</div>
        <div class="exp-org">${esc(e.company)}${e.location ? ' \u00b7 ' + esc(e.location) : ''}</div>
        <div class="exp-date">${esc(dateRange(e.start_date, e.end_date, e.is_current))}</div>
        ${e.description ? `<div class="exp-desc">${esc(e.description)}</div>` : ''}
      </div>
    </div>`).join('');
  return `
<section id="experience">
  <div class="container">
    ${sectionHead('Experience', 'Where I\u2019ve Worked')}
    ${cards}
  </div>
</section>`;
}

function renderProjects(m) {
  const cards = m.projects.map(p => {
    const img = safeUrl(p.image_url);
    const gh = safeUrl(normalizeUrl(p.github_url));
    const demo = safeUrl(normalizeUrl(p.demo_url));
    return `
      <div class="project-card fade-in">
        <div class="project-img">${img ? `<img src="${esc(img)}" alt="${esc(p.title)}" loading="lazy">` : `<div class="no-img">${icon('image', 40)}</div>`}</div>
        <div class="project-body">
          <div class="project-title">${esc(p.title)}</div>
          ${p.description ? `<p class="project-desc">${esc(p.description)}</p>` : ''}
          ${(p.tech_tags || []).length ? `<div class="project-tech">${tags(p.tech_tags)}</div>` : ''}
          ${(gh || demo) ? `<div class="project-links">
            ${gh ? `<a href="${esc(gh)}" target="_blank" rel="noopener noreferrer" class="proj-btn">GitHub</a>` : ''}
            ${demo ? `<a href="${esc(demo)}" target="_blank" rel="noopener noreferrer" class="proj-btn filled">Live Demo</a>` : ''}
          </div>` : ''}
        </div>
      </div>`;
  }).join('');
  return `
<section id="projects">
  <div class="container">
    ${sectionHead('Projects', 'Things I\u2019ve Built')}
    <div class="projects-grid">${cards}</div>
  </div>
</section>`;
}

function renderEducation(m) {
  const edu = m.education.map(e => `
      <div class="edu-card fade-in">
        <div class="icon">${icon('graduation', 24)}</div>
        <h4>${esc(e.degree)}${e.field_of_study ? ' in ' + esc(e.field_of_study) : ''}</h4>
        <div class="org">${esc(e.institution)}</div>
        <div class="date">${esc(yearRange(e.start_year, e.end_year))}</div>
      </div>`).join('');
  const certs = m.show.certifications ? m.certifications.map(c => {
    const url = safeUrl(normalizeUrl(c.credential_url));
    return `
      <div class="edu-card fade-in">
        <div class="icon">${icon('award', 24)}</div>
        <h4>${esc(c.name)}</h4>
        <div class="org">${esc(c.issuer || '')}</div>
        <div class="date">${esc(dateRange(c.issue_date, c.expiry_date, false))}${url ? ` \u00b7 <a href="${esc(url)}" target="_blank" rel="noopener noreferrer">Credential</a>` : ''}</div>
      </div>`;
  }).join('') : '';
  return `
<section id="education">
  <div class="container">
    ${sectionHead('Education', 'Academic Background')}
    <div class="edu-grid">${edu}${certs}</div>
  </div>
</section>`;
}

function renderContact(m) {
  const cards = [];
  if (m.email) cards.push(['mail', 'Email', m.email, `mailto:${m.email}`]);
  if (m.whatsapp) cards.push(['whatsapp', 'WhatsApp', m.whatsapp, `https://wa.me/${m.whatsapp.replace(/^\+/, '')}`]);
  m.links.forEach(l => {
    const href = safeUrl(normalizeUrl(l.url));
    cards.push([l.platform, l.label || l.platform, href.replace(/^https?:\/\/(www\.)?/, ''), href]);
  });
  const cardHtml = cards.map(([ic, lbl, val, href]) => {
    const ext = /^https?:/.test(href) ? ' target="_blank" rel="noopener noreferrer"' : '';
    return `<a href="${esc(href)}"${ext} class="contact-card"><span class="icon">${platformIcon(ic, 22)}</span><div><div class="lbl">${esc(lbl)}</div><div class="val">${esc(val)}</div></div></a>`;
  }).join('');
  const form = m.email ? `
      <form class="contact-form-wrap" id="contactForm" data-email="${esc(m.email)}" novalidate>
        <div class="form-group"><label for="fname">Your Name</label><input type="text" id="fname" name="name" autocomplete="name" placeholder="Your name"></div>
        <div class="form-group"><label for="femail">Email Address</label><input type="email" id="femail" name="email" autocomplete="email" placeholder="you@example.com"></div>
        <div class="form-group"><label for="fsubject">Subject</label><input type="text" id="fsubject" name="subject" placeholder="Project collaboration"></div>
        <div class="form-group"><label for="fmessage">Message</label><textarea id="fmessage" name="message" rows="5" placeholder="Tell me about your project or idea"></textarea></div>
        <button type="submit" class="btn-main form-submit" id="sendBtn">Send Message ${icon('send', 16)}</button>
        <div id="formMsg" class="form-msg" role="status" hidden></div>
      </form>` : '';
  return `
<section id="contact">
  <div class="container">
    ${sectionHead('Contact', 'Let\u2019s Work Together')}
    <div class="contact-layout fade-in${form ? '' : ' no-form'}">
      <div class="contact-info">
        <h3>Get In Touch</h3>
        <p>Have a project in mind or just want to say hello? Reach out using any of the options below.</p>
        <div class="contact-cards">${cardHtml}</div>
      </div>
      ${form}
    </div>
  </div>
</section>`;
}

const RENDERERS = {
  about: renderAbout, skills: renderSkills, services: renderServices,
  experience: renderExperience, projects: renderProjects,
  education: renderEducation, contact: renderContact
};

export function render(m) {
  const present = NAV.filter(([key]) => hasSection(m, key));
  const first = esc(m.name.split(/\s+/)[0] || m.name);
  const links = present.map(([k, l]) => `<a href="#${k}">${esc(l)}</a>`);
  return `
<nav aria-label="Primary">
  <div class="logo">${first}<span>.</span></div>
  <ul class="nav-links">${present.map(([k, l]) => `<li><a href="#${k}">${esc(l)}</a></li>`).join('')}</ul>
  <div class="nav-right">
    <button class="theme-btn" id="themeBtn" type="button" title="Toggle theme" aria-label="Toggle dark theme" aria-pressed="false"></button>
    <button class="hamburger" id="hamburgerBtn" type="button" aria-label="Toggle menu" aria-expanded="false"><span></span><span></span><span></span></button>
  </div>
</nav>
<div class="mobile-nav" id="mobileNav">${links.join('')}</div>
<main>
${renderHero(m)}
${present.map(([k]) => RENDERERS[k](m)).join('\n')}
</main>
<footer><p>${esc(m.name)}${m.title ? ' \u00b7 ' + esc(m.title) : ''}${m.location ? ' \u00b7 ' + esc(m.location) : ''}</p></footer>`;
}
