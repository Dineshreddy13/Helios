import api from './axios';

export const createTaskApi = async (listId, data) => {
  const { data: res } = await api.post(`/api/v1/projects/lists/${listId}/tasks`, data);
  return res;
};

export const getTasksApi = async (projectId) => {
  const { data: res } = await api.get(`/api/v1/projects/${projectId}/tasks`);
  return res;
};

export const updateTaskApi = async (taskId, data) => {
  const { data: res } = await api.patch(`/api/v1/projects/tasks/${taskId}`, data);
  return res;
};

export const deleteTaskApi = async (taskId) => {
  const { data: res } = await api.delete(`/api/v1/projects/tasks/${taskId}`);
  return res;
};

export const moveTaskApi = async (taskId, data) => {
  const { data: res } = await api.patch(`/api/v1/projects/tasks/${taskId}/move`, data);
  return res;
};

export const uploadTaskFilesApi = async (taskId, formData) => {
  const { data: res } = await api.post(`/api/v1/projects/tasks/${taskId}/files`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return res;
};

export const deleteTaskFileApi = async (taskId, fileId) => {
  const { data: res } = await api.delete(`/api/v1/projects/tasks/${taskId}/files/${fileId}`);
  return res;
};

export const addDependencyApi = async (taskId, data) => {
  const { data: res } = await api.post(`/api/v1/projects/tasks/${taskId}/dependencies`, data);
  return res;
};

export const removeDependencyApi = async (taskId, blockingTaskId) => {
  const { data: res } = await api.delete(`/api/v1/projects/tasks/${taskId}/dependencies/${blockingTaskId}`);
  return res;
};

export const getDependenciesApi = async (taskId) => {
  const { data: res } = await api.get(`/api/v1/projects/tasks/${taskId}/dependencies`);
  return res;
};

// ── Todo (Subtask) APIs ────────────────────────────────────────────────────

export const getTodosApi = async (taskId) => {
  const { data: res } = await api.get(`/api/v1/projects/tasks/${taskId}/todos`);
  return res;
};

export const createTodoApi = async (taskId, data) => {
  const { data: res } = await api.post(`/api/v1/projects/tasks/${taskId}/todos`, data);
  return res;
};

export const updateTodoApi = async (taskId, todoId, data) => {
  const { data: res } = await api.patch(`/api/v1/projects/tasks/${taskId}/todos/${todoId}`, data);
  return res;
};

export const deleteTodoApi = async (taskId, todoId) => {
  const { data: res } = await api.delete(`/api/v1/projects/tasks/${taskId}/todos/${todoId}`);
  return res;
};
