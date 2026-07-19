/* GAP — main.js
   Theme toggle, mobile nav, IP copy, live server status, reveal animations
*/
(function () {
  'use strict';

  var root = document.documentElement;

  /* ---------- Theme ---------- */
  var themeToggle = document.querySelector('[data-theme-toggle]');
  var theme = 'dark'; // dark fantasy is the intended aesthetic
  root.setAttribute('data-theme', theme);
  renderThemeIcon();

  function renderThemeIcon() {
    if (!themeToggle) return;
    themeToggle.innerHTML = theme === 'dark'
      ? '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>'
      : '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
    themeToggle.setAttribute('aria-label', theme === 'dark' ? 'Включить светлую тему' : 'Включить тёмную тему');
  }

  if (themeToggle) {
    themeToggle.addEventListener('click', function () {
      theme = theme === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', theme);
      renderThemeIcon();
    });
  }

  /* ---------- Mobile nav ---------- */
  var navToggle = document.getElementById('navToggle');
  var nav = document.getElementById('nav');
  if (navToggle && nav) {
    navToggle.addEventListener('click', function () {
      var open = nav.getAttribute('data-open') === 'true';
      nav.setAttribute('data-open', open ? 'false' : 'true');
      navToggle.setAttribute('aria-expanded', open ? 'false' : 'true');
    });
    nav.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        nav.setAttribute('data-open', 'false');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ---------- Copy IP ---------- */
  var copyBtn = document.getElementById('copyIp');
  var ipValue = document.getElementById('ipValue');
  var toast = document.getElementById('copyToast');
  if (copyBtn && ipValue) {
    copyBtn.addEventListener('click', function () {
      var ip = ipValue.textContent.trim();
      var done = function () { showToast(); };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(ip).then(done).catch(fallback);
      } else { fallback(); }
      function fallback() {
        var t = document.createElement('textarea');
        t.value = ip; document.body.appendChild(t); t.select();
        try { document.execCommand('copy'); } catch (e) {}
        document.body.removeChild(t);
        showToast();
      }
    });
  }
  function showToast() {
    if (!toast) return;
    toast.classList.add('is-show');
    setTimeout(function () { toast.classList.remove('is-show'); }, 1800);
  }

  /* ---------- Live server status ---------- */
  var statusDot = document.getElementById('statusDot');
  var statusText = document.getElementById('statusText');
  var statusPlayers = document.getElementById('statusPlayers');
  if (statusDot && statusText) {
    fetch('https://api.mcsrvstat.us/3/play.gap-3.ru')
      .then(function (r) { return r.ok ? r.json() : Promise.reject(); })
      .then(function (data) {
        if (data && data.online) {
          statusDot.classList.add('is-online');
          statusText.textContent = 'Сервер онлайн';
          var players = data.players && typeof data.players.online === 'number';
          if (players) {
            var on = data.players.online;
            var max = typeof data.players.max === 'number' ? data.players.max : null;
            statusPlayers.textContent = max !== null ? (on + ' / ' + max + ' игроков') : (on + ' игроков');
          }
        } else {
          statusDot.classList.add('is-offline');
          statusText.textContent = 'Сервер offline';
        }
      })
      .catch(function () {
        statusDot.classList.add('is-offline');
        statusText.textContent = 'Статус недоступен';
      });
  }

  /* ---------- Year ---------- */
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Reveal on scroll ---------- */
  var reveals = document.querySelectorAll('.reveal');
  if (reveals.length && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('is-visible'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12 });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('is-visible'); });
  }
})();
