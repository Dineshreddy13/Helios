import { useState, useRef, useEffect, memo } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { MoreVerticalIcon, PlusSignIcon, Cancel01Icon } from 'hugeicons-react';
import useListStore from '../../store/listStore';
import useTaskStore from '../../store/taskStore';
import ConfirmDialog from '../ConfirmDialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import TaskCard from './TaskCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export const BoardColumnUI = memo(({
  list,
  isDragging,
  listeners,
  attributes,
  setNodeRef,
  style,
}) => {
  const { updateList, deleteList } = useListStore();
  const { tasksByListId, createTask } = useTaskStore();
  const tasks = tasksByListId[list.id] || [];

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(list.name);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [isSubmittingTask, setIsSubmittingTask] = useState(false);

  const inputRef = useRef(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    setIsSubmittingTask(true);
    try {
      await createTask(list.id, { title: newTaskTitle.trim() });
      setNewTaskTitle('');
      setIsAddingTask(false);
    } catch {
      // Error handled by store
    } finally {
      setIsSubmittingTask(false);
    }
  };

  const handleNameSave = async () => {
    if (editName.trim() && editName !== list.name) {
      await updateList(list.id, editName.trim());
    }
    setEditName(editName.trim() || list.name);
    setIsEditing(false);
  };

  const handleKeyDown = (e) => {
    e.stopPropagation();
    if (e.key === 'Enter') {
      handleNameSave();
    } else if (e.key === 'Escape') {
      setEditName(list.name);
      setIsEditing(false);
    }
  };

  const executeDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteList(list.id);
      setShowConfirmDelete(false);
    } catch {
      setIsDeleting(false);
      setShowConfirmDelete(false);
    }
  };

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        className={`w-72 shrink-0 flex flex-col bg-card border border-border rounded-2xl shadow-sm ${
          isDragging ? 'opacity-50' : ''
        }`}
      >
        {/* Header */}
        <div
          className="px-3 py-2.5 border-b border-border flex items-center justify-between group cursor-grab active:cursor-grabbing rounded-t-2xl"
          {...attributes}
          {...listeners}
        >
          {isEditing ? (
            <input
              ref={inputRef}
              className="bg-background text-foreground text-sm font-semibold px-2 py-1 rounded-lg w-full mr-2 focus:outline-none focus:ring-2 focus:ring-ring/30 border border-ring"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onBlur={handleNameSave}
              onKeyDown={handleKeyDown}
              onPointerDown={(e) => e.stopPropagation()}
            />
          ) : (
            <h3 className="text-sm font-semibold truncate flex-1 select-none pr-2 text-foreground">
              {list.name}
            </h3>
          )}
          
          <div className="flex items-center gap-1" onPointerDown={(e) => e.stopPropagation()}>
            <button
              className="text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-muted shrink-0 opacity-0 group-hover:opacity-100 transition-all"
              onClick={() => setIsAddingTask(true)}
              title="Add task"
            >
              <PlusSignIcon size={15} />
            </button>
            <DropdownMenu>
              <DropdownMenuTrigger render={
                <button className="text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-muted shrink-0 opacity-0 group-hover:opacity-100 transition-all">
                  <MoreVerticalIcon size={15} />
                </button>
              } />
              <DropdownMenuContent align="end" className="w-36">
                <DropdownMenuItem onClick={() => setIsEditing(true)}>Rename</DropdownMenuItem>
                <DropdownMenuItem variant="destructive" onClick={() => setShowConfirmDelete(true)}>Delete</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Task list */}
        <div className="p-2 flex-1 min-h-[80px] flex flex-col gap-2 overflow-y-auto overflow-x-hidden">
          {tasks.length === 0 && !isAddingTask ? (
            <div className="text-center text-xs text-muted-foreground py-4 italic">
              No tasks yet
            </div>
          ) : (
            tasks.map(task => <TaskCard key={task.id} task={task} />)
          )}

          {/* Add Task Form */}
          {isAddingTask && (
            <form
              onSubmit={handleAddTask}
              className="bg-background border border-border rounded-xl p-2 flex flex-col gap-2 mt-1"
            >
              <Input
                autoFocus
                placeholder="Task title..."
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                disabled={isSubmittingTask}
              />
              <div className="flex items-center gap-2">
                <Button type="submit" size="sm" disabled={isSubmittingTask}>
                  {isSubmittingTask ? 'Adding...' : 'Add task'}
                </Button>
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingTask(false);
                    setNewTaskTitle('');
                  }}
                  className="text-muted-foreground hover:text-foreground p-1 rounded-md hover:bg-muted transition-colors"
                  disabled={isSubmittingTask}
                >
                  <Cancel01Icon size={15} />
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer: Add task button */}
        {!isAddingTask && (
          <div className="px-2 pb-2">
            <button
              onClick={() => setIsAddingTask(true)}
              className="w-full flex items-center gap-2 px-3 py-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl text-xs font-medium transition-colors"
            >
              <PlusSignIcon size={14} />
              Add a task
            </button>
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={showConfirmDelete}
        title="Delete List"
        description={`Are you sure you want to delete "${list.name}"? This action cannot be undone and will delete all tasks in this list.`}
        confirmText={isDeleting ? 'Deleting...' : 'Delete'}
        cancelText="Cancel"
        isDestructive={true}
        isLoading={isDeleting}
        onConfirm={executeDelete}
        onCancel={() => setShowConfirmDelete(false)}
      />
    </>
  );
});

const BoardColumn = memo(({ list, isOverlay }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: list.id, data: { type: 'Column', list } });

  if (isOverlay) {
    return (
      <BoardColumnUI
        list={list}
        isDragging={true}
        style={{ cursor: 'grabbing', opacity: 1, transform: 'scale(1.02)' }}
      />
    );
  }

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
  };

  return (
    <BoardColumnUI
      list={list}
      isDragging={isDragging}
      listeners={listeners}
      attributes={attributes}
      setNodeRef={setNodeRef}
      style={style}
    />
  );
});

export default BoardColumn;
