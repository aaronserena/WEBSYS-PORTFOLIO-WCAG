/* =========================================================
   Accessible Personal Portfolio — script
   Progressive enhancement: everything works without JS.
   ========================================================= */

(function () {
  "use strict";

  var prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  );

  /* -------------------------------------------------------
     1. Mobile navigation
     ------------------------------------------------------- */
  var navToggle = document.getElementById("nav-toggle");
  var primaryNav = document.getElementById("primary-nav");

  function isMobileNav() {
    return window.matchMedia("(max-width: 63.99rem)").matches;
  }

  function setNavOpen(open) {
    if (!navToggle || !primaryNav) return;
    primaryNav.classList.toggle("is-open", open);
    navToggle.setAttribute("aria-expanded", String(open));
    navToggle.setAttribute(
      "aria-label",
      open ? "Close navigation menu" : "Open navigation menu"
    );
  }

  if (navToggle && primaryNav) {
    navToggle.addEventListener("click", function () {
      var open = navToggle.getAttribute("aria-expanded") === "true";
      setNavOpen(!open);
    });

    // Close the menu after choosing a section.
    primaryNav.addEventListener("click", function (event) {
      if (event.target.closest("a") && isMobileNav()) {
        setNavOpen(false);
      }
    });

    // Escape closes the menu and returns focus to the toggle button.
    document.addEventListener("keydown", function (event) {
      if (
        event.key === "Escape" &&
        navToggle.getAttribute("aria-expanded") === "true"
      ) {
        setNavOpen(false);
        navToggle.focus();
      }
    });

    // Close when clicking outside the header.
    document.addEventListener("click", function (event) {
      if (
        isMobileNav() &&
        navToggle.getAttribute("aria-expanded") === "true" &&
        !event.target.closest(".site-header")
      ) {
        setNavOpen(false);
      }
    });

    // Reset state when moving from mobile to desktop.
    var desktopQuery = window.matchMedia("(min-width: 64rem)");
    var onViewportChange = function () {
      if (!desktopQuery.matches) return;
      setNavOpen(false);
    };
    if (typeof desktopQuery.addEventListener === "function") {
      desktopQuery.addEventListener("change", onViewportChange);
    } else if (typeof desktopQuery.addListener === "function") {
      desktopQuery.addListener(onViewportChange);
    }
  }

  /* -------------------------------------------------------
     2. Active navigation state (aria-current)
     Tracks the section that crosses the reading line
     (45% down the viewport). Works without IntersectionObserver.
     ------------------------------------------------------- */
  var navLinks = Array.prototype.slice.call(
    document.querySelectorAll(".nav-link")
  );
  var sections = navLinks
    .map(function (link) {
      var id = link.getAttribute("href");
      return id && id.indexOf("#") === 0 ? document.querySelector(id) : null;
    })
    .filter(Boolean);

  function setCurrentSection(id) {
    navLinks.forEach(function (link) {
      var isCurrent = link.getAttribute("href") === "#" + id;
      if (isCurrent) {
        link.setAttribute("aria-current", "true");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  }

  function updateCurrentSection() {
    if (!sections.length) return;

    var readingLine = window.innerHeight * 0.45;
    var current = sections[0];

    sections.forEach(function (section) {
      if (section.getBoundingClientRect().top <= readingLine) {
        current = section;
      }
    });

    // Near the very bottom, always mark the last visible section.
    if (
      window.innerHeight + window.pageYOffset >=
      document.documentElement.scrollHeight - 4
    ) {
      current = sections[sections.length - 1];
    }

    if (current) setCurrentSection(current.id);
  }

  if (sections.length) {
    // Cheap: five getBoundingClientRect() calls per scroll event.
    window.addEventListener("scroll", updateCurrentSection, { passive: true });
    window.addEventListener("resize", updateCurrentSection);
    window.addEventListener("hashchange", updateCurrentSection);
    updateCurrentSection();
  }

  /* -------------------------------------------------------
     3. Contact form validation
     ------------------------------------------------------- */
  var form = document.getElementById("contact-form");
  var formStatus = document.getElementById("form-status");

  var validators = {
    name: function (value) {
      if (value.trim() === "") {
        return "Please enter your name.";
      }
      if (value.trim().length < 2) {
        return "Please enter your full name (at least 2 characters).";
      }
      return "";
    },
    email: function (value) {
      if (value.trim() === "") {
        return "Please enter your email address.";
      }
      // Simple, permissive pattern: local@domain.tld
      var pattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
      if (!pattern.test(value.trim())) {
        return "Please enter a valid email address, for example name@example.com.";
      }
      return "";
    },
    message: function (value) {
      if (value.trim() === "") {
        return "Please enter a message.";
      }
      if (value.trim().length < 10) {
        return "Please enter a message of at least 10 characters.";
      }
      return "";
    }
  };

  function showFieldError(field, message) {
    var errorEl = document.getElementById(field.id + "-error");
    if (message) {
      field.setAttribute("aria-invalid", "true");
      // Real DOM text (not CSS content) so screen readers always announce it.
      if (errorEl) errorEl.textContent = "Error: " + message;
    } else {
      field.removeAttribute("aria-invalid");
      if (errorEl) errorEl.textContent = "";
    }
  }

  function validateField(field) {
    var validator = validators[field.id];
    if (!validator) return true;
    var message = validator(field.value);
    showFieldError(field, message);
    return message === "";
  }

  if (form) {
    form.classList.add("was-validated");

    var fields = Array.prototype.slice.call(
      form.querySelectorAll("#name, #email, #message")
    );

    // Re-validate a field once it has an error, so users get live feedback.
    fields.forEach(function (field) {
      field.addEventListener("input", function () {
        if (field.getAttribute("aria-invalid") === "true") {
          validateField(field);
        }
      });
      field.addEventListener("blur", function () {
        if (field.value.trim() !== "") {
          validateField(field);
        }
      });
    });

    form.addEventListener("submit", function (event) {
      event.preventDefault();

      var firstInvalid = null;
      fields.forEach(function (field) {
        var valid = validateField(field);
        if (!valid && !firstInvalid) {
          firstInvalid = field;
        }
      });

      if (firstInvalid) {
        if (formStatus) {
          formStatus.textContent =
            "Your message was not sent. Please fix the errors marked above and try again.";
          formStatus.classList.remove("is-success");
          formStatus.classList.add("is-error");
        }
        firstInvalid.focus();
        return;
      }

      if (formStatus) {
        formStatus.textContent =
          "Thank you! Your message has been sent. I will reply as soon as I can.";
        formStatus.classList.remove("is-error");
        formStatus.classList.add("is-success");
      }
      form.reset();
      fields.forEach(function (field) {
        showFieldError(field, "");
      });
    });
  }

  /* -------------------------------------------------------
     4. Light / dark theme switcher
     ------------------------------------------------------- */
  var themeToggle = document.getElementById("theme-toggle");
  var themeToggleText = document.getElementById("theme-toggle-text");
  var STORAGE_KEY = "portfolio-theme";
  var systemDarkQuery = window.matchMedia("(prefers-color-scheme: dark)");

  function getStoredTheme() {
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch (e) {
      return null;
    }
  }

  function setStoredTheme(theme) {
    try {
      if (theme) {
        localStorage.setItem(STORAGE_KEY, theme);
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch (e) {
      /* storage unavailable — theme still applies for this visit */
    }
  }

  function systemPrefersDark() {
    return systemDarkQuery.matches;
  }

  // Effective theme: explicit choice wins, otherwise follow the OS.
  function getEffectiveTheme() {
    var stored = getStoredTheme();
    if (stored === "light" || stored === "dark") return stored;
    return systemPrefersDark() ? "dark" : "light";
  }

  function renderThemeToggle(effective) {
    if (!themeToggle || !themeToggleText) return;
    var switchingToDark = effective === "light";
    themeToggle.dataset.target = switchingToDark ? "dark" : "light";
    themeToggle.setAttribute(
      "aria-label",
      switchingToDark ? "Switch to dark mode" : "Switch to light mode"
    );
    themeToggleText.textContent = switchingToDark ? "Dark" : "Light";
  }

  function setThemeAttribute(theme) {
    if (theme === "light" || theme === "dark") {
      document.documentElement.setAttribute("data-theme", theme);
    } else {
      // No explicit choice: follow OS changes live via CSS media query.
      document.documentElement.removeAttribute("data-theme");
    }
  }

  if (themeToggle) {
    // Sync button state with the current (possibly OS-derived) theme.
    var applyThemeState = function () {
      var effective = getEffectiveTheme();
      renderThemeToggle(effective);
    };

    themeToggle.addEventListener("click", function () {
      var effective = getEffectiveTheme();
      var next = effective === "light" ? "dark" : "light";
      setThemeAttribute(next);
      setStoredTheme(next);
      renderThemeToggle(next);
    });

    // If the visitor never chose explicitly, follow OS theme changes live.
    var onSystemThemeChange = function () {
      if (!getStoredTheme()) {
        applyThemeState();
      }
    };
    if (typeof systemDarkQuery.addEventListener === "function") {
      systemDarkQuery.addEventListener("change", onSystemThemeChange);
    } else if (typeof systemDarkQuery.addListener === "function") {
      systemDarkQuery.addListener(onSystemThemeChange);
    }

    applyThemeState();
  }

  /* -------------------------------------------------------
     5. Footer year
     ------------------------------------------------------- */
  var yearEl = document.getElementById("current-year");
  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }

  /* -------------------------------------------------------
     6. Anchor scrolling respects reduced motion
     ------------------------------------------------------- */
  if (prefersReducedMotion.matches) {
    document.documentElement.style.scrollBehavior = "auto";
  }
})();
