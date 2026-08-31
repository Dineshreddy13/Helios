import { create } from 'zustand';
import {
  createProjectApi,
  deleteProjectApi,
  getProjectByIdApi,
  getProjectsApi,
  updateProjectReadmeApi,
} from '../api/project.api';

const useProjectStore = create((set, get) => ({
  projects: [],
  currentProject: null,
  isLoading: false,
  error: null,

  fetchProjects: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await getProjectsApi();
      set({ projects: response.projects, isLoading: false });
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Failed to fetch projects', 
        isLoading: false 
      });
    }
  },

  fetchProjectById: async (projectId) => {
    set((state) => ({ 
      isLoading: true, 
      error: null, 
      currentProject: state.currentProject?.id === projectId ? state.currentProject : null 
    }));
    try {
      const response = await getProjectByIdApi(projectId);
      set({ currentProject: response.project, isLoading: false });
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Failed to fetch project details', 
        isLoading: false 
      });
    }
  },

  createProject: async (projectData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await createProjectApi(projectData);
      set((state) => ({ 
        projects: [response.project, ...state.projects], 
        isLoading: false 
      }));
      return response.project;
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Failed to create project', 
        isLoading: false 
      });
      throw error;
    }
  },

  deleteProject: async (projectId) => {
    set({ isLoading: true, error: null });
    try {
      await deleteProjectApi(projectId);
      set((state) => ({
        projects: state.projects.filter((p) => p.id !== projectId),
        currentProject: state.currentProject?.id === projectId ? null : state.currentProject,
        isLoading: false
      }));
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Failed to delete project', 
        isLoading: false 
      });
      throw error;
    }
  },

  updateProjectReadme: async (projectId, readme) => {
    set({ isLoading: true, error: null });
    try {
      const response = await updateProjectReadmeApi(projectId, readme);
      set((state) => ({
        currentProject: state.currentProject?.id === projectId 
          ? { ...state.currentProject, readme: response.project.readme } 
          : state.currentProject,
        isLoading: false
      }));
      return response.project;
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Failed to update readme', 
        isLoading: false 
      });
      throw error;
    }
  },

  clearCurrentProject: () => set({ currentProject: null }),
  clearError: () => set({ error: null })
}));

export default useProjectStore;
