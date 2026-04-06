/**
 * Cart-related types for the storefront cart state and checkout flow.
 */

/**
 * A single item in the shopping cart.
 * Shape matches what the EnyoCart browser extension sends.
 */
export interface CartItem {
  productTitle: string;
  productUrl: string;
  productImage: string | null;
  vendorName: string;
  vendorUrl: string | null;
  quantity: number;
  unitPrice: number;
  originalCurrency: string | null;
  originalPrice: number | null;
}

/** Computed totals for the cart. */
export interface CartTotals {
  subtotal: number;
  serviceFee: number;
  fxSurcharge: number;
  shippingFee: number;
  total: number;
}

/** Full cart with items and computed totals. */
export interface Cart {
  items: CartItem[];
  totals: CartTotals;
}

/** Client-side cart state for use in a React reducer/context. */
export interface CartState {
  items: CartItem[];
  isLoading: boolean;
  isCheckingOut: boolean;
}

/** Actions dispatched to the cart reducer. */
export type CartAction =
  | { type: 'SET_ITEMS'; payload: CartItem[] }
  | { type: 'ADD_ITEM'; payload: CartItem }
  | { type: 'REMOVE_ITEM'; payload: { productUrl: string } }
  | { type: 'UPDATE_QUANTITY'; payload: { productUrl: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_CHECKING_OUT'; payload: boolean };
