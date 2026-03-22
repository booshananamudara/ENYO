/**
 * @fileoverview EnyoCart Checkout Page — full-page checkout experience.
 * Handles shipping form, payment method selection, order validation,
 * demo modal, and success screen.
 */

(function () {
  'use strict';

  // ── State ──────────────────────────────────────────────────────────────────
  let cart = [];
  let selectedPayment = 'card';

  // ── DOM References ─────────────────────────────────────────────────────────
  const coLoading        = document.getElementById('co-loading');
  const coEmpty          = document.getElementById('co-empty');
  const coCheckout       = document.getElementById('co-checkout');
  const orderItemsEl     = document.getElementById('order-items');
  const sumCount         = document.getElementById('sum-count');
  const sumSubtotal      = document.getElementById('sum-subtotal');
  const sumFee           = document.getElementById('sum-fee');
  const sumTotal         = document.getElementById('sum-total');
  const btnComplete      = document.getElementById('btn-complete-order');
  const demoModal        = document.getElementById('demo-modal');
  const modalCancel      = document.getElementById('modal-cancel');
  const modalConfirm     = document.getElementById('modal-confirm');
  const successScreen    = document.getElementById('success-screen');
  const orderNumEl       = document.getElementById('order-num');
  const paymentMethods   = document.getElementById('payment-methods');

  // ── Helpers ────────────────────────────────────────────────────────────────

  function esc(str) {
    const d = document.createElement('div');
    d.textContent = String(str || '');
    return d.innerHTML;
  }

  function fmtPrice(p, c) {
    const sym = { USD:'$', EUR:'€', GBP:'£', JPY:'¥', THB:'฿', AUD:'A$', CAD:'C$' };
    return `${sym[c] || '$'}${Number(p || 0).toFixed(2)}`;
  }

  function calcTotals(items) {
    const subtotal = items.reduce((s, i) => s + (i.price || 0) * (i.quantity || 1), 0);
    const fee = subtotal * 0.03;
    return { subtotal, fee, total: subtotal + fee };
  }

  function generateOrderNumber() {
    const suffix = Math.random().toString(36).slice(2, 8).toUpperCase();
    return `#ENYO-${suffix}`;
  }

  // ── Messaging ──────────────────────────────────────────────────────────────

  function sendMsg(type, payload = null) {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage({ type, payload }, (res) => {
        if (chrome.runtime.lastError) { reject(new Error(chrome.runtime.lastError.message)); return; }
        resolve(res);
      });
    });
  }

  // ── Render Order Summary ───────────────────────────────────────────────────

  /**
   * Render all cart items in the order summary panel.
   */
  function renderOrderSummary() {
    orderItemsEl.innerHTML = '';

    for (const item of cart) {
      const div = document.createElement('div');
      div.className = 'co-order-item';

      // onerror inline handlers violate MV3 CSP — use addEventListener after innerHTML
      const thumbHtml = item.image
        ? `<img class="co-order-item__thumb" src="${esc(item.image)}" alt="" loading="lazy">`
        : `<div class="co-order-item__thumb-ph"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/></svg></div>`;

      const linePrice = fmtPrice((item.price || 0) * (item.quantity || 1), item.currency);

      div.innerHTML = `
        ${thumbHtml}
        <div class="co-order-item__info">
          <div class="co-order-item__title">${esc(item.title)}</div>
          <div class="co-order-item__vendor">${esc(item.vendor || '')} · Qty: ${item.quantity || 1}</div>
        </div>
        <div class="co-order-item__price">
          <div>${esc(linePrice)}</div>
          <div class="co-order-item__qty">ea. ${esc(item.priceFormatted || fmtPrice(item.price, item.currency))}</div>
        </div>
      `;

      const thumb = div.querySelector('.co-order-item__thumb');
      if (thumb) {
        thumb.addEventListener('error', () => { thumb.style.display = 'none'; }, { once: true });
      }

      orderItemsEl.appendChild(div);
    }

    // Update totals
    const count = cart.reduce((s, i) => s + (i.quantity || 1), 0);
    const { subtotal, fee, total } = calcTotals(cart);

    sumCount.textContent = String(count);
    sumSubtotal.textContent = `$${subtotal.toFixed(2)}`;
    sumFee.textContent = `$${fee.toFixed(2)}`;
    sumTotal.textContent = `$${total.toFixed(2)}`;
  }

  // ── Form Validation ────────────────────────────────────────────────────────

  /**
   * Validate the shipping form. Shows inline errors.
   * @returns {boolean} True if valid.
   */
  function validateForm() {
    const form = document.getElementById('shipping-form');
    let valid = true;

    // Clear previous errors
    form.querySelectorAll('.co-field__err').forEach((el) => (el.textContent = ''));
    form.querySelectorAll('.co-input--error').forEach((el) => el.classList.remove('co-input--error'));

    const rules = [
      { id: 'f-fname',   label: 'First name',   required: true },
      { id: 'f-lname',   label: 'Last name',    required: true },
      { id: 'f-email',   label: 'Email',        required: true, type: 'email' },
      { id: 'f-addr1',   label: 'Address',      required: true },
      { id: 'f-city',    label: 'City',         required: true },
      { id: 'f-zip',     label: 'Postal code',  required: true },
      { id: 'f-country', label: 'Country',      required: true },
    ];

    for (const rule of rules) {
      const input = document.getElementById(rule.id);
      const errEl = input?.parentElement?.querySelector('.co-field__err');
      if (!input) continue;

      const val = input.value.trim();

      if (rule.required && !val) {
        input.classList.add('co-input--error');
        if (errEl) errEl.textContent = `${rule.label} is required`;
        valid = false;
        continue;
      }

      if (rule.type === 'email' && val && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
        input.classList.add('co-input--error');
        if (errEl) errEl.textContent = 'Please enter a valid email address';
        valid = false;
      }
    }

    if (!valid) {
      // Scroll to first error
      const firstError = form.querySelector('.co-input--error');
      firstError?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    return valid;
  }

  /**
   * Collect form values into a shipping object.
   * @returns {Object}
   */
  function collectShipping() {
    const g = (id) => document.getElementById(id)?.value?.trim() || '';
    return {
      firstName: g('f-fname'),
      lastName: g('f-lname'),
      email: g('f-email'),
      phone: g('f-phone'),
      address1: g('f-addr1'),
      address2: g('f-addr2'),
      city: g('f-city'),
      state: g('f-state'),
      postalCode: g('f-zip'),
      country: g('f-country'),
    };
  }

  // ── Payment Selection ──────────────────────────────────────────────────────

  /**
   * Handle payment method button clicks.
   */
  paymentMethods.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-method]');
    if (!btn) return;

    // Deselect all
    paymentMethods.querySelectorAll('.co-pay-option').forEach((el) => {
      el.classList.remove('co-pay-option--selected');
    });

    // Select clicked
    btn.classList.add('co-pay-option--selected');
    selectedPayment = btn.dataset.method;
  });

  // ── Order Flow ─────────────────────────────────────────────────────────────

  /**
   * "Complete Order" button click — validate then show demo modal.
   */
  btnComplete.addEventListener('click', () => {
    if (!validateForm()) return;
    demoModal.hidden = false;
  });

  modalCancel.addEventListener('click', () => {
    demoModal.hidden = true;
  });

  demoModal.addEventListener('click', (e) => {
    if (e.target === demoModal) demoModal.hidden = true;
  });

  /**
   * Confirm demo order — save to storage, clear cart, show success.
   */
  modalConfirm.addEventListener('click', async () => {
    demoModal.hidden = true;

    const orderNumber = generateOrderNumber();
    const shipping = collectShipping();
    const { subtotal, fee, total } = calcTotals(cart);

    const order = {
      orderNumber,
      placedAt: Date.now(),
      items: cart,
      shipping,
      paymentMethod: selectedPayment,
      subtotal,
      fee,
      total,
    };

    try {
      // Save order to storage
      const existing = await new Promise((resolve) => {
        chrome.storage.local.get('enyocart_orders', (r) => resolve(r.enyocart_orders || []));
      });
      existing.unshift(order);
      await new Promise((resolve) => {
        chrome.storage.local.set({ enyocart_orders: existing }, resolve);
      });

      // Clear the cart
      await sendMsg('CLEAR_CART');
    } catch (err) {
      console.error('[EnyoCart] Save order error:', err);
    }

    // Show success screen
    orderNumEl.textContent = orderNumber;
    successScreen.hidden = false;
    document.body.style.overflow = 'hidden';
  });

  // ── Init ───────────────────────────────────────────────────────────────────

  async function init() {
    try {
      const res = await sendMsg('GET_CART');
      cart = res?.data?.cart || [];
    } catch (err) {
      console.error('[EnyoCart] Failed to load cart:', err);
      cart = [];
    }

    coLoading.hidden = true;

    if (cart.length === 0) {
      coEmpty.hidden = false;
      return;
    }

    coCheckout.hidden = false;
    renderOrderSummary();
  }

  init();

})();
