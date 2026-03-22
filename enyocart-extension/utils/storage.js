/**
 * @fileoverview Storage utility — Promise-based wrapper around chrome.storage.local
 * with cart-specific helpers.
 */

/** @const {string} Cart storage key */
const CART_KEY = 'enyocart_cart';
/** @const {string} Settings storage key */
const SETTINGS_KEY = 'enyocart_settings';
/** @const {string} Orders storage key */
const ORDERS_KEY = 'enyocart_orders';

/**
 * Get one or more values from chrome.storage.local.
 * @param {string|string[]|null} keys - Key(s) to retrieve, or null for all.
 * @returns {Promise<Object>} Resolved with the storage object.
 */
export function storageGet(keys) {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(keys, (result) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
      } else {
        resolve(result);
      }
    });
  });
}

/**
 * Set values in chrome.storage.local.
 * @param {Object} items - Key-value pairs to store.
 * @returns {Promise<void>}
 */
export function storageSet(items) {
  return new Promise((resolve, reject) => {
    chrome.storage.local.set(items, () => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
      } else {
        resolve();
      }
    });
  });
}

/**
 * Remove one or more keys from chrome.storage.local.
 * @param {string|string[]} keys - Key(s) to remove.
 * @returns {Promise<void>}
 */
export function storageRemove(keys) {
  return new Promise((resolve, reject) => {
    chrome.storage.local.remove(keys, () => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
      } else {
        resolve();
      }
    });
  });
}

/**
 * Clear all data from chrome.storage.local.
 * @returns {Promise<void>}
 */
export function storageClear() {
  return new Promise((resolve, reject) => {
    chrome.storage.local.clear(() => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
      } else {
        resolve();
      }
    });
  });
}

// ─── Cart-Specific Helpers ─────────────────────────────────────────────────

/**
 * Get the current cart array from storage.
 * @returns {Promise<ProductData[]>}
 */
export async function getCart() {
  const result = await storageGet(CART_KEY);
  return result[CART_KEY] || [];
}

/**
 * Save the full cart array to storage.
 * @param {ProductData[]} cart
 * @returns {Promise<void>}
 */
export async function saveCart(cart) {
  await storageSet({ [CART_KEY]: cart });
}

/**
 * Add a product to the cart. If the product URL already exists, increment quantity.
 * @param {ProductData} product
 * @returns {Promise<{cart: ProductData[], added: boolean, isNew: boolean}>}
 */
export async function addItemToCart(product) {
  const cart = await getCart();
  const existingIndex = cart.findIndex((item) => item.url === product.url);

  if (existingIndex >= 0) {
    cart[existingIndex].quantity = (cart[existingIndex].quantity || 1) + 1;
    await saveCart(cart);
    return { cart, added: true, isNew: false };
  }

  const newItem = { ...product, quantity: product.quantity || 1 };
  cart.push(newItem);
  await saveCart(cart);
  return { cart, added: true, isNew: true };
}

/**
 * Remove a product from the cart by its ID.
 * @param {string} productId
 * @returns {Promise<ProductData[]>} Updated cart.
 */
export async function removeItemFromCart(productId) {
  let cart = await getCart();
  cart = cart.filter((item) => item.id !== productId);
  await saveCart(cart);
  return cart;
}

/**
 * Update the quantity of a cart item.
 * @param {string} productId
 * @param {number} quantity - New quantity (must be >= 1).
 * @returns {Promise<ProductData[]>} Updated cart.
 */
export async function updateItemQuantity(productId, quantity) {
  const cart = await getCart();
  const index = cart.findIndex((item) => item.id === productId);
  if (index >= 0) {
    cart[index].quantity = Math.max(1, quantity);
    await saveCart(cart);
  }
  return cart;
}

/**
 * Clear all items from the cart.
 * @returns {Promise<void>}
 */
export async function clearCart() {
  await saveCart([]);
}

/**
 * Get the total number of items (sum of all quantities) in the cart.
 * @returns {Promise<number>}
 */
export async function getCartCount() {
  const cart = await getCart();
  return cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
}

// ─── Settings Helpers ──────────────────────────────────────────────────────

/** @typedef {Object} EnyoSettings
 * @property {string} currency - Default currency code.
 * @property {boolean} notifications - Enable toast notifications.
 * @property {boolean} sound - Enable sound on add-to-cart.
 * @property {boolean} analytics - Allow anonymous data collection.
 * @property {boolean} cookieSharing - Allow cookie data sharing.
 */

/** @type {EnyoSettings} */
const DEFAULT_SETTINGS = {
  currency: 'USD',
  notifications: true,
  sound: false,
  analytics: false,
  cookieSharing: false,
};

/**
 * Get extension settings, merged with defaults.
 * @returns {Promise<EnyoSettings>}
 */
export async function getSettings() {
  const result = await storageGet(SETTINGS_KEY);
  return { ...DEFAULT_SETTINGS, ...(result[SETTINGS_KEY] || {}) };
}

/**
 * Save extension settings (merged with existing).
 * @param {Partial<EnyoSettings>} updates
 * @returns {Promise<EnyoSettings>} Updated settings.
 */
export async function saveSettings(updates) {
  const current = await getSettings();
  const merged = { ...current, ...updates };
  await storageSet({ [SETTINGS_KEY]: merged });
  return merged;
}

// ─── Orders Helpers ────────────────────────────────────────────────────────

/**
 * Save an order to the orders history.
 * @param {Object} order
 * @returns {Promise<void>}
 */
export async function saveOrder(order) {
  const result = await storageGet(ORDERS_KEY);
  const orders = result[ORDERS_KEY] || [];
  orders.unshift(order);
  await storageSet({ [ORDERS_KEY]: orders });
}

/**
 * Get all saved orders.
 * @returns {Promise<Object[]>}
 */
export async function getOrders() {
  const result = await storageGet(ORDERS_KEY);
  return result[ORDERS_KEY] || [];
}
