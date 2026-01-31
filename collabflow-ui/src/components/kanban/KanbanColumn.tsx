// components/kanban/KanbanColumn.tsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import {
  Plus,
  MoreVertical,
  Trash2,
  Edit2,
  GripVertical,
} from 'lucide-react';
import { useTaskListTasks } from '../../hooks/useTasks';
import { useDeleteTaskList, useUpdateTaskList } from '../../hooks/useTaskLists';
import { SortableTaskCard } from './SortableTaskCard';
import type { TaskListResponse } from '../../api/tasklists';

interface KanbanColumnProps {
  list: TaskListResponse;
  projectId: string;
  onCreateTask: () => void;
}

export const KanbanColumn: React.FC<KanbanColumnProps> = ({
  list,
  projectId,
  onCreateTask,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(list.name);

  const { data: tasks, isLoading } = useTaskListTasks(list.id);
  const deleteList = useDeleteTaskList(projectId);
  const updateList = useUpdateTaskList(projectId);

  const { setNodeRef } = useDroppable({
    id: list.id,
    data: {
      type: 'column',
      list,
    },
  });

  const handleSaveName = () => {
    if (editName.trim() && editName !== list.name) {
      updateList.mutate({
        listId: list.id,
        data: { name: editName.trim() },
      });
    }
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (window.confirm(`Delete "${list.name}" and all its tasks?`)) {
      deleteList.mutate(list.id);
    }
    setIsMenuOpen(false);
  };

  const taskCount = tasks?.length || 0;
  const completedCount = tasks?.filter(t => t.completed).length || 0;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex-shrink-0 w-80"
    >
      <div className="flex flex-col h-full max-h-[calc(100vh-140px)] rounded-2xl bg-slate-900/60 backdrop-blur-xl border border-white/10 shadow-2xl">
        {/* Column Header */}
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 flex-1">
              <GripVertical className="w-4 h-4 text-slate-500 cursor-grab active:cursor-grabbing" />
              {isEditing ? (
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onBlur={handleSaveName}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveName();
                    if (e.key === 'Escape') {
                      setEditName(list.name);
                      setIsEditing(false);
                    }
                  }}
                  autoFocus
                  className="flex-1 bg-white/5 border border-purple-500/50 rounded px-2 py-1 text-white font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                />
              ) : (
                <h3
                  onClick={() => setIsEditing(true)}
                  className="font-semibold text-white text-lg cursor-pointer hover:text-purple-400 transition-colors flex-1"
                >
                  {list.name}
                </h3>
              )}
            </div>

            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
              >
                <MoreVertical className="w-4 h-4" />
              </motion.button>

              {isMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setIsMenuOpen(false)}
                  />
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    className="absolute right-0 top-10 z-20 w-48 rounded-lg bg-slate-800 border border-white/10 shadow-xl overflow-hidden"
                  >
                    <button
                      onClick={() => {
                        setIsEditing(true);
                        setIsMenuOpen(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-slate-300 hover:bg-white/5 hover:text-white transition-colors flex items-center gap-2"
                    >
                      <Edit2 className="w-4 h-4" />
                      Rename
                    </button>
                    <button
                      onClick={handleDelete}
                      className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors flex items-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </motion.div>
                </>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-4 text-sm">
            <span className="text-slate-400">
              {taskCount} {taskCount === 1 ? 'task' : 'tasks'}
            </span>
            {taskCount > 0 && (
              <>
                <div className="w-px h-4 bg-white/10" />
                <span className="text-emerald-400">
                  {completedCount} completed
                </span>
              </>
            )}
          </div>

          {/* Progress Bar */}
          {taskCount > 0 && (
            <div className="mt-3 h-1.5 bg-white/5 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(completedCount / taskCount) * 100}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="h-full bg-gradient-to-r from-emerald-500 to-green-500"
              />
            </div>
          )}
        </div>

        {/* Tasks List */}
        <div
          ref={setNodeRef}
          className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent"
        >
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <SortableContext
              items={tasks?.map(task => task.id) || []}
              strategy={verticalListSortingStrategy}
            >
              {tasks?.map((task) => (
                <SortableTaskCard key={task.id} task={task} projectId={projectId} />
              ))}
            </SortableContext>
          )}

          {!isLoading && taskCount === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-3">
                <Plus className="w-8 h-8 text-slate-600" />
              </div>
              <p className="text-sm text-slate-500">No tasks yet</p>
            </div>
          )}
        </div>

        {/* Add Task Button */}
        <div className="p-4 border-t border-white/10">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onCreateTask}
            className="w-full px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-purple-500/50 text-slate-400 hover:text-white transition-all flex items-center justify-center gap-2 font-medium group"
          >
            <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" />
            Add Task
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};