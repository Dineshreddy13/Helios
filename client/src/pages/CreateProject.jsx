import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import useProjectStore from '../store/projectStore';
import Navbar from '../components/Navbar';
import Button from '../components/Button';
import Input from '../components/Input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/Card';

const CreateProject = () => {
  const { createProject, isLoading, error, clearError } = useProjectStore();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: { name: '', description: '' }
  });

  useEffect(() => {
    return () => clearError();
  }, [clearError]);

  const onSubmit = async (data) => {
    try {
      const newProject = await createProject(data);
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
      <div className="page-container justify-center items-center pt-8 pb-12 min-h-[calc(100vh-65px)]">
        <div className="w-full max-w-2xl">
          {error && (
            <div className="alert-error flex justify-between items-center mb-6">
              <span>{error}</span>
              <button onClick={clearError} className="text-red-400 hover:text-red-300">×</button>
            </div>
          )}

          <Card className="border-gray-800">
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
    </>
  );
};

export default CreateProject;
