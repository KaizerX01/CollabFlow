// components/kanban/SortableTaskCard.tsx
import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { TaskCard } from './TaskCard';
import type { TaskResponse } from '../../api/tasks';

interface SortableTaskCardProps {
  task: TaskResponse;
  projectId: string;
}

export const SortableTaskCard: React.FC<SortableTaskCardProps> = ({ task, projectId }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: {
      type: 'task',
      task,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <TaskCard task={task} projectId={projectId} isDragging={isDragging} />
    </div>
  );
};