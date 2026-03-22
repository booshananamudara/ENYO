/**
 * @fileoverview EnyoCart Options Page — settings persistence and UI logic.
 */

(function () {
  'use strict';

  // ── DOM References ─────────────────────────────────────────────────────────
  const navLinks      = document.querySelectorAll('.opts-nav__link');
  const sections      = document.querySelectorAll('.opts-section');
  const saveToast     = document.getElementById('save-toast');
  const btnClearData  = document.getElementById('btn-clear-data');
  const clearModal    = document.getElementById('clear-modal');
  const clearCancel   = document.getElementById('clear-cancel');
  const clearConfirm  = document.getElementById('clear-confirm');

  // Setting inputs
  const currencyEl       = document.getElementById('setting-currency');
  const notificationsEl  = document.getElementById('setting-notifications');
  const soundEl          = document.getElementById('setting-sound');
  const analyticsEl      = document.getElementById('setting-analytics');
  const cookiesEl        = document.getElementById('setting-cookies');

  // Version display
  const extVersionEl   = document.getElementById('ext-version');
  const aboutVersionEl = document.getElementById('about-version');

  // ── Navigation ─────────────────────────────────────────────────────────────

  /**
   * Switch the active settings section.
   * @param {string} sectionId
   */
  function showSection(sectionId) {
    sections.forEach((s) => {
      s.classList.remove('opts-section--active');
      s.hidden = true;
    });
    navLinks.forEach((l) => l.classList.remove('opts-nav__link--active'));

    const target = document.getElementById(sectionId);
    if (target) {
      target.hidden = false;
      target.classList.add('opts-section--active');
    }

    const activeLink = document.querySelector(`[data-section="${sectionId}"]`);
    if (activeLink) activeLink.classList.add('opts-nav__link--active');
  }

  navLinks.forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      showSection(link.dataset.section);
    });
  });

  // ── Storage Helpers ────────────────────────────────────────────────────────

  /**
   * Load settings from chrome.storage.local.
   * @returns {Promise<Object>}
   */
  function loadSettings() {
    return new Promise((resolve) => {
      chrome.storage.local.get('enyocart_settings', (result) => {
        const defaults = {
          currency: 'USD',
          notifications: true,
          sound: false,
          analytics: false,
          cookieSharing: false,
        };
        resolve({ ...defaults, ...(result.enyocart_settings || {}) });
      });
    });
  }

  /**
   * Save settings to chrome.storage.local.
   * @param {Object} settings
   * @returns {Promise<void>}
   */
  function saveSettings(settings) {
    return new Promise((resolve) => {
      chrome.storage.local.set({ enyocart_settings: settings }, resolve);
    });
  }

  // ── Show Save Toast ────────────────────────────────────────────────────────

  let toastTimer;

  function showSaveToast() {
    saveToast.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      saveToast.hidden = true;
    }, 2200);
  }

  // ── Settings Persistence ───────────────────────────────────────────────────

  /**
   * Read all inputs and persist to storage.
   */
  async function persistSettings() {
    const settings = {
      currency:      currencyEl.value,
      notifications: notificationsEl.checked,
      sound:         soundEl.checked,
      analytics:     analyticsEl.checked,
      cookieSharing: cookiesEl.checked,
    };

    try {
      await saveSettings(settings);
      showSaveToast();
      console.log('[EnyoCart] Settings saved:', settings);
    } catch (err) {
      console.error('[EnyoCart] Save settings error:', err);
    }
  }

  // Attach change listeners to all inputs
  [currencyEl, notificationsEl, soundEl, analyticsEl, cookiesEl].forEach((el) => {
    el.addEventListener('change', persistSettings);
  });

  // ── Clear All Data ─────────────────────────────────────────────────────────

  btnClearData.addEventListener('click', () => {
    clearModal.hidden = false;
  });

  clearCancel.addEventListener('click', () => {
    clearModal.hidden = true;
  });

  clearModal.addEventListener('click', (e) => {
    if (e.target === clearModal) clearModal.hidden = true;
  });

  clearConfirm.addEventListener('click', async () => {
    clearModal.hidden = true;
    try {
      await new Promise((resolve) => chrome.storage.local.clear(resolve));
      console.log('[EnyoCart] All data cleared');
      // Reload the page to reset UI to defaults
      window.location.reload();
    } catch (err) {
      console.error('[EnyoCart] Clear data error:', err);
    }
  });

  // ── Version Display ────────────────────────────────────────────────────────

  function displayVersion() {
    const manifest = chrome.runtime.getManifest();
    const ver = manifest.version || '1.0.0';
    if (extVersionEl)   extVersionEl.textContent   = `v${ver}`;
    if (aboutVersionEl) aboutVersionEl.textContent = `Version ${ver}`;
  }

  // ── Init ───────────────────────────────────────────────────────────────────

  async function init() {
    displayVersion();

    // Show default section
    showSection('general');

    // Load and apply settings
    try {
      const settings = await loadSettings();
      currencyEl.value       = settings.currency || 'USD';
      notificationsEl.checked = !!settings.notifications;
      soundEl.checked         = !!settings.sound;
      analyticsEl.checked     = !!settings.analytics;
      cookiesEl.checked       = !!settings.cookieSharing;
    } catch (err) {
      console.error('[EnyoCart] Load settings error:', err);
    }
  }

  init();

})();
