import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import useProjectStore from '../store/projectStore';
import Navbar from '../components/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

const CreateProject = () => {
  const { createProject, isLoading, error, clearError } = useProjectStore();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: { name: '', description: '', initializeReadme: false }
  });

  useEffect(() => {
    return () => clearError();
  }, [clearError]);

  const onSubmit = async (data) => {
    try {
      const { initializeReadme, ...rest } = data;
      const newProject = await createProject({ ...rest, includeReadme: !!initializeReadme });
      navigate(`/projects/${newProject.id}`);
    } catch (err) {
      // Error is handled by the store and displayed below
    }
  };

  const handleCancel = () => {
    clearError();
    navigate('/dashboard');
  };

  return (
    <>
      <Navbar />
      <div className="flex flex-col items-center px-4 sm:px-6 justify-start pt-8 pb-12 min-h-[calc(100vh-65px)] w-full">
        <div className="w-full max-w-2xl">
          {error && (
            <div className="alert-error flex justify-between items-center mb-6">
              <span>{error}</span>
              <button onClick={clearError} className="text-red-400 hover:text-red-300">×</button>
            </div>
          )}

          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight mb-2">Create New Project</h1>
            <p className="text-muted-foreground">Enter the details for your new project.</p>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Project Name</Label>
              <Input
                id="name"
                placeholder="My Awesome Project"
                {...register('name', { 
                  required: 'Project name is required',
                  minLength: { value: 3, message: 'Must be at least 3 characters' },
                  maxLength: { value: 100, message: 'Must be at most 100 characters' }
                })}
              />
              {errors.name && <p className="text-[0.8rem] font-medium text-destructive">{errors.name.message}</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                placeholder="Brief description of what this project is about"
                {...register('description', {
                  maxLength: { value: 500, message: 'Must be at most 500 characters' }
                })}
              />
              {errors.description && <p className="text-[0.8rem] font-medium text-destructive">{errors.description.message}</p>}
            </div>

            <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-800 rounded-lg">
              <div className="space-y-0.5">
                <div className="text-base font-medium">Initialize with README</div>
                <div className="text-sm text-muted-foreground">
                  Creates a basic README.md file for your project.
                </div>
              </div>
              <div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    {...register('initializeReadme')} 
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-white peer-checked:dark:bg-white peer-checked:after:bg-black"></div>
                </label>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Creating...' : 'Create Project'}
              </Button>
              <Button type="button" variant="secondary" onClick={handleCancel} disabled={isLoading}>
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default CreateProject;
