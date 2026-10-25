import { bundle, bundleCall, ROOT, seed, openPage, sleep } from './harness.mjs';
const code = await bundle('js/public-portfolio.js');
let pass = 0, fail = 0;
const ok = (c, n, x = '') => { c ? pass++ : fail++; console.log((c ? 'PASS ' : 'FAIL ') + n + (c ? '' : '  ' + x)); };
const db = seed();
Object.assign(db.portfolios[0], { is_published: true, slug: 'amr-ahmed', headline: 'Frontend Developer', about: 'Hello there', contact_email: 'a@b.co' });
db.profiles[0].full_name = 'Amr Ahmed';
db.portfolio_projects.push({ id: 'pr1', portfolio_id: 'P1', title: 'Wrody', tech_tags: ['React'], order_index: 0 });
db.portfolio_links.push({ id: 'l1', portfolio_id: 'P1', platform: 'github', url: 'https://github.com/amrahmed25', is_hidden: false, order_index: 0 },
                        { id: 'l2', portfolio_id: 'P1', platform: 'x', url: 'https://x.com/secret', is_hidden: true, order_index: 1 });
const frame = p => p.doc.getElementById('portfolio-frame');
const visible = (p, id) => p.doc.getElementById(id).classList.contains('visible');

// anonymous visitor, query form
let p = await openPage('public-portfolio.html', '?u=amr-ahmed', db, null, code); await sleep(300);
ok(!!frame(p), 'C4 published portfolio renders for an anonymous visitor');
ok(frame(p)?.srcdoc.includes('Amr Ahmed') && frame(p).srcdoc.includes('Wrody'), 'C5 iframe contains profile + project data');
ok(!frame(p)?.srcdoc.includes('x.com/secret'), 'C6 hidden links are not exposed');
ok(frame(p)?.getAttribute('sandbox').includes('allow-scripts') && !frame(p).getAttribute('sandbox').includes('allow-same-origin'), 'C7 iframe sandboxed without same-origin');
ok(p.doc.title.startsWith('Amr Ahmed'), 'C8 document title set', p.doc.title);
ok(db.portfolios[0].view_count === 1, 'C9 view count incremented once', String(db.portfolios[0].view_count));

// refresh + clean /u/<slug> URL form
p = await openPage('public-portfolio.html', '', db, null, code, '/u/amr-ahmed'); await sleep(300);
ok(!!frame(p) && frame(p).srcdoc.includes('Amr Ahmed'), 'C10 /u/<slug> path resolves the slug');
ok(db.portfolios[0].view_count === 2, 'C11 refresh counts another view');

// unknown slug / missing slug / unpublished
p = await openPage('public-portfolio.html', '?u=nope', db, null, code); await sleep(300);
ok(visible(p, 'state-not-found') && !frame(p), 'C12 unknown slug shows not-found');
p = await openPage('public-portfolio.html', '', db, null, code); await sleep(200);
ok(visible(p, 'state-not-found'), 'C13 missing slug shows not-found');
db.portfolios[0].is_published = false;
p = await openPage('public-portfolio.html', '?u=amr-ahmed', db, null, code); await sleep(300);
ok(visible(p, 'state-not-found') && !frame(p), 'C14 unpublished portfolio is invisible to anonymous visitors (RLS)');
p = await openPage('public-portfolio.html', '?u=amr-ahmed', db, { id: 'U1' }, code); await sleep(300);
ok(visible(p, 'state-not-published'), 'C15 owner sees the not-published notice');
db.portfolios[0].is_published = true;

// load failure -> error state, not "not found"
db.portfolio_skills = null;
p = await openPage('public-portfolio.html', '?u=amr-ahmed', db, null, code); await sleep(300);
ok(visible(p, 'state-error'), 'C16 backend failure shows retryable error state');

// hostile content
db.portfolio_skills = [];
db.portfolios[0].about = '<img src=x onerror=alert(1)>';
p = await openPage('public-portfolio.html', '?u=amr-ahmed', db, null, code); await sleep(300);
ok(!/<img src=x/.test(frame(p).srcdoc) && frame(p).srcdoc.includes('&lt;img src=x'), 'C17 user HTML is escaped in the rendered document');

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
