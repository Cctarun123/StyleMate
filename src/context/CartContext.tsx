import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useReducer,
  type ReactNode,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Clothing } from '../types';

const CART_STORAGE_KEY = '@stylemate:cart';

export type CartItem = Clothing & { size: string; quantity: number };

export type CartState = {
  items: CartItem[];
};

type CartAction =
  | { type: 'ADD'; payload: { product: Clothing; size: string } }
  | { type: 'REMOVE'; payload: { id: number; size: string } }
  | { type: 'SET_QTY'; payload: { id: number; size: string; quantity: number } }
  | { type: 'CLEAR' }
  | { type: 'HYDRATE'; payload: CartItem[] };

export function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD': {
      const { product, size } = action.payload;
      const existing = state.items.find(
        (item) => item.id === product.id && item.size === size
      );
      if (existing) {
        return {
          items: state.items.map((item) =>
            item.id === product.id && item.size === size
              ? { ...item, quantity: item.quantity + 1 }
              : item
          ),
        };
      }
      return { items: [...state.items, { ...product, size, quantity: 1 }] };
    }
    case 'REMOVE':
      return {
        items: state.items.filter(
          (item) => !(item.id === action.payload.id && item.size === action.payload.size)
        ),
      };
    case 'SET_QTY': {
      const { id, size, quantity } = action.payload;
      if (quantity <= 0) {
        return {
          items: state.items.filter(
            (item) => !(item.id === id && item.size === size)
          ),
        };
      }
      return {
        items: state.items.map((item) =>
          item.id === id && item.size === size ? { ...item, quantity } : item
        ),
      };
    }
    case 'CLEAR':
      return { items: [] };
    case 'HYDRATE':
      return { items: action.payload };
    default:
      return state;
  }
}

type CartContextValue = {
  items: CartItem[];
  add: (product: Clothing, size: string) => void;
  remove: (id: number, size: string) => void;
  setQty: (id: number, size: string, quantity: number) => void;
  clear: () => void;
  total: number;
  count: number;
};

const CartContext = createContext(null as unknown as CartContextValue | null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [] });

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(CART_STORAGE_KEY);
        if (raw !== null) {
          const parsed = JSON.parse(raw) as unknown;
          const items = Array.isArray(parsed) ? (parsed as CartItem[]) : [];
          dispatch({ type: 'HYDRATE', payload: items });
        }
      } catch {
        // Corrupt or unreadable storage — start with an empty cart.
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        await AsyncStorage.setItem(CART_STORAGE_KEY, JSON.stringify(state.items));
      } catch {
        // Persistence failed — cart state is still kept in memory.
      }
    })();
  }, [state.items]);

  const add = useCallback(
    (product: Clothing, size: string) =>
      dispatch({ type: 'ADD', payload: { product, size } }),
    []
  );
  const remove = useCallback(
    (id: number, size: string) =>
      dispatch({ type: 'REMOVE', payload: { id, size } }),
    []
  );
  const setQty = useCallback(
    (id: number, size: string, quantity: number) =>
      dispatch({ type: 'SET_QTY', payload: { id, size, quantity } }),
    []
  );
  const clear = useCallback(() => dispatch({ type: 'CLEAR' }), []);

  const total = state.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const count = state.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider value={{ items: state.items, add, remove, setQty, clear, total, count }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (context === null) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
