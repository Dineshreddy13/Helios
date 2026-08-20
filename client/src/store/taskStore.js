import { create } from 'zustand';
import {
  createTaskApi,
  deleteTaskApi,
  getTasksApi,
  moveTaskApi,
  updateTaskApi,
  uploadTaskFilesApi,
  deleteTaskFileApi,
} from '../api/task.api';
import socket from '../lib/socket';

const sortByPosition = (tasks) => [...tasks].sort((a, b) => a.position - b.position);

const useTaskStore = create((set, get) => ({
  tasksByListId: {},
  isLoading: false,
  error: null,

  fetchTasks: async (projectId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await getTasksApi(projectId);
      
      const grouped = {};
      response.tasks.forEach(task => {
        if (!grouped[task.listId]) grouped[task.listId] = [];
        grouped[task.listId].push(task);
      });

      Object.keys(grouped).forEach(listId => {
        grouped[listId] = sortByPosition(grouped[listId]);
      });

      set({ tasksByListId: grouped, isLoading: false });
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Failed to fetch tasks',
        isLoading: false,
      });
    }
  },

  createTask: async (listId, data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await createTaskApi(listId, data);
      set((state) => {
        const listTasks = state.tasksByListId[listId] || [];
        if (listTasks.some((t) => t.id === response.task.id)) {
          return { isLoading: false };
        }
        return {
          tasksByListId: {
            ...state.tasksByListId,
            [listId]: sortByPosition([...listTasks, response.task]),
          },
          isLoading: false,
        };
      });
      return response.task;
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Failed to create task',
        isLoading: false,
      });
      throw error;
    }
  },

  updateTask: async (taskId, data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await updateTaskApi(taskId, data);
      set((state) => {
        const listId = response.task.listId;
        const listTasks = state.tasksByListId[listId] || [];
        return {
          tasksByListId: {
            ...state.tasksByListId,
            [listId]: listTasks.map((t) => (t.id === taskId ? response.task : t)),
          },
          isLoading: false,
        };
      });
      return response.task;
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Failed to update task',
        isLoading: false,
      });
      throw error;
    }
  },

  deleteTask: async (taskId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await deleteTaskApi(taskId);
      set((state) => {
        const listTasks = state.tasksByListId[response.listId] || [];
        return {
          tasksByListId: {
            ...state.tasksByListId,
            [response.listId]: listTasks.filter((t) => t.id !== taskId),
          },
          isLoading: false,
        };
      });
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Failed to delete task',
        isLoading: false,
      });
      throw error;
    }
  },

  uploadTaskFiles: async (taskId, files) => {
    set({ isLoading: true, error: null });
    try {
      const formData = new FormData();
      Array.from(files).forEach((file) => {
        formData.append('files', file);
      });
      const response = await uploadTaskFilesApi(taskId, formData);
      set((state) => {
        const listId = response.task.listId;
        const listTasks = state.tasksByListId[listId] || [];
        return {
          tasksByListId: {
            ...state.tasksByListId,
            [listId]: listTasks.map((t) => (t.id === taskId ? response.task : t)),
          },
          isLoading: false,
        };
      });
      return response.task;
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Failed to upload files',
        isLoading: false,
      });
      throw error;
    }
  },

  deleteTaskFile: async (taskId, fileId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await deleteTaskFileApi(taskId, fileId);
      set((state) => {
        const listId = response.task.listId;
        const listTasks = state.tasksByListId[listId] || [];
        return {
          tasksByListId: {
            ...state.tasksByListId,
            [listId]: listTasks.map((t) => (t.id === taskId ? response.task : t)),
          },
          isLoading: false,
        };
      });
      return response.task;
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Failed to delete file',
        isLoading: false,
      });
      throw error;
    }
  },

  moveTask: async (taskId, sourceListId, targetListId, targetPosition) => {
    const previousTasksByListId = get().tasksByListId;
    
    // Optimistic update
    const nextTasksByListId = { ...previousTasksByListId };
    const sourceTasks = [...(nextTasksByListId[sourceListId] || [])];
    const targetTasks = sourceListId === targetListId ? sourceTasks : [...(nextTasksByListId[targetListId] || [])];
    
    const taskIndex = sourceTasks.findIndex(t => t.id === taskId);
    if (taskIndex !== -1) {
      const [task] = sourceTasks.splice(taskIndex, 1);
      const optimisticTask = { ...task, listId: targetListId };
      targetTasks.splice(targetPosition, 0, optimisticTask);
      
      // Update positions
      if (sourceListId === targetListId) {
        sourceTasks.forEach((t, i) => t.position = i);
        nextTasksByListId[sourceListId] = sourceTasks;
      } else {
        sourceTasks.forEach((t, i) => t.position = i);
        targetTasks.forEach((t, i) => t.position = i);
        nextTasksByListId[sourceListId] = sourceTasks;
        nextTasksByListId[targetListId] = targetTasks;
      }
      
      set({ tasksByListId: nextTasksByListId });
    }

    try {
      const response = await moveTaskApi(taskId, { targetListId, targetPosition });
      
      // Reconcile with server truth
      set((state) => {
         const tasks = [...(state.tasksByListId[targetListId] || [])];
         const index = tasks.findIndex(t => t.id === taskId);
         if (index !== -1) {
           tasks[index] = response.task;
           return { tasksByListId: { ...state.tasksByListId, [targetListId]: tasks } };
         }
         return state;
      });
    } catch (error) {
      // Roll back on failure
      set({
        tasksByListId: previousTasksByListId,
        error: error.response?.data?.message || 'Failed to move task',
      });
      throw error;
    }
  },

  // ── Socket listeners ────────────────────────────────────────────────────

  setupSocketListeners: (projectId) => {
    socket.emit('joinProject', { projectId });

    socket.on('task:created', (task) => {
      set((state) => {
        const listTasks = state.tasksByListId[task.listId] || [];
        if (listTasks.some((t) => t.id === task.id)) return state;
        const newTasks = sortByPosition([...listTasks, task]);
        return { tasksByListId: { ...state.tasksByListId, [task.listId]: newTasks } };
      });
    });

    socket.on('task:updated', (task) => {
      set((state) => {
        const listTasks = state.tasksByListId[task.listId] || [];
        const index = listTasks.findIndex((t) => t.id === task.id);
        if (index === -1) return state;
        const newTasks = [...listTasks];
        newTasks[index] = task;
        return { tasksByListId: { ...state.tasksByListId, [task.listId]: newTasks } };
      });
    });

    socket.on('task:deleted', ({ taskId, listId }) => {
      set((state) => {
        const listTasks = state.tasksByListId[listId] || [];
        if (!listTasks.some(t => t.id === taskId)) return state;
        const newTasks = listTasks.filter((t) => t.id !== taskId);
        return { tasksByListId: { ...state.tasksByListId, [listId]: newTasks } };
      });
    });

    socket.on('task:moved', ({ task, sourceListId, targetListId }) => {
      set((state) => {
        const currentTargetTasks = state.tasksByListId[targetListId] || [];
        const existingTaskInTarget = currentTargetTasks.find(t => t.id === task.id);
        
        // Guard against double applying the optimistic update
        if (existingTaskInTarget && existingTaskInTarget.position === task.position) {
            return state;
        }

        const nextTasksByListId = { ...state.tasksByListId };
        
        const sourceTasks = nextTasksByListId[sourceListId] || [];
        nextTasksByListId[sourceListId] = sourceTasks.filter(t => t.id !== task.id);
        
        const targetTasks = sourceListId === targetListId ? nextTasksByListId[sourceListId] : (nextTasksByListId[targetListId] || []);
        const filteredTargetTasks = targetTasks.filter(t => t.id !== task.id);
        
        filteredTargetTasks.splice(task.position, 0, task);
        
        filteredTargetTasks.forEach((t, i) => t.position = i);
        nextTasksByListId[targetListId] = filteredTargetTasks;

        if (sourceListId !== targetListId) {
            nextTasksByListId[sourceListId].forEach((t, i) => t.position = i);
        }

        return { tasksByListId: nextTasksByListId };
      });
    });
  },

  teardownSocketListeners: (projectId) => {
    socket.emit('leaveProject', { projectId });
    socket.off('task:created');
    socket.off('task:updated');
    socket.off('task:deleted');
    socket.off('task:moved');
  },

  clearError: () => set({ error: null }),
  clearTasks: () => set({ tasksByListId: {}, error: null }),
}));

export default useTaskStore;
