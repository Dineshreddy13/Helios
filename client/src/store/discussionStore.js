import { create } from 'zustand';
import {
  getMessagesApi,
  sendMessageApi,
  editMessageApi,
  deleteMessageApi,
} from '../api/discussion.api';
import socket from '../lib/socket';

const useDiscussionStore = create((set, get) => ({
  messages: [],
  nextCursor: null,
  isLoading: false,
  hasMore: true,
  error: null,

  fetchMessages: async (projectId, cursor) => {
    set({ isLoading: true, error: null });
    try {
      const response = await getMessagesApi(projectId, cursor);
      set((state) => ({
        // API returns newest first; we prepend older messages
        messages: cursor
          ? [...response.messages.reverse(), ...state.messages]
          : response.messages.reverse(),
        nextCursor: response.nextCursor,
        hasMore: !!response.nextCursor,
        isLoading: false,
      }));
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Failed to fetch messages',
        isLoading: false,
      });
    }
  },

  sendMessage: async (projectId, content) => {
    try {
      const response = await sendMessageApi(projectId, content);
      // The socket event will add the message to the list
      return response;
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to send message' });
      throw error;
    }
  },

  editMessage: async (messageId, content) => {
    try {
      const response = await editMessageApi(messageId, content);
      return response;
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to edit message' });
      throw error;
    }
  },

  deleteMessage: async (messageId) => {
    try {
      const response = await deleteMessageApi(messageId);
      return response;
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to delete message' });
      throw error;
    }
  },

  // ── Socket listeners ────────────────────────────────────────────────────

  setupSocketListeners: (projectId) => {
    socket.emit('joinProject', { projectId });

    socket.on('discussion:messageSent', (message) => {
      set((state) => {
        if (state.messages.some((m) => m.id === message.id)) return state;
        return { messages: [...state.messages, message] };
      });
    });

    socket.on('discussion:messageUpdated', (message) => {
      set((state) => {
        const index = state.messages.findIndex((m) => m.id === message.id);
        if (index === -1) return state;
        const newMessages = [...state.messages];
        newMessages[index] = message;
        return { messages: newMessages };
      });
    });

    socket.on('discussion:messageDeleted', ({ messageId }) => {
      set((state) => ({
        messages: state.messages.filter((m) => m.id !== messageId),
      }));
    });
  },

  teardownSocketListeners: (projectId) => {
    socket.emit('leaveProject', { projectId });
    socket.off('discussion:messageSent');
    socket.off('discussion:messageUpdated');
    socket.off('discussion:messageDeleted');
  },

  clearMessages: () => set({ messages: [], nextCursor: null, hasMore: true, error: null }),
  clearError: () => set({ error: null }),
}));

export default useDiscussionStore;
