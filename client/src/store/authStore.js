import { create } from 'zustand';

const useAuthStore = create((set) => ({
  isAuthenticated: false,
  isLoading: true,   // true until session bootstrap completes
  user: null,
  initAuth: (user) => set({ isAuthenticated: !!user, user: user ?? null, isLoading: false }),
  login: (userData) => set({ isAuthenticated: true, user: userData }),
  logout: () => set({ isAuthenticated: false, user: null }),
}));

export default useAuthStore;
