import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Button from './Button';
import useProjectStore from '../store/projectStore';
import { Card, CardHeader, CardTitle, CardContent } from './Card';

const ProjectReadme = ({ projectId, isOwner, initialReadme }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(initialReadme || '');
  const { updateProjectReadme, isLoading } = useProjectStore();

  const handleSave = async () => {
    try {
      await updateProjectReadme(projectId, content);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update readme:', error);
    }
  };

  const handleCancel = () => {
    setContent(initialReadme || '');
    setIsEditing(false);
  };

  if (!initialReadme && !isOwner) {
    return null;
  }

  return (
    <Card className="mt-8 border-gray-800 bg-gray-900/50">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>README</CardTitle>
        {isOwner && !isEditing && (
          <Button variant="secondary" size="sm" onClick={() => setIsEditing(true)}>
            Edit Readme
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <div className="flex flex-col gap-4">
            <textarea
              className="w-full h-64 p-4 text-sm bg-gray-950 border border-gray-800 rounded-md focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-mono text-gray-300 resize-y"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="# Project Readme"
            />
            <div className="flex gap-2 justify-end">
              <Button variant="secondary" onClick={handleCancel} disabled={isLoading}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={isLoading}>
                {isLoading ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </div>
        ) : (
          <div className="prose prose-invert prose-blue max-w-none">
            {initialReadme ? (
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {initialReadme}
              </ReactMarkdown>
            ) : (
              <p className="text-gray-500 italic">No readme added yet. Click 'Edit Readme' to create one.</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProjectReadme;
