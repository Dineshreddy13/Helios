import React, { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Plus, X } from 'lucide-react';
import useListStore from '../../store/listStore';
import BoardColumn from './BoardColumn';
import Button from '../Button';
import Input from '../Input';

const Board = ({ projectId }) => {
  const { lists, reorderLists, createList } = useListStore();
  const [activeId, setActiveId] = useState(null);
  const [isAddingList, setIsAddingList] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // 5px movement required to trigger drag - allows clicking buttons inside
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    if (active.id !== over.id) {
      const oldIndex = lists.findIndex((l) => l.id === active.id);
      const newIndex = lists.findIndex((l) => l.id === over.id);
      
      const newOrder = arrayMove(lists, oldIndex, newIndex);
      const orderedIds = newOrder.map(l => l.id);
      
      reorderLists(projectId, orderedIds);
    }
  };

  const handleAddList = async (e) => {
    e.preventDefault();
    if (!newListName.trim()) return;

    setIsSubmitting(true);
    try {
      await createList(projectId, newListName.trim());
      setNewListName('');
      setIsAddingList(false);
    } catch (error) {
      // Error handled by store
    } finally {
      setIsSubmitting(false);
    }
  };

  const activeList = activeId ? lists.find(l => l.id === activeId) : null;

  return (
    <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-4 items-start">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={lists.map(l => l.id)}
          strategy={horizontalListSortingStrategy}
        >
          {lists.map((list) => (
            <BoardColumn key={list.id} list={list} />
          ))}
        </SortableContext>
        
        <DragOverlay>
          {activeList ? <BoardColumn list={activeList} isOverlay /> : null}
        </DragOverlay>
      </DndContext>

      {/* Add List Control */}
      <div className="w-72 shrink-0">
        {!isAddingList ? (
          <button
            onClick={() => setIsAddingList(true)}
            className="w-full flex items-center gap-2 px-4 py-3 bg-[var(--card-bg)] border border-dashed border-[var(--border-color)] hover:border-gray-500 rounded-md text-gray-400 hover:text-gray-300 transition-colors text-sm font-medium"
          >
            <Plus size={18} />
            Add another list
          </button>
        ) : (
          <form 
            onSubmit={handleAddList}
            className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-md p-3 flex flex-col gap-3"
          >
            <Input
              autoFocus
              placeholder="Enter list title..."
              value={newListName}
              onChange={(e) => setNewListName(e.target.value)}
              className="text-sm"
              disabled={isSubmitting}
            />
            <div className="flex items-center gap-2">
              <Button type="submit" className="h-8 text-xs px-4" disabled={isSubmitting}>
                {isSubmitting ? 'Adding...' : 'Add list'}
              </Button>
              <button
                type="button"
                onClick={() => {
                  setIsAddingList(false);
                  setNewListName('');
                }}
                className="text-gray-400 hover:text-gray-300 p-1"
                disabled={isSubmitting}
              >
                <X size={18} />
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default Board;
