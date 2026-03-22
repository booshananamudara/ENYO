/**
 * @fileoverview EnyoCart Content Script — detects products on e-commerce pages,
 * overlays "Add to EnyoCart" buttons, and handles product scraping.
 *
 * Button positioning strategy: all overlay buttons live inside a single
 * #enyo-overlay-root container that is a direct child of <html>. Buttons use
 * position:fixed with coordinates stored as CSS custom properties so that
 * !important rules in the stylesheet never fight with JS-set values.
 * This bypasses every overflow:hidden ancestor on the host page.
 */

(function () {
  'use strict';

  // Guard: only run once per document
  if (window.__enyoCartLoaded) return;
  window.__enyoCartLoaded = true;

  // ── Constants ────────────────────────────────────────────────────────────

  const PREFIX = '[EnyoCart]';
  const BUTTON_ATTR = 'data-enyo-btn';
  const TOAST_DURATION = 2500; // ms

  // ── SVG Assets ───────────────────────────────────────────────────────────

  const ADD_BTN_SVG = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="22" height="22"
         fill="none" stroke="currentColor" stroke-width="2"
         stroke-linecap="round" stroke-linejoin="round">
      <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
      <line x1="3" y1="6" x2="21" y2="6"/>
      <line x1="12" y1="11" x2="12" y2="17"/>
      <line x1="9" y1="14" x2="15" y2="14"/>
    </svg>`;

  const CHECK_SVG = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="22" height="22"
         fill="none" stroke="currentColor" stroke-width="2.5"
         stroke-linecap="round" stroke-linejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>`;

  // ── Overlay Root Container ────────────────────────────────────────────────

  /**
   * A single fixed-position container attached directly to <html>.
   * All listing overlay buttons live here, bypassing any overflow:hidden
   * on the host page's container hierarchy.
   */
  let overlayRoot = null;

  function getOverlayRoot() {
    if (overlayRoot && document.documentElement.contains(overlayRoot)) {
      return overlayRoot;
    }
    overlayRoot = document.createElement('div');
    overlayRoot.id = 'enyo-overlay-root';
    overlayRoot.setAttribute('aria-hidden', 'true');
    // Styles set inline so they can never be overridden by the host page
    overlayRoot.style.cssText = [
      'position:fixed',
      'top:0',
      'left:0',
      'width:0',
      'height:0',
      'overflow:visible',
      'pointer-events:none',
      'z-index:2147483647',
    ].join('!important;') + '!important';
    document.documentElement.appendChild(overlayRoot);
    return overlayRoot;
  }

  // ── Button Creation ──────────────────────────────────────────────────────

  /**
   * Create a base ENYO overlay button element.
   * @returns {HTMLButtonElement}
   */
  function createOverlayButton() {
    const btn = document.createElement('button');
    btn.className = 'enyo-add-btn';
    btn.setAttribute('aria-label', 'Add to EnyoCart');

    const tooltip = document.createElement('span');
    tooltip.className = 'enyo-tooltip';
    tooltip.textContent = 'Add to EnyoCart';

    btn.innerHTML = ADD_BTN_SVG;
    btn.appendChild(tooltip);
    return btn;
  }

  /**
   * Animate the button to show success state, then revert after 2s.
   * @param {HTMLButtonElement} btn
   */
  function showSuccessAnimation(btn) {
    btn.classList.add('enyo-btn--success');
    btn.innerHTML = CHECK_SVG;

    const tooltip = document.createElement('span');
    tooltip.className = 'enyo-tooltip';
    tooltip.textContent = 'Added!';
    btn.appendChild(tooltip);

    setTimeout(() => {
      btn.classList.remove('enyo-btn--success');
      btn.innerHTML = ADD_BTN_SVG;
      const newTooltip = document.createElement('span');
      newTooltip.className = 'enyo-tooltip';
      newTooltip.textContent = 'Add to EnyoCart';
      btn.appendChild(newTooltip);
    }, 2000);
  }

  // ── Toast Notifications ──────────────────────────────────────────────────

  let toastContainer = null;

  function ensureToastContainer() {
    if (toastContainer && document.body && document.body.contains(toastContainer)) {
      return toastContainer;
    }
    toastContainer = document.createElement('div');
    toastContainer.id = 'enyo-toast-container';
    (document.body || document.documentElement).appendChild(toastContainer);
    return toastContainer;
  }

  /**
   * Show a brief toast notification.
   * @param {string} message
   * @param {'success'|'error'|'info'} [type='success']
   */
  function showToast(message, type = 'success') {
    const container = ensureToastContainer();
    const toast = document.createElement('div');
    toast.className = `enyo-toast enyo-toast--${type}`;

    const icon = type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ';
    // Use textContent for sanitised parts to avoid XSS
    const iconEl = document.createElement('span');
    iconEl.className = 'enyo-toast__icon';
    iconEl.textContent = icon;

    const msgEl = document.createElement('span');
    msgEl.className = 'enyo-toast__msg';
    msgEl.textContent = message;

    toast.appendChild(iconEl);
    toast.appendChild(msgEl);
    container.appendChild(toast);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => toast.classList.add('enyo-toast--visible'));
    });

    setTimeout(() => {
      toast.classList.remove('enyo-toast--visible');
      setTimeout(() => toast.remove(), 400);
    }, TOAST_DURATION);
  }

  // ── Extension Context Guard ──────────────────────────────────────────────

  /**
   * Returns true if the extension context is still valid (service worker alive).
   * In MV3 the service worker can be terminated after ~30 s of inactivity.
   * After the user reloads the extension, content scripts in open tabs lose their
   * runtime context. Calling chrome.runtime.sendMessage in that state throws
   * "Extension context invalidated".
   * @returns {boolean}
   */
  function isContextValid() {
    try {
      return !!(chrome && chrome.runtime && chrome.runtime.id);
    } catch (_e) {
      return false;
    }
  }

  /**
   * Show a page-level refresh banner when the extension context has been
   * invalidated (e.g. after an extension reload/update).
   */
  function showRefreshBanner() {
    if (document.getElementById('enyo-refresh-banner')) return;

    const banner = document.createElement('div');
    banner.id = 'enyo-refresh-banner';
    banner.style.cssText = [
      'position:fixed',
      'bottom:80px',
      'left:50%',
      'transform:translateX(-50%)',
      'background:#1B3A5C',
      'color:#fff',
      'font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif',
      'font-size:13px',
      'font-weight:500',
      'padding:10px 20px',
      'border-radius:24px',
      'box-shadow:0 4px 16px rgba(0,0,0,0.25)',
      'z-index:2147483647',
      'display:flex',
      'align-items:center',
      'gap:12px',
      'white-space:nowrap',
    ].join('!important;') + '!important';

    const msg = document.createElement('span');
    msg.textContent = 'EnyoCart was updated — refresh this page to continue.';

    const btn = document.createElement('button');
    btn.textContent = 'Refresh';
    btn.style.cssText = [
      'background:#2E75B6',
      'color:#fff',
      'border:none',
      'border-radius:12px',
      'padding:4px 12px',
      'font-size:12px',
      'font-weight:600',
      'cursor:pointer',
    ].join('!important;') + '!important';
    btn.addEventListener('click', () => window.location.reload());

    banner.appendChild(msg);
    banner.appendChild(btn);
    document.documentElement.appendChild(banner);
  }

  // ── Cart Communication ───────────────────────────────────────────────────

  /**
   * Send product data to the background service worker.
   * @param {Object} product
   * @returns {Promise<void>}
   */
  function addToCart(product) {
    return new Promise((resolve, reject) => {
      // Guard: check context is valid before attempting the call.
      // "Extension context invalidated" happens after an extension reload/update
      // while the tab is still open. Recover gracefully instead of silently failing.
      if (!isContextValid()) {
        reject(new Error('Extension context invalidated'));
        return;
      }

      try {
        chrome.runtime.sendMessage(
          { type: 'ADD_TO_CART', payload: product },
          (response) => {
            if (chrome.runtime.lastError) {
              reject(new Error(chrome.runtime.lastError.message));
              return;
            }
            if (response?.success) {
              resolve(response.data);
            } else {
              reject(new Error(response?.error || 'Add to cart failed'));
            }
          }
        );
      } catch (err) {
        reject(err);
      }
    });
  }

  // ── Listing Button Positioning ────────────────────────────────────────────

  /**
   * Map of product elements → {btn, imageEl} for position updates.
   * @type {Map<HTMLElement, {btn: HTMLButtonElement, imageEl: HTMLElement}>}
   */
  const trackedButtons = new Map();

  /**
   * Calculate and apply the fixed position for a listing overlay button.
   * Position is written as CSS custom properties on the button's style so that
   * the !important declarations in content.css can resolve them via var().
   * This avoids the CSS !important vs inline-style specificity conflict.
   *
   * @param {HTMLButtonElement} btn
   * @param {HTMLElement} imageEl
   */
  function applyButtonPosition(btn, imageEl) {
    const rect = imageEl.getBoundingClientRect();

    // Hide if the image has no size or is off-screen
    if (rect.width === 0 || rect.height === 0) {
      btn.style.setProperty('--enyo-btn-visible', '0');
      return;
    }
    btn.style.setProperty('--enyo-btn-visible', '1');

    // top-right corner of the image, 8px inset
    const top = rect.top + 8;
    const left = rect.right - 48; // button is 40px wide

    btn.style.setProperty('--enyo-pos-top', `${top}px`);
    btn.style.setProperty('--enyo-pos-left', `${left}px`);
  }

  /**
   * Re-calculate positions for all tracked listing buttons.
   * Called on scroll / resize events.
   */
  let rafPending = false;

  function updateAllButtonPositions() {
    if (rafPending) return;
    rafPending = true;
    requestAnimationFrame(() => {
      rafPending = false;
      for (const { btn, imageEl } of trackedButtons.values()) {
        applyButtonPosition(btn, imageEl);
      }
    });
  }

  // Listen on capture phase to catch scrolling inside any element
  document.addEventListener('scroll', updateAllButtonPositions, { passive: true, capture: true });
  window.addEventListener('resize', updateAllButtonPositions, { passive: true });

  // ── Product Page Handling ─────────────────────────────────────────────────

  /**
   * Inject the floating "Add to EnyoCart" button for a product detail page.
   * This button is position:fixed at the bottom-right of the viewport.
   * @param {Object} scraper
   */
  function handleProductPage(scraper) {
    if (document.getElementById('enyo-detail-btn')) return;

    const btn = createOverlayButton();
    btn.id = 'enyo-detail-btn';
    btn.classList.add('enyo-detail-btn');
    btn.style.setProperty('pointer-events', 'auto', 'important');

    btn.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();
      btn.disabled = true;
      try {
        const product = scraper.getProductFromDetailPage();
        if (!product || !product.title) {
          showToast('Could not extract product data', 'error');
          return;
        }
        await addToCart(product);
        showSuccessAnimation(btn);
        showToast(`"${product.title.slice(0, 40)}…" added to EnyoCart`);
      } catch (err) {
        console.error(`${PREFIX} Add to cart error:`, err);
        if (err.message.includes('context invalidated')) {
          showRefreshBanner();
        } else {
          showToast('Failed to add product', 'error');
        }
      } finally {
        setTimeout(() => { btn.disabled = false; }, 2200);
      }
    });

    // Append to <html> so position:fixed is relative to the viewport,
    // not affected by any transform/overflow on <body>
    document.documentElement.appendChild(btn);
    console.log(`${PREFIX} Detail page button injected`);
  }

  // ── Listing Page Handling ─────────────────────────────────────────────────

  /**
   * Attach ENYO overlay buttons to all product cards on a listing page.
   * @param {Object} scraper
   */
  function attachListingButtons(scraper) {
    const elements = scraper.getProductElements();
    if (!elements || elements.length === 0) return;

    const root = getOverlayRoot();
    let attached = 0;

    for (const el of elements) {
      if (el.hasAttribute(BUTTON_ATTR)) continue;

      const imageEl = scraper.getProductImageElement(el);
      if (!imageEl) continue;

      el.setAttribute(BUTTON_ATTR, '1');

      const btn = createOverlayButton();
      btn.classList.add('enyo-listing-btn');
      // Enable pointer events on the button itself only
      btn.style.setProperty('pointer-events', 'auto', 'important');

      btn.addEventListener('click', async (e) => {
        e.preventDefault();
        e.stopPropagation();
        btn.disabled = true;
        try {
          const product = scraper.getProductFromCard(el);
          if (!product || !product.title) {
            showToast('Could not read product data', 'error');
            return;
          }
          await addToCart(product);
          showSuccessAnimation(btn);
          showToast(`"${product.title.slice(0, 40)}…" added to EnyoCart`);
        } catch (err) {
          console.error(`${PREFIX} Add to cart error:`, err);
          showToast('Failed to add product', 'error');
        } finally {
          setTimeout(() => { btn.disabled = false; }, 2200);
        }
      });

      // Position and insert
      applyButtonPosition(btn, imageEl);
      root.appendChild(btn);
      trackedButtons.set(el, { btn, imageEl });
      attached++;
    }

    if (attached > 0) {
      console.log(`${PREFIX} Attached ${attached} listing buttons`);
    }
  }

  // ── MutationObserver for Dynamic Content ──────────────────────────────────

  let observerDebounceTimer = null;

  function onDomMutation(scraper) {
    clearTimeout(observerDebounceTimer);
    observerDebounceTimer = setTimeout(() => {
      requestAnimationFrame(() => {
        try {
          if (scraper.isListingPage()) attachListingButtons(scraper);
          if (scraper.isProductPage() && !document.getElementById('enyo-detail-btn')) {
            handleProductPage(scraper);
          }
        } catch (err) {
          console.error(`${PREFIX} MutationObserver callback error:`, err);
        }
      });
    }, 400);
  }

  function startMutationObserver(scraper) {
    const observer = new MutationObserver(() => onDomMutation(scraper));
    observer.observe(document.documentElement, { childList: true, subtree: true });
    console.log(`${PREFIX} MutationObserver started`);
  }

  // ── Scraper Resolution ───────────────────────────────────────────────────

  /**
   * Find the scraper for the current hostname, or fall back to generic.
   * @returns {Object|null}
   */
  function resolveScraper() {
    const hostname = window.location.hostname;
    const scrapers = window.EnyoScrapers || {};

    for (const key of Object.keys(scrapers)) {
      if (key === 'generic') continue;
      const s = scrapers[key];
      if (Array.isArray(s.hostname) && s.hostname.some((h) => hostname === h || hostname.endsWith('.' + h))) {
        console.log(`${PREFIX} Using scraper: ${key}`);
        return s;
      }
    }

    console.log(`${PREFIX} No dedicated scraper — using generic fallback`);
    return scrapers.generic || null;
  }

  // ── Init with Retry ───────────────────────────────────────────────────────

  /**
   * Main init — resolves scraper, detects page type, injects buttons.
   * Called multiple times with increasing delays to handle dynamic pages.
   */
  function init() {
    if (!window.location.protocol.startsWith('http')) return;

    const scraper = resolveScraper();
    if (!scraper) {
      console.log(`${PREFIX} No scraper available`);
      return;
    }

    console.log(`${PREFIX} Init on ${window.location.hostname}`);

    try {
      if (scraper.isProductPage()) {
        handleProductPage(scraper);
      }
      // Also run listing check — some pages are both (e.g. homepage with products)
      if (scraper.isListingPage()) {
        attachListingButtons(scraper);
      }
    } catch (err) {
      console.error(`${PREFIX} Init error:`, err);
    }
  }

  /**
   * Run init immediately, then retry at 600 ms, 1.5 s, and 3 s to handle
   * pages that render content asynchronously (React/SPA, lazy-loaded cards).
   */
  function scheduleInit() {
    init();
    setTimeout(init, 600);
    setTimeout(init, 1500);
    setTimeout(init, 3000);
  }

  // ── Startup ──────────────────────────────────────────────────────────────

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      scheduleInit();
      startMutationObserver(resolveScraper() || {
        isListingPage: () => false,
        isProductPage: () => false,
      });
    });
  } else {
    scheduleInit();
    startMutationObserver(resolveScraper() || {
      isListingPage: () => false,
      isProductPage: () => false,
    });
  }

  // ── SPA Navigation Detection ──────────────────────────────────────────────

  let lastHref = window.location.href;
  setInterval(() => {
    if (window.location.href !== lastHref) {
      lastHref = window.location.href;
      // Remove old detail button on navigation
      document.getElementById('enyo-detail-btn')?.remove();
      // Clear tracked listing buttons (they're stale after navigation)
      trackedButtons.clear();
      if (overlayRoot) {
        overlayRoot.innerHTML = '';
      }
      setTimeout(scheduleInit, 500);
    }
  }, 1000);

})();
