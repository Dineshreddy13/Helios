import { useState, useEffect, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import ConfirmDialog from '../ConfirmDialog';
import useTaskStore from '../../store/taskStore';
import useAuthStore from '../../store/authStore';
import useProjectStore from '../../store/projectStore';
import { getProjectMembersApi } from '../../api/invitation.api';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Delete02Icon, CheckmarkCircle02Icon, Tag01Icon, Cancel01Icon, Calendar01Icon, CheckmarkBadge01Icon, ArrowUpDownIcon, Alert01Icon, ArrowUp01Icon, ArrowRight01Icon, ArrowDown01Icon } from 'hugeicons-react';

export const PRIORITY_MAP = {
  urgent: { label: 'Urgent', color: 'text-destructive', variant: 'destructive', icon: Alert01Icon },
  high: { label: 'High', color: 'text-primary', variant: 'default', icon: ArrowUp01Icon },
  medium: { label: 'Medium', color: 'text-secondary-foreground', variant: 'secondary', icon: ArrowRight01Icon },
  low: { label: 'Low', color: 'text-muted-foreground', variant: 'outline', icon: ArrowDown01Icon },
};

// ── TaskEditModal ─────────────────────────────────────────────────────────
// Shows only title, tags, and assignee — as per owner edit scope
const TaskEditModal = ({ task, onClose }) => {
  const { updateTask } = useTaskStore();
  const [members, setMembers] = useState([]);
  const [title, setTitle] = useState(task.title);
  const [assigneeId, setAssigneeId] = useState(task.assignee?.id || '');
  const [priority, setPriority] = useState(task.priority || 'medium');
  const [dueDate, setDueDate] = useState(task.dueDate ? new Date(task.dueDate) : null);
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState(task.tags || []);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [openAssignee, setOpenAssignee] = useState(false);
  const [openDate, setOpenDate] = useState(false);

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

  const addTag = () => {
    const trimmed = tagInput.trim();
    if (!trimmed || tags.includes(trimmed) || tags.length >= 10) return;
    setTags([...tags, trimmed]);
    setTagInput('');
  };

  const removeTag = (tag) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleTagKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    } else if (e.key === 'Backspace' && !tagInput && tags.length > 0) {
      setTags(tags.slice(0, -1));
    }
  };

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
        assigneeId: assigneeId || null,
        tags: tags.length > 0 ? tags : null,
        dueDate: dueDate ? dueDate.toISOString() : null,
        priority,
      });
      onClose();
    } catch (err) {
      console.error(err);
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

          {/* Title */}
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

          {/* Tags */}
          <div className="space-y-2">
            <Label htmlFor="task-tags">Tags</Label>
            <div className="flex flex-wrap gap-1.5 min-h-[36px] w-full rounded-3xl border border-transparent bg-input/50 px-3 py-1.5 focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/30 transition-[color,box-shadow,background-color]">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-primary/15 text-primary border border-primary/25"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    disabled={isSubmitting}
                    className="hover:text-destructive transition-colors"
                  >
                    <Cancel01Icon size={10} />
                  </button>
                </span>
              ))}
              <input
                id="task-tags"
                className="flex-1 min-w-[80px] bg-transparent text-sm outline-none placeholder:text-muted-foreground disabled:opacity-50"
                placeholder={tags.length === 0 ? 'Add tags, press Enter…' : ''}
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                onBlur={addTag}
                disabled={isSubmitting}
              />
            </div>
            <p className="text-xs text-muted-foreground">Up to 10 tags · press Enter or Tab to add</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Assignee */}
            <div className="space-y-2 flex flex-col">
              <Label>Assignee</Label>
              <Popover open={openAssignee} onOpenChange={setOpenAssignee}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={openAssignee}
                    className="w-full justify-between"
                    disabled={isSubmitting}
                  >
                    {assigneeId
                      ? members.find((member) => member.user.id === assigneeId)?.user.username
                      : "Unassigned"}
                    <ArrowUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Search member..." />
                    <CommandList>
                      <CommandEmpty>No member found.</CommandEmpty>
                      <CommandGroup>
                        <CommandItem
                          value="unassigned"
                          onSelect={() => {
                            setAssigneeId("");
                            setOpenAssignee(false);
                          }}
                        >
                          <CheckmarkBadge01Icon
                            className={cn(
                              "mr-2 h-4 w-4",
                              assigneeId === "" ? "opacity-100" : "opacity-0"
                            )}
                          />
                          Unassigned
                        </CommandItem>
                        {members.map((member) => (
                          <CommandItem
                            key={member.user.id}
                            value={member.user.username}
                            onSelect={() => {
                              setAssigneeId(member.user.id);
                              setOpenAssignee(false);
                            }}
                          >
                            <CheckmarkBadge01Icon
                              className={cn(
                                "mr-2 h-4 w-4",
                                assigneeId === member.user.id ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {member.user.username}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            {/* Due Date */}
            <div className="space-y-2 flex flex-col">
              <Label>Due Date</Label>
              <Popover open={openDate} onOpenChange={setOpenDate}>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !dueDate && "text-muted-foreground"
                    )}
                    disabled={isSubmitting}
                  >
                    <Calendar01Icon className="mr-2 h-4 w-4" />
                    {dueDate ? format(dueDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dueDate}
                    onSelect={(date) => {
                      setDueDate(date);
                      setOpenDate(false);
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Priority */}
            <div className="space-y-2 flex flex-col">
              <Label>Priority</Label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full justify-start" disabled={isSubmitting}>
                    {(() => {
                      const PIcon = PRIORITY_MAP[priority].icon;
                      return (
                        <>
                          <PIcon className={cn("mr-2 h-4 w-4", PRIORITY_MAP[priority].color)} />
                          {PRIORITY_MAP[priority].label}
                        </>
                      );
                    })()}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-[--radix-dropdown-menu-trigger-width]">
                  {Object.entries(PRIORITY_MAP).map(([key, { label, icon: Icon, color }]) => (
                    <DropdownMenuItem key={key} onClick={() => setPriority(key)}>
                      <Icon className={cn("mr-2 h-4 w-4", color)} />
                      {label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
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

// ── TaskCard ──────────────────────────────────────────────────────────────
const TaskCard = memo(({ task }) => {
  const { deleteTask } = useTaskStore();
  const currentUser = useAuthStore((state) => state.user);
  const currentProject = useProjectStore((state) => state.currentProject);
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Is the currently logged-in user the assignee of this task?
  const isAssignee = !!task.assignee && task.assignee.id === currentUser?.id;
  // Is the currently logged-in user the project owner?
  const isOwner = currentProject?.role === 'owner';

  const handleCardClick = () => {
    if (isAssignee) {
      // The assigned person (including owner who self-assigned) → task page
      navigate(`/projects/${task.projectId}/tasks/${task.id}`);
    } else if (isOwner) {
      // Owner who did NOT assign themselves → edit modal
      setIsEditing(true);
    }
    // Regular members who are not the assignee → do nothing
  };


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
        onClick={handleCardClick}
      >
        <div className="flex justify-between items-start gap-2">
          <div className="flex items-start gap-2 flex-1 min-w-0">
            <CheckmarkCircle02Icon 
              className={cn("w-4 h-4 shrink-0 mt-0.5", task.status === 'completed' ? "text-green-500" : "text-muted-foreground")} 
            />
            <h4 className="text-sm font-medium break-words line-clamp-2 flex-1">{task.title}</h4>
          </div>
          <button
            className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive p-1 shrink-0 transition-all rounded-lg hover:bg-destructive/10"
            onClick={(e) => {
              e.stopPropagation();
              setShowConfirmDelete(true);
            }}
          >
            <Delete02Icon size={13} />
          </button>
        </div>

        {/* Tags */}
        {task.tags && task.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {task.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-primary/10 text-primary border border-primary/20"
              >
                <Tag01Icon size={8} />
                {tag}
              </span>
            ))}
            {task.tags.length > 3 && (
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-muted text-muted-foreground border border-border">
                +{task.tags.length - 3}
              </span>
            )}
          </div>
        )}

        <div className="mt-1 flex items-center justify-between">
          <div className="flex items-center">
            {(() => {
              const pInfo = PRIORITY_MAP[task.priority || 'medium'];
              const Icon = pInfo.icon;
              return (
                <Badge variant={pInfo.variant} className="gap-1 px-1.5 py-0.5 text-[10px]" title={`Priority: ${pInfo.label}`}>
                  <Icon size={10} />
                  {pInfo.label}
                </Badge>
              );
            })()}
          </div>
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
});

export default TaskCard;
