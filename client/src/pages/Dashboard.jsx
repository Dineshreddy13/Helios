import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useProjectStore from '../store/projectStore';
import Button from '../components/Button';
import Badge from '../components/Badge';
import Navbar from '../components/Navbar';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/Card';

const Dashboard = () => {
  const { projects, isLoading, error, fetchProjects, clearError } = useProjectStore();
  const navigate = useNavigate();

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleProjectClick = (projectId) => {
    navigate(`/projects/${projectId}`);
  };

  return (
    <>
      <Navbar />
      <div className="page-container justify-start pt-8 pb-12 min-h-[calc(100vh-65px)]">
        <div className="w-full max-w-7xl">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end mb-10 gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight mb-2">Projects</h1>
              <p className="text-gray-400">Manage your projects here.</p>
            </div>
            <div className="flex gap-3">
              <Button onClick={() => navigate('/projects/new')}>New Project</Button>
            </div>
          </div>

        {error && (
          <div className="alert-error flex justify-between items-center mb-6">
            <span>{error}</span>
            <button onClick={clearError} className="text-red-400 hover:text-red-300">×</button>
          </div>
        )}

        {/* Project List */}
        {isLoading && projects.length === 0 ? (
          <div className="text-center py-12 text-gray-500">Loading projects...</div>
        ) : projects.length === 0 ? (
          <Card className="text-center py-16 border-dashed border-gray-800">
            <CardContent>
              <h3 className="text-xl font-medium text-white mb-2">No projects yet</h3>
              <p className="text-gray-400 mb-6">Create your first project to get started.</p>
              <Button onClick={() => navigate('/projects/new')}>Create a Project</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <Card 
                key={project.id} 
                className="cursor-pointer hover:border-gray-600 transition-colors flex flex-col group"
                onClick={() => handleProjectClick(project.id)}
              >
                <CardHeader className="mb-4">
                  <div className="flex justify-between items-start mb-2">
                    <CardTitle className="text-lg group-hover:text-[var(--primary-color)] transition-colors line-clamp-1">
                      {project.name}
                    </CardTitle>
                    <Badge variant={project.role}>
                      {project.role}
                    </Badge>
                  </div>
                  <CardDescription className="line-clamp-2 min-h-[2.5rem]">
                    {project.description || 'No description provided.'}
                  </CardDescription>
                </CardHeader>
                <div className="mt-auto pt-4 border-t border-gray-800/50 text-xs text-gray-500">
                  Updated {new Date(project.updatedAt).toLocaleDateString()}
                </div>
              </Card>
            ))}
          </div>
        )}

      </div>
    </div>
    </>
  );
};

export default Dashboard;
