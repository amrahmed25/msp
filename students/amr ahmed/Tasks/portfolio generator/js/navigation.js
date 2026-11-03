/**
 * navigation.js
 * PortfolioHub — Navigation Module
 * Handles navbar rendering, auth-state updates, mobile menu, and dropdown behavior.
 */

import supabase from './supabase-client.js';

/* ─────────────────────────────────────────────
   NAVBAR TEMPLATE
   ───────────────────────────────────────────── */
function getNavbarHTML() {
  return `
    <nav class="navbar" id="navbar">
      <div class="nav-container">
        <!-- Logo -->
        <a href="index.html" class="nav-logo">
          <span class="nav-logo-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="3"/><path d="M3 9h18"/><path d="M9 21V9"/></svg></span>
          <span class="nav-logo-text">PortfolioHub</span>
        </a>

        <!-- Desktop Nav Links -->
        <ul class="nav-links" id="nav-links">
          <li><a href="index.html" class="nav-link" data-page="index">Home</a></li>
          <li><a href="explore.html" class="nav-link" data-page="explore">Explore</a></li>
          <li><a href="templates.html" class="nav-link" data-page="templates">Templates</a></li>
          <li><a href="community.html" class="nav-link" data-page="community">Community</a></li>
        </ul>

        <!-- Auth Section -->
        <div class="nav-auth" id="nav-auth">
          <!-- Unauthenticated (default, hidden when logged in) -->
          <div class="nav-auth-guest" id="nav-auth-guest">
            <a href="login.html" class="btn btn-ghost nav-btn-login">Login</a>
            <a href="signup.html" class="btn btn-primary nav-btn-signup">Get Started</a>
          </div>

          <!-- Authenticated (hidden by default) -->
          <div class="nav-auth-user" id="nav-auth-user" style="display:none;">
            <a href="dashboard.html" class="btn btn-ghost nav-dashboard-link">Dashboard</a>
            <div class="nav-user-dropdown" id="nav-user-dropdown">
              <button class="nav-avatar-btn" id="nav-avatar-btn" aria-haspopup="true" aria-expanded="false">
                <img src="" alt="User Avatar" class="nav-avatar-img" id="nav-avatar-img" />
                <span class="nav-avatar-initials" id="nav-avatar-initials"></span>
                <svg class="nav-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
              </button>
              <div class="nav-dropdown-menu" id="nav-dropdown-menu" role="menu">
                <div class="nav-dropdown-header">
                  <span class="nav-dropdown-name" id="nav-dropdown-name">User</span>
                  <span class="nav-dropdown-email" id="nav-dropdown-email"></span>
                </div>
                <div class="nav-dropdown-divider"></div>
                <a href="dashboard.html" class="nav-dropdown-item" role="menuitem">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
                  Dashboard
                </a>
                <a href="profile.html" class="nav-dropdown-item" role="menuitem">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  Profile Settings
                </a>
                <a href="dashboard.html" class="nav-dropdown-item" role="menuitem">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
                  My Portfolio
                </a>
                <div class="nav-dropdown-divider"></div>
                <button class="nav-dropdown-item nav-dropdown-logout" id="nav-logout-btn" role="menuitem">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Mobile Hamburger -->
        <button class="nav-hamburger" id="nav-hamburger" aria-label="Toggle menu" aria-expanded="false">
          <span class="hamburger-line"></span>
          <span class="hamburger-line"></span>
          <span class="hamburger-line"></span>
        </button>
      </div>

      <!-- Mobile Menu -->
      <div class="nav-mobile-menu" id="nav-mobile-menu" aria-hidden="true">
        <ul class="nav-mobile-links">
          <li><a href="index.html" class="nav-mobile-link" data-page="index">Home</a></li>
          <li><a href="explore.html" class="nav-mobile-link" data-page="explore">Explore</a></li>
          <li><a href="templates.html" class="nav-mobile-link" data-page="templates">Templates</a></li>
          <li><a href="community.html" class="nav-mobile-link" data-page="community">Community</a></li>
        </ul>
        <div class="nav-mobile-auth" id="nav-mobile-auth">
          <div class="nav-mobile-auth-guest" id="nav-mobile-auth-guest">
            <a href="login.html" class="btn btn-ghost nav-mobile-btn">Login</a>
            <a href="signup.html" class="btn btn-primary nav-mobile-btn">Get Started</a>
          </div>
          <div class="nav-mobile-auth-user" id="nav-mobile-auth-user" style="display:none;">
            <a href="dashboard.html" class="nav-mobile-link">Dashboard</a>
            <a href="profile.html" class="nav-mobile-link">Profile Settings</a>
            <a href="dashboard.html" class="nav-mobile-link">My Portfolio</a>
            <button class="nav-mobile-link nav-mobile-logout" id="nav-mobile-logout-btn">Logout</button>
          </div>
        </div>
      </div>
    </nav>
    <div class="nav-overlay" id="nav-overlay"></div>
  `;
}

/* ─────────────────────────────────────────────
   INJECT NAVBAR
   ───────────────────────────────────────────── */
/**
 * Renders the standard navbar HTML into the target container.
 * @param {string} containerId - ID of the container element (default: 'main-nav')
 */
function renderNavbar(containerId = 'main-nav') {
  const container = document.getElementById(containerId);
  if (!container) {
    console.warn(`[Navigation] Container "#${containerId}" not found.`);
    return;
  }
  container.innerHTML = getNavbarHTML();
  _injectNavStyles();
}

/* ─────────────────────────────────────────────
   ACTIVE LINK HIGHLIGHTING
   ───────────────────────────────────────────── */
function _setActiveLink() {
  const path = window.location.pathname;
  const filename = path.substring(path.lastIndexOf('/') + 1).replace('.html', '') || 'index';

  // Desktop links
  document.querySelectorAll('.nav-link[data-page]').forEach(link => {
    link.classList.toggle('active', link.dataset.page === filename);
  });

  // Mobile links
  document.querySelectorAll('.nav-mobile-link[data-page]').forEach(link => {
    link.classList.toggle('active', link.dataset.page === filename);
  });
}

/* ─────────────────────────────────────────────
   AUTH STATE UPDATE
   ───────────────────────────────────────────── */
async function _updateAuthUI() {
  const { data: { session } } = await supabase.auth.getSession();

  const guestEl = document.getElementById('nav-auth-guest');
  const userEl = document.getElementById('nav-auth-user');
  const mobileGuestEl = document.getElementById('nav-mobile-auth-guest');
  const mobileUserEl = document.getElementById('nav-mobile-auth-user');

  if (!session) {
    // Not logged in — show guest buttons
    if (guestEl) guestEl.style.display = 'flex';
    if (userEl) userEl.style.display = 'none';
    if (mobileGuestEl) mobileGuestEl.style.display = 'flex';
    if (mobileUserEl) mobileUserEl.style.display = 'none';
    return;
  }

  // Logged in — show user section
  if (guestEl) guestEl.style.display = 'none';
  if (userEl) userEl.style.display = 'flex';
  if (mobileGuestEl) mobileGuestEl.style.display = 'none';
  if (mobileUserEl) mobileUserEl.style.display = 'flex';

  const user = session.user;

  // Try to load profile
  let displayName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User';
  let avatarUrl = user.user_metadata?.avatar_url || null;

  try {
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, avatar_url')
      .eq('id', user.id)
      .single();

    if (profile) {
      if (profile.full_name) displayName = profile.full_name;
      if (profile.avatar_url) avatarUrl = profile.avatar_url;
    }
  } catch (_) {
    // Silently fail — profile table may not exist yet
  }

  // Initials fallback
  const initials = displayName
    .split(' ')
    .map(w => w[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  const avatarImg = document.getElementById('nav-avatar-img');
  const avatarInitialsEl = document.getElementById('nav-avatar-initials');
  const dropdownNameEl = document.getElementById('nav-dropdown-name');
  const dropdownEmailEl = document.getElementById('nav-dropdown-email');

  if (avatarImg && avatarInitialsEl) {
    if (avatarUrl) {
      avatarImg.src = avatarUrl;
      avatarImg.style.display = 'block';
      avatarInitialsEl.style.display = 'none';

      avatarImg.onerror = () => {
        avatarImg.style.display = 'none';
        avatarInitialsEl.style.display = 'flex';
        avatarInitialsEl.textContent = initials;
      };
    } else {
      avatarImg.style.display = 'none';
      avatarInitialsEl.style.display = 'flex';
      avatarInitialsEl.textContent = initials;
    }
  }

  if (dropdownNameEl) dropdownNameEl.textContent = displayName;
  if (dropdownEmailEl) dropdownEmailEl.textContent = user.email || '';
}

/* ─────────────────────────────────────────────
   MOBILE HAMBURGER MENU
   ───────────────────────────────────────────── */
function _initMobileMenu() {
  const hamburger = document.getElementById('nav-hamburger');
  const mobileMenu = document.getElementById('nav-mobile-menu');
  const overlay = document.getElementById('nav-overlay');

  if (!hamburger || !mobileMenu) return;

  function openMenu() {
    mobileMenu.classList.add('open');
    hamburger.classList.add('open');
    hamburger.setAttribute('aria-expanded', 'true');
    mobileMenu.setAttribute('aria-hidden', 'false');
    if (overlay) overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    mobileMenu.classList.remove('open');
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    mobileMenu.setAttribute('aria-hidden', 'true');
    if (overlay) overlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  hamburger.addEventListener('click', () => {
    const isOpen = mobileMenu.classList.contains('open');
    isOpen ? closeMenu() : openMenu();
  });

  if (overlay) {
    overlay.addEventListener('click', closeMenu);
  }

  // Close on mobile link click
  mobileMenu.querySelectorAll('a, button').forEach(el => {
    el.addEventListener('click', closeMenu);
  });

  // Close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMenu();
  });
}

/* ─────────────────────────────────────────────
   USER DROPDOWN
   ───────────────────────────────────────────── */
function _initUserDropdown() {
  const avatarBtn = document.getElementById('nav-avatar-btn');
  const dropdownMenu = document.getElementById('nav-dropdown-menu');

  if (!avatarBtn || !dropdownMenu) return;

  function openDropdown() {
    dropdownMenu.classList.add('open');
    avatarBtn.setAttribute('aria-expanded', 'true');
  }

  function closeDropdown() {
    dropdownMenu.classList.remove('open');
    avatarBtn.setAttribute('aria-expanded', 'false');
  }

  avatarBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = dropdownMenu.classList.contains('open');
    isOpen ? closeDropdown() : openDropdown();
  });

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (!avatarBtn.contains(e.target) && !dropdownMenu.contains(e.target)) {
      closeDropdown();
    }
  });

  // Close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeDropdown();
  });
}

/* ─────────────────────────────────────────────
   LOGOUT HANDLER
   ───────────────────────────────────────────── */
function _initLogout() {
  const logoutBtn = document.getElementById('nav-logout-btn');
  const mobileLogoutBtn = document.getElementById('nav-mobile-logout-btn');

  async function handleLogout() {
    try {
      await supabase.auth.signOut();
      window.location.href = 'index.html';
    } catch (err) {
      console.error('[Navigation] Logout error:', err);
    }
  }

  if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);
  if (mobileLogoutBtn) mobileLogoutBtn.addEventListener('click', handleLogout);
}

/* ─────────────────────────────────────────────
   NAVBAR SCROLL EFFECT
   ───────────────────────────────────────────── */
function _initScrollEffect() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 10) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }, { passive: true });
}

/* ─────────────────────────────────────────────
   INJECT NAV-SPECIFIC STYLES (if not in stylesheet)
   ───────────────────────────────────────────── */
function _injectNavStyles() {
  if (document.getElementById('nav-injected-styles')) return;

  const style = document.createElement('style');
  style.id = 'nav-injected-styles';
  style.textContent = `
    /* ── Navbar Base ── */
    .navbar {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 1000;
      background: rgba(255,255,255,0.95);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      border-bottom: 1px solid var(--border, #E2E8F0);
      transition: box-shadow 0.2s ease, background 0.2s ease;
    }
    .navbar.scrolled {
      box-shadow: 0 4px 20px rgba(0,0,0,0.08);
      background: rgba(255,255,255,0.98);
    }
    .nav-container {
      max-width: 1280px;
      margin: 0 auto;
      padding: 0 1.5rem;
      height: 64px;
      display: flex;
      align-items: center;
      gap: 2rem;
    }

    /* ── Logo ── */
    .nav-logo {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      text-decoration: none;
      flex-shrink: 0;
    }
    .nav-logo-icon { font-size: 1.5rem; }
    .nav-logo-text {
      font-size: 1.2rem;
      font-weight: 700;
      color: var(--primary, #2563EB);
      letter-spacing: -0.3px;
    }

    /* ── Desktop Links ── */
    .nav-links {
      display: flex;
      list-style: none;
      margin: 0;
      padding: 0;
      gap: 0.25rem;
      flex: 1;
    }
    .nav-link {
      display: block;
      padding: 0.4rem 0.85rem;
      text-decoration: none;
      font-size: 0.925rem;
      font-weight: 500;
      color: var(--secondary-text, #64748B);
      border-radius: 6px;
      transition: color 0.15s, background 0.15s;
    }
    .nav-link:hover { color: var(--primary, #2563EB); background: #EFF6FF; }
    .nav-link.active { color: var(--primary, #2563EB); background: #EFF6FF; font-weight: 600; }

    /* ── Auth Section ── */
    .nav-auth { display: flex; align-items: center; gap: 0.75rem; flex-shrink: 0; }
    .nav-auth-guest { display: flex; align-items: center; gap: 0.75rem; }
    .nav-auth-user { display: flex; align-items: center; gap: 0.75rem; }
    .nav-dashboard-link {
      font-size: 0.9rem;
      font-weight: 500;
      color: var(--secondary-text, #64748B);
      text-decoration: none;
      padding: 0.4rem 0.85rem;
      border-radius: 6px;
      transition: color 0.15s, background 0.15s;
    }
    .nav-dashboard-link:hover { color: var(--primary, #2563EB); background: #EFF6FF; }

    /* ── User Dropdown Trigger ── */
    .nav-user-dropdown { position: relative; }
    .nav-avatar-btn {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      background: none;
      border: 2px solid var(--border, #E2E8F0);
      border-radius: 50px;
      padding: 0.2rem 0.6rem 0.2rem 0.2rem;
      cursor: pointer;
      transition: border-color 0.15s, box-shadow 0.15s;
    }
    .nav-avatar-btn:hover { border-color: var(--primary, #2563EB); box-shadow: 0 0 0 3px rgba(37,99,235,0.1); }
    .nav-avatar-img {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      object-fit: cover;
      display: none;
    }
    .nav-avatar-initials {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: var(--primary, #2563EB);
      color: white;
      font-size: 0.75rem;
      font-weight: 700;
      display: none;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .nav-chevron {
      color: var(--secondary-text, #64748B);
      transition: transform 0.2s ease;
    }
    .nav-avatar-btn[aria-expanded="true"] .nav-chevron { transform: rotate(180deg); }

    /* ── Dropdown Menu ── */
    .nav-dropdown-menu {
      position: absolute;
      top: calc(100% + 10px);
      right: 0;
      min-width: 220px;
      background: white;
      border: 1px solid var(--border, #E2E8F0);
      border-radius: 12px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.12);
      padding: 0.5rem;
      opacity: 0;
      visibility: hidden;
      transform: translateY(-8px);
      transition: opacity 0.2s ease, transform 0.2s ease, visibility 0.2s;
      z-index: 1100;
    }
    .nav-dropdown-menu.open {
      opacity: 1;
      visibility: visible;
      transform: translateY(0);
    }
    .nav-dropdown-header {
      padding: 0.5rem 0.75rem 0.75rem;
      display: flex;
      flex-direction: column;
      gap: 0.2rem;
    }
    .nav-dropdown-name { font-size: 0.925rem; font-weight: 600; color: var(--dark-text, #0F172A); }
    .nav-dropdown-email { font-size: 0.8rem; color: var(--secondary-text, #64748B); overflow: hidden; text-overflow: ellipsis; white-space: normal; }
    .nav-dropdown-divider { height: 1px; background: var(--border, #E2E8F0); margin: 0.25rem 0; }
    .nav-dropdown-item {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      padding: 0.55rem 0.75rem;
      text-decoration: none;
      font-size: 0.9rem;
      font-weight: 500;
      color: var(--dark-text, #0F172A);
      border-radius: 8px;
      transition: background 0.15s, color 0.15s;
      width: 100%;
      border: none;
      background: none;
      cursor: pointer;
      text-align: left;
    }
    .nav-dropdown-item:hover { background: var(--light-gray, #F1F5F9); color: var(--primary, #2563EB); }
    .nav-dropdown-item svg { flex-shrink: 0; color: var(--secondary-text, #64748B); }
    .nav-dropdown-item:hover svg { color: var(--primary, #2563EB); }
    .nav-dropdown-logout:hover { background: #FEF2F2; color: #DC2626; }
    .nav-dropdown-logout:hover svg { color: #DC2626; }

    /* ── Hamburger ── */
    .nav-hamburger {
      display: none;
      flex-direction: column;
      gap: 5px;
      background: none;
      border: none;
      cursor: pointer;
      padding: 6px;
      margin-left: auto;
      border-radius: 6px;
      transition: background 0.15s;
    }
    .nav-hamburger:hover { background: var(--light-gray, #F1F5F9); }
    .hamburger-line {
      display: block;
      width: 22px;
      height: 2px;
      background: var(--dark-text, #0F172A);
      border-radius: 2px;
      transition: transform 0.3s ease, opacity 0.3s ease;
    }
    .nav-hamburger.open .hamburger-line:nth-child(1) { transform: translateY(7px) rotate(45deg); }
    .nav-hamburger.open .hamburger-line:nth-child(2) { opacity: 0; }
    .nav-hamburger.open .hamburger-line:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }

    /* ── Mobile Menu ── */
    .nav-mobile-menu {
      display: none;
      overflow: hidden;
      max-height: 0;
      transition: max-height 0.35s cubic-bezier(0.4,0,0.2,1);
      background: white;
      border-top: 1px solid var(--border, #E2E8F0);
    }
    .nav-mobile-menu.open { max-height: 600px; }
    .nav-mobile-links {
      list-style: none;
      margin: 0;
      padding: 0.5rem 1rem;
    }
    .nav-mobile-link {
      display: block;
      padding: 0.7rem 0.75rem;
      text-decoration: none;
      font-size: 0.975rem;
      font-weight: 500;
      color: var(--dark-text, #0F172A);
      border-radius: 8px;
      transition: background 0.15s, color 0.15s;
      border: none;
      background: none;
      width: 100%;
      text-align: left;
      cursor: pointer;
    }
    .nav-mobile-link:hover { background: var(--light-gray, #F1F5F9); color: var(--primary, #2563EB); }
    .nav-mobile-link.active { color: var(--primary, #2563EB); background: #EFF6FF; font-weight: 600; }
    .nav-mobile-auth {
      padding: 0.75rem 1rem 1rem;
      border-top: 1px solid var(--border, #E2E8F0);
    }
    .nav-mobile-auth-guest { display: flex; gap: 0.75rem; }
    .nav-mobile-auth-user { display: flex; flex-direction: column; gap: 0.25rem; }
    .nav-mobile-btn { flex: 1; justify-content: center; }
    .nav-mobile-logout { color: #DC2626; }
    .nav-mobile-logout:hover { background: #FEF2F2; color: #DC2626; }

    /* ── Overlay ── */
    .nav-overlay {
      display: none;
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.3);
      z-index: 999;
      opacity: 0;
      transition: opacity 0.3s;
    }
    .nav-overlay.active { opacity: 1; }

    /* ── Btn helpers (if not in global css) ── */
    .btn { display: inline-flex; align-items: center; gap: 0.4rem; padding: 0.5rem 1.1rem; border-radius: 8px; font-size: 0.9rem; font-weight: 600; cursor: pointer; text-decoration: none; border: none; transition: all 0.2s ease; white-space: normal; }
    .btn-primary { background: var(--primary, #2563EB); color: white; }
    .btn-primary:hover { background: var(--dark-blue, #1E3A8A); transform: translateY(-1px); }
    .btn-ghost { background: transparent; color: var(--secondary-text, #64748B); border: 1.5px solid var(--border, #E2E8F0); }
    .btn-ghost:hover { color: var(--primary, #2563EB); border-color: var(--primary, #2563EB); background: #EFF6FF; }

    /* ── Responsive ── */
    @media (max-width: 768px) {
      .nav-links { display: none; }
      .nav-auth { display: none; }
      .nav-hamburger { display: flex; }
      .nav-mobile-menu { display: block; }
    }
  `;
  document.head.appendChild(style);
}

/* ─────────────────────────────────────────────
   MAIN INIT
   ───────────────────────────────────────────── */
/**
 * Initializes the full navigation system.
 * Call this after renderNavbar() has been called, or if the nav HTML is already in the page.
 */
async function initNavigation() {
  // 1. Inject styles
  _injectNavStyles();

  // 2. Set active nav link
  _setActiveLink();

  // 3. Initialize mobile menu
  _initMobileMenu();

  // 4. Initialize user dropdown
  _initUserDropdown();

  // 5. Initialize logout buttons
  _initLogout();

  // 6. Initialize scroll effect
  _initScrollEffect();

  // 7. Update auth UI (async — fetches session)
  await _updateAuthUI();

  // 8. Listen for auth state changes (handles login/logout on the fly)
  supabase.auth.onAuthStateChange((_event, _session) => {
    _updateAuthUI();
  });
}

export { initNavigation, renderNavbar };
