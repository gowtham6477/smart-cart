import { create } from 'zustand';
import { customerAPI } from '../services/api';
import toast from 'react-hot-toast';

const useCartStore = create((set, get) => ({
  items: [],
  loading: false,
  initialized: false,

  // Initialize cart from database
  initCart: async () => {
    if (get().initialized) return;

    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        set({ items: [], initialized: true });
        return;
      }

      const response = await customerAPI.getCart();
      const cartItems = response.data.data?.items || [];
      set({ items: cartItems, initialized: true });
    } catch (error) {
      console.error('Failed to load cart:', error);
      set({ items: [], initialized: true });
    }
  },

  // Sync cart from server
  syncCart: async () => {
    try {
      const response = await customerAPI.getCart();
      const cartItems = response.data.data?.items || [];
      set({ items: cartItems });
    } catch (error) {
      console.error('Failed to sync cart:', error);
    }
  },

  addItem: async (product, quantity = 1) => {
    set({ loading: true });
    try {
      const item = {
        serviceId: product.id,
        serviceName: product.name,
        category: product.category,
        price: Number(product.price) || 0,
        quantity: Number(quantity) || 1,
        descriptionIcon: product.descriptionIcon,
      };

      const response = await customerAPI.addToCart(item);
      const cartItems = response.data.data?.items || [];
      set({ items: cartItems });
      toast.success('Added to cart');
    } catch (error) {
      console.error('Failed to add item to cart:', error);
      toast.error(error?.response?.data?.message || 'Failed to add to cart');
    } finally {
      set({ loading: false });
    }
  },

  removeItem: async (serviceId) => {
    set({ loading: true });
    try {
      const response = await customerAPI.removeFromCart(serviceId);
      const cartItems = response.data.data?.items || [];
      set({ items: cartItems });
      toast.success('Removed from cart');
    } catch (error) {
      console.error('Failed to remove item:', error);
      toast.error('Failed to remove item');
    } finally {
      set({ loading: false });
    }
  },

  updateQuantity: async (serviceId, quantity) => {
    set({ loading: true });
    try {
      const response = await customerAPI.updateCartQuantity(serviceId, quantity);
      const cartItems = response.data.data?.items || [];
      set({ items: cartItems });
    } catch (error) {
      console.error('Failed to update quantity:', error);
      toast.error('Failed to update quantity');
    } finally {
      set({ loading: false });
    }
  },

  clearCart: async () => {
    set({ loading: true });
    try {
      await customerAPI.clearCart();
      set({ items: [] });
      toast.success('Cart cleared');
    } catch (error) {
      console.error('Failed to clear cart:', error);
      toast.error('Failed to clear cart');
    } finally {
      set({ loading: false });
    }
  },

  getTotal: () => {
    return get().items.reduce((total, item) => {
      const price = Number(item.price) || 0;
      const quantity = Number(item.quantity) || 0;
      return total + (price * quantity);
    }, 0);
  },

  // Reset cart state (for logout)
  resetCart: () => {
    set({ items: [], initialized: false });
  },
}));

export default useCartStore;
