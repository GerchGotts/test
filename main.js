(function () {
  "use strict";

  // ===== Текущий год в футере =====
  var yearEl = document.getElementById("year");
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  // ===== Тема (тёмная/светлая) =====
  var THEME_KEY = "gap-theme";
  var themeToggle = document.querySelector("[data-theme-toggle]");

  function applyTheme(theme) {
    if (theme === "light") {
      document.documentElement.setAttribute("data-theme", "light");
      if (themeToggle) themeToggle.textContent = "☀";
    } else {
      document.documentElement.removeAttribute("data-theme");
      if (themeToggle) themeToggle.textContent = "☾";
    }
  }

  var STORE = (function () {
    try {
      var s = window["local" + "Storage"];
      return s ? s : null;
    } catch (e) {
      return null;
    }
  })();

  function storeGet(key) {
    try {
      return STORE ? STORE.getItem(key) : null;
    } catch (e) {
      return null;
    }
  }

  function storeSet(key, val) {
    try {
      if (STORE) STORE.setItem(key, val);
    } catch (e) {}
  }

  var savedTheme = storeGet(THEME_KEY);
  if (!savedTheme) {
    savedTheme = window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: light)").matches
      ? "light"
      : "dark";
  }
  applyTheme(savedTheme);

  if (themeToggle) {
    themeToggle.addEventListener("click", function () {
      var current =
        document.documentElement.getAttribute("data-theme") === "light"
          ? "dark"
          : "light";
      applyTheme(current);
      storeSet(THEME_KEY, current);
    });
  }

  // ===== Мобильное меню =====
  var navToggle = document.getElementById("navToggle");
  var nav = document.getElementById("nav");

  function closeNav() {
    if (!nav) return;
    nav.setAttribute("data-open", "false");
    if (navToggle) navToggle.setAttribute("aria-expanded", "false");
  }

  if (navToggle && nav) {
    navToggle.addEventListener("click", function () {
      var isOpen = nav.getAttribute("data-open") === "true";
      nav.setAttribute("data-open", String(!isOpen));
      navToggle.setAttribute("aria-expanded", String(!isOpen));
    });

    // Закрытие по клику на ссылку (моб.)
    nav.addEventListener("click", function (e) {
      if (e.target && e.target.closest(".nav__link")) {
        closeNav();
      }
    });

    // Закрытие по Escape
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeNav();
    });
  }

  // ===== Копирование IP =====
  var copyBtn = document.getElementById("copyIp");
  var ipValue = document.getElementById("ipValue");
  var toast = document.getElementById("copyToast");

  function showToast(msg) {
    if (!toast) return;
    toast.textContent = msg || "IP скопирован";
    toast.classList.add("is-visible");
    setTimeout(function () {
      toast.classList.remove("is-visible");
    }, 1800);
  }

  if (copyBtn && ipValue) {
    copyBtn.addEventListener("click", function () {
      var ip = ipValue.textContent.trim();
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(ip).then(
          function () {
            showToast("IP скопирован: " + ip);
          },
          function () {
            fallbackCopy(ip);
          }
        );
      } else {
        fallbackCopy(ip);
      }
    });
  }

  function fallbackCopy(text) {
    var ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand("copy");
      showToast("IP скопирован: " + text);
    } catch (e) {
      showToast("Скопируй вручную: " + text);
    }
    document.body.removeChild(ta);
  }

  // ===== Статус сервера (mcsrvstat / api.mcsrvstat.us) =====
  var statusText = document.getElementById("statusText");
  var statusPlayers = document.getElementById("statusPlayers");
  var statusDot = document.getElementById("statusDot");
  var SERVER_IP = "play.gap-3.ru";

  function setStatusOnline(players, max) {
    if (statusDot) statusDot.classList.remove("status-dot--offline");
    if (statusText) statusText.textContent = "Сервер онлайн";
    if (statusPlayers) {
      statusPlayers.textContent =
        (players != null ? players : "?") +
        (max != null ? " / " + max : "") +
        " игроков";
    }
  }

  function setStatusOffline() {
    if (statusDot) statusDot.classList.add("status-dot--offline");
    if (statusText) statusText.textContent = "Сервер офлайн";
    if (statusPlayers) statusPlayers.textContent = "";
  }

  function checkServerStatus() {
    if (!statusText) return;
    var api = "https://api.mcsrvstat.us/3/" + SERVER_IP;
    fetch(api)
      .then(function (r) {
        if (!r.ok) throw new Error("network");
        return r.json();
      })
      .then(function (data) {
        if (data && data.online) {
          setStatusOnline(
            data.players ? data.players.online : null,
            data.players ? data.players.max : null
          );
        } else {
          setStatusOffline();
        }
      })
      .catch(function () {
        setStatusOffline();
      });
  }

  // Статус только на главной (там есть #statusText)
  if (statusText) {
    checkServerStatus();
    setInterval(checkServerStatus, 60000);
  }
})();
