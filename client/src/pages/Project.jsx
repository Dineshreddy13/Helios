import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useProjectStore from '../store/projectStore';
import { Button } from '@/components/ui/button';
import Badge from '../components/Badge';
import Navbar from '../components/Navbar';
import ConfirmDialog from '../components/ConfirmDialog';
import ProjectMembers from '../components/ProjectMembers';
<<<<<<< HEAD
import ProjectReadme from '../components/ProjectReadme';
import Board from '../components/board/Board';
import useListStore from '../store/listStore';
import useTaskStore from '../store/taskStore';
=======
import { Card, CardContent } from '@/components/ui/card';
>>>>>>> 41ce5c5 (feat: scaffold client application with authentication pages and reusable UI components)

const Project = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { currentProject, isLoading, error, fetchProjectById, deleteProject, clearError } = useProjectStore();
  const { fetchLists, setupSocketListeners, teardownSocketListeners } = useListStore();
  const { fetchTasks, setupSocketListeners: setupTaskSockets, teardownSocketListeners: teardownTaskSockets } = useTaskStore();
  const [isDeleting, setIsDeleting] = useState(false);

  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  useEffect(() => {
    fetchProjectById(projectId);
    
    fetchLists(projectId).then(() => {
      setupSocketListeners(projectId);
    });

    fetchTasks(projectId).then(() => {
      setupTaskSockets(projectId);
    });

    return () => {
      clearError();
      teardownSocketListeners(projectId);
      teardownTaskSockets(projectId);
    };
  }, [projectId, fetchProjectById, clearError, fetchLists, setupSocketListeners, teardownSocketListeners, fetchTasks, setupTaskSockets, teardownTaskSockets]);

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
          Loading project...
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
        <div className="w-full max-w-7xl">

          {/* Navigation & Header */}
          <div className="mb-8">

            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold tracking-tight">{currentProject.name}</h1>
                  <Badge variant={currentProject.role}>
                    {currentProject.role}
                  </Badge>
                </div>
                <p className="text-gray-400 max-w-2xl">{currentProject.description || 'No description provided.'}</p>
              </div>

              {currentProject.role === 'owner' && (
                <Button
                  variant="destructive"
                  className="whitespace-nowrap"
                  onClick={confirmDelete}
                  disabled={isDeleting}
                >
                  {isDeleting ? 'Deleting...' : 'Delete Project'}
                </Button>
              )}
            </div>
<<<<<<< HEAD
            
            {currentProject.role === 'owner' && (
              <Button 
                variant="destructive" 
                className="whitespace-nowrap"
                onClick={confirmDelete}
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete Project'}
              </Button>
            )}
          </div>
        </div>

        {/* Global Error Display for actions on this page */}
        {error && (
          <div className="alert-error flex justify-between items-center mb-8">
            <span>{error}</span>
            <button onClick={clearError} className="text-red-400 hover:text-red-300">×</button>
          </div>
        )}

        {/* Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Main Content Area (Board) */}
          <div className="lg:col-span-3 min-h-[400px]">
            <Board projectId={projectId} />
            <ProjectReadme 
              projectId={projectId} 
              isOwner={currentProject.role === 'owner'} 
              initialReadme={currentProject.readme} 
            />
=======
>>>>>>> 41ce5c5 (feat: scaffold client application with authentication pages and reusable UI components)
          </div>

          {/* Global Error Display for actions on this page */}
          {error && (
            <div className="alert-error flex justify-between items-center mb-8">
              <span>{error}</span>
              <button onClick={clearError} className="text-red-400 hover:text-red-300">×</button>
            </div>
          )}

          {/* Content Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

            {/* Main Content Area (Board Placeholder) */}
            <div className="lg:col-span-3">
              <h2 className="text-xl font-semibold mb-4">Board</h2>
              <Card className="min-h-[400px] flex items-center justify-center border-dashed border-gray-800">
                <CardContent className="text-center text-gray-500">
                  <p>Board coming soon</p>
                  <p className="text-sm mt-1">Phase 4 implementation</p>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar Area (Members) */}
            <div className="lg:col-span-1">
              <ProjectMembers projectId={projectId} isOwner={currentProject.role === 'owner'} />
            </div>

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

export default Project;
