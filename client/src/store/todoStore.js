import { create } from 'zustand';
import { getTodosApi, createTodoApi, updateTodoApi, deleteTodoApi } from '../api/task.api';
import socket from '../lib/socket';

const useTodoStore = create((set, get) => ({
  // Map of taskId → sorted todo[]
  todosByTaskId: {},
  isLoading: false,
  error: null,

  // ── Fetch ──────────────────────────────────────────────────────────────────

  fetchTodos: async (taskId) => {
    set({ isLoading: true, error: null });
    try {
      const res = await getTodosApi(taskId);
      set((state) => ({
        todosByTaskId: { ...state.todosByTaskId, [taskId]: res.todos },
        isLoading: false,
      }));
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to fetch todos', isLoading: false });
    }
  },

  // ── Create ─────────────────────────────────────────────────────────────────

  createTodo: async (taskId, title) => {
    try {
      const res = await createTodoApi(taskId, { title });
      set((state) => {
        const existing = state.todosByTaskId[taskId] || [];
        // Avoid duplicate if socket already pushed it
        if (existing.some((t) => t.id === res.todo.id)) return state;
        return {
          todosByTaskId: { ...state.todosByTaskId, [taskId]: [...existing, res.todo] },
        };
      });
      return res.todo;
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to create todo' });
      throw err;
    }
  },

  // ── Toggle / Update ────────────────────────────────────────────────────────

  updateTodo: async (taskId, todoId, data) => {
    // Optimistic update
    set((state) => {
      const todos = state.todosByTaskId[taskId] || [];
      return {
        todosByTaskId: {
          ...state.todosByTaskId,
          [taskId]: todos.map((t) => (t.id === todoId ? { ...t, ...data } : t)),
        },
      };
    });

    try {
      const res = await updateTodoApi(taskId, todoId, data);
      set((state) => {
        const todos = state.todosByTaskId[taskId] || [];
        return {
          todosByTaskId: {
            ...state.todosByTaskId,
            [taskId]: todos.map((t) => (t.id === todoId ? res.todo : t)),
          },
        };
      });
      return res.todo;
    } catch (err) {
      // Roll back by re-fetching
      get().fetchTodos(taskId);
      set({ error: err.response?.data?.message || 'Failed to update todo' });
      throw err;
    }
  },

  // ── Delete ─────────────────────────────────────────────────────────────────

  deleteTodo: async (taskId, todoId) => {
    // Optimistic remove
    set((state) => ({
      todosByTaskId: {
        ...state.todosByTaskId,
        [taskId]: (state.todosByTaskId[taskId] || []).filter((t) => t.id !== todoId),
      },
    }));

    try {
      await deleteTodoApi(taskId, todoId);
    } catch (err) {
      get().fetchTodos(taskId);
      set({ error: err.response?.data?.message || 'Failed to delete todo' });
      throw err;
    }
  },

  // ── Socket listeners ───────────────────────────────────────────────────────

  setupTodoSocketListeners: () => {
    socket.on('task:todos:updated', ({ taskId, todos }) => {
      set((state) => {
        const existing = state.todosByTaskId[taskId] || [];
        // Merge: upsert each incoming todo
        const merged = [...existing];
        todos.forEach((incoming) => {
          const idx = merged.findIndex((t) => t.id === incoming.id);
          if (idx !== -1) merged[idx] = incoming;
          else merged.push(incoming);
        });
        merged.sort((a, b) => a.position - b.position);
        return { todosByTaskId: { ...state.todosByTaskId, [taskId]: merged } };
      });
    });

    socket.on('task:todo:deleted', ({ taskId, todoId }) => {
      set((state) => ({
        todosByTaskId: {
          ...state.todosByTaskId,
          [taskId]: (state.todosByTaskId[taskId] || []).filter((t) => t.id !== todoId),
        },
      }));
    });
  },

  teardownTodoSocketListeners: () => {
    socket.off('task:todos:updated');
    socket.off('task:todo:deleted');
  },

  clearTodos: () => set({ todosByTaskId: {}, error: null }),
}));

export default useTodoStore;
