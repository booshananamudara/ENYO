'use client';

import { createContext, useContext, useReducer, type ReactNode } from 'react';
import type { CartItem, CartState, CartAction } from '@/lib/types/cart';

const initialState: CartState = {
  items: [],
  isLoading: false,
  isCheckingOut: false,
};

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'SET_ITEMS':
      return { ...state, items: action.payload };
    case 'ADD_ITEM': {
      const existing = state.items.findIndex((i) => i.productUrl === action.payload.productUrl);
      if (existing >= 0) {
        const items = [...state.items];
        items[existing] = { ...items[existing], quantity: items[existing].quantity + action.payload.quantity };
        return { ...state, items };
      }
      return { ...state, items: [...state.items, action.payload] };
    }
    case 'REMOVE_ITEM':
      return { ...state, items: state.items.filter((i) => i.productUrl !== action.payload.productUrl) };
    case 'UPDATE_QUANTITY':
      return {
        ...state,
        items: state.items.map((i) =>
          i.productUrl === action.payload.productUrl ? { ...i, quantity: action.payload.quantity } : i,
        ),
      };
    case 'CLEAR_CART':
      return { ...state, items: [] };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_CHECKING_OUT':
      return { ...state, isCheckingOut: action.payload };
    default:
      return state;
  }
}

interface CartContextValue {
  state: CartState;
  dispatch: React.Dispatch<CartAction>;
  items: CartItem[];
  subtotal: number;
  itemCount: number;
}

const CartContext = createContext<CartContextValue | null>(null);

/** Cart context provider wrapping the storefront. */
export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  const subtotal = state.items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
  const itemCount = state.items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider value={{ state, dispatch, items: state.items, subtotal, itemCount }}>
      {children}
    </CartContext.Provider>
  );
}

/** Hook to access cart context. Must be used within CartProvider. */
export function useCartContext() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCartContext must be used within CartProvider');
  return context;
}
