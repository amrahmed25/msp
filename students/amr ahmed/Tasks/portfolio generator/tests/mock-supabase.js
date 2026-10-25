// In-memory stand-in for the Supabase client used ONLY by the offline test harness.
// It enforces the real schema's column names, NOT NULL, unique slug, slug format and
// a simplified version of the RLS rules so payload mistakes are caught.
const COLS = {
  portfolios: 'id,user_id,template_id,title,slug,is_published,custom_domain,theme_color,seo_title,seo_description,view_count,created_at,updated_at,headline,about,cover_url,contact_email,whatsapp,sections',
  profiles: 'id,full_name,username,title,bio,avatar_url,cover_url,location,role,website,created_at,updated_at',
  portfolio_projects: 'id,portfolio_id,title,description,image_url,tech_tags,github_url,demo_url,order_index,created_at,updated_at',
  portfolio_services: 'id,portfolio_id,name,description,image_url,icon,price,price_label,contact_url,order_index,created_at',
  portfolio_skills: 'id,portfolio_id,name,level,category,order_index',
  portfolio_experience: 'id,portfolio_id,job_title,company,start_date,end_date,is_current,description,location,order_index',
  portfolio_education: 'id,portfolio_id,degree,institution,field_of_study,start_year,end_year,description,order_index',
  portfolio_certifications: 'id,portfolio_id,name,issuer,issue_date,expiry_date,credential_url,order_index',
  portfolio_links: 'id,portfolio_id,platform,url,label,icon,order_index,is_hidden',
  community_posts: 'id,user_id,portfolio_id,content,image_url,category,tags,is_published,created_at,updated_at',
};
const NOT_NULL = { portfolios: ['user_id','title','slug'], portfolio_skills: ['name'], portfolio_experience: ['job_title','company'],
  portfolio_education: ['degree','institution'], portfolio_certifications: ['name'], portfolio_projects: ['title'],
  portfolio_services: ['name'], portfolio_links: ['platform','url'], community_posts: ['user_id','content'] };
Object.keys(COLS).forEach(k => COLS[k] = COLS[k].split(','));

const db = () => window.__MOCKDB__;
const me = () => window.__MOCKUSER__;
let seq = 1000;
const uuid = () => 'id-' + (++seq);
const err = (code, message) => ({ code, message });
const owns = pid => db().portfolios.some(p => p.id === pid && p.user_id === me()?.id);

class Q {
  constructor(table) { this.t = table; this.op = 'select'; this.f = []; this.ord = null; this.lim = null; this.one = null; this.payload = null; this.sel = false; this.opts = {}; }
  select(cols, opts) { this.sel = true; this.cols = typeof cols === 'string' ? cols : '*'; this.selOpts = opts || {}; return this; }
  range(a, b) { this.rng = [a, b]; return this; }
  not(c, op, v) { this.f.push(r => op === 'is' ? (v === null ? r[c] !== null && r[c] !== undefined : r[c] !== v) : r[c] !== v); return this; }
  contains(c, v) { this.f.push(r => (r[c] || []).some(x => v.includes(x))); return this; }
  insert(r) { this.op = 'insert'; this.payload = Array.isArray(r) ? r : [r]; return this; }
  update(o) { this.op = 'update'; this.payload = o; return this; }
  upsert(o, opts) { this.op = 'upsert'; this.payload = o; this.opts = opts || {}; return this; }
  delete() { this.op = 'delete'; return this; }
  eq(c, v) { this.f.push(r => r[c] === v); return this; }
  in(c, a) { this.f.push(r => a.includes(r[c])); return this; }
  order(c, o) { this.ord = [c, o?.ascending !== false]; return this; }
  limit(n) { this.lim = n; return this; }
  maybeSingle() { this.one = 'maybe'; return this.then ? this : this; }
  single() { this.one = 'single'; return this; }
  then(res, rej) { return Promise.resolve().then(() => this.run()).then(res, rej); }
  // Validates the select() column list and resolves embedded relations like PostgREST does.
  project(rows) {
    const spec = (this.cols || '*').replace(/\s+/g, '');
    if (spec === '*') return rows;
    const items = []; let depth = 0, cur = '';
    for (const ch of spec) { if (ch === '(') depth++; if (ch === ')') depth--; if (ch === ',' && depth === 0) { items.push(cur); cur = ''; } else cur += ch; }
    if (cur) items.push(cur);
    const REL = {
      'portfolios>profiles': { to: 'profiles', local: 'user_id', one: true },
      'portfolios>portfolio_skills': { to: 'portfolio_skills', remote: 'portfolio_id', one: false },
      'community_posts>profiles': { to: 'profiles', local: 'user_id', one: true },
      'community_posts>portfolios': { to: 'portfolios', local: 'portfolio_id', one: true },
    };
    const plain = items.filter(i => !i.includes('(')).map(i => i.trim()).filter(Boolean);
    plain.forEach(c => { if (c !== '*' && !COLS[this.t].includes(c)) throw err('42703', `column ${this.t}.${c} does not exist`); });
    const embeds = items.filter(i => i.includes('(')).map(i => ({ name: i.slice(0, i.indexOf('(')), cols: i.slice(i.indexOf('(') + 1, -1).split(',').filter(Boolean) }));
    embeds.forEach(e => {
      const rel = REL[`${this.t}>${e.name}`];
      if (!rel) throw err('PGRST200', `Could not find a relationship between '${this.t}' and '${e.name}' in the schema cache`);
      e.cols.forEach(c => { if (!COLS[e.name].includes(c)) throw err('42703', `column ${e.name}.${c} does not exist`); });
    });
    return rows.map(r => {
      const o = {};
      plain.forEach(c => { if (c === '*') Object.assign(o, r); else o[c] = r[c]; });
      embeds.forEach(e => {
        const rel = REL[`${this.t}>${e.name}`];
        const vis = x => e.name === 'portfolios' ? (x.user_id === me()?.id || x.is_published) : e.name === 'portfolio_skills' ? (owns(x.portfolio_id) || db().portfolios.some(p => p.id === x.portfolio_id && p.is_published)) : true;
        const pick = x => Object.fromEntries(e.cols.map(c => [c, x[c]]));
        if (rel.one) { const t = db()[rel.to].find(x => x.id === r[rel.local] && vis(x)); o[e.name] = t ? pick(t) : null; }
        else o[e.name] = db()[rel.to].filter(x => x[rel.remote] === r.id && vis(x)).map(pick);
      });
      return o;
    });
  }
  checkCols(obj) {
    for (const k of Object.keys(obj)) if (!COLS[this.t].includes(k)) throw err('PGRST204', `Could not find the '${k}' column of '${this.t}' in the schema cache`);
  }
  checkNN(row) { for (const c of NOT_NULL[this.t] || []) if (row[c] === null || row[c] === undefined || row[c] === '') throw err('23502', `null value in column "${c}" violates not-null constraint`); }
  checkSlug(row) {
    if (this.t !== 'portfolios' || row.slug === undefined) return;
    if (!/^[a-z0-9][a-z0-9-]{1,59}$/.test(row.slug)) throw err('23514', 'portfolios_slug_format');
    if (db().portfolios.some(p => p.slug === row.slug && p.id !== row.id)) throw err('23505', 'duplicate key value violates unique constraint');
  }
  run() {
    try { return this._run(); } catch (e) { if (e && e.code) return { data: null, error: e }; throw e; }
  }
  _run() {
    const rows = db()[this.t]; if (!rows) throw err('42P01', 'no table ' + this.t);
    const match = r => this.f.every(fn => fn(r));
    let visible = r => true;
    if (this.t === 'portfolios') visible = r => r.user_id === me()?.id || r.is_published;
    if (this.t === 'community_posts') visible = r => r.is_published || r.user_id === me()?.id;
    if (this.t.startsWith('portfolio_')) visible = r => owns(r.portfolio_id) || db().portfolios.some(p => p.id === r.portfolio_id && p.is_published);
    const wrap = data => {
      if (this.one) {
        if (Array.isArray(data) && data.length > 1 && this.one === 'maybe') return { data: null, error: err('PGRST116', 'multiple rows returned') };
        const d = Array.isArray(data) ? data[0] ?? null : data;
        if (!d && this.one === 'single') return { data: null, error: err('PGRST116', 'no rows') };
        return { data: d, error: null };
      }
      return { data, error: null };
    };
    if (this.op === 'select') {
      let out = rows.filter(r => visible(r) && match(r)).map(r => ({ ...r }));
      if (this.selOpts?.head) return { data: null, count: out.length, error: null };
      if (this.ord) out.sort((a, b) => (a[this.ord[0]] > b[this.ord[0]] ? 1 : -1) * (this.ord[1] ? 1 : -1));
      if (this.rng) out = out.slice(this.rng[0], this.rng[1] + 1);
      if (this.lim) out = out.slice(0, this.lim);
      out = this.project(out);
      return wrap(out);
    }
    if (this.op === 'insert') {
      const created = [];
      for (const p of this.payload) {
        this.checkCols(p);
        const row = { id: uuid(), created_at: new Date().toISOString(), ...p };
        if (this.t.startsWith('portfolio_') && this.t !== 'portfolios' && !owns(row.portfolio_id)) throw err('42501', 'new row violates row-level security policy');
        if ((this.t === 'portfolios' || this.t === 'community_posts') && row.user_id !== me()?.id) throw err('42501', 'new row violates row-level security policy');
        if (this.t === 'community_posts') { row.category ??= 'Other'; row.tags ??= []; row.is_published ??= true; row.updated_at ??= row.created_at; }
        if (this.t === 'portfolio_skills') { row.level ??= 80; row.category ??= 'General'; }
        this.checkNN(row); this.checkSlug(row); created.push(row);
      }
      rows.push(...created);
      return wrap(this.project(created.map(r => ({ ...r }))));
    }
    if (this.op === 'update') {
      this.checkCols(this.payload);
      const writable = r => (this.t === 'portfolios' || this.t === 'community_posts') ? r.user_id === me()?.id : this.t === 'profiles' ? r.id === me()?.id : owns(r.portfolio_id);
      const targets = rows.filter(r => writable(r) && match(r)); // RLS: silently affects 0 rows when not owner
      for (const r of targets) { const next = { ...r, ...this.payload }; this.checkNN(next); this.checkSlug(next); if (this.t === 'portfolios' && next.user_id !== r.user_id) throw err('P0001', 'owner cannot be changed'); }
      targets.forEach(r => Object.assign(r, this.payload));
      return wrap(this.project(targets.map(r => ({ ...r }))));
    }
    if (this.op === 'upsert') {
      this.checkCols(this.payload);
      const key = this.opts.onConflict || 'id';
      let r = rows.find(x => x[key] === this.payload[key]);
      if (this.t === 'profiles' && this.payload.username && db().profiles.some(x => x.username === this.payload.username && x.id !== this.payload.id)) throw err('23505', 'profiles_username_key');
      if (r) { if (this.t === 'profiles' && r.id !== me()?.id) throw err('42501', 'rls'); Object.assign(r, this.payload); }
      else { if (this.t === 'profiles' && this.payload.id !== me()?.id) throw err('42501', 'rls'); rows.push({ ...this.payload }); }
      return wrap([]);
    }
    if (this.op === 'delete') {
      const writable = r => (this.t === 'portfolios' || this.t === 'community_posts') ? r.user_id === me()?.id : owns(r.portfolio_id);
      const gone = rows.filter(r => writable(r) && match(r));
      db()[this.t] = rows.filter(r => !gone.includes(r));
      return wrap(gone);
    }
  }
}

const supabase = {
  from: t => new Q(t),
  storage: { from: bucket => ({
    upload: async (path, file) => {
      if (!path.startsWith(me().id + '/')) return { data: null, error: err('42501', 'storage rls') };
      (db().__uploads ||= []).push({ bucket, path, type: file.type, size: file.size }); return { data: { path }, error: null };
    },
    getPublicUrl: path => ({ data: { publicUrl: `https://files.test/${bucket}/${path}` } })
  }) },
  rpc: async (name, args) => {
    if (name !== 'increment_view_count') return { data: null, error: err('42883', 'no function') };
    const p = db().portfolios.find(x => x.slug === args.portfolio_slug && x.is_published);
    if (p) p.view_count = (p.view_count || 0) + 1;
    return { data: null, error: null };
  },
  auth: { onAuthStateChange: () => ({ data: { subscription: { unsubscribe() {} } } }), getSession: async () => ({ data: { session: me() ? { user: me() } : null }, error: null }) }
};
export default supabase;
export async function getUser() { return me() || null; }
export async function signOut() {}
export async function requireAuth() {
  if (!me()) { (window.__REDIRECTS__ ||= []).push('login.html'); return new Promise(() => {}); }
  return me();
}
