/**
 * @fileoverview EnyoCart Side Panel — full cart view with vendor grouping,
 * editable quantities, notes per item, and checkout CTA.
 */

(function () {
  'use strict';

  // ── State ──────────────────────────────────────────────────────────────────
  let cart = [];

  // ── DOM References ─────────────────────────────────────────────────────────
  const spLoading    = document.getElementById('sp-loading');
  const spEmpty      = document.getElementById('sp-empty');
  const spContent    = document.getElementById('sp-cart-content');
  const spGroups     = document.getElementById('sp-groups');
  const spFooter     = document.getElementById('sp-footer');
  const spBadge      = document.getElementById('sp-badge');
  const spSubtotal   = document.getElementById('sp-subtotal');
  const spFee        = document.getElementById('sp-fee');
  const spTotal      = document.getElementById('sp-total');
  const spItemCount  = document.getElementById('sp-item-count');
  const btnClear     = document.getElementById('btn-clear-cart');
  const btnCheckout  = document.getElementById('btn-checkout');
  const modal        = document.getElementById('confirm-modal');
  const modalCount   = document.getElementById('modal-count');
  const modalCancel  = document.getElementById('modal-cancel');
  const modalConfirm = document.getElementById('modal-confirm');

  // ── Helpers ────────────────────────────────────────────────────────────────

  /** @param {string} str @returns {string} */
  function esc(str) {
    const d = document.createElement('div');
    d.textContent = String(str || '');
    return d.innerHTML;
  }

  /** @param {number} p @param {string} c @returns {string} */
  function fmtPrice(p, c) {
    const sym = { USD:'$', EUR:'€', GBP:'£', JPY:'¥', THB:'฿', AUD:'A$', CAD:'C$' };
    return `${sym[c] || '$'}${Number(p || 0).toFixed(2)}`;
  }

  /** @param {Object[]} items @returns {{subtotal:number,fee:number,total:number}} */
  function calcTotals(items) {
    const subtotal = items.reduce((s, i) => s + (i.price || 0) * (i.quantity || 1), 0);
    const fee = subtotal * 0.03;
    return { subtotal, fee, total: subtotal + fee };
  }

  /** Group cart items by vendor. @param {Object[]} items @returns {Object} */
  function groupByVendor(items) {
    return items.reduce((groups, item) => {
      const v = item.vendor || 'Other';
      if (!groups[v]) groups[v] = [];
      groups[v].push(item);
      return groups;
    }, {});
  }

  // ── Messaging ──────────────────────────────────────────────────────────────
  function sendMsg(type, payload = null) {
    return new Promise((resolve, reject) => {
      try {
        chrome.runtime.sendMessage({ type, payload }, (res) => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
            return;
          }
          resolve(res);
        });
      } catch (err) {
        reject(err);
      }
    });
  }

  // ── Rendering ──────────────────────────────────────────────────────────────

  /**
   * Render a single cart item row for the side panel.
   * @param {Object} item
   * @returns {HTMLElement}
   */
  function renderItem(item) {
    const div = document.createElement('div');
    div.className = 'sp-cart-item';
    div.dataset.id = item.id;

    // onerror inline handlers violate MV3 CSP — use addEventListener after innerHTML
    const thumbHtml = item.image
      ? `<img class="sp-cart-item__thumb" src="${esc(item.image)}" alt="" loading="lazy">`
      : `<div class="sp-cart-item__thumb-placeholder"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg></div>`;

    const lineTotal = fmtPrice((item.price || 0) * (item.quantity || 1), item.currency);

    div.innerHTML = `
      ${thumbHtml}
      <div class="sp-cart-item__info">
        <div class="sp-cart-item__title">
          <a href="${esc(item.url)}" target="_blank" rel="noopener noreferrer">${esc(item.title)}</a>
        </div>
        <div class="sp-cart-item__price-row">
          <span class="sp-cart-item__price">${esc(item.priceFormatted || fmtPrice(item.price, item.currency))}</span>
          <span class="sp-cart-item__line-total">Subtotal: ${esc(lineTotal)}</span>
        </div>
        <div class="sp-qty">
          <button class="sp-qty__btn" data-action="dec" aria-label="Decrease">−</button>
          <input class="sp-qty__input" type="number" min="1" max="99"
                 value="${item.quantity || 1}" aria-label="Quantity" />
          <button class="sp-qty__btn" data-action="inc" aria-label="Increase">+</button>
        </div>
        <div class="sp-cart-item__note-wrap">
          <textarea class="sp-cart-item__note" placeholder="Add a note for this item…"
                    maxlength="200" rows="1">${esc(item.note || '')}</textarea>
        </div>
      </div>
      <button class="sp-cart-item__remove" aria-label="Remove item">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/>
          <path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/>
        </svg>
      </button>
    `;

    // Attach img error listener now that the element is in the DOM
    const thumb = div.querySelector('.sp-cart-item__thumb');
    if (thumb) {
      thumb.addEventListener('error', () => { thumb.style.display = 'none'; }, { once: true });
    }

    // Qty dec/inc buttons
    div.querySelector('[data-action="dec"]').addEventListener('click', () => handleQtyChange(item.id, -1));
    div.querySelector('[data-action="inc"]').addEventListener('click', () => handleQtyChange(item.id, +1));

    // Direct input
    const qtyInput = div.querySelector('.sp-qty__input');
    qtyInput.addEventListener('change', () => {
      const val = parseInt(qtyInput.value, 10);
      if (!isNaN(val) && val >= 1) handleQtySet(item.id, val);
      else qtyInput.value = item.quantity || 1;
    });

    // Note textarea (debounced save)
    const noteArea = div.querySelector('.sp-cart-item__note');
    let noteTimer;
    noteArea.addEventListener('input', () => {
      clearTimeout(noteTimer);
      noteTimer = setTimeout(() => saveNote(item.id, noteArea.value), 800);
    });

    // Remove
    div.querySelector('.sp-cart-item__remove').addEventListener('click', () => handleRemove(item.id));

    return div;
  }

  /**
   * Build a vendor group section with a header and item list.
   * @param {string} vendor
   * @param {Object[]} items
   * @returns {HTMLElement}
   */
  function renderVendorGroup(vendor, items) {
    const section = document.createElement('section');
    section.className = 'vendor-group';
    section.dataset.vendor = vendor;
    section.style.animation = 'slideIn 200ms ease';

    const logoUrl = items[0]?.vendorLogo || '';
    const count = items.reduce((s, i) => s + (i.quantity || 1), 0);

    const header = document.createElement('div');
    header.className = 'vendor-header';
    // Set innerHTML once (the += pattern re-parses and destroys any listeners).
    // onerror inline handlers violate MV3 CSP — use addEventListener after setting innerHTML.
    header.innerHTML =
      (logoUrl ? `<img class="vendor-logo" src="${esc(logoUrl)}" alt="">` : '') +
      `<span class="vendor-name">${esc(vendor)}</span>
       <span class="vendor-count">${count} item${count !== 1 ? 's' : ''}</span>`;

    const logoImg = header.querySelector('.vendor-logo');
    if (logoImg) {
      logoImg.addEventListener('error', () => { logoImg.style.display = 'none'; }, { once: true });
    }

    section.appendChild(header);
    items.forEach((item) => section.appendChild(renderItem(item)));
    return section;
  }

  /**
   * Full re-render of the cart.
   */
  function renderCart() {
    spGroups.innerHTML = '';

    const totalCount = cart.reduce((s, i) => s + (i.quantity || 1), 0);

    if (cart.length === 0) {
      spLoading.hidden = true;
      spEmpty.hidden = false;
      spContent.hidden = true;
      spFooter.hidden = true;
      spBadge.textContent = '0';
      return;
    }

    spLoading.hidden = true;
    spEmpty.hidden = true;
    spContent.hidden = false;
    spFooter.hidden = false;

    // Group items by vendor and render
    const groups = groupByVendor(cart);
    for (const [vendor, items] of Object.entries(groups)) {
      spGroups.appendChild(renderVendorGroup(vendor, items));
    }

    // Update totals
    const { subtotal, fee, total } = calcTotals(cart);
    spBadge.textContent = String(totalCount);
    spItemCount.textContent = `${totalCount} item${totalCount !== 1 ? 's' : ''}`;
    spSubtotal.textContent = `$${subtotal.toFixed(2)}`;
    spFee.textContent = `$${fee.toFixed(2)}`;
    spTotal.textContent = `$${total.toFixed(2)}`;
  }

  // ── Actions ────────────────────────────────────────────────────────────────

  async function handleQtyChange(id, delta) {
    const item = cart.find((i) => i.id === id);
    if (!item) return;
    const newQty = (item.quantity || 1) + delta;
    if (newQty < 1) { await handleRemove(id); return; }
    await handleQtySet(id, newQty);
  }

  async function handleQtySet(id, qty) {
    try {
      const res = await sendMsg('UPDATE_QUANTITY', { productId: id, quantity: qty });
      if (res?.success) { cart = res.data.cart; renderCart(); }
    } catch (err) {
      console.error('[EnyoCart] Update quantity error:', err);
    }
  }

  async function handleRemove(id) {
    const el = spGroups.querySelector(`[data-id="${id}"]`);
    if (el) {
      el.style.transition = 'opacity 200ms, transform 200ms';
      el.style.opacity = '0';
      el.style.transform = 'translateX(16px)';
      await new Promise((r) => setTimeout(r, 200));
    }
    try {
      const res = await sendMsg('REMOVE_FROM_CART', { productId: id });
      if (res?.success) { cart = res.data.cart; renderCart(); }
    } catch (err) {
      console.error('[EnyoCart] Remove error:', err);
    }
  }

  /**
   * Save a note on a cart item (stored locally only for now).
   */
  async function saveNote(id, note) {
    const item = cart.find((i) => i.id === id);
    if (item) {
      item.note = note.slice(0, 200);
      // Persist updated cart to storage directly
      try {
        await chrome.storage.local.set({ enyocart_cart: cart });
      } catch (err) {
        console.error('[EnyoCart] Save note error:', err);
      }
    }
  }

  // ── Clear Cart ─────────────────────────────────────────────────────────────

  function showClearModal() {
    const count = cart.reduce((s, i) => s + (i.quantity || 1), 0);
    modalCount.textContent = String(count);
    modal.hidden = false;
  }

  function hideClearModal() {
    modal.hidden = true;
  }

  async function confirmClearCart() {
    hideClearModal();
    try {
      const res = await sendMsg('CLEAR_CART');
      if (res?.success) { cart = []; renderCart(); }
    } catch (err) {
      console.error('[EnyoCart] Clear cart error:', err);
    }
  }

  // ── Checkout ───────────────────────────────────────────────────────────────

  async function handleCheckout() {
    try {
      const res = await sendMsg('CHECKOUT');
      if (!res?.success) console.error('[EnyoCart] Checkout error:', res?.error);
    } catch (err) {
      console.error('[EnyoCart] Checkout error:', err);
    }
  }

  // ── Cart Update Listener ───────────────────────────────────────────────────
  // Wrapped in try/catch: if chrome.runtime is unavailable (e.g. extension context
  // invalidated, or page opened outside the extension context), this must NOT
  // throw — otherwise the IIFE aborts here and init() never runs.

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

  // ── Event Listeners ────────────────────────────────────────────────────────

  btnClear.addEventListener('click', showClearModal);
  modalCancel.addEventListener('click', hideClearModal);
  modalConfirm.addEventListener('click', confirmClearCart);
  btnCheckout.addEventListener('click', handleCheckout);

  // Close modal on overlay click
  modal.addEventListener('click', (e) => {
    if (e.target === modal) hideClearModal();
  });

  // ── Init ───────────────────────────────────────────────────────────────────

  async function init() {
    if (spLoading) spLoading.hidden = false;
    try {
      const res = await sendMsg('GET_CART');
      // After the messaging.js fix, res = { success, data: { cart }, error }
      cart = res?.data?.cart || [];
    } catch (err) {
      console.error('[EnyoCart] Failed to load cart:', err);
      cart = [];
    }
    renderCart();
  }

  init();

})();
