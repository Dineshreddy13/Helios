import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useProjectStore from '../store/projectStore';
import Navbar from '../components/Navbar';
import ConfirmDialog from '../components/ConfirmDialog';
import { Button } from '@/components/ui/button';
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "@/components/ui/item"
import InvitePeople from '../components/InvitePeople';

const Settings = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { currentProject, isLoading, error, fetchProjectById, deleteProject, clearError } = useProjectStore();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  useEffect(() => {
    if (!currentProject || currentProject.id !== projectId) {
      fetchProjectById(projectId);
    }
  }, [projectId, currentProject, fetchProjectById]);

  const confirmDelete = () => {
    setShowConfirmDelete(true);
  };

  const executeDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteProject(projectId);
      setShowConfirmDelete(false);
      navigate('/dashboard', { replace: true });
    } catch {
      setIsDeleting(false);
      setShowConfirmDelete(false);
    }
  };

  if (isLoading && !currentProject) {
    return (
      <div className="page-container justify-start pt-8">
        <div className="w-full max-w-7xl text-center text-gray-500 py-12">
          Loading settings...
        </div>
      </div>
    );
  }

  if (error && !currentProject) {
    return (
      <div className="page-container justify-start pt-8">
        <div className="w-full max-w-7xl">
          <div className="alert-error flex justify-between items-center mb-4">
            <span>{error}</span>
          </div>
          <Button variant="secondary" onClick={() => navigate('/dashboard')}>Back to Dashboard</Button>
        </div>
      </div>
    );
  }

  if (!currentProject) {
    return null;
  }

  return (
    <>
      <Navbar />
      <div className="flex flex-col items-center px-4 sm:px-6 justify-start pt-8 pb-12 min-h-[calc(100vh-65px)] w-full">
        <div className="w-full max-w-4xl">
          <h1 className="text-3xl font-bold tracking-tight mb-8">Project Settings</h1>
          
          <div className="space-y-8">
            {/* Global Error Display */}
            {error && (
              <div className="alert-error flex justify-between items-center mb-8">
                <span>{error}</span>
                <button onClick={clearError} className="text-red-400 hover:text-red-300">×</button>
              </div>
            )}

            {/* Owner Section */}
            {currentProject.role === 'owner' && (
              <div className="flex flex-col gap-12">
                <InvitePeople projectId={currentProject.id} />

                <div>
                  <h3 className="text-lg font-semibold mb-4 text-red-500">Danger Zone</h3>
                  <div className="flex w-full flex-col gap-6">
                  <Item variant="outline" className="border-red-500/30 bg-red-500/5">
                    <ItemContent>
                      <ItemTitle className="text-red-500">Delete Project</ItemTitle>
                      <ItemDescription className="text-red-400">
                        Permanently delete this project and all its data. This action cannot be undone.
                      </ItemDescription>
                    </ItemContent>
                    <ItemActions>
                      <Button variant="destructive" size="sm" onClick={confirmDelete} disabled={isDeleting}>
                        {isDeleting ? 'Deleting...' : 'Delete Project'}
                      </Button>
                    </ItemActions>
                  </Item>
                </div>
              </div>
              </div>
            )}

            {currentProject.role !== 'owner' && (
              <div className="text-muted-foreground p-4 bg-muted rounded-md border border-border">
                Only the project owner can access settings.
              </div>
            )}
          </div>

          <ConfirmDialog
            isOpen={showConfirmDelete}
            title="Delete Project"
            description={`Are you sure you want to delete "${currentProject.name}"? This action cannot be undone and all lists and tasks will be permanently removed.`}
            confirmText={isDeleting ? 'Deleting...' : 'Delete'}
            cancelText="Cancel"
            isDestructive={true}
            isLoading={isDeleting}
            onConfirm={executeDelete}
            onCancel={() => setShowConfirmDelete(false)}
          />

        </div>
      </div>
    </>
  );
};

export default Settings;
