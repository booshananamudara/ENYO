/**
 * @fileoverview EnyoCart Background Service Worker (Manifest V3)
 *
 * Manages cart state in chrome.storage.local, updates the extension badge,
 * handles all messages from content scripts / popup / side panel,
 * and orchestrates checkout flow.
 */

import {
  addItemToCart,
  removeItemFromCart,
  updateItemQuantity,
  getCart,
  clearCart,
  getCartCount,
} from '../utils/storage.js';

import {
  MSG,
  registerMessageHandlers,
  successResponse,
  errorResponse,
} from '../utils/messaging.js';

// ── Badge Helpers ────────────────────────────────────────────────────────────

/**
 * Update the browser action badge with the current cart item count.
 * @returns {Promise<void>}
 */
async function updateBadge() {
  try {
    const count = await getCartCount();
    const text = count > 0 ? (count > 99 ? '99+' : String(count)) : '';
    await chrome.action.setBadgeText({ text });
    await chrome.action.setBadgeBackgroundColor({ color: '#2E75B6' });
  } catch (err) {
    console.error('[EnyoCart] Badge update error:', err);
  }
}

/**
 * Broadcast a CART_UPDATED message to all extension pages (popup, side panel).
 * @param {ProductData[]} cart - The updated cart.
 */
function broadcastCartUpdate(cart) {
  chrome.runtime.sendMessage({ type: MSG.CART_UPDATED, payload: { cart } }).catch(() => {
    // Ignore errors — no listeners open is normal when popup/panel is closed
  });
}

// ── Message Handlers ─────────────────────────────────────────────────────────

registerMessageHandlers({

  /**
   * Add a product to the cart.
   * @param {ProductData} product
   */
  async [MSG.ADD_TO_CART](product) {
    if (!product || !product.title) {
      return errorResponse('Invalid product data');
    }
    try {
      const { cart, isNew } = await addItemToCart(product);
      await updateBadge();
      broadcastCartUpdate(cart);
      console.log(`[EnyoCart] ADD_TO_CART — "${product.title.slice(0, 50)}" (${isNew ? 'new' : 'quantity incremented'})`);
      return successResponse({ cart, isNew });
    } catch (err) {
      console.error('[EnyoCart] ADD_TO_CART error:', err);
      return errorResponse(err);
    }
  },

  /**
   * Remove an item from the cart by product ID.
   * @param {{productId: string}} payload
   */
  async [MSG.REMOVE_FROM_CART]({ productId }) {
    try {
      const cart = await removeItemFromCart(productId);
      await updateBadge();
      broadcastCartUpdate(cart);
      console.log(`[EnyoCart] REMOVE_FROM_CART — id: ${productId}`);
      return successResponse({ cart });
    } catch (err) {
      console.error('[EnyoCart] REMOVE_FROM_CART error:', err);
      return errorResponse(err);
    }
  },

  /**
   * Update the quantity of a cart item.
   * @param {{productId: string, quantity: number}} payload
   */
  async [MSG.UPDATE_QUANTITY]({ productId, quantity }) {
    try {
      const cart = await updateItemQuantity(productId, quantity);
      await updateBadge();
      broadcastCartUpdate(cart);
      console.log(`[EnyoCart] UPDATE_QUANTITY — id: ${productId}, qty: ${quantity}`);
      return successResponse({ cart });
    } catch (err) {
      console.error('[EnyoCart] UPDATE_QUANTITY error:', err);
      return errorResponse(err);
    }
  },

  /**
   * Return the full cart contents.
   */
  async [MSG.GET_CART]() {
    try {
      const cart = await getCart();
      return successResponse({ cart });
    } catch (err) {
      console.error('[EnyoCart] GET_CART error:', err);
      return errorResponse(err);
    }
  },

  /**
   * Clear all items from the cart.
   */
  async [MSG.CLEAR_CART]() {
    try {
      await clearCart();
      await updateBadge();
      broadcastCartUpdate([]);
      console.log('[EnyoCart] CLEAR_CART');
      return successResponse({ cart: [] });
    } catch (err) {
      console.error('[EnyoCart] CLEAR_CART error:', err);
      return errorResponse(err);
    }
  },

  /**
   * Return the total item count in the cart.
   */
  async [MSG.GET_CART_COUNT]() {
    try {
      const count = await getCartCount();
      return successResponse({ count });
    } catch (err) {
      console.error('[EnyoCart] GET_CART_COUNT error:', err);
      return errorResponse(err);
    }
  },

  /**
   * Open the checkout page in a new tab.
   */
  async [MSG.CHECKOUT]() {
    try {
      const cart = await getCart();
      if (cart.length === 0) {
        return errorResponse('Cart is empty');
      }
      await chrome.tabs.create({ url: chrome.runtime.getURL('checkout/checkout.html') });
      console.log('[EnyoCart] CHECKOUT — opened checkout tab');
      return successResponse({ opened: true });
    } catch (err) {
      console.error('[EnyoCart] CHECKOUT error:', err);
      return errorResponse(err);
    }
  },

  /**
   * Open the side panel in the current tab.
   * @param {*} _payload
   * @param {chrome.runtime.MessageSender} sender
   */
  async [MSG.OPEN_SIDEPANEL](_payload, sender) {
    try {
      if (sender.tab?.id) {
        await chrome.sidePanel.open({ tabId: sender.tab.id });
      }
      return successResponse({ opened: true });
    } catch (err) {
      console.error('[EnyoCart] OPEN_SIDEPANEL error:', err);
      return errorResponse(err);
    }
  },

});

// ── Side Panel Behaviour ──────────────────────────────────────────────────────

// Allow opening the side panel when the action icon is clicked in any tab
chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: false })
  .catch((err) => console.warn('[EnyoCart] sidePanel.setPanelBehavior:', err));

// ── Install / Update Hooks ────────────────────────────────────────────────────

chrome.runtime.onInstalled.addListener(async (details) => {
  if (details.reason === 'install') {
    console.log('[EnyoCart] Extension installed — welcome!');
    // Set default settings
    await chrome.storage.local.set({
      enyocart_settings: {
        currency: 'USD',
        notifications: true,
        sound: false,
        analytics: false,
        cookieSharing: false,
      },
    });
  } else if (details.reason === 'update') {
    console.log(`[EnyoCart] Updated to ${chrome.runtime.getManifest().version}`);
  }

  // Initialise badge
  await updateBadge();
});

// Keep badge up to date on service worker startup
updateBadge();

console.log('[EnyoCart] Service worker started');
