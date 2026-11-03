/**
 * Runtime for rendered portfolio documents (classic script, loaded inside the
 * sandboxed preview/public iframe). Handles theme toggle, mobile nav, scroll
 * reveal and the contact form. No inline handlers are used anywhere.
 */
(function () {
  'use strict';
  var root = document.body;
  var THEME_KEY = 'ph-tpl-theme';

  function readTheme() {
    try { return window.localStorage.getItem(THEME_KEY); } catch (e) { return null; }
  }
  function writeTheme(v) {
    try { window.localStorage.setItem(THEME_KEY, v); } catch (e) { /* storage unavailable in sandbox */ }
  }

  var themeBtn = document.getElementById('themeBtn');
  if (themeBtn) {
    var initial = readTheme() || root.getAttribute('data-theme') || 'light';
    root.setAttribute('data-theme', initial);
    themeBtn.setAttribute('aria-pressed', String(initial === 'dark'));
    themeBtn.addEventListener('click', function () {
      var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      themeBtn.setAttribute('aria-pressed', String(next === 'dark'));
      writeTheme(next);
    });
  }
  // Keep portfolio section links inside the rendered document.
document.addEventListener('click', function (e) {
  var link = e.target.closest('a[href^="#"]');
  if (!link) return;

  var hash = link.getAttribute('href');
  if (!hash || hash === '#') return;

  var target;

  try {
    target = document.getElementById(
      decodeURIComponent(hash.slice(1))
    );
  } catch (err) {
    return;
  }

  if (!target) return;

  e.preventDefault();

  target.scrollIntoView({
    behavior: 'smooth',
    block: 'start'
  });

  if (mobileNav && mobileNav.classList.contains('open')) {
    setNav(false);
  }
});

  var burger = document.getElementById('hamburgerBtn');
  var mobileNav = document.getElementById('mobileNav');
  function setNav(open) {
    if (!burger || !mobileNav) return;
    burger.classList.toggle('open', open);
    mobileNav.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', String(open));
  }
  if (burger && mobileNav) {
    burger.addEventListener('click', function () { setNav(!mobileNav.classList.contains('open')); });
    mobileNav.addEventListener('click', function (e) {
      if (e.target && e.target.tagName === 'A') setNav(false);
    });
  }

  // Preview mode: reveal everything immediately, restore scroll, report scroll to the builder.
  var isPreview = root.getAttribute('data-preview') === '1';
  if (isPreview) {
    var y = parseInt(root.getAttribute('data-scroll') || '0', 10);
    if (y > 0) window.scrollTo(0, y);
    var ticking = false;
    window.addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(function () {
        ticking = false;
        try { window.parent.postMessage({ source: 'ph-preview', type: 'scroll', y: window.scrollY }, '*'); } catch (e) { /* ignore */ }
      });
    }, { passive: true });
  }

  var fades = document.querySelectorAll('.fade-in');
  if (isPreview) {
    fades.forEach(function (el) { el.classList.add('visible'); el.style.transition = 'none'; });
    fades = [];
  }
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('visible'); io.unobserve(en.target); }
      });
    }, { threshold: 0.1 });
    fades.forEach(function (el) { io.observe(el); });
  } else {
    fades.forEach(function (el) { el.classList.add('visible'); });
  }


var form = document.getElementById('contactForm');

if (form) {
  var msgBox = document.getElementById('formMsg');

  var show = function (ok, text) {
    if (!msgBox) return;

    msgBox.hidden = false;
    msgBox.className = 'form-msg ' + (ok ? 'ok' : 'err');
    msgBox.textContent = text;
  };

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    var name = form.elements.name.value.trim();
    var email = form.elements.email.value.trim();
    var subject = form.elements.subject.value.trim();
    var message = form.elements.message.value.trim();

    var to = (
      form.getAttribute('data-email') ||
      ''
    ).trim();

    var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!name || !email || !message) {
      show(false, 'Please fill in your name, email and message.');
      return;
    }

    if (!emailPattern.test(email)) {
      show(false, 'Please enter a valid email address.');
      return;
    }

    if (!emailPattern.test(to)) {
      show(false, 'The portfolio owner has not configured a valid email address.');
      return;
    }

    var emailSubject =
      'Portfolio Contact: ' + name +
      (subject ? ' - ' + subject : '');

    var body = [
      'Name: ' + name,
      'Visitor email: ' + email,
      '',
      'Message:',
      message
    ].join('\n');

    var gmailUrl =
        'https://mail.google.com/mail/?view=cm&fs=1' +
        '&to=' + encodeURIComponent(to) +
        '&su=' + encodeURIComponent(emailSubject) +
        '&body=' + encodeURIComponent(body);

    // Open Gmail directly instead of relying on the default mail application.
    var gmailWindow = window.open(
      gmailUrl,
      '_blank',
      'noopener,noreferrer'
    );


    if (gmailWindow) {
      show(
        true,
        'Gmail compose opened with your message. Please review it and click Send in Gmail.'
      );
    } else {
      show(
        false,
        'Your browser blocked the Gmail window. Allow pop-ups for this site and try again.'
      );
    }
  });
}
})();
