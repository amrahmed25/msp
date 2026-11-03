import { bundle, bundleCall, ROOT, seed, openPage, sleep, type, click } from './harness.mjs';
import fs from 'fs';
let pass = 0, fail = 0;
const ok = (c, n, x = '') => { c ? pass++ : fail++; console.log((c ? 'PASS ' : 'FAIL ') + n + (c ? '' : '  ' + x)); };
const code = await bundleCall('js/dashboard.js', 'loadDashboard');
const db = seed();
db.portfolios[0].template_id = 'developer';
db.portfolios.push({ id: 'P5', user_id: 'U1', title: 'Second', slug: 'u1abc-second-zz', template_id: 'minimal', is_published: true, view_count: 7, sections: {}, created_at: new Date().toISOString() });
const U1 = { id: 'U1', email: 'a@b.co', user_metadata: {} };
const p = await openPage('dashboard.html', '', db, U1, code); await sleep(600);
const cards = [...p.doc.querySelectorAll('[data-portfolio-id]')];
ok(cards.length === 2, 'F1 dashboard lists only the signed-in user\'s portfolios', String(cards.length));
ok(!p.errors.length, 'F2 no console errors while loading dashboard', p.errors.join(' / '));
const badge = id => p.doc.querySelector(`[data-portfolio-id="${id}"] .portfolio-template-badge`)?.textContent;
ok(badge('P1') === 'Developer' && badge('P5') === 'Reference', 'F3 template badges show real template names (legacy id falls back)', badge('P1') + '/' + badge('P5'));
const view = id => p.doc.querySelector(`[data-portfolio-id="${id}"] .btn-preview`);
ok(view('P1').getAttribute('aria-disabled') === 'true' && !view('P1').getAttribute('href'), 'F4 draft has a disabled View button (no dead link)');
ok(view('P5').href.includes('public-portfolio.html?u=u1abc-second-zz'), 'F5 published portfolio links to the real public page', view('P5').href);
ok(p.doc.querySelector('[data-portfolio-id="P1"] .btn-edit').href.includes('portfolio-builder.html?id=P1'), 'F6 Edit opens the builder with the id');

const mod = await p.w.__mod;
// publish toggle
await mod.togglePublish('P1', false); await sleep(100);
ok(db.portfolios[0].is_published === true && view('P1').getAttribute('aria-disabled') !== 'true' && view('P1').href.includes('u1abc-demo-x1y2'), 'F7 publishing enables the View link', view('P1').outerHTML.slice(0, 120));
await mod.togglePublish('P1', true); await sleep(100);
ok(db.portfolios[0].is_published === false && view('P1').getAttribute('aria-disabled') === 'true', 'F8 unpublishing disables it again');
// cannot touch someone else's portfolio even by id
await mod.togglePublish('P2', true); await sleep(100);
ok(db.portfolios[1].is_published === true && db.portfolios[1].title === 'Other', 'F9 cannot modify another user\'s portfolio');
// create
await mod.createPortfolio('Mi Portafolio Nuevo', 'creative'); await sleep(200);
const c1 = db.portfolios.find(x => x.title === 'Mi Portafolio Nuevo');
ok(c1 && c1.template_id === 'creative' && c1.user_id === 'U1' && /^[a-z0-9][a-z0-9-]{1,59}$/.test(c1.slug), 'F10 create stores template_id/slug correctly', JSON.stringify(c1));
await mod.createPortfolio('مشروعي', 'reference'); await sleep(200);
const c2 = db.portfolios.find(x => x.title === 'مشروعي');
ok(c2 && /^[a-z0-9][a-z0-9-]{1,59}$/.test(c2.slug) && !c2.slug.includes('--'), 'F11 non-Latin title still gets a valid slug', c2?.slug);
const n = db.portfolios.length;
await mod.createPortfolio('   ', 'reference');
ok(db.portfolios.length === n, 'F12 blank title is rejected');
await mod.createPortfolio('Bad template', 'not-a-template'); await sleep(100);
ok(db.portfolios.find(x => x.title === 'Bad template')?.template_id === 'reference', 'F13 unknown template id falls back to reference');

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
