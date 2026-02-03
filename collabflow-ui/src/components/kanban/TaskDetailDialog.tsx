// components/kanban/TaskDetailDialog.tsx
import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Save,
  Loader2,
  Calendar,
  Flag,
  User,
  Clock,
  CheckCircle2,
  Circle,
  Edit2,
  Trash2,
} from 'lucide-react';
import { useUpdateTask, useDeleteTask, useToggleTaskComplete } from '../../hooks/useTasks';
import { ConfirmDialog } from '../ConfirmDialog';
import { formatDistanceToNow } from 'date-fns';
import type { TaskResponse } from '../../api/tasks';

interface TaskDetailDialogProps {
  task: TaskResponse;
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
}

export const TaskDetailDialog: React.FC<TaskDetailDialogProps> = ({
  task,
  isOpen,
  onClose,
  projectId,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || '');
  const [priority, setPriority] = useState<number>(task.priority);
  const [dueDate, setDueDate] = useState(
    task.dueDate ? new Date(task.dueDate).toISOString().slice(0, 16) : ''
  );

  const updateTask = useUpdateTask(projectId, task.taskListId);
  const deleteTask = useDeleteTask(projectId, task.taskListId);
  const toggleComplete = useToggleTaskComplete(projectId, task.taskListId);

  const handleSave = async () => {
    if (!title.trim()) return;

    try {
      await updateTask.mutateAsync({
        taskId: task.id,
        data: {
          title: title.trim(),
          description: description.trim() || undefined,
          priority: priority || undefined,
          dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
        },
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  };

  const handleDeleteClick = () => {
    setIsDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteTask.mutateAsync(task.id);
      onClose();
    } catch (error) {
      console.error('Failed to delete task:', error);
    }
  };

  const handleToggleComplete = async (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      console.log('🔄 Toggling task:', task.id, 'Current state:', task.isCompleted || task.completed);
      const result = await toggleComplete.mutateAsync(task.id);
      console.log('✅ Toggle result:', result);
      console.log('   - isCompleted:', result.isCompleted);
      console.log('   - completed:', result.completed);
    } catch (error) {
      console.error('❌ Failed to toggle completion:', error);
    }
  };

  const handleCancel = () => {
    setTitle(task.title);
    setDescription(task.description || '');
    setPriority(task.priority);
    setDueDate(task.dueDate ? new Date(task.dueDate).toISOString().slice(0, 16) : '');
    setIsEditing(false);
  };

  const priorityOptions = [
    { value: 0, label: 'None', color: 'text-slate-400' },
    { value: 1, label: 'Low', color: 'text-yellow-400' },
    { value: 2, label: 'Medium', color: 'text-orange-400' },
    { value: 3, label: 'High', color: 'text-red-400' },
  ];

  const getPriorityColor = (p: number) => {
    if (p >= 3) return 'text-red-400';
    if (p >= 2) return 'text-orange-400';
    if (p >= 1) return 'text-yellow-400';
    return 'text-slate-400';
  };

  if (!isOpen) return null;

  return createPortal(
    <>
      <ConfirmDialog
        open={isDeleteConfirmOpen}
        onOpenChange={setIsDeleteConfirmOpen}
        title="Delete Task"
        description="Are you sure you want to delete this task permanently? This action cannot be undone."
        confirmLabel="Delete"
        variant="danger"
        onConfirm={handleConfirmDelete}
        isLoading={deleteTask.isPending}
      />
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            style={{ zIndex: 9999 }}
          />

          {/* Dialog */}
          <div 
            className="fixed inset-0 flex items-center justify-center p-4"
            style={{ zIndex: 10000 }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl bg-slate-900 rounded-2xl shadow-2xl border border-white/10 overflow-hidden max-h-[90vh] flex flex-col"
            >
              {/* Header */}
              <div className="p-6 border-b border-white/10 bg-gradient-to-r from-purple-500/10 to-pink-500/10 flex-shrink-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={handleToggleComplete}
                      className="flex-shrink-0"
                      title={task.completed ? "Mark as incomplete" : "Mark as complete"}
                    >
                      {task.completed ? (
                        <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                      ) : (
                        <Circle className="w-8 h-8 text-slate-400 hover:text-purple-400 transition-colors" />
                      )}
                    </motion.button>
                    <h2 className="text-xl font-bold text-white">Task Details</h2>
                    {task.completed && (
                      <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-sm font-semibold">
                        Completed
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {isEditing ? (
                      <>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={handleCancel}
                          className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
                        >
                          Cancel
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={handleSave}
                          disabled={!title.trim() || updateTask.isPending}
                          className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium transition-all disabled:opacity-50 flex items-center gap-2"
                        >
                          {updateTask.isPending ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Saving...
                            </>
                          ) : (
                            <>
                              <Save className="w-4 h-4" />
                              Save
                            </>
                          )}
                        </motion.button>
                      </>
                    ) : (
                      <>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={handleToggleComplete}
                          className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                            task.completed
                              ? 'bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 hover:text-orange-300'
                              : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 hover:text-emerald-300'
                          }`}
                        >
                          {task.completed ? (
                            <>
                              <Circle className="w-4 h-4" />
                              Mark Incomplete
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="w-4 h-4" />
                              Mark Complete
                            </>
                          )}
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setIsEditing(true)}
                          className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors flex items-center gap-2"
                        >
                          <Edit2 className="w-4 h-4" />
                          Edit
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={handleDeleteClick}
                          className="px-4 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-colors flex items-center gap-2"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </motion.button>
                      </>
                    )}

                    <motion.button
                      whileHover={{ scale: 1.1, rotate: 90 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={onClose}
                      className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </motion.button>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Title</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
                    />
                  ) : (
                    <p className={`text-lg font-medium ${
                      task.completed 
                        ? 'line-through text-slate-500 decoration-2 decoration-slate-600' 
                        : 'text-white'
                    }`}>
                      {task.title}
                    </p>
                  )}
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Description</label>
                  {isEditing ? (
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={4}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all resize-none"
                      placeholder="Add a description..."
                    />
                  ) : (
                    <p className={`whitespace-pre-wrap ${
                      task.completed 
                        ? 'line-through text-slate-500 decoration-slate-600' 
                        : 'text-slate-300'
                    }`}>
                      {task.description || <span className="text-slate-500 italic">No description</span>}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Priority */}
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2 flex items-center gap-2">
                      <Flag className="w-4 h-4" />
                      Priority
                    </label>
                    {isEditing ? (
                      <select
                        value={priority}
                        onChange={(e) => setPriority(Number(e.target.value))}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                      >
                        {priorityOptions.map((option) => (
                          <option key={option.value} value={option.value} className="bg-slate-800">
                            {option.label}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <p className={`font-medium ${getPriorityColor(task.priority)}`}>
                        {priorityOptions.find(o => o.value === task.priority)?.label || 'None'}
                      </p>
                    )}
                  </div>

                  {/* Due Date */}
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2 flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Due Date
                    </label>
                    {isEditing ? (
                      <input
                        type="datetime-local"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                      />
                    ) : (
                      <p className="text-white">
                        {task.dueDate ? (
                          formatDistanceToNow(new Date(task.dueDate), { addSuffix: true })
                        ) : (
                          <span className="text-slate-500 italic">No due date</span>
                        )}
                      </p>
                    )}
                  </div>
                </div>

                {/* Assignees */}
                {task.assignees && task.assignees.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-3 flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Assignees
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {task.assignees.map((assignee) => (
                        <div
                          key={assignee.userId}
                          className="px-3 py-2 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-300 text-sm font-medium"
                        >
                          {assignee.username}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Metadata */}
                <div className="pt-4 border-t border-white/10">
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Clock className="w-4 h-4" />
                    Created {formatDistanceToNow(new Date(task.createdAt), { addSuffix: true })}
                  </div>
                  {task.updatedAt !== task.createdAt && (
                    <div className="flex items-center gap-2 text-sm text-slate-500 mt-2">
                      <Clock className="w-4 h-4" />
                      Updated {formatDistanceToNow(new Date(task.updatedAt), { addSuffix: true })}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
    </>,
    document.body
  );
};