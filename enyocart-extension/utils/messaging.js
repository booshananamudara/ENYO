/**
 * @fileoverview Messaging utility — consistent wrappers for Chrome extension
 * message passing between content scripts, popup, side panel, and background.
 *
 * Message format: { type: string, payload: any }
 * Response format: { success: boolean, data: any, error: string|null }
 */

// ─── Message Type Constants ────────────────────────────────────────────────

export const MSG = {
  ADD_TO_CART:       'ADD_TO_CART',
  REMOVE_FROM_CART:  'REMOVE_FROM_CART',
  UPDATE_QUANTITY:   'UPDATE_QUANTITY',
  GET_CART:          'GET_CART',
  CLEAR_CART:        'CLEAR_CART',
  CHECKOUT:          'CHECKOUT',
  GET_CART_COUNT:    'GET_CART_COUNT',
  OPEN_SIDEPANEL:    'OPEN_SIDEPANEL',
  CART_UPDATED:      'CART_UPDATED',
};

/**
 * Send a message to the background service worker and await the response.
 * @param {string} type - Message type constant from MSG.
 * @param {*} [payload] - Optional data payload.
 * @returns {Promise<{success: boolean, data: *, error: string|null}>}
 */
export function sendToBackground(type, payload = null) {
  return new Promise((resolve, reject) => {
    try {
      chrome.runtime.sendMessage({ type, payload }, (response) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
          return;
        }
        resolve(response || { success: false, data: null, error: 'No response' });
      });
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * Send a message to a specific tab's content script.
 * @param {number} tabId - Target tab ID.
 * @param {string} type - Message type.
 * @param {*} [payload] - Optional payload.
 * @returns {Promise<*>}
 */
export function sendToTab(tabId, type, payload = null) {
  return new Promise((resolve, reject) => {
    chrome.tabs.sendMessage(tabId, { type, payload }, (response) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
        return;
      }
      resolve(response);
    });
  });
}

/**
 * Register a message listener in the background or a page context.
 * Automatically handles async responses.
 *
 * @param {Object} handlers - Map of MSG type → handler function.
 *   Handler signature: (payload, sender) => Promise<*> | *
 *   The return value is sent back as { success: true, data: returnValue }.
 * @returns {Function} The registered listener (for removal if needed).
 */
export function registerMessageHandlers(handlers) {
  const listener = (message, sender, sendResponse) => {
    const handler = handlers[message.type];
    if (!handler) return false; // Not handled here

    // Support both sync and async handlers.
    // IMPORTANT: handlers already return a fully-formed { success, data, error }
    // object via successResponse() / errorResponse(). Pass it through directly —
    // do NOT wrap it again or callers will see double-nested data.
    const result = handler(message.payload, sender);
    if (result && typeof result.then === 'function') {
      result
        .then((handlerResult) => sendResponse(handlerResult))
        .catch((err) => {
          console.error('[EnyoCart] Handler error:', err);
          sendResponse({ success: false, data: null, error: err.message });
        });
      return true; // Keep channel open for async response
    }

    // Sync handler — result is already the full response object
    sendResponse(result);
    return false;
  };

  chrome.runtime.onMessage.addListener(listener);
  return listener;
}

/**
 * Create a standardised success response object.
 * @param {*} data
 * @returns {{success: true, data: *, error: null}}
 */
export function successResponse(data) {
  return { success: true, data, error: null };
}

/**
 * Create a standardised error response object.
 * @param {string|Error} error
 * @returns {{success: false, data: null, error: string}}
 */
export function errorResponse(error) {
  return { success: false, data: null, error: error instanceof Error ? error.message : String(error) };
}
