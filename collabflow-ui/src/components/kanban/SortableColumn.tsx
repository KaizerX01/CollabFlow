// components/kanban/SortableColumn.tsx
import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { KanbanColumn } from './KanbanColumn';
import type { TaskListResponse } from '../../api/tasklists';

interface SortableColumnProps {
  list: TaskListResponse;
  projectId: string;
  onCreateTask: () => void;
  searchQuery?: string;
  filterPriority?: number | null;
}

export const SortableColumn: React.FC<SortableColumnProps> = ({
  list,
  projectId,
  onCreateTask,
  searchQuery,
  filterPriority,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: list.id,
    data: {
      type: 'list',
      list,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <KanbanColumn
        list={list}
        projectId={projectId}
        onCreateTask={onCreateTask}
        dragHandleProps={{ ...attributes, ...listeners }}
        isDragging={isDragging}
        searchQuery={searchQuery}
        filterPriority={filterPriority}
      />
    </div>
  );
};