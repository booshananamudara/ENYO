'use client';

import { useCartContext } from '@/contexts/cart-context';
import type { CartItem } from '@/lib/types/cart';
import { SERVICE_FEE_PERCENT } from '@/lib/constants';

/** Hook for cart operations. Wraps the cart context with convenience methods. */
export function useCart() {
  const { state, dispatch, items, subtotal, itemCount } = useCartContext();

  const serviceFee = Math.round(subtotal * (SERVICE_FEE_PERCENT / 100) * 100) / 100;
  const total = subtotal + serviceFee;

  function addItem(item: CartItem) {
    dispatch({ type: 'ADD_ITEM', payload: item });
  }

  function removeItem(productUrl: string) {
    dispatch({ type: 'REMOVE_ITEM', payload: { productUrl } });
  }

  function updateQuantity(productUrl: string, quantity: number) {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { productUrl, quantity } });
  }

  function setItems(items: CartItem[]) {
    dispatch({ type: 'SET_ITEMS', payload: items });
  }

  function clearCart() {
    dispatch({ type: 'CLEAR_CART' });
  }

  return {
    items,
    itemCount,
    subtotal,
    serviceFee,
    total,
    isLoading: state.isLoading,
    isCheckingOut: state.isCheckingOut,
    addItem,
    removeItem,
    updateQuantity,
    setItems,
    clearCart,
  };
}
