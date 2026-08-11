import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import useAuthStore from '../store/authStore';
import useProjectStore from '../store/projectStore';
import { logoutApi } from '../api/auth.api';
import Button from '../components/Button';
import Input from '../components/Input';
import Badge from '../components/Badge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/Card';

const CreateProjectForm = ({ onSubmit, onCancel, isLoading }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: { name: '', description: '' }
  });

  return (
    <Card className="mb-8 border-gray-800">
      <CardHeader>
        <CardTitle>Create New Project</CardTitle>
        <CardDescription>Enter the details for your new project.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Input
            id="name"
            label="Project Name"
            placeholder="My Awesome Project"
            {...register('name', { 
              required: 'Project name is required',
              minLength: { value: 3, message: 'Must be at least 3 characters' },
              maxLength: { value: 100, message: 'Must be at most 100 characters' }
            })}
            error={errors.name?.message}
          />
          <Input
            id="description"
            label="Description (Optional)"
            placeholder="Brief description of what this project is about"
            {...register('description', {
              maxLength: { value: 500, message: 'Must be at most 500 characters' }
            })}
            error={errors.description?.message}
          />
          <div className="flex gap-3 mt-4">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Creating...' : 'Create Project'}
            </Button>
            <Button type="button" variant="secondary" onClick={onCancel} disabled={isLoading}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

const Dashboard = () => {
  const { user, logout } = useAuthStore();
  const { projects, isLoading, error, fetchProjects, createProject, clearError } = useProjectStore();
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logoutApi();
    } catch {
    } finally {
      logout();
      navigate('/', { replace: true });
    }
  };

  const handleCreateProject = async (data) => {
    try {
      await createProject(data);
      setIsCreating(false);
    } catch (err) {
      // Error is handled by the store and displayed below
    }
  };

  const handleProjectClick = (projectId) => {
    navigate(`/projects/${projectId}`);
  };

  return (
    <div className="page-container justify-start pt-8">
      <div className="w-full max-w-7xl">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end mb-10 gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-2">Projects</h1>
            <p className="text-gray-400">Welcome back, {user?.username}. Manage your projects here.</p>
          </div>
          <div className="flex gap-3">
            {!isCreating && (
              <Button onClick={() => setIsCreating(true)}>New Project</Button>
            )}
            <Button variant="secondary" onClick={handleLogout} disabled={isLoggingOut}>
              {isLoggingOut ? 'Logging out...' : 'Logout'}
            </Button>
          </div>
        </div>

        {error && (
          <div className="alert-error flex justify-between items-center mb-6">
            <span>{error}</span>
            <button onClick={clearError} className="text-red-400 hover:text-red-300">×</button>
          </div>
        )}

        {/* Create Form */}
        {isCreating && (
          <CreateProjectForm 
            onSubmit={handleCreateProject} 
            onCancel={() => {
              setIsCreating(false);
              clearError();
            }} 
            isLoading={isLoading} 
          />
        )}

        {/* Project List */}
        {isLoading && !isCreating && projects.length === 0 ? (
          <div className="text-center py-12 text-gray-500">Loading projects...</div>
        ) : projects.length === 0 && !isCreating ? (
          <Card className="text-center py-16 border-dashed border-gray-800">
            <CardContent>
              <h3 className="text-xl font-medium text-white mb-2">No projects yet</h3>
              <p className="text-gray-400 mb-6">Create your first project to get started.</p>
              <Button onClick={() => setIsCreating(true)}>Create a Project</Button>
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
  );
};

export default Dashboard;
