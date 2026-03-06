// components/kanban/TaskCard.tsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  CheckCircle2,
  Circle,
  Calendar,
  User,
  Flag,
  MoreVertical,
  Edit2,
  Trash2,
  Users,
} from 'lucide-react';
import { useToggleTaskComplete, useDeleteTask } from '../../hooks/useTasks';
import { TaskDetailDialog } from './TaskDetailDialog';
import { ConfirmDialog } from '../ConfirmDialog';
import type { TaskResponse } from '../../api/tasks';
import { formatDistanceToNow } from 'date-fns';

interface TaskCardProps {
  task: TaskResponse;
  projectId?: string;
  isDragging?: boolean;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, projectId, isDragging = false }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  const toggleComplete = useToggleTaskComplete(projectId || task.projectId, task.taskListId);
  const deleteTask = useDeleteTask(projectId || task.projectId, task.taskListId);

  const handleToggleComplete = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleComplete.mutate(task.id);
  };

  const handleDeleteClick = () => {
    setIsMenuOpen(false);
    setIsDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteTask.mutateAsync(task.id);
      setIsDetailOpen(false);
    } catch (error) {
      console.error('Failed to delete task:', error);
    }
  };

  const getPriorityColor = (priority: number) => {
    if (priority >= 3) return 'text-red-400 border-red-400/30 bg-red-500/10';
    if (priority >= 2) return 'text-orange-400 border-orange-400/30 bg-orange-500/10';
    if (priority >= 1) return 'text-yellow-400 border-yellow-400/30 bg-yellow-500/10';
    return 'text-slate-400 border-slate-400/30 bg-slate-500/10';
  };

  const getPriorityLabel = (priority: number) => {
    if (priority >= 3) return 'High';
    if (priority >= 2) return 'Medium';
    if (priority >= 1) return 'Low';
    return 'None';
  };

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && !task.completed;

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        whileHover={{ scale: isDragging ? 1 : 1.02 }}
        onClick={() => setIsDetailOpen(true)}
        className={`group relative p-4 rounded-xl backdrop-blur-sm border shadow-lg hover:shadow-purple-500/20 transition-all cursor-pointer ${
          isDragging ? 'cursor-grabbing' : 'cursor-grab'
        } ${
          task.completed 
            ? 'bg-slate-800/40 border-white/5 opacity-70 hover:opacity-80' 
            : 'bg-slate-800/80 border-white/10 hover:border-purple-500/50'
        }`}
      >
        {/* Completion Checkbox */}
        <div className="flex items-start gap-3 mb-3">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleToggleComplete}
            className="mt-0.5 flex-shrink-0 group/checkbox"
            title={task.completed ? "Mark as incomplete" : "Mark as complete"}
          >
            {task.completed ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 drop-shadow-lg" />
            ) : (
              <Circle className="w-5 h-5 text-slate-400 group-hover/checkbox:text-purple-400 group-hover/checkbox:scale-110 transition-all" />
            )}
          </motion.button>

          <div className="flex-1 min-w-0">
            <h4
              className={`font-medium mb-1 ${
                task.completed 
                  ? 'line-through text-slate-500 decoration-2 decoration-slate-600' 
                  : 'text-white'
              }`}
            >
              {task.title}
            </h4>

            {task.description && (
              <p className={`text-sm line-clamp-2 ${
                task.completed 
                  ? 'text-slate-600' 
                  : 'text-slate-400'
              }`}>
                {task.description}
              </p>
            )}
          </div>

          {/* Menu */}
          <div className="relative flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => {
                e.stopPropagation();
                setIsMenuOpen(!isMenuOpen);
              }}
              className="w-6 h-6 rounded bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
              aria-haspopup="true"
              aria-expanded={isMenuOpen}
            >
              <MoreVertical className="w-4 h-4" />
            </motion.button>

            {isMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-30"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsMenuOpen(false);
                  }}
                />
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  className="absolute right-0 top-8 z-40 w-40 rounded-lg bg-slate-800 border border-white/10 shadow-xl overflow-hidden"
                  role="menu"
                  aria-orientation="vertical"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsDetailOpen(true);
                      setIsMenuOpen(false);
                    }}
                    role="menuitem"
                    className="w-full px-3 py-2 text-left text-sm text-slate-300 hover:bg-white/5 hover:text-white transition-colors flex items-center gap-2"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    Edit
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteClick();
                    }}
                    role="menuitem"
                    className="w-full px-3 py-2 text-left text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors flex items-center gap-2"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete
                  </button>
                </motion.div>
              </>
            )}
          </div>
        </div>

        {/* Metadata */}
        <div className="flex flex-wrap items-center gap-2 mt-3">
          {/* Priority */}
          {task.priority > 0 && (
            <span
              className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium border ${getPriorityColor(
                task.priority
              )}`}
            >
              <Flag className="w-3 h-3" />
              {getPriorityLabel(task.priority)}
            </span>
          )}

          {/* Due Date */}
          {task.dueDate && (
            <span
              className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium border ${
                isOverdue
                  ? 'text-red-400 border-red-400/30 bg-red-500/10'
                  : 'text-blue-400 border-blue-400/30 bg-blue-500/10'
              }`}
            >
              <Calendar className="w-3 h-3" />
              {formatDistanceToNow(new Date(task.dueDate), { addSuffix: true })}
            </span>
          )}

          {/* Assignees */}
          {task.assignees && task.assignees.length > 0 && (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium border text-purple-400 border-purple-400/30 bg-purple-500/10">
              {task.assignees.length === 1 ? (
                <>
                  <User className="w-3 h-3" />
                  {task.assignees[0].username}
                </>
              ) : (
                <>
                  <Users className="w-3 h-3" />
                  {task.assignees.length} assigned
                </>
              )}
            </span>
          )}
        </div>

        {/* Hover Effect */}
        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/0 to-pink-500/0 group-hover:from-purple-500/5 group-hover:to-pink-500/5 transition-all pointer-events-none" />
      </motion.div>

      {/* Task Detail Dialog */}
      {isDetailOpen && (
        <TaskDetailDialog
          task={task}
          isOpen={isDetailOpen}
          onClose={() => setIsDetailOpen(false)}
          projectId={projectId || task.projectId}
        />
      )}

      <ConfirmDialog
        open={isDeleteConfirmOpen}
        onOpenChange={setIsDeleteConfirmOpen}
        title="Delete Task"
        description="Are you sure you want to delete this task? This action cannot be undone."
        confirmLabel="Delete"
        variant="danger"
        onConfirm={handleConfirmDelete}
        isLoading={deleteTask.isPending}
      />
    </>
  );
};