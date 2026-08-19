import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import ConfirmDialog from '../ConfirmDialog';
import useTaskStore from '../../store/taskStore';
import { getProjectMembersApi } from '../../api/invitation.api';
import { Trash2, CircleCheckBig } from 'lucide-react';

const TaskEditModal = ({ task, onClose }) => {
  const { updateTask } = useTaskStore();
  const [members, setMembers] = useState([]);
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || '');
  const [assigneeId, setAssigneeId] = useState(task.assignee?.id || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

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
      <div className="w-full max-w-lg bg-card border border-border rounded-2xl shadow-xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-border shrink-0 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Edit Task</h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-muted transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-6 flex flex-col gap-5">
          {error && (
            <p className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2">{error}</p>
          )}

          <div className="space-y-2">
            <Label htmlFor="task-title">Title</Label>
            <Input
              id="task-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Task title"
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="task-desc">Description</Label>
            <Textarea
              id="task-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add a more detailed description..."
              disabled={isSubmitting}
              className="min-h-[100px]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="task-assignee">Assignee</Label>
            <select
              id="task-assignee"
              className="h-9 w-full min-w-0 rounded-3xl border border-transparent bg-input/50 px-3 py-1 text-sm transition-[color,box-shadow,background-color] outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30 disabled:opacity-50 disabled:cursor-not-allowed"
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
        </div>

        {/* Footer */}
        <div className="shrink-0 flex justify-end gap-3 px-6 py-4 border-t border-border">
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>
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
        className="bg-background p-3 rounded-xl border border-border hover:border-primary/40 hover:shadow-sm cursor-pointer group flex flex-col gap-2 transition-all"
        onClick={() => setIsEditing(true)}
      >
        <div className="flex justify-between items-start gap-2">
          <div className="flex items-start gap-2 flex-1 min-w-0">
            <CircleCheckBig className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
            <h4 className="text-sm font-medium break-words line-clamp-2 flex-1">{task.title}</h4>
          </div>
          <button
            className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive p-1 shrink-0 transition-all rounded-lg hover:bg-destructive/10"
            onClick={(e) => {
              e.stopPropagation();
              setShowConfirmDelete(true);
            }}
          >
            <Trash2 size={13} />
          </button>
        </div>

        {task.description && (
          <p className="text-xs text-muted-foreground line-clamp-2">
            {task.description}
          </p>
        )}

        <div className="mt-1 flex items-center justify-end">
          {task.assignee ? (
            <div className="flex items-center gap-1.5" title={`Assigned to ${task.assignee.username}`}>
              <div className="w-5 h-5 rounded-full bg-primary/20 text-primary border border-primary/30 flex items-center justify-center text-[9px] font-bold">
                {getInitials(task.assignee.username)}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-1.5" title="Unassigned">
              <div className="w-5 h-5 rounded-full bg-muted border border-dashed border-border flex items-center justify-center text-[9px] text-muted-foreground font-bold">
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
