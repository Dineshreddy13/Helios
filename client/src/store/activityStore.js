import { create } from 'zustand';
import { getDashboardActivityApi, getProjectActivityApi } from '../api/activity.api';
import socket from '../lib/socket';

const MAX_DASHBOARD_ITEMS = 50;

const useActivityStore = create((set, get) => ({
  dashboardActivity: [],
  projectActivity: [],
  isLoading: false,
  error: null,

  fetchDashboardActivity: async (opts) => {
    set({ isLoading: true, error: null });
    try {
      const response = await getDashboardActivityApi(opts);
      set({ dashboardActivity: response.activities, isLoading: false });
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Failed to fetch dashboard activity',
        isLoading: false,
      });
    }
  },

  fetchProjectActivity: async (projectId, opts) => {
    set({ isLoading: true, error: null });
    try {
      const response = await getProjectActivityApi(projectId, opts);
      set({ projectActivity: response.activities, isLoading: false });
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Failed to fetch project activity',
        isLoading: false,
      });
    }
  },

  prependActivity: (item) => {
    set((state) => {
      // Guard: already exists
      if (state.dashboardActivity.some((a) => a.id === item.id)) return state;
      const updated = [item, ...state.dashboardActivity].slice(0, MAX_DASHBOARD_ITEMS);
      return { dashboardActivity: updated };
    });
  },

  // ── Socket listeners ────────────────────────────────────────────────────

  setupDashboardSocketListeners: (projectIds) => {
    projectIds.forEach((projectId) => {
      socket.emit('joinProject', { projectId });
    });

    socket.on('activity:created', (item) => {
      get().prependActivity(item);
    });
  },

  teardownDashboardSocketListeners: (projectIds) => {
    projectIds.forEach((projectId) => {
      socket.emit('leaveProject', { projectId });
    });
    socket.off('activity:created');
  },

  clearError: () => set({ error: null }),
  clearActivity: () => set({ dashboardActivity: [], projectActivity: [], error: null }),
}));

export default useActivityStore;
