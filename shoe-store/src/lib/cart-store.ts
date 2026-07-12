import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { toast } from 'sonner';
import type { CartItem } from '@/lib/validations';

interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  addItem: (item: CartItem) => void;
  removeItem: (variantId: string) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  getTotalItems: () => number;
  getSubtotal: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (item) => {
        const items = get().items;
        const existingIndex = items.findIndex(i => i.variantId === item.variantId);
        const stock = item.maxStock ?? 999;

        if (existingIndex >= 0) {
          const newItems = [...items];
          const newQty = Math.min(newItems[existingIndex].quantity + item.quantity, stock);
          newItems[existingIndex].quantity = newQty;
          if (item.maxStock) newItems[existingIndex].maxStock = item.maxStock;
          set({ items: newItems });
          toast.success('Cart updated', {
            description: `${item.productName} × ${newQty}`,
          });
        } else {
          set({ items: [...items, { ...item, quantity: Math.min(item.quantity, stock) }] });
          toast.success('Added to cart', {
            description: `${item.productName} (${item.variantSize} / ${item.variantColor})`,
          });
        }
        get().openCart();
      },

      removeItem: (variantId) => {
        const item = get().items.find(i => i.variantId === variantId);
        set({ items: get().items.filter(i => i.variantId !== variantId) });
        if (item) {
          toast.info('Removed from cart', {
            description: item.productName,
          });
        }
      },

      updateQuantity: (variantId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(variantId);
          return;
        }
        set({
          items: get().items.map(i =>
            i.variantId === variantId
              ? { ...i, quantity: Math.min(quantity, i.maxStock ?? 999) }
              : i
          ),
        });
      },

      clearCart: () => {
        set({ items: [] });
        toast.info('Cart cleared');
      },

      toggleCart: () => set({ isOpen: !get().isOpen }),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),

      getTotalItems: () => get().items.reduce((sum, item) => sum + item.quantity, 0),
      getSubtotal: () => get().items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0),
    }),
    {
      name: 'shoe-store-cart',
      partialize: (state) => ({ items: state.items }),
    }
  )
);
