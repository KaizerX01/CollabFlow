// pages/KanbanWorkspace.tsx
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  ArrowLeft,
  Sparkles,
  LayoutGrid,
  Loader2,
  Filter,
  Search,
  Menu,
  X,
} from 'lucide-react';
import { DndContext, DragOverlay, closestCorners, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import { useProjectTaskLists, useReorderTaskLists } from '../hooks/useTaskLists';
import { useProject } from '../hooks/useProjects';
import { useMoveTask, useProjectTasks } from '../hooks/useTasks';
import { SortableColumn } from '../components/kanban/SortableColumn';
import { TaskCard } from '../components/kanban/TaskCard';
import { CreateTaskListDialog } from '../components/kanban/CreateTaskListDialog';
import { CreateTaskDialog } from '../components/kanban/CreateTaskDialog';
import { KanbanSidebar } from '../components/kanban/KanbanSidebar';
import { ThreeBackground } from '../components/kanban/ThreeBackground';
import type { TaskResponse } from '../api/tasks';
import type { TaskListResponse } from '../api/tasklists';



export const KanbanWorkspace: React.FC = () => {
  const { teamId, projectId } = useParams<{ teamId: string; projectId: string }>();
  const navigate = useNavigate();

  const { data: project, isLoading: projectLoading } = useProject(projectId || '');
  const { data: taskLists, isLoading: listsLoading } = useProjectTaskLists(projectId || '');
  const { data: projectTasks } = useProjectTasks(projectId || '');

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isCreateListOpen, setIsCreateListOpen] = useState(false);
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [selectedListId, setSelectedListId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPriority, setFilterPriority] = useState<number | null>(null);
  const [activeTask, setActiveTask] = useState<TaskResponse | null>(null);
  const [, setActiveList] = useState<TaskListResponse | null>(null);
  const [filterOpen, setFilterOpen] = useState(false);

  const moveTask = useMoveTask(projectId!);
  const reorderLists = useReorderTaskLists(projectId!);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = (event: any) => {
    const { active } = event;
    const activeData = active.data.current;
    
    if (activeData?.type === 'task') {
      setActiveTask(activeData.task);
    } else if (activeData?.type === 'list') {
      setActiveList(activeData.list);
    }
  };

  const handleDragEnd = async (event: any) => {
  const { active, over } = event;

  setActiveTask(null);
  setActiveList(null);

  if (!over) return;

  const activeData = active.data.current;
  const overData = over.data.current;

  try {

  const computePosition = (
    targetListId: string,
    anchorTaskId?: string,
    placeAfter?: boolean
  ) => {
    const tasksInList = (projectTasks || [])
      .filter((t) => t.taskListId === targetListId)
      .sort((a, b) => a.position - b.position);

    // Remove the moving task to avoid self-collision when calculating slot
    const filtered = tasksInList.filter((t) => t.id !== activeData?.task?.id);

    if (!anchorTaskId) {
      const last = filtered[filtered.length - 1];
      return last ? last.position + 1000 : 1000;
    }

    const anchorIndex = filtered.findIndex((t) => t.id === anchorTaskId);
    const insertIndex = anchorIndex + (placeAfter ? 1 : 0);

    const prev = insertIndex > 0 ? filtered[insertIndex - 1] : undefined;
    const next = filtered[insertIndex] || undefined;

    if (prev && next) return (prev.position + next.position) / 2;
    if (prev && !next) return prev.position + 1000;
    if (!prev && next) return next.position / 2;
    return 1000;
  };

  // ---- TASK DRAG ----
  if (activeData?.type === 'task' && activeData.task) {
    const task = activeData.task as TaskResponse;

    // Dropped on column (append) — also accept list container fallback
    if (overData?.type === 'column' || overData?.type === 'list') {
      const newListId = overData.list.id;

      if (task.taskListId !== newListId) {
        await moveTask.mutateAsync({
          taskId: task.id,
          data: {
            newTaskListId: newListId,
            newPosition: computePosition(newListId),
          },
          currentTaskListId: task.taskListId,
        });
      }
    }

    // Dropped on another task
    else if (overData?.type === 'task' && overData.task) {
      const overTask = overData.task as TaskResponse;

      const sameList =
        task.taskListId === overTask.taskListId &&
        task.id !== overTask.id;

      if (sameList) {
        const movingDown = task.position < overTask.position;
        const newPosition = computePosition(task.taskListId, overTask.id, movingDown);

        await moveTask.mutateAsync({
          taskId: task.id,
          data: {
            newTaskListId: task.taskListId,
            newPosition,
          },
          currentTaskListId: task.taskListId,
        });
      }

      // Moving to different list
      else if (task.taskListId !== overTask.taskListId) {
        const newPosition = computePosition(overTask.taskListId, overTask.id, true);

        await moveTask.mutateAsync({
          taskId: task.id,
          data: {
            newTaskListId: overTask.taskListId,
            newPosition,
          },
          currentTaskListId: task.taskListId,
        });
      }
    }
  }

  // ---- LIST DRAG ----
  else if (activeData?.type === 'list' && overData?.type === 'list') {
    const activeList = activeData.list as TaskListResponse;
    const overList = overData.list as TaskListResponse;

    if (activeList.id !== overList.id && taskLists) {
      const oldIndex = taskLists.findIndex(
        (l) => l.id === activeList.id
      );
      const newIndex = taskLists.findIndex(
        (l) => l.id === overList.id
      );

      const newLists = [...taskLists];
      const [removed] = newLists.splice(oldIndex, 1);
      newLists.splice(newIndex, 0, removed);

      await reorderLists.mutateAsync(newLists.map((l) => l.id));
    }
  }
  } catch (error) {
    console.error('Drag operation failed:', error);
  }
};


  const handleCreateTask = (listId: string) => {
    setSelectedListId(listId);
    setIsCreateTaskOpen(true);
  };

  if (!teamId || !projectId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <p className="text-red-400">Invalid project URL</p>
      </div>
    );
  }

  const isLoading = projectLoading || listsLoading;

  return (
    <div className="relative min-h-screen bg-slate-950 overflow-hidden">
      {/* Three.js Animated Background */}
      <ThreeBackground />

      {/* Header */}
      <div className="relative z-10 border-b border-white/10 bg-slate-900/80 backdrop-blur-xl">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <motion.button
                whileHover={{ scale: 1.05, x: -5 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate(`/teams/${teamId}/projects`)}
                className="w-11 h-11 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors group"
              >
                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              </motion.button>

              <div className="flex items-center gap-3">
                <motion.div
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
                  className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/30"
                >
                  <LayoutGrid className="w-6 h-6 text-white" />
                </motion.div>
                <div>
                  <h1 className="text-2xl font-bold text-white">
                    {project?.name || 'Loading...'}
                  </h1>
                  {project?.description && (
                    <p className="text-sm text-slate-400">{project.description}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search tasks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 w-64"
                />
              </div>

              {/* Filter */}
              <div className="relative">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setFilterOpen(prev => !prev)}
                  className={`px-4 py-2 rounded-lg border transition-colors flex items-center gap-2 ${
                    filterPriority !== null
                      ? 'bg-purple-500/20 border-purple-500/50 text-purple-300'
                      : 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-300 hover:text-white'
                  }`}
                >
                  <Filter className="w-4 h-4" />
                  {filterPriority !== null ? `Priority ${filterPriority}` : 'Filter'}
                </motion.button>
                {filterOpen && (
                  <>
                    <div className="fixed inset-0 z-20" onClick={() => setFilterOpen(false)} />
                    <div className="absolute right-0 top-12 z-30 w-48 rounded-lg bg-slate-800 border border-white/10 shadow-xl overflow-hidden py-1">
                      <button
                        onClick={() => { setFilterPriority(null); setFilterOpen(false); }}
                        className={`w-full px-4 py-2 text-left text-sm transition-colors flex items-center gap-2 ${
                          filterPriority === null ? 'text-purple-400 bg-purple-500/10' : 'text-slate-300 hover:bg-white/5 hover:text-white'
                        }`}
                      >
                        All Priorities
                      </button>
                      {[1, 2, 3, 4, 5].map(p => (
                        <button
                          key={p}
                          onClick={() => { setFilterPriority(p); setFilterOpen(false); }}
                          className={`w-full px-4 py-2 text-left text-sm transition-colors flex items-center gap-2 ${
                            filterPriority === p ? 'text-purple-400 bg-purple-500/10' : 'text-slate-300 hover:bg-white/5 hover:text-white'
                          }`}
                        >
                          Priority {p}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Add List */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsCreateListOpen(true)}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold shadow-lg shadow-purple-500/25 transition-all flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add List
                <Sparkles className="w-4 h-4" />
              </motion.button>

              {/* Sidebar Toggle */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="w-11 h-11 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
              >
                {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex h-[calc(100vh-73px)]">
        {/* Kanban Board */}
        <div className={`flex-1 overflow-x-auto overflow-y-hidden transition-all duration-300 ${
          isSidebarOpen ? 'mr-96' : 'mr-0'
        }`}>
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-full">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              >
                <Loader2 className="w-12 h-12 text-purple-400" />
              </motion.div>
              <p className="text-slate-400 mt-4 font-medium">Loading workspace...</p>
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCorners}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
              <div className="flex gap-6 p-6 h-full">
                <SortableContext
                  items={taskLists?.map(list => list.id) || []}
                  strategy={horizontalListSortingStrategy}
                >
                  {taskLists?.map((list) => (
                    <SortableColumn
                      key={list.id}
                      list={list}
                      projectId={projectId!}
                      onCreateTask={() => handleCreateTask(list.id)}
                      searchQuery={searchQuery}
                      filterPriority={filterPriority}
                    />
                  ))}
                </SortableContext>

                {/* Add List Column Placeholder */}
                {taskLists && taskLists.length > 0 && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setIsCreateListOpen(true)}
                    className="flex-shrink-0 w-80 h-fit p-6 rounded-2xl bg-white/5 hover:bg-white/10 border-2 border-dashed border-white/20 hover:border-purple-500/50 transition-all group"
                  >
                    <div className="flex flex-col items-center gap-3 text-slate-400 group-hover:text-purple-400 transition-colors">
                      <Plus className="w-8 h-8" />
                      <span className="font-semibold">Add Another List</span>
                    </div>
                  </motion.button>
                )}

                {/* Empty State */}
                {!isLoading && (!taskLists || taskLists.length === 0) && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex-1 flex flex-col items-center justify-center"
                  >
                    <div className="relative">
                      <motion.div
                        animate={{
                          scale: [1, 1.2, 1],
                          rotate: [0, 10, -10, 0],
                        }}
                        transition={{ duration: 4, repeat: Infinity }}
                        className="absolute inset-0 bg-gradient-to-br from-purple-500/30 to-pink-500/30 rounded-full blur-3xl"
                      />
                      <div className="relative w-32 h-32 bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl flex items-center justify-center border border-white/10">
                        <LayoutGrid className="w-16 h-16 text-slate-600" />
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold text-white mt-8">No Lists Yet</h3>
                    <p className="text-slate-400 mt-2 max-w-md text-center">
                      Create your first list to start organizing tasks
                    </p>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setIsCreateListOpen(true)}
                      className="mt-8 px-8 py-4 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold shadow-lg shadow-purple-500/25 transition-all flex items-center gap-2"
                    >
                      <Plus className="w-5 h-5" />
                      Create First List
                      <Sparkles className="w-5 h-5" />
                    </motion.button>
                  </motion.div>
                )}
              </div>

              <DragOverlay>
                {activeTask && (
                  <div className="opacity-50">
                    <TaskCard task={activeTask} isDragging />
                  </div>
                )}
              </DragOverlay>
            </DndContext>
          )}
        </div>

        {/* Sidebar */}
        <AnimatePresence>
          {isSidebarOpen && (
            <KanbanSidebar
              projectId={projectId!}
              onClose={() => setIsSidebarOpen(false)}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Dialogs */}
      <CreateTaskListDialog
        isOpen={isCreateListOpen}
        onClose={() => setIsCreateListOpen(false)}
        projectId={projectId!}
      />

      {selectedListId && (
        <CreateTaskDialog
          isOpen={isCreateTaskOpen}
          onClose={() => {
            setIsCreateTaskOpen(false);
            setSelectedListId(null);
          }}
          taskListId={selectedListId}
          projectId={projectId!}
        />
      )}
    </div>
  );
};