import { createContext, useCallback, useContext, useEffect, useReducer, type ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from './AuthContext';
import { Clothing } from '../types';

const WARDROBE_STORAGE_KEY = '@stylemate:wardrobe';

type WardrobeState = {
  items: Clothing[];
};

type WardrobeAction =
  | { type: 'ADD'; payload: Clothing }
  | { type: 'REMOVE'; payload: { id: number } }
  | { type: 'HYDRATE'; payload: Clothing[] };

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
  items: Clothing[];
  add: (item: Clothing) => void;
  remove: (id: number) => void;
  isSaved: (id: number) => boolean;
};

const WardrobeContext = createContext<WardrobeContextValue | null>(null);

export function WardrobeProvider({ children }: { children: ReactNode }) {
  const { email } = useAuth();
  const storageKey = email ? `${WARDROBE_STORAGE_KEY}:${email}` : `${WARDROBE_STORAGE_KEY}:guest`;
  const [state, dispatch] = useReducer(wardrobeReducer, { items: [] });

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(storageKey);
        if (raw !== null) {
          const parsed = JSON.parse(raw) as unknown;
          const items = Array.isArray(parsed) ? (parsed as Clothing[]) : [];
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
        await AsyncStorage.setItem(storageKey, JSON.stringify(state.items));
      } catch {
        // Persistence failed — wardrobe state is still kept in memory.
      }
    })();
  }, [state.items, storageKey]);

  const add = useCallback((item: Clothing) => dispatch({ type: 'ADD', payload: item }), []);
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
