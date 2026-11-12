import { validateEmail, validatePassword, authReducer, registerUser, loginUser } from './AuthContext';
import type { User } from '../types';

jest.mock('expo-crypto', () => ({
  digestStringAsync: jest.fn(async (_algorithm: string, data: string) => `hashed:${data}`),
  CryptoDigestAlgorithm: { SHA256: 'SHA-256' },
}));
jest.mock('expo-secure-store', () => {
  const store: Record<string, string> = {};
  return {
    getItemAsync: jest.fn(async (key: string) => store[key] ?? null),
    setItemAsync: jest.fn(async (key: string, value: string) => {
      store[key] = value;
    }),
    deleteItemAsync: jest.fn(async (key: string) => {
      delete store[key];
    }),
  };
});
jest.mock('@react-native-async-storage/async-storage', () => {
  const store: Record<string, string> = {};
  return {
    getItem: jest.fn(async (key: string) => store[key] ?? null),
    setItem: jest.fn(async (key: string, value: string) => {
      store[key] = value;
    }),
  };
});

const baseUser: User = { email: 'alice@example.com', name: 'Alice', passwordHash: 'hashed:old' };

describe('validateEmail', () => {
  it('accepts valid email addresses', () => {
    expect(validateEmail('alice@example.com')).toBe(true);
    expect(validateEmail('user+tag@domain.co.uk')).toBe(true);
  });

  it('rejects invalid email addresses', () => {
    expect(validateEmail('')).toBe(false);
    expect(validateEmail('not-an-email')).toBe(false);
    expect(validateEmail('x@x')).toBe(false);
  });
});

describe('validatePassword', () => {
  it('rejects passwords shorter than 6 characters', () => {
    expect(validatePassword('abc')).toBe('Password must be at least 6 characters.');
    expect(validatePassword('')).toBe('Password must be at least 6 characters.');
  });

  it('accepts passwords with 6 or more characters', () => {
    expect(validatePassword('abcdef')).toBe(null);
    expect(validatePassword('a'.repeat(100))).toBe(null);
  });
});

describe('authReducer', () => {
  const initial = { status: 'loading' as const, email: null as string | null, name: null as string | null };

  it('sets loading status', () => {
    const next = authReducer(initial, { type: 'SET_LOADING' });
    expect(next.status).toBe('loading');
  });

  it('signs in a user', () => {
    const next = authReducer(initial, {
      type: 'SIGNED_IN',
      payload: { email: 'alice@example.com', name: 'Alice' },
    });
    expect(next.status).toBe('signedIn');
    expect(next.email).toBe('alice@example.com');
    expect(next.name).toBe('Alice');
  });

  it('signs out a user', () => {
    const signedIn = { status: 'signedIn' as const, email: 'alice@example.com', name: 'Alice' };
    const next = authReducer(signedIn, { type: 'SIGNED_OUT' });
    expect(next.status).toBe('signedOut');
    expect(next.email).toBe(null);
    expect(next.name).toBe(null);
  });
});

describe('registerUser', () => {
  it('creates a new account storing a hash, never the plaintext password', async () => {
    const result = await registerUser([], 'alice@example.com', 'Alice', 'secret123');
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.users).toHaveLength(1);
      expect(result.users[0].passwordHash).toBe('hashed:secret123');
      expect(result.users[0].passwordHash).not.toBe('secret123');
    }
  });

  it('rejects an invalid email', async () => {
    const result = await registerUser([], 'not-an-email', 'Alice', 'secret123');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe('Enter a valid email address.');
    }
  });

  it('rejects a short password', async () => {
    const result = await registerUser([], 'alice@example.com', 'Alice', 'abc');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe('Password must be at least 6 characters.');
    }
  });

  it('rejects an email that is already registered', async () => {
    await registerUser([], 'alice@example.com', 'Alice', 'secret123');
    const result = await registerUser([baseUser], 'alice@example.com', 'Alice2', 'secret123');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe('Email already registered.');
    }
  });
});

describe('loginUser', () => {
  it('logs in with the correct password', async () => {
    const users = [baseUser];
    const result = await loginUser(users, 'alice@example.com', 'old');
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.user.email).toBe('alice@example.com');
    }
  });

  it('rejects login when no account exists', async () => {
    const result = await loginUser([], 'alice@example.com', 'old');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe('No account with this email.');
    }
  });

  it('rejects login with the wrong password', async () => {
    const result = await loginUser([baseUser], 'alice@example.com', 'wrong');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe('Wrong password.');
    }
  });

  it('rejects an invalid email', async () => {
    const result = await loginUser([baseUser], 'not-an-email', 'old');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe('Enter a valid email address.');
    }
  });
});
