import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product, quantity = 1) => {
        const items = get().items;
        const existingItem = items.find(item => item.id === product.id);

        if (existingItem) {
          set({
            items: items.map(item =>
              item.id === product.id
                ? { ...item, quantity: Number(item.quantity || 0) + Number(quantity || 1) }
                : item
            )
          });
        } else {
          set({
            items: [...items, {
              ...product,
              quantity: Number(quantity) || 1,
              price: Number(product.price) || 0,
              descriptionIcon: product.descriptionIcon,
            }]
          });
        }
      },

      removeItem: (productId) => {
        set({ items: get().items.filter(item => item.id !== productId) });
      },

      updateQuantity: (productId, quantity) => {
        const numQuantity = Number(quantity) || 0;
        if (numQuantity <= 0) {
          get().removeItem(productId);
        } else {
          set({
            items: get().items.map(item =>
              item.id === productId ? { ...item, quantity: numQuantity } : item
            )
          });
        }
      },

      clearCart: () => {
        set({ items: [] });
      },

      getTotal: () => {
        return get().items.reduce((total, item) => {
          const price = Number(item.price) || 0;
          const quantity = Number(item.quantity) || 0;
          return total + (price * quantity);
        }, 0);
      }
    }),
    {
      name: 'cart-storage',
    }
  )
);

export default useCartStore;
