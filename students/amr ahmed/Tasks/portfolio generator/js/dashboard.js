/**
 * dashboard.js
 * PortfolioHub — Dashboard Module
 * Handles portfolio CRUD, stats, and all dashboard UI logic.
 */

import supabase from './supabase-client.js';
import { showToast, createModal, copyToClipboard, formatRelativeDate } from './utils.js';
import { requireAuth } from './supabase-client.js';
import { createPortfolio as createPortfolioRecord, publicUrl } from './portfolio-service.js';

/* ─────────────────────────────────────────────
   GLOBALS
   ───────────────────────────────────────────── */
let _currentUser = null;
let _allPortfolios = [];

/* ─────────────────────────────────────────────
   TEMPLATE GRADIENTS (fallback covers)
   ───────────────────────────────────────────── */
const TEMPLATE_GRADIENTS = {
  reference:  'linear-gradient(135deg, #2563EB 0%, #1E3A8A 100%)',
  developer:  'linear-gradient(135deg, #0F172A 0%, #1E3A8A 100%)',
  creative:   'linear-gradient(135deg, #DBEAFE 0%, #93C5FD 100%)',
  freelancer: 'linear-gradient(135deg, #EFF6FF 0%, #BFDBFE 100%)',
  default:    'linear-gradient(135deg, #2563EB 0%, #1E3A8A 100%)',
};

const TEMPLATE_LABELS = {
  reference: 'Reference',
  developer: 'Developer',
  creative: 'Creative',
  freelancer: 'Freelancer',
};

function _templateLabel(id) {
  return TEMPLATE_LABELS[id] || TEMPLATE_LABELS.reference;
}

function _getGradient(templateName) {
  if (!templateName) return TEMPLATE_GRADIENTS.default;
  const key = templateName.toLowerCase();
  return TEMPLATE_GRADIENTS[key] || TEMPLATE_GRADIENTS.default;
}

/* ─────────────────────────────────────────────
   SKELETON LOADERS
   ───────────────────────────────────────────── */
function _showPortfolioSkeletons(count = 3) {
  const grid = document.getElementById('portfolios-grid');
  if (!grid) return;

  grid.innerHTML = '';
  for (let i = 0; i < count; i++) {
    const card = document.createElement('div');
    card.className = 'portfolio-card skeleton-card';
    card.innerHTML = `
      <div class="skeleton skeleton-cover"></div>
      <div class="portfolio-card-body">
        <div class="skeleton skeleton-badge"></div>
        <div class="skeleton skeleton-title"></div>
        <div class="skeleton skeleton-meta"></div>
        <div class="skeleton skeleton-actions"></div>
      </div>
    `;
    grid.appendChild(card);
  }
}

function _showStatSkeletons() {
  document.querySelectorAll('.stat-value').forEach(el => {
    el.innerHTML = '<span class="skeleton skeleton-stat-num"></span>';
  });
}

/* ─────────────────────────────────────────────
   STATS
   ───────────────────────────────────────────── */
async function loadStats(userId) {
  try {
    // Count portfolios
    const { count: totalPortfolios } = await supabase
      .from('portfolios')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId);

    // Count published
    const { count: publishedCount } = await supabase
      .from('portfolios')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_published', true);

    // Total views (sum of view_count)
    const { data: viewData } = await supabase
      .from('portfolios')
      .select('view_count')
      .eq('user_id', userId);

    const totalViews = (viewData || []).reduce((sum, p) => sum + (p.view_count || 0), 0);

    // Community posts
    let communityPosts = 0;
    try {
      const { count } = await supabase
        .from('community_posts')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId);
      communityPosts = count || 0;
    } catch (_) { /* table may not exist */ }

    _renderStats({
      total: totalPortfolios || 0,
      published: publishedCount || 0,
      views: totalViews,
      posts: communityPosts,
    });
  } catch (err) {
    console.error('[Dashboard] Stats error:', err);
    _renderStats({ total: 0, published: 0, views: 0, posts: 0 });
  }
}

function _renderStats({ total, published, views, posts }) {
  const map = {
    'stat-total-portfolios': total,
    'stat-published': published,
    'stat-views': views.toLocaleString(),
    'stat-posts': posts,
  };
  Object.entries(map).forEach(([id, val]) => {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  });
}

/* ─────────────────────────────────────────────
   LOAD PORTFOLIOS
   ───────────────────────────────────────────── */
async function loadPortfolios(userId) {
  const { data, error } = await supabase
    .from('portfolios')
    .select('id, title, slug, template_id, is_published, view_count, cover_url, created_at, updated_at')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

/* ─────────────────────────────────────────────
   RENDER PORTFOLIO CARD (safe DOM manipulation)
   ───────────────────────────────────────────── */
function renderPortfolioCard(portfolio) {
  const card = document.createElement('div');
  card.className = 'portfolio-card';
  card.dataset.portfolioId = portfolio.id;

  // ── Cover ──
  const cover = document.createElement('div');
  cover.className = 'portfolio-card-cover';
  if (portfolio.cover_url) {
    const img = document.createElement('img');
    img.src = portfolio.cover_url;
    img.alt = portfolio.title || 'Portfolio cover';
    img.className = 'portfolio-cover-img';
    img.onerror = () => {
      img.remove();
      cover.style.background = _getGradient(portfolio.template_id);
    };
    cover.appendChild(img);
  } else {
    cover.style.background = _getGradient(portfolio.template_id);
  }

  // Template badge on cover
  if (portfolio.template_id) {
    const badge = document.createElement('span');
    badge.className = 'portfolio-template-badge';
    badge.textContent = _templateLabel(portfolio.template_id);
    cover.appendChild(badge);
  }

  card.appendChild(cover);

  // ── Body ──
  const body = document.createElement('div');
  body.className = 'portfolio-card-body';

  // Published badge
  const statusBadge = document.createElement('span');
  statusBadge.className = `portfolio-status-badge ${portfolio.is_published ? 'published' : 'draft'}`;
  statusBadge.id = `status-badge-${portfolio.id}`;
  statusBadge.textContent = portfolio.is_published ? '● Published' : '○ Draft';
  body.appendChild(statusBadge);

  // Title
  const title = document.createElement('h3');
  title.className = 'portfolio-card-title';
  title.textContent = portfolio.title || 'Untitled Portfolio';
  body.appendChild(title);

  // Meta row
  const meta = document.createElement('div');
  meta.className = 'portfolio-card-meta';

  const viewCount = document.createElement('span');
  viewCount.className = 'portfolio-view-count';
  viewCount.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg> ${(portfolio.view_count || 0).toLocaleString()} views`;
  meta.appendChild(viewCount);

  const dateEl = document.createElement('span');
  dateEl.className = 'portfolio-date';
  try {
    dateEl.textContent = formatRelativeDate(portfolio.updated_at || portfolio.created_at);
  } catch (_) {
    dateEl.textContent = 'Recently';
  }
  meta.appendChild(dateEl);
  body.appendChild(meta);

  // ── Action Buttons ──
  const actions = document.createElement('div');
  actions.className = 'portfolio-card-actions';

  // Edit
  const editBtn = document.createElement('a');
  editBtn.href = `portfolio-builder.html?id=${encodeURIComponent(portfolio.id)}`;
  editBtn.className = 'card-action-btn btn-edit';
  editBtn.title = 'Edit Portfolio';
  editBtn.innerHTML = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg> Edit`;
  actions.appendChild(editBtn);

  // View live (only meaningful once published)
  const previewBtn = document.createElement('a');
  previewBtn.className = 'card-action-btn btn-preview';
  previewBtn.innerHTML = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg> <span>View</span>`;
  applyViewState(previewBtn, portfolio.slug, portfolio.is_published);
  actions.appendChild(previewBtn);

  // Publish/Unpublish
  const publishBtn = document.createElement('button');
  publishBtn.className = `card-action-btn btn-publish${portfolio.is_published ? ' btn-unpublish' : ''}`;
  publishBtn.id = `publish-btn-${portfolio.id}`;
  publishBtn.title = portfolio.is_published ? 'Unpublish' : 'Publish';
  publishBtn.innerHTML = portfolio.is_published
    ? `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 1l4 4-4 4"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><path d="M7 23l-4-4 4-4"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg> Unpublish`
    : `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg> Publish`;
  publishBtn.addEventListener('click', () => togglePublish(portfolio.id, portfolio.is_published));
  actions.appendChild(publishBtn);

  // Delete
  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'card-action-btn btn-delete';
  deleteBtn.title = 'Delete Portfolio';
  deleteBtn.innerHTML = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg> Delete`;
  deleteBtn.addEventListener('click', () => deletePortfolio(portfolio.id));
  actions.appendChild(deleteBtn);

  body.appendChild(actions);
  card.appendChild(body);

  return card;
}

/* ─────────────────────────────────────────────
   RENDER PORTFOLIOS GRID
   ───────────────────────────────────────────── */
function _renderPortfolios(portfolios) {
  const grid = document.getElementById('portfolios-grid');
  const emptyState = document.getElementById('portfolios-empty');
  if (!grid) return;

  grid.innerHTML = '';

  if (!portfolios || portfolios.length === 0) {
    grid.style.display = 'none';
    if (emptyState) emptyState.style.display = 'flex';
    return;
  }

  grid.style.display = 'grid';
  if (emptyState) emptyState.style.display = 'none';

  portfolios.forEach(portfolio => {
    const card = renderPortfolioCard(portfolio);
    grid.appendChild(card);
  });
}

/* ─────────────────────────────────────────────
   CREATE PORTFOLIO
   ───────────────────────────────────────────── */
async function createPortfolio(title, templateId = 'reference') {
  if (!_currentUser) {
    showToast('You must be logged in.', 'error');
    return;
  }
  if (!title || !title.trim()) {
    showToast('Please enter a portfolio title.', 'error');
    return;
  }
  try {
    const id = await createPortfolioRecord({ user: _currentUser, title, templateId });
    showToast('Portfolio created! Opening the builder...', 'success');
    setTimeout(() => {
      window.location.href = `portfolio-builder.html?id=${encodeURIComponent(id)}`;
    }, 600);
  } catch (err) {
    console.error('[Dashboard] Create portfolio error:', err);
    showToast(err.message || 'Failed to create portfolio.', 'error');
  }
}

/* ─────────────────────────────────────────────
   DELETE PORTFOLIO
   ───────────────────────────────────────────── */
async function deletePortfolio(portfolioId) {
  // Find the portfolio title for the modal
  const portfolio = _allPortfolios.find(p => p.id === portfolioId);
  const title = portfolio?.title || 'this portfolio';

  const confirmed = await createModal({
    title: 'Delete Portfolio',
    message: `Are you sure you want to delete "<strong>${_escapeHtml(title)}</strong>"? This action cannot be undone.`,
    confirmText: 'Delete',
    cancelText: 'Cancel',
    type: 'danger',
  });

  if (!confirmed) return;

  try {
    const { error } = await supabase
      .from('portfolios')
      .delete()
      .eq('id', portfolioId)
      .eq('user_id', _currentUser.id);

    if (error) throw error;

    // Remove from local array
    _allPortfolios = _allPortfolios.filter(p => p.id !== portfolioId);

    // Remove card from DOM with animation
    const card = document.querySelector(`[data-portfolio-id="${portfolioId}"]`);
    if (card) {
      card.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
      card.style.opacity = '0';
      card.style.transform = 'scale(0.9)';
      setTimeout(() => {
        card.remove();
        _renderPortfolios(_allPortfolios);
      }, 300);
    }

    // Update stats
    loadStats(_currentUser.id);
    showToast('Portfolio deleted successfully.', 'success');
  } catch (err) {
    console.error('[Dashboard] Delete portfolio error:', err);
    showToast(err.message || 'Failed to delete portfolio.', 'error');
  }
}

/* ─────────────────────────────────────────────
   TOGGLE PUBLISH
   ───────────────────────────────────────────── */
/**
 * Points the "View" button at the public page when the portfolio is published,
 * otherwise shows it as unavailable instead of linking to a page that would 404.
 */
function applyViewState(btn, slug, isPublished) {
  if (isPublished && slug) {
    btn.href = publicUrl(slug);
    btn.target = '_blank';
    btn.rel = 'noopener noreferrer';
    btn.removeAttribute('aria-disabled');
    btn.title = 'Open the public page';
    btn.style.opacity = '';
    btn.style.pointerEvents = '';
  } else {
    btn.removeAttribute('href');
    btn.removeAttribute('target');
    btn.setAttribute('aria-disabled', 'true');
    btn.title = 'Publish this portfolio to get a public link';
    btn.style.opacity = '0.5';
    btn.style.pointerEvents = 'none';
  }
}

async function togglePublish(portfolioId, currentState) {
  const newState = !currentState;

  try {
    const { error } = await supabase
      .from('portfolios')
      .update({ is_published: newState, updated_at: new Date().toISOString() })
      .eq('id', portfolioId)
      .eq('user_id', _currentUser.id);

    if (error) throw error;

    // Update local array
    const idx = _allPortfolios.findIndex(p => p.id === portfolioId);
    if (idx !== -1) _allPortfolios[idx].is_published = newState;

    // Update status badge
    const badge = document.getElementById(`status-badge-${portfolioId}`);
    if (badge) {
      badge.textContent = newState ? '● Published' : '○ Draft';
      badge.className = `portfolio-status-badge ${newState ? 'published' : 'draft'}`;
    }

    // Update publish button
    const btn = document.getElementById(`publish-btn-${portfolioId}`);
    if (btn) {
      btn.innerHTML = newState
        ? `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 1l4 4-4 4"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><path d="M7 23l-4-4 4-4"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg> Unpublish`
        : `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg> Publish`;
      btn.title = newState ? 'Unpublish' : 'Publish';
      btn.className = `card-action-btn btn-publish${newState ? ' btn-unpublish' : ''}`;

      // Update the onclick reference to the new state
      btn.onclick = null;
      btn.addEventListener('click', () => togglePublish(portfolioId, newState));
    }

    // Update the View button
    const viewBtn = document.querySelector(`[data-portfolio-id="${portfolioId}"] .btn-preview`);
    const slug = (_allPortfolios.find(p => p.id === portfolioId) || {}).slug;
    if (viewBtn) applyViewState(viewBtn, slug, newState);

    // Update stats
    loadStats(_currentUser.id);
    showToast(newState ? 'Portfolio published.' : 'Portfolio unpublished.', 'success');
  } catch (err) {
    console.error('[Dashboard] Toggle publish error:', err);
    showToast(err.message || 'Failed to update portfolio.', 'error');
  }
}

/* ─────────────────────────────────────────────
   COPY PORTFOLIO URL
   ───────────────────────────────────────────── */
async function copyPortfolioUrl(slug) {
  const url = publicUrl(slug);
  try {
    await copyToClipboard(url);
    showToast('Portfolio link copied to clipboard.', 'success');
  } catch (err) {
    showToast('Failed to copy URL. Please copy it manually.', 'error');
    console.error('[Dashboard] Copy URL error:', err);
  }
}

/* ─────────────────────────────────────────────
   CREATE PORTFOLIO MODAL
   ───────────────────────────────────────────── */
function initCreatePortfolioModal() {
  const modal = document.getElementById('create-portfolio-modal');
  const openBtns = document.querySelectorAll('[data-action="create-portfolio"]');
  const closeBtn = document.getElementById('modal-close-btn');
  const cancelBtn = document.getElementById('modal-cancel-btn');
  const form = document.getElementById('create-portfolio-form');
  const submitBtn = document.getElementById('modal-submit-btn');

  if (!modal) return;

  function openModal() {
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
    const titleInput = document.getElementById('portfolio-title-input');
    if (titleInput) setTimeout(() => titleInput.focus(), 100);
  }

  function closeModal() {
    modal.classList.remove('open');
    document.body.style.overflow = '';
    if (form) form.reset();
  }

  openBtns.forEach(btn => btn.addEventListener('click', openModal));
  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  if (cancelBtn) cancelBtn.addEventListener('click', closeModal);

  // Close on backdrop click
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  // Close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('open')) closeModal();
  });

  // Form submission
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const titleInput = document.getElementById('portfolio-title-input');
      const templateSelect = document.getElementById('portfolio-template-select');
      const title = titleInput?.value || '';
      const template = templateSelect?.value || 'minimal';

      if (!title.trim()) {
        showToast('Please enter a title for your portfolio.', 'error');
        if (titleInput) titleInput.focus();
        return;
      }

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Creating...';
      }

      await createPortfolio(title, template);

      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Create Portfolio';
      }
      closeModal();
    });
  }
}

/* ─────────────────────────────────────────────
   UPDATE WELCOME MESSAGE
   ───────────────────────────────────────────── */
function _updateWelcomeMessage(user, profile) {
  const welcomeEl = document.getElementById('welcome-name');
  if (!welcomeEl) return;

  const name = profile?.full_name
    || user.user_metadata?.full_name
    || user.email?.split('@')[0]
    || 'there';

  // Get first name only
  const firstName = name.split(' ')[0];
  welcomeEl.textContent = firstName;
}

/* ─────────────────────────────────────────────
   SIDEBAR USER INFO
   ───────────────────────────────────────────── */
function _renderSidebarUser(user, profile) {
  const avatarImg = document.getElementById('sidebar-avatar-img');
  const avatarInitials = document.getElementById('sidebar-avatar-initials');
  const nameEl = document.getElementById('sidebar-user-name');
  const emailEl = document.getElementById('sidebar-user-email');

  const displayName = profile?.full_name
    || user.user_metadata?.full_name
    || user.email?.split('@')[0]
    || 'User';

  const avatarUrl = profile?.avatar_url || user.user_metadata?.avatar_url || null;

  const initials = displayName
    .split(' ')
    .map(w => w[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  if (nameEl) nameEl.textContent = displayName;
  if (emailEl) emailEl.textContent = user.email || '';

  if (avatarImg && avatarInitials) {
    if (avatarUrl) {
      avatarImg.src = avatarUrl;
      avatarImg.style.display = 'block';
      avatarInitials.style.display = 'none';
      avatarImg.onerror = () => {
        avatarImg.style.display = 'none';
        avatarInitials.style.display = 'flex';
        avatarInitials.textContent = initials;
      };
    } else {
      avatarImg.style.display = 'none';
      avatarInitials.style.display = 'flex';
      avatarInitials.textContent = initials;
    }
  }
}

/* ─────────────────────────────────────────────
   SIDEBAR TOGGLE (mobile)
   ───────────────────────────────────────────── */
function _initSidebarToggle() {
  const toggleBtn = document.getElementById('sidebar-toggle-btn');
  const sidebar = document.getElementById('dashboard-sidebar');
  const overlay = document.getElementById('sidebar-overlay');

  if (!toggleBtn || !sidebar) return;

  function openSidebar() {
    sidebar.classList.add('open');
    if (overlay) overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeSidebar() {
    sidebar.classList.remove('open');
    if (overlay) overlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  toggleBtn.addEventListener('click', () => {
    sidebar.classList.contains('open') ? closeSidebar() : openSidebar();
  });

  if (overlay) overlay.addEventListener('click', closeSidebar);
}

/* ─────────────────────────────────────────────
   SIDEBAR LOGOUT
   ───────────────────────────────────────────── */
function _initSidebarLogout() {
  const logoutBtn = document.getElementById('sidebar-logout-btn');
  if (!logoutBtn) return;

  logoutBtn.addEventListener('click', async () => {
    try {
      await supabase.auth.signOut();
      window.location.href = 'index.html';
    } catch (err) {
      console.error('[Dashboard] Logout error:', err);
      showToast('Failed to log out. Please try again.', 'error');
    }
  });
}

/* ─────────────────────────────────────────────
   ACTIVE SIDEBAR LINK
   ───────────────────────────────────────────── */
function _setActiveSidebarLink() {
  const currentPage = 'dashboard'; // We're on dashboard
  document.querySelectorAll('.sidebar-nav-link').forEach(link => {
    if (link.dataset.page === currentPage) {
      link.classList.add('active');
    }
  });
}

/* ─────────────────────────────────────────────
   RECENT ACTIVITY
   ───────────────────────────────────────────── */
function _renderRecentActivity(portfolios) {
  const container = document.getElementById('recent-activity-list');
  if (!container) return;

  if (!portfolios || portfolios.length === 0) {
    container.innerHTML = `<p class="activity-empty">No recent activity yet. Create your first portfolio to get started!</p>`;
    return;
  }

  // Show last 5 portfolio updates as activity
  const recent = [...portfolios]
    .sort((a, b) => new Date(b.updated_at || b.created_at) - new Date(a.updated_at || a.created_at))
    .slice(0, 5);

  container.innerHTML = '';
  recent.forEach(p => {
    const item = document.createElement('div');
    item.className = 'activity-item';

    const icon = document.createElement('div');
    icon.className = 'activity-icon';
    icon.innerHTML = p.is_published ? '<svg class="ph-icon" width="1.1em" height="1.1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/></svg>' : '<svg class="ph-icon" width="1.1em" height="1.1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/></svg>';

    const info = document.createElement('div');
    info.className = 'activity-info';

    const titleEl = document.createElement('span');
    titleEl.className = 'activity-title';
    titleEl.textContent = p.title || 'Untitled Portfolio';

    const desc = document.createElement('span');
    desc.className = 'activity-desc';
    desc.textContent = p.is_published ? 'Published' : 'Last edited';

    const timeEl = document.createElement('span');
    timeEl.className = 'activity-time';
    try {
      timeEl.textContent = formatRelativeDate(p.updated_at || p.created_at);
    } catch (_) {
      timeEl.textContent = 'Recently';
    }

    info.appendChild(titleEl);
    info.appendChild(desc);
    item.appendChild(icon);
    item.appendChild(info);
    item.appendChild(timeEl);
    container.appendChild(item);
  });
}

/* ─────────────────────────────────────────────
   SEARCH / FILTER PORTFOLIOS
   ───────────────────────────────────────────── */
function _initPortfolioSearch() {
  const searchInput = document.getElementById('portfolio-search');
  const filterSelect = document.getElementById('portfolio-filter');

  function applyFilters() {
    const query = searchInput?.value.toLowerCase().trim() || '';
    const filter = filterSelect?.value || 'all';

    let filtered = [..._allPortfolios];

    if (query) {
      filtered = filtered.filter(p =>
        (p.title || '').toLowerCase().includes(query)
      );
    }

    if (filter === 'published') {
      filtered = filtered.filter(p => p.is_published);
    } else if (filter === 'draft') {
      filtered = filtered.filter(p => !p.is_published);
    }

    _renderPortfolios(filtered);
  }

  if (searchInput) {
    searchInput.addEventListener('input', applyFilters);
  }
  if (filterSelect) {
    filterSelect.addEventListener('change', applyFilters);
  }
}

/* ─────────────────────────────────────────────
   ESCAPE HTML HELPER
   ───────────────────────────────────────────── */
function _escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = String(str);
  return div.innerHTML;
}

/* ─────────────────────────────────────────────
   MAIN LOAD DASHBOARD
   ───────────────────────────────────────────── */
async function loadDashboard() {
  // 1. Auth guard
  const user = await requireAuth();
  _currentUser = user;

  // 2. Show loading skeletons
  _showStatSkeletons();
  _showPortfolioSkeletons(3);

  // 3. Init UI components
  _initSidebarToggle();
  _initSidebarLogout();
  _setActiveSidebarLink();
  initCreatePortfolioModal();
  _initPortfolioSearch();

  // 4. Load profile
  let profile = null;
  try {
    const { data } = await supabase
      .from('profiles')
      .select('full_name, avatar_url')
      .eq('id', user.id)
      .single();
    profile = data;
  } catch (_) { /* profile may not exist */ }

  // 5. Update UI with user info
  _updateWelcomeMessage(user, profile);
  _renderSidebarUser(user, profile);

  // There is no paid tier, so the pro badge stays hidden.
  const proBadge = document.getElementById('sidebar-pro-badge');
  if (proBadge) proBadge.style.display = 'none';

  // 6. Load portfolios and stats concurrently
  try {
    const [portfolios] = await Promise.all([
      loadPortfolios(user.id),
      loadStats(user.id),
    ]);

    _allPortfolios = portfolios;
    _renderPortfolios(portfolios);
    _renderRecentActivity(portfolios);
  } catch (err) {
    console.error('[Dashboard] Load error:', err);
    showToast('Failed to load dashboard data. Please refresh.', 'error');

    const grid = document.getElementById('portfolios-grid');
    if (grid) {
      grid.innerHTML = '';
      const errMsg = document.createElement('p');
      errMsg.className = 'load-error';
      errMsg.textContent = 'Failed to load portfolios. Please try refreshing the page.';
      grid.appendChild(errMsg);
    }
  }
}

export {
  loadDashboard,
  createPortfolio,
  deletePortfolio,
  togglePublish,
  copyPortfolioUrl,
  loadPortfolios,
  renderPortfolioCard,
  loadStats,
  initCreatePortfolioModal,
};
