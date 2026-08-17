import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../Card';
import Button from '../Button';
import Input from '../Input';
import ConfirmDialog from '../ConfirmDialog';
import useTaskStore from '../../store/taskStore';
import { getProjectMembersApi } from '../../api/invitation.api';

const TaskEditModal = ({ task, onClose }) => {
  const { updateTask } = useTaskStore();
  const [members, setMembers] = useState([]);
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || '');
  const [assigneeId, setAssigneeId] = useState(task.assignee?.id || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Fetch confirmed project members directly when modal opens
  useEffect(() => {
    const loadMembers = async () => {
      try {
        const response = await getProjectMembersApi(task.projectId);
        setMembers(response.members);
      } catch {
        // Members will remain empty — assignee dropdown shows "Unassigned" only
      }
    };
    loadMembers();
  }, [task.projectId]);

  const handleSave = async () => {
    if (!title.trim()) {
      setError('Title is required');
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      await updateTask(task.id, { 
        title: title.trim(), 
        description: description.trim() || undefined, 
        assigneeId: assigneeId || null 
      });
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update task');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <Card className="w-full max-w-lg shadow-lg border-gray-800 flex flex-col max-h-[90vh]">
        <CardHeader className="mb-4 shrink-0 border-b border-gray-800/50 pb-4">
          <CardTitle>Edit Task</CardTitle>
        </CardHeader>
        <CardContent className="overflow-y-auto p-6 flex flex-col gap-4">
          {error && <div className="text-red-400 text-sm">{error}</div>}
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Title</label>
            <Input 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              placeholder="Task title"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
            <textarea
              className="w-full bg-[var(--bg-color)] text-[var(--text-color)] border border-[var(--border-color)] rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors min-h-[100px] resize-y"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add a more detailed description..."
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Assignee</label>
            <select
              className="w-full bg-[var(--bg-color)] text-[var(--text-color)] border border-[var(--border-color)] rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              value={assigneeId}
              onChange={(e) => setAssigneeId(e.target.value)}
              disabled={isSubmitting}
            >
              <option value="">Unassigned</option>
              {members.map(member => (
                <option key={member.user.id} value={member.user.id}>
                  {member.user.username}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
        <CardFooter className="shrink-0 flex justify-end gap-3 pt-4 border-t border-gray-800/50">
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

const TaskCard = ({ task }) => {
  const { deleteTask } = useTaskStore();
  const [isEditing, setIsEditing] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteTask(task.id);
      setShowConfirmDelete(false);
    } catch {
      setIsDeleting(false);
    }
  };

  const getInitials = (name) => {
    return name?.substring(0, 2).toUpperCase() || '??';
  };

  return (
    <>
      <div 
        className="bg-[var(--card-bg)] p-3 rounded-md border border-[var(--border-color)] hover:border-gray-600 cursor-pointer group flex flex-col gap-2"
        onClick={() => setIsEditing(true)}
      >
        <div className="flex justify-between items-start gap-2">
          <h4 className="text-sm font-medium text-white break-words line-clamp-2">{task.title}</h4>
          <button 
            className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-400 p-1 shrink-0 transition-opacity rounded hover:bg-[var(--bg-color)]"
            onClick={(e) => {
              e.stopPropagation();
              setShowConfirmDelete(true);
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
          </button>
        </div>

        {task.description && (
          <p className="text-xs text-gray-400 line-clamp-2 mt-1">
            {task.description}
          </p>
        )}

        <div className="mt-2 flex items-center justify-end">
          {task.assignee ? (
            <div className="flex items-center gap-2" title={`Assigned to ${task.assignee.username}`}>
              <span className="text-xs text-gray-500">{task.assignee.username}</span>
              <div className="w-6 h-6 rounded-full bg-blue-900/50 text-blue-200 border border-blue-800 flex items-center justify-center text-[10px] font-bold">
                {getInitials(task.assignee.username)}
              </div>
            </div>
          ) : (
             <div className="flex items-center gap-2" title="Unassigned">
              <span className="text-xs text-gray-600 italic">Unassigned</span>
              <div className="w-6 h-6 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center text-[10px] text-gray-500 font-bold border-dashed">
                ?
              </div>
            </div>
          )}
        </div>
      </div>

      {isEditing && (
        <TaskEditModal task={task} onClose={() => setIsEditing(false)} />
      )}

      <ConfirmDialog
        isOpen={showConfirmDelete}
        title="Delete Task"
        description={`Are you sure you want to delete "${task.title}"? This action cannot be undone.`}
        confirmText={isDeleting ? 'Deleting...' : 'Delete'}
        cancelText="Cancel"
        isDestructive={true}
        isLoading={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setShowConfirmDelete(false)}
      />
    </>
  );
};

export default TaskCard;
