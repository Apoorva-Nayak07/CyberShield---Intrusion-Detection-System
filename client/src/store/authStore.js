import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../lib/api';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,

      initAuth: async () => {
        const { token, refreshToken } = get();
        if (!token) return;

        try {
          const response = await api.get('/auth/me');
          set({ user: response.data.data, isAuthenticated: true });
        } catch (error) {
          // Try to refresh token
          if (refreshToken) {
            try {
              const refreshResponse = await api.post('/auth/refresh', { refreshToken });
              const { accessToken, refreshToken: newRefresh } = refreshResponse.data.data;
              set({ token: accessToken, refreshToken: newRefresh });
              api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
              const userResponse = await api.get('/auth/me');
              set({ user: userResponse.data.data, isAuthenticated: true });
            } catch {
              get().logout();
            }
          } else {
            get().logout();
          }
        }
      },

      login: async (email, password, twoFactorCode) => {
        set({ isLoading: true });
        try {
          const response = await api.post('/auth/login', { email, password, twoFactorCode });
          const { user, accessToken, refreshToken } = response.data.data;

          api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

          set({
            user,
            token: accessToken,
            refreshToken,
            isAuthenticated: true,
            isLoading: false,
          });

          return { success: true };
        } catch (error) {
          set({ isLoading: false });
          return {
            success: false,
            message: error.response?.data?.message || 'Login failed',
            requiresTwoFactor: error.response?.data?.requiresTwoFactor,
          };
        }
      },

      register: async (name, email, password) => {
        set({ isLoading: true });
        try {
          const response = await api.post('/auth/register', { name, email, password });
          const { user, accessToken, refreshToken } = response.data.data;

          api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

          set({
            user,
            token: accessToken,
            refreshToken,
            isAuthenticated: true,
            isLoading: false,
          });

          return { success: true };
        } catch (error) {
          set({ isLoading: false });
          return {
            success: false,
            message: error.response?.data?.message || 'Registration failed',
          };
        }
      },

      logout: async () => {
        try {
          await api.post('/auth/logout');
        } catch {}
        delete api.defaults.headers.common['Authorization'];
        set({ user: null, token: null, refreshToken: null, isAuthenticated: false });
      },

      updateUser: (userData) => {
        set({ user: { ...get().user, ...userData } });
      },
    }),
    {
      name: 'cybershield-auth',
      partialize: (state) => ({
        token: state.token,
        refreshToken: state.refreshToken,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
