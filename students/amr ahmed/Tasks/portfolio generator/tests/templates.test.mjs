import { fileURLToPath, pathToFileURL } from 'url';
import path from 'path';
import fs from 'fs';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..') + '/';
const { normalizeData, buildDocument, TEMPLATES } = await import(pathToFileURL(ROOT + 'js/portfolio-renderer.js').href);
let pass = 0, fail = 0;
const ok = (c, n, x = '') => { c ? pass++ : fail++; if (!c) console.log('FAIL ' + n + ' ' + x); };
const full = {
  profile: { full_name: 'Amr <img src=x onerror=alert(1)> Ahmed', avatar_url: 'https://f.test/a.jpg', location: 'Giza, Egypt', website: 'example.com' },
  portfolio: { slug: 'amr', headline: 'Frontend Developer', about: 'Para one.\n\nPara two <script>alert(1)</script>', contact_email: 'a@b.co', whatsapp: '+201000000000', theme_color: '#7C3AED', sections: {} },
  projects: [{ title: 'Wrody', description: 'd', tech_tags: ['React'], github_url: 'github.com/a/b', demo_url: 'javascript:alert(1)', image_url: 'https://f.test/p.png' }],
  skills: [{ name: 'JS', category: 'Frontend' }], experience: [{ job_title: 'Dev', company: 'ACME', start_date: '2025-11-01', is_current: true }],
  education: [{ degree: 'BSc', institution: 'Helwan', start_year: 2024, end_year: 2028 }],
  certifications: [{ name: 'Tailwind', issuer: 'Coursera', credential_url: 'javascript:1' }],
  services: [{ name: 'Web apps', description: 'x', price: 500, price_label: 'From' }],
  links: [{ platform: 'github', url: 'https://github.com/amrahmed25' }, { platform: 'linkedin', url: 'linkedin.com/in/x' }]
};
const ids = Object.keys(TEMPLATES);
ok(ids.join() === 'reference,developer,creative,freelancer', 'registry has the four templates', ids.join());
const docs = {};
for (const id of ids) {
  const m = normalizeData({ ...full, portfolio: { ...full.portfolio, template_id: id } });
  const html = buildDocument(m, { baseUrl: 'https://s.test/' });
  docs[id] = html;
  ok(m.templateId === id, `${id}: id resolved`);
  ok(html.includes(`data-template="${id}"`), `${id}: body marker`);
  ok(!/undefined|\[object|NaN/.test(html), `${id}: no undefined/NaN leaks`, (html.match(/.{20}(undefined|\[object|NaN).{20}/) || [])[0]);
  ok(!/<script>alert|<img src=x/.test(html), `${id}: user HTML escaped`);
  ok(!/href="javascript:|src="javascript:/i.test(html), `${id}: no javascript: URLs`);
  ok(/id="themeBtn"/.test(html) && /id="mobileNav"/.test(html) && /id="hamburgerBtn"/.test(html), `${id}: runtime hooks present`);
  ok(/id="contactForm"[^>]*data-email="a@b.co"/.test(html), `${id}: contact form bound to email`);
  ok(html.includes('--user-accent:#7C3AED'), `${id}: accent applied`);
  ok(html.includes('Wrody') && html.includes('Helwan') && html.includes('ACME'), `${id}: data sections rendered`);
  // every stylesheet referenced exists on disk
  [...html.matchAll(/href="https:\/\/s\.test\/([^"]+\.css)"/g)].forEach(([, p]) => ok(fs.existsSync(ROOT + p), `${id}: stylesheet exists ${p}`));
  // anchors point at existing ids
  const idset = new Set([...html.matchAll(/id="([^"]+)"/g)].map(x => x[1]));
  [...html.matchAll(/href="#([^"]+)"/g)].forEach(([, a]) => ok(idset.has(a), `${id}: anchor #${a} has a target`));
  // hide services via sections flag
  const hidden = buildDocument(normalizeData({ ...full, portfolio: { ...full.portfolio, template_id: id, sections: { services: false, projects: false } } }), { baseUrl: '/' });
  ok(!hidden.includes('id="services"') && !hidden.includes('id="projects"'), `${id}: hidden sections removed`);
  // empty data
  const empty = buildDocument(normalizeData({ portfolio: { template_id: id } }), { baseUrl: '/' });
  ok(empty.length > 500 && !/undefined|NaN/.test(empty), `${id}: renders with empty data`);
  ok(!/id="contactForm"/.test(empty), `${id}: no form without an email`);
}
ok(new Set(Object.values(docs).map(d => d.replace(/data-template="[^"]+"/, ''))).size === 4, 'the four templates produce different documents');
const dev = buildDocument(normalizeData({ ...full, portfolio: { template_id: 'developer' } }), { baseUrl: '/' });
ok(dev.includes('data-theme="dark"'), 'developer defaults to dark theme');
ok(buildDocument(normalizeData({ ...full, portfolio: { template_id: 'bogus' } }), { baseUrl: '/' }).includes('data-template="reference"'), 'unknown template id falls back to reference');
console.log(`${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
