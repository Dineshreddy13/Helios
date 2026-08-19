import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useProjectStore from '../store/projectStore';
import { Button } from '@/components/ui/button';
import Badge from '../components/Badge';
import Navbar from '../components/Navbar';
import ConfirmDialog from '../components/ConfirmDialog';
import ProjectMembers from '../components/ProjectMembers';
import ProjectReadme from '../components/ProjectReadme';
import Board from '../components/board/Board';
import useListStore from '../store/listStore';
import useTaskStore from '../store/taskStore';

const Project = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { currentProject, isLoading, error, fetchProjectById, clearError } = useProjectStore();
  const { fetchLists, setupSocketListeners, teardownSocketListeners } = useListStore();
  const { fetchTasks, setupSocketListeners: setupTaskSockets, teardownSocketListeners: teardownTaskSockets } = useTaskStore();

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
              </div>
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
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            
            {/* Main Content Area (Board) */}
            <div className="lg:col-span-4 min-h-[400px]">
              <Board projectId={projectId} />
              <ProjectReadme 
                projectId={projectId} 
                isOwner={currentProject.role === 'owner'} 
                initialReadme={currentProject.readme} 
              />
            </div>

            {/* Sidebar Area (Description & Members) */}
            <div className="lg:col-span-1 flex flex-col gap-8">
              <div>
                <h3 className="text-lg font-semibold mb-3">About</h3>
                <p className="text-gray-400 text-sm">{currentProject.description || 'No description provided.'}</p>
              </div>
              <ProjectMembers projectId={projectId} isOwner={currentProject.role === 'owner'} />
            </div>

          </div>


        </div>
      </div>
    </>
  );
};

export default Project;
