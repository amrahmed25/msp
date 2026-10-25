/**
 * PortfolioHub — Utility Module
 * Pure ES6 helper functions used across the entire application.
 */

/* ─────────────────────────────────────────────
   1. Toast Notifications
   ───────────────────────────────────────────── */

/**
 * Ensures a #toast-container div exists in the document body.
 * @returns {HTMLElement}
 */
function ensureToastContainer() {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.setAttribute('aria-live', 'polite');
    container.setAttribute('aria-atomic', 'false');
    // Inline base styles so the container works without an external stylesheet
    Object.assign(container.style, {
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      zIndex: '9999',
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
      maxWidth: '360px',
      width: 'calc(100% - 48px)',
      pointerEvents: 'none'
    });
    document.body.appendChild(container);
  }
  return container;
}

/**
 * Injects the toast keyframe CSS once into the document <head>.
 */
function ensureToastStyles() {
  if (document.getElementById('toast-styles')) return;
  const style = document.createElement('style');
  style.id = 'toast-styles';
  style.textContent = `
    .toast {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      padding: 14px 16px;
      border-radius: 8px;
      font-family: inherit;
      font-size: 0.875rem;
      line-height: 1.4;
      color: #ffffff;
      box-shadow: 0 4px 16px rgba(0,0,0,0.18);
      pointer-events: all;
      cursor: pointer;
      opacity: 0;
      transform: translateX(40px);
      transition: opacity 0.3s ease, transform 0.3s ease;
    }
    .toast.toast--visible {
      opacity: 1;
      transform: translateX(0);
    }
    .toast.toast--hiding {
      opacity: 0;
      transform: translateX(40px);
    }
    .toast--success { background: #16a34a; }
    .toast--error   { background: #dc2626; }
    .toast--warning { background: #d97706; color: #fff; }
    .toast--info    { background: #2563EB; }
    .toast__icon    { font-size: 1rem; flex-shrink: 0; margin-top: 1px; }
    .toast__message { flex: 1; }
    .toast__close   {
      background: none; border: none; color: inherit;
      opacity: 0.7; cursor: pointer; font-size: 1rem; line-height: 1;
      padding: 0; flex-shrink: 0;
    }
    .toast__close:hover { opacity: 1; }
  `;
  document.head.appendChild(style);
}

const TOAST_ICONS = {
  success: '✓',
  error:   '✕',
  warning: '!',
  info:    'ℹ'
};

/**
 * Displays a toast notification.
 * @param {string} message   Text to display.
 * @param {'success'|'error'|'warning'|'info'} [type='success']
 * @param {number} [duration=3500] Auto-dismiss after this many ms.
 */
export function showToast(message, type = 'success', duration = 3500) {
  ensureToastStyles();
  const container = ensureToastContainer();

  const toast = document.createElement('div');
  toast.className = `toast toast--${type}`;
  toast.setAttribute('role', 'alert');
  toast.innerHTML = `
    <span class="toast__icon" aria-hidden="true">${TOAST_ICONS[type] ?? 'ℹ'}</span>
    <span class="toast__message">${sanitize(message)}</span>
    <button class="toast__close" aria-label="Dismiss notification">✕</button>
  `;

  const dismiss = () => {
    toast.classList.add('toast--hiding');
    toast.addEventListener('transitionend', () => toast.remove(), { once: true });
  };

  toast.querySelector('.toast__close').addEventListener('click', dismiss);
  toast.addEventListener('click', dismiss);

  container.appendChild(toast);

  // Trigger the slide-in transition on next frame
  requestAnimationFrame(() => {
    requestAnimationFrame(() => toast.classList.add('toast--visible'));
  });

  if (duration > 0) {
    setTimeout(dismiss, duration);
  }
}

/* ─────────────────────────────────────────────
   2. Debounce
   ───────────────────────────────────────────── */

/**
 * Returns a debounced version of `fn` that only fires after `delay` ms of
 * inactivity.
 * @param {Function} fn
 * @param {number} delay  Milliseconds.
 * @returns {Function}
 */
export function debounce(fn, delay) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

/* ─────────────────────────────────────────────
   3. Sanitize
   ───────────────────────────────────────────── */

/**
 * Escapes HTML entities in a string to prevent XSS when injecting into the DOM.
 * @param {string} str
 * @returns {string}
 */
export function sanitize(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g,  '&amp;')
    .replace(/</g,  '&lt;')
    .replace(/>/g,  '&gt;')
    .replace(/"/g,  '&quot;')
    .replace(/'/g,  '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/* ─────────────────────────────────────────────
   4. Date Formatting
   ───────────────────────────────────────────── */

const DATE_MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

/**
 * Formats an ISO date string to "Month DD, YYYY".
 * @param {string} dateStr
 * @returns {string}
 */
export function formatDate(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return '';
  const month = DATE_MONTH_NAMES[date.getMonth()];
  const day   = String(date.getDate()).padStart(2, '0');
  const year  = date.getFullYear();
  return `${month} ${day}, ${year}`;
}

/**
 * Returns a human-friendly relative date string (e.g. "2 hours ago").
 * @param {string} dateStr  ISO date string.
 * @returns {string}
 */
export function formatRelativeDate(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return '';
  const now   = Date.now();
  const diffMs = now - date.getTime();

  const seconds = Math.floor(diffMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours   = Math.floor(minutes / 60);
  const days    = Math.floor(hours   / 24);
  const weeks   = Math.floor(days    / 7);
  const months  = Math.floor(days    / 30);
  const years   = Math.floor(days    / 365);

  if (seconds < 60)   return 'just now';
  if (minutes < 60)   return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
  if (hours   < 24)   return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
  if (days    < 7)    return `${days} day${days !== 1 ? 's' : ''} ago`;
  if (weeks   < 5)    return `${weeks} week${weeks !== 1 ? 's' : ''} ago`;
  if (months  < 12)   return `${months} month${months !== 1 ? 's' : ''} ago`;
  return `${years} year${years !== 1 ? 's' : ''} ago`;
}

/* ─────────────────────────────────────────────
   5. Slug Generation
   ───────────────────────────────────────────── */

/**
 * Converts a string to a URL-friendly slug.
 * @param {string} str
 * @returns {string}
 */
export function generateSlug(str) {
  if (typeof str !== 'string') return '';
  return str
    .toLowerCase()
    .normalize('NFD')                        // decompose accented chars
    .replace(/[\u0300-\u036f]/g, '')         // strip diacritics
    .replace(/[^a-z0-9\s-]/g, '')           // remove non-alphanumeric
    .trim()
    .replace(/[\s_]+/g, '-')                 // spaces/underscores → hyphens
    .replace(/-+/g, '-')                     // collapse consecutive hyphens
    .replace(/^-+|-+$/g, '');               // trim leading/trailing hyphens
}

/* ─────────────────────────────────────────────
   6. Clipboard
   ───────────────────────────────────────────── */

/**
 * Copies `text` to the system clipboard.
 * @param {string} text
 * @returns {Promise<boolean>} Resolves to true on success, false on failure.
 */
export async function copyToClipboard(text) {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    // Fallback for HTTP or older browsers
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.cssText = 'position:fixed;top:-9999px;left:-9999px;opacity:0;';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    const success = document.execCommand('copy');
    textarea.remove();
    return success;
  } catch {
    return false;
  }
}

/* ─────────────────────────────────────────────
   7. Validation
   ───────────────────────────────────────────── */

/**
 * Validates an email address.
 * @param {string} email
 * @returns {boolean}
 */
export function validateEmail(email) {
  if (typeof email !== 'string') return false;
  // RFC-5322-ish regex kept practical
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  return re.test(email.trim());
}

/**
 * Validates a password against PortfolioHub rules:
 * — At least 8 characters
 * — Contains at least one letter
 * — Contains at least one number
 * @param {string} password
 * @returns {{ valid: boolean, message: string }}
 */
export function validatePassword(password) {
  if (typeof password !== 'string' || password.length === 0) {
    return { valid: false, message: 'Password is required.' };
  }
  if (password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters long.' };
  }
  if (!/[a-zA-Z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one letter.' };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one number.' };
  }
  return { valid: true, message: 'Password is valid.' };
}

/* ─────────────────────────────────────────────
   8. Loading State (Buttons)
   ───────────────────────────────────────────── */

/**
 * Puts a button into a loading state (disables it, replaces text with spinner).
 * @param {HTMLElement} element  Typically a <button>.
 */
export function showLoading(element) {
  if (!element) return;
  element.dataset.originalText = element.innerHTML;
  element.disabled = true;
  element.innerHTML = `
    <span style="display:inline-flex;align-items:center;gap:8px;">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
           style="animation:ph-spin 0.75s linear infinite" aria-hidden="true">
        <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" opacity="0.25"/>
        <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" stroke-width="3"
              stroke-linecap="round"/>
      </svg>
      Loading…
    </span>`;
  // Inject the spin keyframe once
  if (!document.getElementById('ph-spin-style')) {
    const s = document.createElement('style');
    s.id = 'ph-spin-style';
    s.textContent = '@keyframes ph-spin { to { transform: rotate(360deg); } }';
    document.head.appendChild(s);
  }
}

/**
 * Restores a button from its loading state.
 * @param {HTMLElement} element
 */
export function hideLoading(element) {
  if (!element) return;
  element.disabled = false;
  if (element.dataset.originalText !== undefined) {
    element.innerHTML = element.dataset.originalText;
    delete element.dataset.originalText;
  }
}

/* ─────────────────────────────────────────────
   9. Modal
   ───────────────────────────────────────────── */

/**
 * Injects modal base styles once.
 */
function ensureModalStyles() {
  if (document.getElementById('ph-modal-styles')) return;
  const s = document.createElement('style');
  s.id = 'ph-modal-styles';
  s.textContent = `
    .ph-modal-backdrop {
      position: fixed; inset: 0; z-index: 10000;
      background: rgba(15,23,42,0.55);
      display: flex; align-items: center; justify-content: center;
      padding: 16px;
      opacity: 0; transition: opacity 0.2s ease;
    }
    .ph-modal-backdrop.ph-modal--visible { opacity: 1; }
    .ph-modal {
      background: #ffffff; border-radius: 12px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.25);
      width: 100%; max-width: 480px; max-height: 90vh;
      overflow-y: auto;
      transform: translateY(16px); transition: transform 0.2s ease;
    }
    .ph-modal-backdrop.ph-modal--visible .ph-modal { transform: translateY(0); }
    .ph-modal__header {
      display: flex; align-items: center; justify-content: space-between;
      padding: 20px 24px 0;
    }
    .ph-modal__title {
      font-size: 1.125rem; font-weight: 700; color: #0F172A; margin: 0;
    }
    .ph-modal__close {
      background: none; border: none; font-size: 1.25rem; cursor: pointer;
      color: #64748B; line-height: 1; padding: 4px;
    }
    .ph-modal__close:hover { color: #0F172A; }
    .ph-modal__body { padding: 16px 24px; color: #0F172A; font-size: 0.9375rem; line-height: 1.6; }
    .ph-modal__footer {
      display: flex; gap: 10px; justify-content: flex-end;
      padding: 0 24px 20px;
    }
    .ph-modal__footer .ph-btn {
      padding: 9px 18px; border-radius: 8px; font-size: 0.875rem;
      font-weight: 600; cursor: pointer; border: none; transition: opacity 0.15s;
    }
    .ph-modal__footer .ph-btn:hover { opacity: 0.85; }
    .ph-modal__footer .ph-btn--primary   { background: #2563EB; color: #fff; }
    .ph-modal__footer .ph-btn--secondary {
      background: #F1F5F9; color: #0F172A; border: 1px solid #E2E8F0;
    }
    .ph-modal__footer .ph-btn--danger    { background: #dc2626; color: #fff; }
  `;
  document.head.appendChild(s);
}

/**
 * Creates a modal dialog and appends it to the document body.
 *
 * @param {string} title   Modal heading.
 * @param {string|HTMLElement} content  Body content — HTML string or DOM node.
 * @param {Array<{label: string, type: 'primary'|'secondary'|'danger', onClick: Function}>} [actions=[]]
 * @returns {{ modal: HTMLElement, close: Function }}
 */
export function createModal(title, content, actions = []) {
  ensureModalStyles();

  const backdrop = document.createElement('div');
  backdrop.className = 'ph-modal-backdrop';
  backdrop.setAttribute('role', 'dialog');
  backdrop.setAttribute('aria-modal', 'true');
  backdrop.setAttribute('aria-labelledby', 'ph-modal-title');

  const modal = document.createElement('div');
  modal.className = 'ph-modal';

  // Header
  const header = document.createElement('div');
  header.className = 'ph-modal__header';
  const titleEl = document.createElement('h2');
  titleEl.id = 'ph-modal-title';
  titleEl.className = 'ph-modal__title';
  titleEl.textContent = title;
  const closeBtn = document.createElement('button');
  closeBtn.className = 'ph-modal__close';
  closeBtn.innerHTML = '&times;';
  closeBtn.setAttribute('aria-label', 'Close modal');
  header.appendChild(titleEl);
  header.appendChild(closeBtn);

  // Body
  const body = document.createElement('div');
  body.className = 'ph-modal__body';
  if (content instanceof HTMLElement) {
    body.appendChild(content);
  } else {
    body.innerHTML = content;
  }

  // Footer
  const footer = document.createElement('div');
  footer.className = 'ph-modal__footer';
  actions.forEach(({ label, type = 'secondary', onClick }) => {
    const btn = document.createElement('button');
    btn.className = `ph-btn ph-btn--${type}`;
    btn.textContent = label;
    btn.addEventListener('click', () => {
      if (typeof onClick === 'function') onClick();
    });
    footer.appendChild(btn);
  });

  modal.appendChild(header);
  modal.appendChild(body);
  if (actions.length) modal.appendChild(footer);
  backdrop.appendChild(modal);
  document.body.appendChild(backdrop);

  // Animate in
  requestAnimationFrame(() => {
    requestAnimationFrame(() => backdrop.classList.add('ph-modal--visible'));
  });

  const close = () => {
    backdrop.classList.remove('ph-modal--visible');
    backdrop.addEventListener('transitionend', () => backdrop.remove(), { once: true });
  };

  closeBtn.addEventListener('click', close);
  backdrop.addEventListener('click', (e) => { if (e.target === backdrop) close(); });
  document.addEventListener('keydown', function onKey(e) {
    if (e.key === 'Escape') { close(); document.removeEventListener('keydown', onKey); }
  });

  return { modal: backdrop, close };
}

/* ─────────────────────────────────────────────
   10. Text Utilities
   ───────────────────────────────────────────── */

/**
 * Truncates a string to `maxLength` characters, appending "…" if truncated.
 * @param {string} str
 * @param {number} maxLength
 * @returns {string}
 */
export function truncateText(str, maxLength) {
  if (typeof str !== 'string') return '';
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength).trimEnd() + '…';
}

/**
 * Returns up to two initials from a full name string.
 * @param {string} name
 * @returns {string}  e.g. "John Doe" → "JD", "Alice" → "A"
 */
export function getInitials(name) {
  if (typeof name !== 'string' || !name.trim()) return '?';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/* ─────────────────────────────────────────────
   11. Currency Formatting
   ───────────────────────────────────────────── */

/**
 * Formats a numeric price as a localised currency string.
 * @param {number} price
 * @param {string} [currency='USD']
 * @returns {string}
 */
export function formatPrice(price, currency = 'USD') {
  if (typeof price !== 'number' || isNaN(price)) return '';
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(price);
  } catch {
    return `${currency} ${price.toFixed(2)}`;
  }
}

/* ─────────────────────────────────────────────
   12. URL Validation
   ───────────────────────────────────────────── */

/**
 * Checks whether `url` is a well-formed HTTP or HTTPS URL.
 * @param {string} url
 * @returns {boolean}
 */
export function isValidUrl(url) {
  if (typeof url !== 'string' || !url.trim()) return false;
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}
