import { useState, useRef, useEffect } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { EllipsisVertical, Plus, X } from 'lucide-react';
import useListStore from '../../store/listStore';
import useTaskStore from '../../store/taskStore';
import ConfirmDialog from '../ConfirmDialog';
import { Dropdown, DropdownItem } from '../Dropdown';
import TaskCard from './TaskCard';
import Button from '../Button';
import Input from '../Input';

export const BoardColumnUI = ({
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
        className={`w-72 shrink-0 flex flex-col bg-[var(--card-bg)] border border-[var(--border-color)] rounded-md ${
          isDragging ? 'opacity-50' : ''
        }`}
      >
        {/* Header - drag handle area */}
        <div 
          className="p-3 border-b border-[var(--border-color)] flex items-center justify-between group cursor-grab active:cursor-grabbing rounded-t-md"
          {...attributes}
          {...listeners}
        >
          {isEditing ? (
            <input
              ref={inputRef}
              className="bg-[var(--bg-color)] text-[var(--text-color)] text-sm font-semibold px-2 py-1 rounded w-full mr-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onBlur={handleNameSave}
              onKeyDown={handleKeyDown}
              // Prevent drag when interacting with input
              onPointerDown={(e) => e.stopPropagation()}
            />
          ) : (
            <h3 className="text-sm font-semibold truncate flex-1 select-none pr-2">
              {list.name}
            </h3>
          )}
          
          <div className="flex items-center gap-1" onPointerDown={(e) => e.stopPropagation()}>
            <button 
              className="text-gray-500 hover:text-gray-300 p-1 rounded hover:bg-[var(--bg-color)] shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => setIsAddingTask(true)}
              title="Add task"
            >
              <Plus size={16} />
            </button>
            <Dropdown 
              trigger={
                <button className="text-gray-500 hover:text-gray-300 p-1 rounded hover:bg-[var(--bg-color)] shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <EllipsisVertical size={16} />
                </button>
              }
            >
              <DropdownItem onClick={() => setIsEditing(true)}>Rename</DropdownItem>
              <DropdownItem onClick={() => setShowConfirmDelete(true)} variant="destructive">Delete</DropdownItem>
            </Dropdown>
          </div>
        </div>

        {/* Content area (Phase 5 tasks) */}
        <div className="p-3 flex-1 min-h-[100px] flex flex-col gap-2 bg-[var(--bg-color)] rounded-b-md overflow-y-auto overflow-x-hidden">
          {tasks.length === 0 ? (
            <div className="text-center text-xs text-gray-500 py-4 italic">
              No tasks yet
            </div>
          ) : (
            tasks.map(task => <TaskCard key={task.id} task={task} />)
          )}

          {/* Add Task Form */}
          {isAddingTask && (
            <div className="mt-2">
              <form 
                onSubmit={handleAddTask}
                className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-md p-2 flex flex-col gap-2"
              >
                <Input
                  autoFocus
                  placeholder="Task title..."
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  className="text-sm"
                  disabled={isSubmittingTask}
                />
                <div className="flex items-center gap-2">
                  <Button type="submit" className="h-7 text-xs px-3" disabled={isSubmittingTask}>
                    {isSubmittingTask ? 'Adding...' : 'Add task'}
                  </Button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingTask(false);
                      setNewTaskTitle('');
                    }}
                    className="text-gray-400 hover:text-gray-300 p-1"
                    disabled={isSubmittingTask}
                  >
                    <X size={16} />
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
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
};

const BoardColumn = ({ list, isOverlay }) => {
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
};

export default BoardColumn;
