import { create } from 'zustand';
import {
  getMyInvitationsApi,
  getProjectInvitationsApi,
  getProjectMembersApi,
  inviteUserApi,
  respondToInvitationApi,
} from '../api/invitation.api';

const useInvitationStore = create((set) => ({
  myInvitations: [],
  projectInvitations: [],
  projectMembers: [],
  isLoading: false,
  error: null,

  fetchMyInvitations: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await getMyInvitationsApi();
      set({ myInvitations: response.invitations, isLoading: false });
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Failed to fetch invitations',
        isLoading: false,
      });
    }
  },

  respondToInvitation: async (invitationId, response) => {
    set({ isLoading: true, error: null });
    try {
      await respondToInvitationApi(invitationId, response);
      set((state) => ({
        myInvitations: state.myInvitations.filter((inv) => inv.id !== invitationId),
        isLoading: false,
      }));
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Failed to respond to invitation',
        isLoading: false,
      });
      throw error;
    }
  },

  fetchProjectMembers: async (projectId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await getProjectMembersApi(projectId);
      set({ projectMembers: response.members, isLoading: false });
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Failed to fetch project members',
        isLoading: false,
      });
    }
  },

  fetchProjectInvitations: async (projectId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await getProjectInvitationsApi(projectId);
      set({ projectInvitations: response.invitations, isLoading: false });
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Failed to fetch project invitations',
        isLoading: false,
      });
    }
  },

  inviteUser: async (projectId, invitedUserId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await inviteUserApi(projectId, invitedUserId);
      set((state) => ({
        projectInvitations: [...state.projectInvitations, response.invitation],
        isLoading: false,
      }));
      return response.invitation;
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Failed to send invitation',
        isLoading: false,
      });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));

export default useInvitationStore;
