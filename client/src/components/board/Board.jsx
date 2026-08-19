import React, { useState, useEffect } from 'react';
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
import { Plus, X, Maximize, Minimize } from 'lucide-react';
import useListStore from '../../store/listStore';
import BoardColumn from './BoardColumn';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const Board = ({ projectId }) => {
  const { lists, reorderLists, createList } = useListStore();
  const [activeId, setActiveId] = useState(null);
  const [isAddingList, setIsAddingList] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Close fullscreen on escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
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
    } catch {
      // Error handled by store
    } finally {
      setIsSubmitting(false);
    }
  };

  const activeList = activeId ? lists.find(l => l.id === activeId) : null;

  return (
    <div className={isFullscreen ? "fixed inset-0 z-50 bg-background flex flex-col p-6" : "relative flex flex-col"}>
      <div className={`flex justify-end mb-4 ${!isFullscreen && "absolute -top-12 right-0 z-10"}`}>
        <Button 
          variant="outline" 
          size="icon" 
          onClick={() => setIsFullscreen(!isFullscreen)}
          className="text-muted-foreground hover:text-foreground bg-background"
          title={isFullscreen ? "Exit Fullscreen" : "Fullscreen Board"}
        >
          {isFullscreen ? (
            <Minimize className="h-4 w-4" />
          ) : (
            <Maximize className="h-4 w-4" />
          )}
        </Button>
      </div>

      <div className={`flex gap-4 overflow-x-auto pb-4 items-start ${isFullscreen ? "flex-1 overflow-y-hidden" : ""}`} style={{ scrollbarWidth: 'none' }}>
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
            className="w-full flex items-center gap-2 px-4 py-3 bg-card border border-dashed border-border hover:border-primary/50 hover:bg-muted/50 rounded-2xl text-muted-foreground hover:text-foreground transition-all text-sm font-medium"
          >
            <Plus size={16} />
            Add another list
          </button>
        ) : (
          <form
            onSubmit={handleAddList}
            className="bg-card border border-border rounded-2xl p-3 flex flex-col gap-3 shadow-sm"
          >
            <Input
              autoFocus
              placeholder="Enter list title..."
              value={newListName}
              onChange={(e) => setNewListName(e.target.value)}
              disabled={isSubmitting}
            />
            <div className="flex items-center gap-2">
              <Button type="submit" size="sm" disabled={isSubmitting}>
                {isSubmitting ? 'Adding...' : 'Add list'}
              </Button>
              <button
                type="button"
                onClick={() => {
                  setIsAddingList(false);
                  setNewListName('');
                }}
                className="text-muted-foreground hover:text-foreground p-1 rounded-md hover:bg-muted transition-colors"
                disabled={isSubmitting}
              >
                <X size={16} />
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
    </div>
  );
};

export default Board;
