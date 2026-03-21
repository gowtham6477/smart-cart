import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authAPI, customerAPI } from '../services/api';
import useCartStore from './cartStore';

const normalizeRole = (role) => {
  if (!role) return role;
  return role.toString().toUpperCase().replace(/^ROLE_/, '');
};

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: false,
      hasHydrated: false,

      setHasHydrated: (value) => set({ hasHydrated: value }),

      // Login
      login: async (credentials) => {
        set({ isLoading: true });
        try {
          const response = await authAPI.login(credentials);
          const { token, userId, email, name, role, mobile, address, city, state, pincode } = response.data.data;

          const user = {
            userId,
            email,
            name,
            role: normalizeRole(role),
            mobile,
            address,
            city,
            state,
            pincode,
          };

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
          const { token, userId, email, name, role, mobile, address, city, state, pincode } = response.data.data;

          const user = {
            userId,
            email,
            name,
            role: normalizeRole(role),
            mobile,
            address,
            city,
            state,
            pincode,
          };

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
        useCartStore.getState().resetCart(); // Reset cart on logout
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
          try {
            const user = JSON.parse(userStr);
            const normalizedUser = {
              ...user,
              role: normalizeRole(user?.role),
            };

            // Check if token has userId - if not, force logout for token refresh
            if (!user.userId) {
              console.warn('Old token detected without userId. Please log in again.');
              localStorage.removeItem('accessToken');
              localStorage.removeItem('user');
              set({
                user: null,
                accessToken: null,
                isAuthenticated: false,
              });
              return;
            }

            set({
              user: normalizedUser,
              accessToken: token,
              isAuthenticated: true,
            });
          } catch (error) {
            console.error('Error parsing user data:', error);
            localStorage.removeItem('accessToken');
            localStorage.removeItem('user');
          }
        }
      },

      // Check if user has role
      hasRole: (role) => {
        const { user } = get();
  return normalizeRole(user?.role) === normalizeRole(role);
      },

      // Update user data
      setUser: (userData) => {
        const normalizedUser = {
          ...userData,
          role: normalizeRole(userData?.role),
        };
        set({ user: normalizedUser });
        localStorage.setItem('user', JSON.stringify(normalizedUser));
      },

      // Refresh profile from backend (customer role)
      refreshProfile: async () => {
        const { isAuthenticated, user } = get();
        if (!isAuthenticated) return null;

        try {
          const response = await customerAPI.getProfile();
          const profile = response.data?.data;
          if (!profile) return null;

          const updatedUser = {
            ...user,
            ...profile,
            role: normalizeRole(profile?.role || user?.role),
            userId: profile?.id || profile?.userId || user?.userId,
          };

          set({ user: updatedUser });
          localStorage.setItem('user', JSON.stringify(updatedUser));
          return updatedUser;
        } catch (error) {
          console.error('Failed to refresh profile:', error);
          return null;
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);

export default useAuthStore;

