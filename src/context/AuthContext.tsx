import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  type ReactNode,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';
import type { AuthContextValue, User } from '../types';

const USERS_STORAGE_KEY = '@stylemate:users';
const SESSION_STORAGE_KEY = '@stylemate:session';

export type { AuthContextValue } from '../types';

type AuthState = {
  status: 'loading' | 'signedIn' | 'signedOut';
  email: string | null;
  name: string | null;
};

type AuthAction =
  | { type: 'SET_LOADING' }
  | { type: 'SIGNED_IN'; payload: { email: string; name: string | null } }
  | { type: 'SIGNED_OUT' };

export function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, status: 'loading' };
    case 'SIGNED_IN':
      return { status: 'signedIn', email: action.payload.email, name: action.payload.name };
    case 'SIGNED_OUT':
      return { status: 'signedOut', email: null, name: null };
    default:
      return state;
  }
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateEmail(email: string): boolean {
  return EMAIL_REGEX.test(email);
}

export function validatePassword(password: string): string | null {
  if (password.length < 6) {
    return 'Password must be at least 6 characters.';
  }
  return null;
}

// Hashes a password with SHA-256. Never stores plaintext passwords.
export async function hashPassword(password: string): Promise<string> {
  return Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, password);
}

export type RegisterResult =
  | { ok: true; users: User[] }
  | { ok: false; error: string };

// Pure registration logic: validates input, checks for duplicates, and hashes the
// password. Returns the new users array (caller persists it). Safe to unit test.
export async function registerUser(
  users: User[],
  email: string,
  name: string,
  password: string
): Promise<RegisterResult> {
  if (!validateEmail(email)) {
    return { ok: false, error: 'Enter a valid email address.' };
  }
  if (!name.trim()) {
    return { ok: false, error: 'Name is required.' };
  }
  const passwordError = validatePassword(password);
  if (passwordError) {
    return { ok: false, error: passwordError };
  }
  if (users.some((u) => u.email === email)) {
    return { ok: false, error: 'Email already registered.' };
  }
  const passwordHash = await hashPassword(password);
  return {
    ok: true,
    users: [...users, { email, name, passwordHash }],
  };
}

export type LoginResult =
  | { ok: true; user: User }
  | { ok: false; error: string };

// Pure login logic: looks up the account and compares password hashes. Safe to unit test.
export async function loginUser(
  users: User[],
  email: string,
  password: string
): Promise<LoginResult> {
  if (!validateEmail(email)) {
    return { ok: false, error: 'Enter a valid email address.' };
  }
  const user = users.find((u) => u.email === email);
  if (!user) {
    return { ok: false, error: 'No account with this email.' };
  }
  const passwordHash = await hashPassword(password);
  if (passwordHash !== user.passwordHash) {
    return { ok: false, error: 'Wrong password.' };
  }
  return { ok: true, user };
}

async function readUsers(): Promise<User[]> {
  try {
    const raw = await AsyncStorage.getItem(USERS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as User[]) : [];
  } catch {
    return [];
  }
}

const AuthContext = createContext(null as unknown as AuthContextValue | null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, {
    status: 'loading',
    email: null,
    name: null,
  });

  // Restore the session (email only) from secure store on mount.
  useEffect(() => {
    (async () => {
      try {
        const email = await SecureStore.getItemAsync(SESSION_STORAGE_KEY);
        if (email) {
          const users = await readUsers();
          const user = users.find((u) => u.email === email);
          dispatch({ type: 'SIGNED_IN', payload: { email, name: user?.name ?? null } });
        } else {
          dispatch({ type: 'SIGNED_OUT' });
        }
      } catch {
        dispatch({ type: 'SIGNED_OUT' });
      }
    })();
  }, []);

  const register = useCallback(
    async (email: string, name: string, password: string) => {
      const result = await registerUser(await readUsers(), email, name, password);
      if (!result.ok) {
        return { ok: false, error: result.error };
      }
      try {
        await AsyncStorage.setItem(
          USERS_STORAGE_KEY,
          JSON.stringify(result.users)
        );
        await SecureStore.setItemAsync(SESSION_STORAGE_KEY, email);
        dispatch({ type: 'SIGNED_IN', payload: { email, name } });
        return { ok: true };
      } catch {
        return { ok: false, error: 'Registration failed. Try again.' };
      }
    },
    []
  );

  const login = useCallback(
    async (email: string, password: string) => {
      const result = await loginUser(await readUsers(), email, password);
      if (!result.ok) {
        return { ok: false, error: result.error };
      }
      try {
        await SecureStore.setItemAsync(SESSION_STORAGE_KEY, email);
        dispatch({ type: 'SIGNED_IN', payload: { email, name: result.user.name } });
        return { ok: true };
      } catch {
        return { ok: false, error: 'Login failed. Try again.' };
      }
    },
    []
  );

  const logout = useCallback(() => {
    SecureStore.deleteItemAsync(SESSION_STORAGE_KEY);
    dispatch({ type: 'SIGNED_OUT' });
  }, []);

  const value = useMemo(
    () => ({ ...state, register, login, logout }),
    [state, register, login, logout]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
