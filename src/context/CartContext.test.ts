import { cartReducer, CartState } from './CartContext';
import { Clothing } from '../types';

const product: Clothing = {
  id: 1,
  title: 'Cotton Tee',
  price: 500,
  gender: 'unisex',
  kind: 'tshirt',
  minTemp: 20,
  maxTemp: 30,
  rainOk: false,
  image: 'https://images.unsplash.com/photo-1521592712012-82996836a47e',
};

function addItem(state: CartState, size: string) {
  return cartReducer(state, {
    type: 'ADD',
    payload: { product, size },
  });
}

describe('CartContext reducer', () => {
  it('adds the same item+size by incrementing quantity', () => {
    let state: CartState = { items: [] };
    state = addItem(state, 'M');
    state = addItem(state, 'M');
    expect(state.items).toHaveLength(1);
    expect(state.items[0].quantity).toBe(2);
  });

  it('keeps different sizes as separate line items', () => {
    let state: CartState = { items: [] };
    state = addItem(state, 'M');
    state = addItem(state, 'L');
    expect(state.items).toHaveLength(2);
    expect(state.items.find((i) => i.size === 'M')?.quantity).toBe(1);
    expect(state.items.find((i) => i.size === 'L')?.quantity).toBe(1);
  });

  it('setQty to 0 removes the item', () => {
    let state: CartState = { items: [] };
    state = addItem(state, 'M');
    state = cartReducer(state, {
      type: 'SET_QTY',
      payload: { id: 1, size: 'M', quantity: 0 },
    });
    expect(state.items).toHaveLength(0);
  });

  it('setQty updates quantity without removing when positive', () => {
    let state: CartState = { items: [] };
    state = addItem(state, 'M');
    state = cartReducer(state, {
      type: 'SET_QTY',
      payload: { id: 1, size: 'M', quantity: 5 },
    });
    expect(state.items[0].quantity).toBe(5);
  });

  it('computes total as price * quantity', () => {
    const p2: Clothing = { ...product, id: 2, price: 300 };
    let state: CartState = { items: [] };
    state = cartReducer(state, { type: 'ADD', payload: { product, size: 'M' } });
    state = cartReducer(state, { type: 'ADD', payload: { product: p2, size: 'L' } });
    state = cartReducer(state, {
      type: 'SET_QTY',
      payload: { id: 1, size: 'M', quantity: 2 },
    });
    const total = state.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    expect(total).toBe(500 * 2 + 300);
  });

  it('CLEAR empties the cart', () => {
    let state: CartState = { items: [] };
    state = addItem(state, 'M');
    state = cartReducer(state, { type: 'CLEAR' });
    expect(state.items).toHaveLength(0);
  });
});
