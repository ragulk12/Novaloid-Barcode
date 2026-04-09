import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface CartItem {
  id: string; // SQLite ID as string for easy reading
  name: string;
  price: number;
  quantity: number;
  barcode: string;
}

interface CartState {
  items: CartItem[];
  total: number;
}

const initialState: CartState = {
  items: [],
  total: 0,
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<Omit<CartItem, "quantity">>) => {
      const existingItem = state.items.find((item) => item.barcode === action.payload.barcode);
      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        state.items.push({ ...action.payload, quantity: 1 });
      }
      state.total = state.items.reduce((acc, item) => acc + item.price * item.quantity, 0);
    },
    removeFromCart: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((item) => item.barcode !== action.payload);
      state.total = state.items.reduce((acc, item) => acc + item.price * item.quantity, 0);
    },
    updateQuantity: (state, action: PayloadAction<{ barcode: string; quantity: number }>) => {
      const item = state.items.find((item) => item.barcode === action.payload.barcode);
      if (item) {
        item.quantity = Math.max(0, action.payload.quantity);
        if (item.quantity === 0) {
          state.items = state.items.filter((i) => i.barcode !== action.payload.barcode);
        }
      }
      state.total = state.items.reduce((acc, item) => acc + item.price * item.quantity, 0);
    },
    clearCart: (state) => {
      state.items = [];
      state.total = 0;
    },
  },
});

export const { addToCart, removeFromCart, updateQuantity, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
