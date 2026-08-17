import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import useProjectStore from '../store/projectStore';
import Button from './Button';
import Input from './Input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './Card';

const CreateProjectModal = ({ isOpen, onClose }) => {
  const { createProject, isLoading, error, clearError } = useProjectStore();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm({
    defaultValues: { name: '', description: '', includeReadme: false }
  });

  useEffect(() => {
    if (isOpen) {
      clearError();
      reset({ name: '', description: '', includeReadme: false });
    }
  }, [isOpen, clearError, reset]);

  const onSubmit = async (data) => {
    try {
      const newProject = await createProject(data);
      onClose();
      navigate(`/projects/${newProject.id}`);
    } catch (err) {
      // Error is handled by the store and displayed below
    }
  };

  const handleCancel = () => {
    clearError();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl">
        {error && (
          <div className="alert-error flex justify-between items-center mb-6">
            <span>{error}</span>
            <button onClick={clearError} className="text-red-400 hover:text-red-300">×</button>
          </div>
        )}

        <Card className="shadow-lg border-gray-800">
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
              
              <div className="flex items-center mt-4">
                <input
                  type="checkbox"
                  id="includeReadme"
                  className="w-4 h-4 text-blue-600 bg-gray-800 border-gray-700 rounded focus:ring-blue-500 focus:ring-offset-gray-900"
                  {...register('includeReadme')}
                />
                <label htmlFor="includeReadme" className="ml-2 text-sm font-medium text-gray-300">
                  Include Readme
                </label>
              </div>

              <div className="flex gap-3 mt-6">
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Creating...' : 'Create Project'}
                </Button>
                <Button type="button" variant="secondary" onClick={handleCancel} disabled={isLoading}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CreateProjectModal;
