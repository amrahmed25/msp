import { bundle, bundleCall, ROOT, seed, openPage, sleep, type, click } from './harness.mjs';
const code = await bundle('js/portfolio-builder.js');
let pass = 0, fail = 0;
const ok = (cond, name, extra = '') => { cond ? pass++ : fail++; console.log((cond ? 'PASS ' : 'FAIL ') + name + (cond ? '' : '  ' + extra)); };
const U1 = { id: 'U1', user_metadata: {} };
const db = seed();

// ---------- Flow A: load, edit, autosave ----------
let p = await openPage('portfolio-builder.html', '?id=P1', db, U1, code);
await sleep(600);
let { w, doc } = p;
ok(doc.querySelector('#section-form-container input') !== null, 'A1 personal form renders');
ok(doc.getElementById('preview-iframe')?.srcdoc.includes('data-template="reference"'), 'A2 live preview iframe rendered with reference template');
ok(doc.getElementById('save-status').classList.contains('saved'), 'A3 initial status saved');
const inputs = () => [...doc.querySelectorAll('#section-form-container input, #section-form-container textarea, #section-form-container select')];
const byLabel = text => { const l = [...doc.querySelectorAll('#section-form-container label')].find(x => x.textContent.trim().startsWith(text)); return l && doc.getElementById(l.getAttribute('for')); };
type(w, byLabel('Full name'), 'Amr Ahmed');
type(w, byLabel('Headline'), 'Frontend Developer');
type(w, byLabel('Contact email'), 'amr@example.com');
await sleep(300);
ok(doc.getElementById('preview-iframe').srcdoc.includes('Amr Ahmed') && doc.getElementById('preview-iframe').srcdoc.includes('Frontend'), 'A4 preview updates as user types');
ok(doc.getElementById('save-status-text').textContent === 'Unsaved changes', 'A5 status shows unsaved before autosave');
await sleep(2200);
ok(db.profiles[0].full_name === 'Amr Ahmed', 'A6 profile.full_name persisted', JSON.stringify(db.profiles[0]));
ok(db.portfolios[0].headline === 'Frontend Developer' && db.portfolios[0].contact_email === 'amr@example.com', 'A7 portfolio fields persisted');
ok(doc.getElementById('save-status').classList.contains('saved'), 'A8 status back to saved');

// skills
click(w, doc.querySelector('.section-tab[data-section="skills"]'));
click(w, doc.querySelector('.add-item-btn'));
await sleep(100);
ok(true, 'A9 add skill clicked');
type(w, byLabel('Skill'), 'JavaScript');
type(w, byLabel('Category'), 'Frontend');
await sleep(2200);
ok(db.portfolio_skills.length === 1 && db.portfolio_skills[0].name === 'JavaScript' && db.portfolio_skills[0].portfolio_id === 'P1' && db.portfolio_skills[0].category === 'Frontend', 'A10 skill inserted with portfolio_id/category', JSON.stringify(db.portfolio_skills));

// blank draft item must not be saved nor raise an error
click(w, doc.querySelector('.add-item-btn'));
await sleep(2200);
ok(db.portfolio_skills.length === 1, 'A11 blank draft item is not persisted');
ok(!doc.getElementById('save-status').classList.contains('error'), 'A12 blank draft does not trigger error state');

// project with invalid URL is blocked, then fixed
click(w, doc.querySelector('.section-tab[data-section="projects"]'));
click(w, doc.querySelector('.add-item-btn'));
type(w, byLabel('Title'), 'Wrody');
type(w, byLabel('GitHub link'), 'not a url');
type(w, byLabel('Technologies'), 'Next.js, Supabase , ,CSS');
await sleep(2200);
ok(db.portfolio_projects.length === 0, 'D1 invalid project URL blocked from saving');
ok(doc.getElementById('save-status').classList.contains('error'), 'D2 error status shown');
ok(!!doc.querySelector('.field-error:not([hidden])'), 'D3 inline error message visible');
type(w, byLabel('GitHub link'), 'github.com/amrahmed25/wrody');
await sleep(2200);
const proj = db.portfolio_projects[0];
ok(proj && proj.github_url === 'https://github.com/amrahmed25/wrody', 'A13 URL normalised and project saved', JSON.stringify(proj));
ok(proj && JSON.stringify(proj.tech_tags) === '["Next.js","Supabase","CSS"]', 'A14 tech tags parsed', JSON.stringify(proj?.tech_tags));

// experience date + current
click(w, doc.querySelector('.section-tab[data-section="experience"]'));
click(w, doc.querySelector('.add-item-btn'));
type(w, byLabel('Role'), 'Trainee'); type(w, byLabel('Company'), 'DEPI');
type(w, byLabel('Start'), '2025-11');
const cur = doc.querySelector('.checkbox-label input'); cur.checked = true; cur.dispatchEvent(new w.Event('change', { bubbles: true }));
await sleep(2200);
const exp = db.portfolio_experience[0];
ok(exp && exp.start_date === '2025-11-01' && exp.is_current === true && exp.end_date === null, 'A15 experience dates + current saved', JSON.stringify(exp));

// links
click(w, doc.querySelector('.section-tab[data-section="links"]'));
click(w, doc.querySelector('.add-item-btn'));
type(w, byLabel('URL'), 'github.com/amrahmed25');
await sleep(2200);
ok(db.portfolio_links[0]?.url === 'https://github.com/amrahmed25' && db.portfolio_links[0].platform === 'github', 'A16 link saved');

// ---------- template / slug ----------
click(w, doc.querySelector('.section-tab[data-section="template"]'));
ok(doc.querySelectorAll('.template-card').length === 4, 'E1 builder template picker lists all four templates', String(doc.querySelectorAll('.template-card').length));
click(w, [...doc.querySelectorAll('.template-card')].find(c => c.textContent.includes('Freelancer')));
await sleep(2200);
ok(db.portfolios[0].template_id === 'freelancer', 'E2 selecting a template persists template_id', db.portfolios[0].template_id);
ok(doc.getElementById('preview-iframe').srcdoc.includes('data-template="freelancer"'), 'E3 preview switches to the chosen template');
click(w, doc.querySelectorAll('.template-card')[1]);
await sleep(2200);
ok(db.portfolios[0].template_id === 'developer' && doc.getElementById('preview-iframe').srcdoc.includes('data-template="developer"'), 'E4 switching again works and keeps content', db.portfolios[0].template_id);
type(w, byLabel('Public URL name'), 'Bad Slug!');
await sleep(2200);
ok(db.portfolios[0].slug === 'u1abc-demo-x1y2', 'D4 invalid slug rejected client-side');
type(w, byLabel('Public URL name'), 'taken');
await sleep(2200);
ok(db.portfolios[0].slug === 'u1abc-demo-x1y2' && doc.getElementById('save-status').classList.contains('error'), 'D5 duplicate slug reported, DB unchanged');
type(w, byLabel('Public URL name'), 'amr-ahmed');
await sleep(2200);
ok(db.portfolios[0].slug === 'amr-ahmed', 'A17 valid unique slug saved');

// ---------- Flow C (publish) ----------
click(w, doc.getElementById('publish-btn'));
await sleep(500);
ok(db.portfolios[0].is_published === true, 'C1 publish sets is_published');
ok(doc.getElementById('publish-btn-text').textContent === 'Unpublish' && !!doc.getElementById('view-live-btn'), 'C2 UI reflects published state + View live link');
ok(doc.getElementById('view-live-btn').href.includes('public-portfolio.html?u=amr-ahmed'), 'C3 live link uses query form on localhost', doc.getElementById('view-live-btn').href);

// ---------- Flow B: refresh and edit ----------
p = await openPage('portfolio-builder.html', '?id=P1', db, U1, code); await sleep(600);
({ w, doc } = p);
ok(byLabel('Full name').value === 'Amr Ahmed' && byLabel('Headline').value === 'Frontend Developer', 'B1 data persists after refresh');
click(w, doc.querySelector('.section-tab[data-section="skills"]'));
ok(byLabel('Skill').value === 'JavaScript', 'B2 skills reload after refresh');
type(w, byLabel('Skill'), 'TypeScript'); await sleep(2200);
ok(db.portfolio_skills.length === 1 && db.portfolio_skills[0].name === 'TypeScript', 'B3 edit updates row instead of duplicating');
// delete
click(w, doc.querySelector('.list-item-actions .icon-btn.danger')); await sleep(2200);
ok(db.portfolio_skills.length === 0, 'B4 removing an item deletes it after save');
ok(doc.getElementById('publish-btn-text').textContent === 'Unpublish', 'B5 published state restored on reload');

// ---------- Flow D: unauthorized ----------
p = await openPage('portfolio-builder.html', '?id=P2', db, U1, code); await sleep(500);
ok(/not found|do not have access/i.test(p.doc.getElementById('section-form-container').textContent), 'D6 other user\'s portfolio id is refused');
ok(db.portfolios[1].title === 'Other', 'D7 other user data untouched');
p = await openPage('portfolio-builder.html', '?id=not-a-uuid', db, U1, code); await sleep(500);
ok(/not found/i.test(p.doc.getElementById('section-form-container').textContent), 'D8 malformed id handled');
p = await openPage('portfolio-builder.html', '?id=P1', db, null, code); await sleep(300);
ok((p.w.__REDIRECTS__ || []).includes('login.html'), 'D9 unauthenticated visitor sent to login');

console.log(`\n${pass} passed, ${fail} failed`);
const errs = [p, ].flatMap(x => x.errors);
process.exit(fail ? 1 : 0);
