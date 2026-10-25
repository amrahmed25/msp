/**
 * profile.js
 * Profile settings page: edit the signed-in user's own profiles row.
 */
import supabase, { requireAuth } from './supabase-client.js';
import { showToast } from './utils.js';

const USERNAME_RE = /^[A-Za-z0-9_-]{3,30}$/;
const AVATAR_TYPES = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/gif': 'gif' };
const AVATAR_MAX = 5 * 1024 * 1024;

const $ = id => document.getElementById(id);
let user = null;
let avatarUrl = '';
let dirty = false;

function websiteError(v) {
  const s = v.trim();
  if (!s) return '';
  try {
    const u = new URL(/^[a-z][a-z0-9+.-]*:/i.test(s) ? s : `https://${s}`);
    return /^https?:$/.test(u.protocol) && u.hostname.includes('.') ? '' : 'Enter a valid http(s) link.';
  } catch (_) { return 'Enter a valid http(s) link.'; }
}

function validate() {
  const errs = {
    full_name: $('full_name').value.trim() ? '' : 'Full name is required.',
    username: !$('username').value.trim() || USERNAME_RE.test($('username').value.trim()) ? '' : 'Use 3-30 letters, numbers, hyphens or underscores.',
    website: websiteError($('website').value)
  };
  Object.entries(errs).forEach(([k, msg]) => {
    $(`${k}-error`).textContent = msg;
    $(k).setAttribute('aria-invalid', msg ? 'true' : 'false');
  });
  return !Object.values(errs).some(Boolean);
}

function showAvatar() {
  const name = $('full_name').value.trim();
  const img = $('avatar-preview');
  img.hidden = !avatarUrl;
  if (avatarUrl) img.src = avatarUrl;
  $('avatar-initials').hidden = !!avatarUrl;
  $('avatar-initials').textContent = (name.split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join('')) || '?';
  $('avatar-remove').hidden = !avatarUrl;
}

function fill(p) {
  ['full_name', 'username', 'title', 'bio', 'location', 'website'].forEach(k => { $(k).value = p?.[k] || ''; });
  avatarUrl = p?.avatar_url || '';
  showAvatar();
}

async function load() {
  $('profile-loading').hidden = false;
  $('profile-error').hidden = true;
  $('profile-form').hidden = true;
  try {
    const { data, error } = await supabase.from('profiles')
      .select('full_name, username, title, bio, location, website, avatar_url').eq('id', user.id).maybeSingle();
    if (error) throw error;
    fill(data);
    $('profile-loading').hidden = true;
    $('profile-form').hidden = false;
  } catch (err) {
    console.error('[Profile] Load failed:', err);
    $('profile-loading').hidden = true;
    $('profile-error').hidden = false;
  }
}

async function uploadAvatar(file) {
  const ext = AVATAR_TYPES[file.type];
  if (!ext) throw new Error('Use a JPG, PNG, WebP or GIF image.');
  if (file.size > AVATAR_MAX) throw new Error('That image is larger than 5 MB.');
  const path = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { error } = await supabase.storage.from('avatars').upload(path, file, { cacheControl: '3600', upsert: false, contentType: file.type });
  if (error) throw error;
  return supabase.storage.from('avatars').getPublicUrl(path).data.publicUrl;
}

async function save(e) {
  e.preventDefault();
  if (!validate()) { showToast('Please fix the highlighted fields.', 'error'); return; }
  const btn = $('profile-save');
  btn.disabled = true;
  const nullable = v => (v.trim() === '' ? null : v.trim());
  const site = nullable($('website').value);
  try {
    const { error } = await supabase.from('profiles').upsert({
      id: user.id,
      full_name: $('full_name').value.trim(),
      username: nullable($('username').value),
      title: nullable($('title').value),
      bio: nullable($('bio').value),
      location: nullable($('location').value),
      website: site && (/^[a-z][a-z0-9+.-]*:/i.test(site) ? site : `https://${site}`),
      avatar_url: avatarUrl || null
    }, { onConflict: 'id' });
    if (error) throw error;
    dirty = false;
    showToast('Profile saved.', 'success');
  } catch (err) {
    console.error('[Profile] Save failed:', err);
    if (err.code === '23505') {
      $('username-error').textContent = 'That username is already taken.';
      $('username').setAttribute('aria-invalid', 'true');
      showToast('That username is already taken.', 'error');
    } else if (err.status === 401 || /jwt/i.test(err.message || '')) {
      showToast('Your session expired. Please sign in again.', 'error');
    } else {
      showToast(err.message || 'Could not save your profile.', 'error');
    }
  } finally {
    btn.disabled = false;
  }
}

async function init() {
  user = await requireAuth();
  $('profile-retry').addEventListener('click', load);
  $('profile-form').addEventListener('submit', save);
  $('profile-form').addEventListener('input', () => { dirty = true; });
  $('full_name').addEventListener('input', showAvatar);
  $('avatar-remove').addEventListener('click', () => { avatarUrl = ''; dirty = true; showAvatar(); });
  $('avatar-input').addEventListener('change', async ev => {
    const file = ev.target.files && ev.target.files[0];
    if (!file) return;
    try {
      avatarUrl = await uploadAvatar(file);
      dirty = true;
      showAvatar();
      showToast('Photo uploaded. Save to keep it.', 'success');
    } catch (err) {
      showToast(err.message || 'Upload failed.', 'error');
    } finally {
      ev.target.value = '';
    }
  });
  window.addEventListener('beforeunload', e => { if (dirty) { e.preventDefault(); e.returnValue = ''; } });
  await load();
}

init();
