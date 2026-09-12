import { create } from 'zustand';
import { connectSocket, disconnectSocket } from '../lib/socket';

const useAuthStore = create((set) => ({
  isAuthenticated: false,
  isLoading: true,   // true until session bootstrap completes
  user: null,
  initAuth: (user) => {
    if (user) connectSocket();
    set({ isAuthenticated: !!user, user: user ?? null, isLoading: false });
  },
  login: (userData) => {
    connectSocket();
    set({ isAuthenticated: true, user: userData });
  },
  logout: () => {
    disconnectSocket();
    set({ isAuthenticated: false, user: null });
  },
  // Merge a partial update into the current user object.
  // Used by profile/avatar updates so every component re-renders automatically.
  updateUser: (patch) => set((state) => ({
    user: state.user ? { ...state.user, ...patch } : state.user,
  })),
}));

export default useAuthStore;

