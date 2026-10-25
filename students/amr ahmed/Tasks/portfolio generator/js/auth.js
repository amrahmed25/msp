/**
 * js/auth.js
 * PortfolioHub — Complete Authentication Module
 * ES6 Module — depends on supabase-client.js and utils.js
 */

import supabase from './supabase-client.js';
import { showToast, validateEmail, validatePassword } from './utils.js';

// ─────────────────────────────────────────────
//  HELPERS
// ─────────────────────────────────────────────

/**
 * Convert raw Supabase / network error messages into human-friendly text.
 * @param {Error|Object|string} err
 * @returns {string}
 */
function friendlyError(err) {
  const raw =
    (typeof err === 'string' ? err : err?.message || err?.error_description || '')
      .toLowerCase();

  if (raw.includes('invalid login credentials') || raw.includes('invalid email or password')) {
    return 'Invalid email or password. Please try again.';
  }
  if (raw.includes('email not confirmed')) {
    return 'Please confirm your email address before signing in.';
  }
  if (raw.includes('user already registered') || raw.includes('already exists')) {
    return 'An account with this email already exists. Try signing in instead.';
  }
  if (raw.includes('password should be at least')) {
    return 'Password must be at least 8 characters long.';
  }
  if (raw.includes('rate limit') || raw.includes('too many requests')) {
    return 'Too many attempts. Please wait a few minutes and try again.';
  }
  if (raw.includes('network') || raw.includes('fetch')) {
    return 'Network error. Please check your connection and try again.';
  }
  if (raw.includes('token') || raw.includes('expired')) {
    return 'This link has expired. Please request a new one.';
  }
  if (raw.includes('weak password') || raw.includes('should contain')) {
    return 'Your password is too weak. Please choose a stronger one.';
  }
  if (raw.includes('unable to validate email')) {
    return 'Please enter a valid email address.';
  }
  if (raw === '') {
    return 'Something went wrong. Please try again.';
  }
  // Capitalise and return as-is when nothing matched
  return raw.charAt(0).toUpperCase() + raw.slice(1);
}

/**
 * Show the error banner inside an auth card.
 * @param {string} wrapperId - id of the error div
 * @param {string} msgId     - id of the span that holds the text
 * @param {string} message   - message to display
 */
function showAuthError(wrapperId, msgId, message) {
  const wrapper = document.getElementById(wrapperId);
  const span = document.getElementById(msgId);
  if (!wrapper || !span) return;
  span.textContent = message;
  wrapper.hidden = false;
  wrapper.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function hideAuthError(wrapperId) {
  const wrapper = document.getElementById(wrapperId);
  if (wrapper) wrapper.hidden = true;
}

/**
 * Toggle button between normal and loading states.
 * @param {HTMLButtonElement} btn
 * @param {boolean} loading
 */
function setButtonLoading(btn, loading) {
  if (!btn) return;
  const text = btn.querySelector('.btn-text');
  const spinner = btn.querySelector('.btn-spinner');
  btn.disabled = loading;
  if (text) text.hidden = loading;
  if (spinner) spinner.hidden = !loading;
}

/**
 * Show/hide inline field error.
 * @param {string} id - element id of the error span
 * @param {string} message - empty string clears the error
 */
function setFieldError(id, message) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = message;
  // Find the input-wrap sibling and mark it
  const group = el.closest('.form-group');
  if (group) {
    const input = group.querySelector('.form-input');
    if (input) {
      input.classList.toggle('input-error', !!message);
    }
  }
}

/**
 * Attach show/hide toggle to a password input.
 * @param {string} toggleId  - id of the toggle button
 * @param {string} inputId   - id of the password input
 */
function attachPasswordToggle(toggleId, inputId) {
  const btn = document.getElementById(toggleId);
  const input = document.getElementById(inputId);
  if (!btn || !input) return;

  btn.addEventListener('click', () => {
    const isPassword = input.type === 'password';
    input.type = isPassword ? 'text' : 'password';
    const showEye = btn.querySelector('.show-eye');
    const hideEye = btn.querySelector('.hide-eye');
    if (showEye) showEye.style.display = isPassword ? 'none' : '';
    if (hideEye) hideEye.style.display = isPassword ? '' : 'none';
    btn.setAttribute('aria-label', isPassword ? 'Hide password' : 'Show password');
  });
}

/**
 * Calculate password strength score (0-4).
 * @param {string} password
 * @returns {{ score: number, label: string }}
 */
function calcPasswordStrength(password) {
  if (!password) return { score: 0, label: '' };
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  // Clamp to 4
  score = Math.min(score, 4);

  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
  const label = labels[score] || '';
  return { score, label };
}

/**
 * Update the 4-bar strength meter UI.
 * @param {number} score        - 0 to 4
 * @param {string} label        - strength text
 * @param {string} barPrefix    - e.g. 'bar' for #bar-1 … #bar-4
 * @param {string} labelId      - id of the strength-label span
 */
function renderStrengthMeter(score, label, barPrefix, labelId) {
  const colors = ['', '#EF4444', '#F59E0B', '#3B82F6', '#22C55E'];
  const color = colors[score] || '';
  for (let i = 1; i <= 4; i++) {
    const bar = document.getElementById(`${barPrefix}-${i}`);
    if (!bar) continue;
    bar.style.backgroundColor = i <= score ? color : '';
    bar.classList.toggle('filled', i <= score);
  }
  const labelEl = document.getElementById(labelId);
  if (labelEl) {
    labelEl.textContent = label;
    labelEl.style.color = color;
  }
}

// ─────────────────────────────────────────────
//  CORE AUTH FUNCTIONS
// ─────────────────────────────────────────────

/**
 * Sign up a new user and create their profile row.
 * @param {string} email
 * @param {string} password
 * @param {string} fullName
 * @param {string} [role]
 * @returns {Promise<{ data: Object|null, error: Object|null }>}
 */
async function signUp(email, password, fullName, role) {
  const { data, error } = await supabase.auth.signUp({
    email: email.trim().toLowerCase(),
    password,
    options: {
      data: {
        full_name: fullName.trim(),
        role: role || null,
      },
    },
  });

  if (error) return { data: null, error };

  // Insert into profiles table (best-effort — may already exist via trigger)
  if (data?.user) {
    await supabase.from('profiles').upsert(
      {
        id: data.user.id,
        full_name: fullName.trim(),
        role: role || null,
        email: email.trim().toLowerCase(),
        created_at: new Date().toISOString(),
      },
      { onConflict: 'id' }
    );
  }

  return { data, error: null };
}

/**
 * Sign in an existing user with email + password.
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{ data: Object|null, error: Object|null }>}
 */
async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim().toLowerCase(),
    password,
  });
  return { data: data ?? null, error: error ?? null };
}

/**
 * Sign out the current user and redirect to index.html.
 * @returns {Promise<void>}
 */
async function signOut() {
  await supabase.auth.signOut();
  window.location.href = 'index.html';
}

/**
 * Send a password reset email.
 * @param {string} email
 * @returns {Promise<{ data: Object|null, error: Object|null }>}
 */
async function requestPasswordReset(email) {
  const redirectTo = `${window.location.origin}${window.location.pathname.replace(/[^/]*$/, '')}reset-password.html`;
  const { data, error } = await supabase.auth.resetPasswordForEmail(
    email.trim().toLowerCase(),
    { redirectTo }
  );
  return { data: data ?? null, error: error ?? null };
}

/**
 * Update the authenticated user's password (called after Supabase magic link lands).
 * @param {string} newPassword
 * @returns {Promise<{ data: Object|null, error: Object|null }>}
 */
async function updatePassword(newPassword) {
  const { data, error } = await supabase.auth.updateUser({ password: newPassword });
  return { data: data ?? null, error: error ?? null };
}

/**
 * Get the current Supabase session.
 * @returns {Promise<{ session: Object|null, error: Object|null }>}
 */
async function getSession() {
  const { data, error } = await supabase.auth.getSession();
  return { session: data?.session ?? null, error: error ?? null };
}

/**
 * Guard: call on protected pages to ensure user is logged in.
 * Redirects to login.html?next=<current-page> if no valid session.
 * @returns {Promise<Object|null>} The session object, or null (redirect happens).
 */
async function requireAuth() {
  const { session } = await getSession();
  if (!session) {
    const next = encodeURIComponent(window.location.pathname + window.location.search);
    window.location.href = `login.html?next=${next}`;
    return null;
  }
  return session;
}

// ─────────────────────────────────────────────
//  PAGE INIT: LOGIN
// ─────────────────────────────────────────────

/**
 * Initialise the login page: attach handlers, check existing session.
 */
async function initLoginPage() {
  // Redirect if already logged in
  const { session } = await getSession();
  if (session) {
    window.location.href = 'dashboard.html';
    return;
  }

  attachPasswordToggle('toggle-password', 'password');

  const form = document.getElementById('login-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const emailVal = (document.getElementById('email')?.value || '').trim();
    const passwordVal = document.getElementById('password')?.value || '';

    // Client-side validation
    let valid = true;

    if (!emailVal) {
      setFieldError('email-error', 'Email address is required.');
      valid = false;
    } else if (!validateEmail(emailVal)) {
      setFieldError('email-error', 'Please enter a valid email address.');
      valid = false;
    } else {
      setFieldError('email-error', '');
    }

    if (!passwordVal) {
      setFieldError('password-error', 'Password is required.');
      valid = false;
    } else {
      setFieldError('password-error', '');
    }

    if (!valid) return;

    hideAuthError('auth-error');
    const btn = document.getElementById('login-btn');
    setButtonLoading(btn, true);

    const { data, error } = await signIn(emailVal, passwordVal);

    setButtonLoading(btn, false);

    if (error) {
      showAuthError('auth-error', 'auth-error-msg', friendlyError(error));
      return;
    }

    if (!data?.session) {
      showAuthError('auth-error', 'auth-error-msg', 'Sign-in failed. Please try again.');
      return;
    }

    // Honour ?next= (or ?returnTo=) but only for same-site paths, never external URLs.
    window.location.href = safeRedirectPath(new URLSearchParams(window.location.search)) || 'dashboard.html';
  });
}


/**
 * Returns a same-site path from ?next= or ?returnTo=, or '' if none is safe.
 * Rejects protocol-relative ("//evil.com") and backslash tricks ("/\\evil.com").
 */
function safeRedirectPath(params) {
  const raw = params.get('next') || params.get('returnTo') || '';
  if (!raw.startsWith('/') || raw.startsWith('//') || raw.startsWith('/\\')) return '';
  if (/[\r\n]/.test(raw)) return '';
  return raw;
}

// ─────────────────────────────────────────────
//  PAGE INIT: SIGN UP
// ─────────────────────────────────────────────

/**
 * Initialise the sign-up page: password strength meter, validation, submit.
 */
async function initSignupPage() {
  // Redirect if already logged in
  const { session } = await getSession();
  if (session) {
    window.location.href = 'dashboard.html';
    return;
  }

  attachPasswordToggle('toggle-password', 'password');
  attachPasswordToggle('toggle-confirm-password', 'confirm-password');

  // Real-time password strength meter
  const passwordInput = document.getElementById('password');
  if (passwordInput) {
    passwordInput.addEventListener('input', () => {
      const val = passwordInput.value;
      const { score, label } = calcPasswordStrength(val);
      renderStrengthMeter(score, label, 'bar', 'strength-label');
      // Clear error when user starts typing
      if (val) setFieldError('password-error', '');
    });
  }

  // Real-time confirm password match
  const confirmInput = document.getElementById('confirm-password');
  if (confirmInput) {
    confirmInput.addEventListener('input', () => {
      if (passwordInput && confirmInput.value && confirmInput.value !== passwordInput.value) {
        setFieldError('confirm-error', 'Passwords do not match.');
      } else {
        setFieldError('confirm-error', '');
      }
    });
  }

  const form = document.getElementById('signup-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const nameVal     = (document.getElementById('full-name')?.value || '').trim();
    const emailVal    = (document.getElementById('email')?.value || '').trim();
    const roleVal     = document.getElementById('role')?.value || '';
    const passwordVal = document.getElementById('password')?.value || '';
    const confirmVal  = document.getElementById('confirm-password')?.value || '';

    let valid = true;

    // Name
    if (!nameVal) {
      setFieldError('name-error', 'Full name is required.');
      valid = false;
    } else if (nameVal.length < 2) {
      setFieldError('name-error', 'Please enter your full name.');
      valid = false;
    } else {
      setFieldError('name-error', '');
    }

    // Email
    if (!emailVal) {
      setFieldError('email-error', 'Email address is required.');
      valid = false;
    } else if (!validateEmail(emailVal)) {
      setFieldError('email-error', 'Please enter a valid email address.');
      valid = false;
    } else {
      setFieldError('email-error', '');
    }

    // Password
    const pwValidation = validatePassword(passwordVal);
    if (!passwordVal) {
      setFieldError('password-error', 'Password is required.');
      valid = false;
    } else if (!pwValidation.valid) {
      setFieldError('password-error', pwValidation.message || 'Password must be at least 8 characters.');
      valid = false;
    } else {
      setFieldError('password-error', '');
    }

    // Confirm password
    if (!confirmVal) {
      setFieldError('confirm-error', 'Please confirm your password.');
      valid = false;
    } else if (confirmVal !== passwordVal) {
      setFieldError('confirm-error', 'Passwords do not match.');
      valid = false;
    } else {
      setFieldError('confirm-error', '');
    }

    // Terms

    if (!valid) return;

    hideAuthError('auth-error');
    const btn = document.getElementById('signup-btn');
    setButtonLoading(btn, true);

    const { data, error } = await signUp(emailVal, passwordVal, nameVal, roleVal);

    setButtonLoading(btn, false);

    if (error) {
      showAuthError('auth-error', 'auth-error-msg', friendlyError(error));
      return;
    }

    // Supabase may require email confirmation — check session
    const { session: newSession } = await getSession();
    if (newSession) {
      // Auto-confirmed or confirmations disabled — go to dashboard
      window.location.href = 'dashboard.html?welcome=1';
    } else {
      // Email confirmation required
      showToast(
        'Almost there! Check your email to confirm your account, then sign in.',
        'success',
        6000
      );
      setTimeout(() => {
        window.location.href = 'login.html';
      }, 3000);
    }
  });
}

// ─────────────────────────────────────────────
//  PAGE INIT: RESET PASSWORD
// ─────────────────────────────────────────────

/**
 * Initialise the reset-password page.
 * Detects Supabase access_token in URL hash/query to show the correct form state.
 */
async function initResetPage() {
  // ── Detect token from URL ──
  // Supabase appends #access_token=... or ?access_token=...
  const hashParams  = new URLSearchParams(window.location.hash.replace(/^#/, ''));
  const queryParams = new URLSearchParams(window.location.search);

  const accessToken =
    hashParams.get('access_token') ||
    queryParams.get('access_token') ||
    null;

  const tokenType =
    hashParams.get('type') ||
    queryParams.get('type') ||
    '';

  if (accessToken) {
    // Set the session so updateUser works
    const { error: sessionError } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: hashParams.get('refresh_token') || queryParams.get('refresh_token') || '',
    });

    if (sessionError) {
      // Show request form with error
      switchResetState('state-request');
      showAuthError('request-error', 'request-error-msg', friendlyError(sessionError));
    } else {
      switchResetState('state-new-password');
      initNewPasswordForm();
    }
    return;
  }

  // ── No token — default to request state ──
  switchResetState('state-request');
  initRequestForm();
}

/**
 * Show one state div, hide the others.
 * @param {'state-request'|'state-success'|'state-new-password'} stateId
 */
function switchResetState(stateId) {
  ['state-request', 'state-success', 'state-new-password'].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.hidden = id !== stateId;
  });
}

/** Wire up the "Send Reset Link" form. */
function initRequestForm() {
  const form = document.getElementById('request-form');
  if (!form) return;

  let lastEmail = '';

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const emailVal = (document.getElementById('reset-email')?.value || '').trim();

    if (!emailVal) {
      setFieldError('reset-email-error', 'Email address is required.');
      return;
    }
    if (!validateEmail(emailVal)) {
      setFieldError('reset-email-error', 'Please enter a valid email address.');
      return;
    }
    setFieldError('reset-email-error', '');
    hideAuthError('request-error');

    const btn = document.getElementById('request-btn');
    setButtonLoading(btn, true);

    const { error } = await requestPasswordReset(emailVal);

    setButtonLoading(btn, false);

    if (error) {
      showAuthError('request-error', 'request-error-msg', friendlyError(error));
      return;
    }

    lastEmail = emailVal;
    const successEmailEl = document.getElementById('success-email');
    if (successEmailEl) successEmailEl.textContent = emailVal;
    switchResetState('state-success');

    // Resend button
    const resendBtn = document.getElementById('resend-btn');
    if (resendBtn) {
      resendBtn.addEventListener('click', async () => {
        resendBtn.disabled = true;
        resendBtn.textContent = 'Sending…';
        await requestPasswordReset(lastEmail);
        resendBtn.textContent = 'Email sent!';
        setTimeout(() => {
          resendBtn.disabled = false;
          resendBtn.textContent = 'Resend Email';
        }, 30000);
      });
    }
  });
}

/** Wire up the "Set New Password" form (shown when token is in URL). */
function initNewPasswordForm() {
  attachPasswordToggle('toggle-new-password', 'new-password');

  const newPwInput = document.getElementById('new-password');
  if (newPwInput) {
    newPwInput.addEventListener('input', () => {
      const { score, label } = calcPasswordStrength(newPwInput.value);
      renderStrengthMeter(score, label, 'newpw-bar', 'newpw-strength-label');
      if (newPwInput.value) setFieldError('newpw-password-error', '');
    });
  }

  const form = document.getElementById('newpw-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const newPw  = document.getElementById('new-password')?.value || '';
    const confPw = document.getElementById('confirm-new-password')?.value || '';

    let valid = true;

    const pwValidation = validatePassword(newPw);
    if (!newPw) {
      setFieldError('newpw-password-error', 'Password is required.');
      valid = false;
    } else if (!pwValidation.valid) {
      setFieldError('newpw-password-error', pwValidation.message || 'Password must be at least 8 characters.');
      valid = false;
    } else {
      setFieldError('newpw-password-error', '');
    }

    if (!confPw) {
      setFieldError('newpw-confirm-error', 'Please confirm your new password.');
      valid = false;
    } else if (confPw !== newPw) {
      setFieldError('newpw-confirm-error', 'Passwords do not match.');
      valid = false;
    } else {
      setFieldError('newpw-confirm-error', '');
    }

    if (!valid) return;

    hideAuthError('newpw-error');
    const btn = document.getElementById('newpw-btn');
    setButtonLoading(btn, true);

    const { error } = await updatePassword(newPw);

    setButtonLoading(btn, false);

    if (error) {
      showAuthError('newpw-error', 'newpw-error-msg', friendlyError(error));
      return;
    }

    showToast('Password updated! Signing you in…', 'success', 3000);
    setTimeout(() => {
      window.location.href = 'dashboard.html';
    }, 2000);
  });
}

// ─────────────────────────────────────────────
//  EXPORTS
// ─────────────────────────────────────────────

export {
  signUp,
  signIn,
  signOut,
  requestPasswordReset,
  updatePassword,
  getSession,
  requireAuth,
  initLoginPage,
  initSignupPage,
  initResetPage,
  friendlyError,
};
