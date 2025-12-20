import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authAPI } from '../services/api';

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: false,

      // Login
      login: async (credentials) => {
        set({ isLoading: true });
        try {
          const response = await authAPI.login(credentials);
          const { token, userId, email, name, role } = response.data.data;

          const user = { userId, email, name, role };

          localStorage.setItem('accessToken', token);
          localStorage.setItem('user', JSON.stringify(user));

          set({
            user,
            accessToken: token,
            isAuthenticated: true,
            isLoading: false,
          });

          return { success: true, user };
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      // Register
      register: async (data) => {
        set({ isLoading: true });
        try {
          const response = await authAPI.register(data);
          const { token, userId, email, name, role } = response.data.data;

          const user = { userId, email, name, role };

          localStorage.setItem('accessToken', token);
          localStorage.setItem('user', JSON.stringify(user));

          set({
            user,
            accessToken: token,
            isAuthenticated: true,
            isLoading: false,
          });

          return { success: true, user };
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      // Logout
      logout: () => {
        authAPI.logout();
        set({
          user: null,
          accessToken: null,
          isAuthenticated: false,
        });
      },

      // Initialize auth from storage
      initAuth: () => {
        const token = localStorage.getItem('accessToken');
        const userStr = localStorage.getItem('user');

        if (token && userStr) {
          const user = JSON.parse(userStr);
          set({
            user,
            accessToken: token,
            isAuthenticated: true,
          });
        }
      },

      // Check if user has role
      hasRole: (role) => {
        const { user } = get();
        return user?.role === role;
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export default useAuthStore;

