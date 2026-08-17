import { create } from 'zustand';
import {
  createListApi,
  deleteListApi,
  getListsApi,
  reorderListsApi,
  updateListApi,
} from '../api/list.api';
import socket from '../lib/socket';

const sortByPosition = (lists) => [...lists].sort((a, b) => a.position - b.position);

const useListStore = create((set, get) => ({
  lists: [],
  isLoading: false,
  error: null,

  fetchLists: async (projectId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await getListsApi(projectId);
      set({ lists: sortByPosition(response.lists), isLoading: false });
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Failed to fetch lists',
        isLoading: false,
      });
    }
  },

  createList: async (projectId, name) => {
    set({ isLoading: true, error: null });
    try {
      const response = await createListApi(projectId, { name });
      set((state) => {
        if (state.lists.some((l) => l.id === response.list.id)) {
          return { isLoading: false };
        }
        return {
          lists: sortByPosition([...state.lists, response.list]),
          isLoading: false,
        };
      });
      return response.list;
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Failed to create list',
        isLoading: false,
      });
      throw error;
    }
  },

  updateList: async (listId, name) => {
    set({ isLoading: true, error: null });
    try {
      const response = await updateListApi(listId, { name });
      set((state) => ({
        lists: state.lists.map((l) => (l.id === listId ? response.list : l)),
        isLoading: false,
      }));
      return response.list;
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Failed to update list',
        isLoading: false,
      });
      throw error;
    }
  },

  deleteList: async (listId) => {
    set({ isLoading: true, error: null });
    try {
      await deleteListApi(listId);
      set((state) => ({
        lists: state.lists.filter((l) => l.id !== listId),
        isLoading: false,
      }));
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Failed to delete list',
        isLoading: false,
      });
      throw error;
    }
  },

  reorderLists: async (projectId, orderedListIds) => {
    // Optimistic update — reorder immediately for snappy drag UX
    const previousLists = get().lists;
    const optimistic = orderedListIds
      .map((id) => previousLists.find((l) => l.id === id))
      .filter(Boolean)
      .map((l, index) => ({ ...l, position: index }));
    set({ lists: optimistic });

    try {
      const response = await reorderListsApi(projectId, orderedListIds);
      // Reconcile with server truth
      set({ lists: sortByPosition(response.lists) });
    } catch (error) {
      // Roll back on failure
      set({
        lists: previousLists,
        error: error.response?.data?.message || 'Failed to reorder lists',
      });
      throw error;
    }
  },

  // ── Socket listeners ────────────────────────────────────────────────────

  setupSocketListeners: (projectId) => {
    socket.emit('joinProject', { projectId });

    socket.on('list:created', (list) => {
      set((state) => {
        // Guard: already exists (our own optimistic add won't happen since we use server response)
        if (state.lists.some((l) => l.id === list.id)) return state;
        return { lists: sortByPosition([...state.lists, list]) };
      });
    });

    socket.on('list:updated', (list) => {
      set((state) => ({
        lists: state.lists.map((l) => (l.id === list.id ? list : l)),
      }));
    });

    socket.on('list:deleted', ({ listId }) => {
      set((state) => ({
        lists: state.lists.filter((l) => l.id !== listId),
      }));
    });

    socket.on('list:reordered', (updatedLists) => {
      // Only apply if the incoming order differs from the current optimistic state
      const current = get().lists;
      const sameOrder = current.every((l, i) => updatedLists[i]?.id === l.id);
      if (!sameOrder) {
        set({ lists: sortByPosition(updatedLists) });
      }
    });
  },

  teardownSocketListeners: (projectId) => {
    socket.emit('leaveProject', { projectId });
    socket.off('list:created');
    socket.off('list:updated');
    socket.off('list:deleted');
    socket.off('list:reordered');
  },

  clearError: () => set({ error: null }),
  clearLists: () => set({ lists: [], error: null }),
}));

export default useListStore;
