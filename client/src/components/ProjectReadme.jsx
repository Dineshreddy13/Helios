import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import useProjectStore from '../store/projectStore';
import { Pencil, Eye, Edit2 } from 'lucide-react';

const ProjectReadme = ({ projectId, isOwner, initialReadme }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('edit');
  const [content, setContent] = useState(initialReadme || '');
  const { updateProjectReadme, isLoading } = useProjectStore();

  useEffect(() => {
    setContent(initialReadme || '');
  }, [initialReadme]);

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

  if (!initialReadme && isOwner && !isEditing) {
    return (
      <div className="mt-8 flex justify-center border border-dashed border-border/60 rounded-xl p-8 bg-card/20 hover:bg-card/50 transition-colors">
        <Button variant="outline" onClick={() => setIsEditing(true)} className="gap-2 text-muted-foreground hover:text-foreground">
          <Pencil className="w-4 h-4" /> Add README
        </Button>
      </div>
    );
  }

  return (
    <>
      {initialReadme && (
        <div className="mt-8 rounded-xl border border-border bg-card">
          <div className="flex items-center justify-between px-6 py-4 border-b border-border">
            <h3 className="text-base font-semibold tracking-tight">README</h3>
            {isOwner && (
              <Button variant="ghost" size="icon" onClick={() => setIsEditing(true)} title="Edit Readme">
                <Pencil className="w-4 h-4 text-muted-foreground hover:text-foreground" />
              </Button>
            )}
          </div>
          <div className="p-6">
            <div className="prose prose-neutral dark:prose-invert prose-sm max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {initialReadme}
              </ReactMarkdown>
            </div>
          </div>
        </div>
      )}

      {isEditing && (
        <div className="fixed inset-0 z-50 bg-background flex flex-col animate-in fade-in duration-200">
          <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-card">
            <div className="flex items-center gap-6">
              <h3 className="text-lg font-semibold tracking-tight">Edit README</h3>
              
              <Button 
                variant="outline" 
                size="sm" 
                className="gap-2"
                onClick={() => setActiveTab(activeTab === 'edit' ? 'preview' : 'edit')}
              >
                {activeTab === 'edit' ? (
                  <><Eye className="w-4 h-4" /> Preview</>
                ) : (
                  <><Edit2 className="w-4 h-4" /> Edit</>
                )}
              </Button>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" onClick={handleCancel} disabled={isLoading}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={isLoading}>
                {isLoading ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </div>
          
          <div className="flex-1 overflow-hidden flex bg-muted/10">
            {activeTab === 'edit' ? (
              <div className="flex-1 flex-col p-6 overflow-y-auto flex">
                <Textarea
                  className="flex-1 font-mono text-sm resize-none border-0 rounded-none focus-visible:ring-0 bg-transparent p-0 shadow-none h-full"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="# Project Readme"
                  autoFocus
                />
              </div>
            ) : (
              <div className="flex-1 flex-col p-6 overflow-y-auto bg-background flex">
                <div className="prose prose-neutral dark:prose-invert prose-sm max-w-none w-full max-w-3xl mx-auto">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {content || '*No content*'}
                  </ReactMarkdown>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default ProjectReadme;
