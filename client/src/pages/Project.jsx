import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import useProjectStore from '../store/projectStore';
import Button from '../components/Button';
import Badge from '../components/Badge';
import ConfirmDialog from '../components/ConfirmDialog';
import { Card, CardContent } from '../components/Card';

const Project = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { currentProject, isLoading, error, fetchProjectById, deleteProject, clearError } = useProjectStore();
  const [isDeleting, setIsDeleting] = useState(false);

  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  useEffect(() => {
    fetchProjectById(projectId);
    return () => clearError();
  }, [projectId, fetchProjectById, clearError]);

  const confirmDelete = () => {
    setShowConfirmDelete(true);
  };

  const executeDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteProject(projectId);
      setShowConfirmDelete(false);
      navigate('/dashboard', { replace: true });
    } catch (err) {
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
    <div className="page-container justify-start pt-8">
      <div className="w-full max-w-7xl">
        
        {/* Navigation & Header */}
        <div className="mb-8">
          <Link to="/dashboard" className="text-gray-400 hover:text-white transition-colors text-sm flex items-center gap-1 mb-6">
            &larr; Back to Dashboard
          </Link>
          
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

          {/* Sidebar Area (Members Placeholder) */}
          <div className="lg:col-span-1">
            <h2 className="text-xl font-semibold mb-4">Members</h2>
            <Card className="min-h-[200px] flex items-center justify-center border-dashed border-gray-800">
              <CardContent className="text-center text-gray-500">
                <p>Members section coming soon</p>
                <p className="text-sm mt-1">Phase 3 implementation</p>
              </CardContent>
            </Card>
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
  );
};

export default Project;
