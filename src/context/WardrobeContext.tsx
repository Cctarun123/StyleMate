import { createContext, useCallback, useContext, useEffect, useReducer, type ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Product } from '../types';

const STORAGE_KEY = '@stylemate:wardrobe';

type WardrobeState = {
  items: Product[];
};

type WardrobeAction =
  | { type: 'ADD'; payload: Product }
  | { type: 'REMOVE'; payload: { id: number } }
  | { type: 'HYDRATE'; payload: Product[] };

function wardrobeReducer(state: WardrobeState, action: WardrobeAction): WardrobeState {
  switch (action.type) {
    case 'ADD':
      if (state.items.some((item) => item.id === action.payload.id)) return state;
      return { items: [...state.items, action.payload] };
    case 'REMOVE':
      return { items: state.items.filter((item) => item.id !== action.payload.id) };
    case 'HYDRATE':
      return { items: action.payload };
    default:
      return state;
  }
}

type WardrobeContextValue = {
  items: Product[];
  add: (item: Product) => void;
  remove: (id: number) => void;
  isSaved: (id: number) => boolean;
};

const WardrobeContext = createContext<WardrobeContextValue | null>(null);

export function WardrobeProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(wardrobeReducer, { items: [] });

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw !== null) {
          const parsed = JSON.parse(raw) as unknown;
          const items = Array.isArray(parsed) ? (parsed as Product[]) : [];
          dispatch({ type: 'HYDRATE', payload: items });
        }
      } catch {
        // Corrupt or unreadable storage — start with an empty wardrobe.
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state.items));
      } catch {
        // Persistence failed — wardrobe state is still kept in memory.
      }
    })();
  }, [state.items]);

  const add = useCallback((item: Product) => dispatch({ type: 'ADD', payload: item }), []);
  const remove = useCallback((id: number) => dispatch({ type: 'REMOVE', payload: { id } }), []);
  const isSaved = useCallback((id: number) => state.items.some((item) => item.id === id), [state.items]);

  return (
    <WardrobeContext.Provider value={{ items: state.items, add, remove, isSaved }}>
      {children}
    </WardrobeContext.Provider>
  );
}

export function useWardrobe(): WardrobeContextValue {
  const context = useContext(WardrobeContext);
  if (context === null) {
    throw new Error('useWardrobe must be used within a WardrobeProvider');
  }
  return context;
}
