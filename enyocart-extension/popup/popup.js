/**
 * @fileoverview EnyoCart Popup — compact cart view (380px wide).
 * Renders cart items, quantity controls, subtotal, and checkout CTA.
 */

(function () {
  'use strict';

  // ── State ──────────────────────────────────────────────────────────────────
  let cart = [];

  // ── DOM References ─────────────────────────────────────────────────────────
  const cartList       = document.getElementById('cart-list');
  const emptyState     = document.getElementById('empty-state');
  const loadingState   = document.getElementById('loading-state');
  const popupFooter    = document.getElementById('popup-footer');
  const cartBadge      = document.getElementById('cart-count-badge');
  const subtotalEl     = document.getElementById('subtotal-display');
  const itemCountEl    = document.getElementById('item-count-text');
  const btnCheckout    = document.getElementById('btn-checkout');
  const btnOpenPanel   = document.getElementById('btn-open-panel');

  // ── Messaging ──────────────────────────────────────────────────────────────

  /**
   * Send a message to the background service worker.
   * @param {string} type
   * @param {*} [payload]
   * @returns {Promise<*>}
   */
  function sendMsg(type, payload = null) {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage({ type, payload }, (response) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
          return;
        }
        resolve(response);
      });
    });
  }

  // ── Rendering ──────────────────────────────────────────────────────────────

  /**
   * Get a deterministic vendor accent colour from the vendor name string.
   * @param {string} vendor
   * @returns {string} CSS hex colour.
   */
  function vendorColor(vendor) {
    const colours = ['#2E75B6', '#27AE60', '#E74C3C', '#9B59B6', '#F39C12', '#1ABC9C', '#E67E22'];
    let hash = 0;
    for (let i = 0; i < vendor.length; i++) hash = vendor.charCodeAt(i) + (hash << 5) - hash;
    return colours[Math.abs(hash) % colours.length];
  }

  /**
   * Sanitise a string for safe innerHTML insertion (text nodes only).
   * @param {string} str
   * @returns {string}
   */
  function esc(str) {
    const d = document.createElement('div');
    d.textContent = String(str || '');
    return d.innerHTML;
  }

  /**
   * Format a price with its currency.
   * @param {number} price
   * @param {string} currency
   * @returns {string}
   */
  function fmtPrice(price, currency) {
    const sym = { USD:'$', EUR:'€', GBP:'£', JPY:'¥', THB:'฿', AUD:'A$', CAD:'C$' };
    return `${sym[currency] || '$'}${Number(price).toFixed(2)}`;
  }

  /**
   * Calculate and format the cart subtotal.
   * @param {Array} items
   * @returns {string}
   */
  function calcSubtotal(items) {
    const total = items.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 1), 0);
    return `$${total.toFixed(2)}`;
  }

  /**
   * Render one cart item row.
   * @param {Object} item - ProductData
   * @returns {HTMLElement}
   */
  function renderCartItem(item) {
    const li = document.createElement('li');
    li.className = 'cart-item';
    li.dataset.id = item.id;

    // onerror inline handlers violate MV3 CSP — use addEventListener after innerHTML
    const thumbHtml = item.image
      ? `<img class="cart-item__thumb" src="${esc(item.image)}" alt="" loading="lazy">`
        + `<div class="cart-item__thumb-placeholder" style="display:none">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
           </div>`
      : `<div class="cart-item__thumb-placeholder">
           <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
         </div>`;

    li.innerHTML = `
      ${thumbHtml}
      <div class="cart-item__info">
        <div class="cart-item__title">${esc(item.title)}</div>
        <div class="cart-item__vendor">
          <span class="cart-item__vendor-dot" style="background:${vendorColor(item.vendor || '')}"></span>
          <span>${esc(item.vendor || 'Unknown')}</span>
        </div>
        <div class="cart-item__price">${esc(item.priceFormatted || fmtPrice(item.price, item.currency))}</div>
        <div class="cart-item__controls">
          <button class="qty-btn" data-action="dec" aria-label="Decrease quantity">−</button>
          <span class="qty-value">${item.quantity || 1}</span>
          <button class="qty-btn" data-action="inc" aria-label="Increase quantity">+</button>
        </div>
      </div>
      <button class="cart-item__remove" aria-label="Remove ${esc(item.title)} from cart">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/>
          <path d="M9 6V4h6v2"/>
        </svg>
      </button>
    `;

    // Attach img error listener now that the element is in the DOM
    const thumb = li.querySelector('.cart-item__thumb');
    if (thumb) {
      thumb.addEventListener('error', () => {
        thumb.style.display = 'none';
        const placeholder = thumb.nextElementSibling;
        if (placeholder) placeholder.style.display = 'flex';
      }, { once: true });
    }

    // Quantity controls
    li.querySelector('[data-action="dec"]').addEventListener('click', () => handleQtyChange(item.id, -1));
    li.querySelector('[data-action="inc"]').addEventListener('click', () => handleQtyChange(item.id, +1));
    li.querySelector('.cart-item__remove').addEventListener('click', () => handleRemove(item.id));

    return li;
  }

  /**
   * Re-render the entire cart list and update summary.
   */
  function renderCart() {
    cartList.innerHTML = '';

    const count = cart.reduce((s, i) => s + (i.quantity || 1), 0);

    if (cart.length === 0) {
      emptyState.hidden = false;
      popupFooter.hidden = true;
      cartBadge.textContent = '0';
    } else {
      emptyState.hidden = true;
      popupFooter.hidden = false;

      for (const item of cart) {
        cartList.appendChild(renderCartItem(item));
      }

      cartBadge.textContent = String(count);
      subtotalEl.textContent = calcSubtotal(cart);
      itemCountEl.textContent = `${count} item${count !== 1 ? 's' : ''}`;

      // Badge bump animation
      cartBadge.classList.remove('bump');
      void cartBadge.offsetWidth; // reflow to restart animation
      cartBadge.classList.add('bump');
      setTimeout(() => cartBadge.classList.remove('bump'), 400);
    }
  }

  // ── Actions ────────────────────────────────────────────────────────────────

  /**
   * Handle quantity increment/decrement.
   * @param {string} id - Product ID.
   * @param {number} delta - +1 or -1.
   */
  async function handleQtyChange(id, delta) {
    const item = cart.find((i) => i.id === id);
    if (!item) return;

    const newQty = (item.quantity || 1) + delta;
    if (newQty < 1) {
      await handleRemove(id);
      return;
    }

    try {
      const res = await sendMsg('UPDATE_QUANTITY', { productId: id, quantity: newQty });
      if (res?.success) {
        cart = res.data.cart;
        renderCart();
      }
    } catch (err) {
      console.error('[EnyoCart] Update quantity error:', err);
    }
  }

  /**
   * Remove an item from the cart.
   * @param {string} id - Product ID.
   */
  async function handleRemove(id) {
    // Animate out
    const li = cartList.querySelector(`[data-id="${id}"]`);
    if (li) {
      li.style.transition = 'opacity 200ms, transform 200ms';
      li.style.opacity = '0';
      li.style.transform = 'translateX(20px)';
      await new Promise((r) => setTimeout(r, 200));
    }

    try {
      const res = await sendMsg('REMOVE_FROM_CART', { productId: id });
      if (res?.success) {
        cart = res.data.cart;
        renderCart();
      }
    } catch (err) {
      console.error('[EnyoCart] Remove item error:', err);
    }
  }

  /**
   * Open the side panel.
   */
  async function handleOpenPanel() {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab?.id) {
        await chrome.sidePanel.open({ tabId: tab.id });
        window.close();
      }
    } catch (err) {
      console.error('[EnyoCart] Open side panel error:', err);
    }
  }

  /**
   * Trigger checkout — opens checkout.html in a new tab.
   */
  async function handleCheckout() {
    try {
      const res = await sendMsg('CHECKOUT');
      if (res?.success) {
        window.close();
      } else {
        alert(res?.error || 'Checkout failed');
      }
    } catch (err) {
      console.error('[EnyoCart] Checkout error:', err);
    }
  }

  // ── Cart Update Listener ───────────────────────────────────────────────────

  /**
   * Listen for CART_UPDATED broadcasts from the background worker.
   * Guarded so a missing chrome.runtime never aborts the rest of the script.
   */
  try {
    chrome.runtime.onMessage.addListener((message) => {
      if (message.type === 'CART_UPDATED' && Array.isArray(message.payload?.cart)) {
        cart = message.payload.cart;
        renderCart();
      }
    });
  } catch (err) {
    console.warn('[EnyoCart] Could not register onMessage listener:', err.message);
  }

  // ── Initialisation ─────────────────────────────────────────────────────────

  /**
   * Load the cart from storage and render the popup.
   */
  async function init() {
    loadingState.hidden = false;
    cartList.innerHTML = '';
    emptyState.hidden = true;
    popupFooter.hidden = true;

    try {
      const res = await sendMsg('GET_CART');
      // messaging.js fix: res = { success, data: { cart }, error } — no double-wrap
      cart = res?.data?.cart || [];
    } catch (err) {
      console.error('[EnyoCart] Failed to load cart:', err);
      cart = [];
    } finally {
      loadingState.hidden = true;
      renderCart();
    }
  }

  // ── Event Listeners ────────────────────────────────────────────────────────
  btnCheckout.addEventListener('click', handleCheckout);
  btnOpenPanel.addEventListener('click', handleOpenPanel);

  // Boot
  init();

})();
