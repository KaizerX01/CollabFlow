// components/kanban/KanbanSidebar.tsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  X,
  MessageSquare,
  FolderOpen,
  Activity,
  Users,
  BarChart3,
  Sparkles,
  Loader2,
} from 'lucide-react';
import { useParams } from 'react-router-dom';
import { useProjectTasks } from '../../hooks/useTasks';
import { useTeamDetails } from '../../hooks/useTeams';
import { formatDistanceToNow } from 'date-fns';
import { ChatPanel } from './ChatPanel';

interface KanbanSidebarProps {
  projectId: string;
  onClose: () => void;
}

type Tab = 'activity' | 'chat' | 'files' | 'team' | 'analytics';

export const KanbanSidebar: React.FC<KanbanSidebarProps> = ({ projectId, onClose }) => {
  const [activeTab, setActiveTab] = useState<Tab>('analytics');

  const tabs = [
    { id: 'analytics' as Tab, label: 'Analytics', icon: BarChart3 },
    { id: 'activity' as Tab, label: 'Activity', icon: Activity },
    { id: 'team' as Tab, label: 'Team', icon: Users },
    { id: 'chat' as Tab, label: 'Chat', icon: MessageSquare },
    { id: 'files' as Tab, label: 'Files', icon: FolderOpen },
  ];

  return (
    <motion.div
      initial={{ x: 400, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 400, opacity: 0 }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="fixed right-0 top-[73px] bottom-0 w-96 bg-slate-900/95 backdrop-blur-xl border-l border-white/10 shadow-2xl z-20 flex flex-col"
    >
      {/* Header */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-400" />
            Workspace
          </h2>
          <motion.button
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </motion.button>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <motion.button
                key={tab.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-all relative ${
                  isActive
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/25'
                    : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4 mx-auto mb-1" />
                {tab.label}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className={`flex-1 ${activeTab === 'chat' ? 'overflow-hidden p-0' : 'overflow-y-auto p-6'} relative`}>
        {activeTab === 'analytics' && <AnalyticsTab projectId={projectId} />}
        {activeTab === 'activity' && <ActivityTab projectId={projectId} />}
        {activeTab === 'team' && <TeamTab projectId={projectId} />}
        {activeTab === 'chat' && <ChatPanel projectId={projectId} />}
        {activeTab === 'files' && <FilesTab />}
      </div>
    </motion.div>
  );
};

// Analytics Tab - REAL DATA
const AnalyticsTab: React.FC<{ projectId: string }> = ({ projectId }) => {
  const { data: tasks, isLoading } = useProjectTasks(projectId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
      </div>
    );
  }

  const totalTasks = tasks?.length || 0;
  const completedTasks = tasks?.filter(t => t.completed).length || 0;
  const inProgressTasks = totalTasks - completedTasks;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Task creation trend (last 7 days)
  const getLast7Days = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      days.push(date);
    }
    return days;
  };

  const last7Days = getLast7Days();
  const tasksByDay = last7Days.map(day => {
    const dayStart = new Date(day);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(day);
    dayEnd.setHours(23, 59, 59, 999);
    
    return tasks?.filter(task => {
      const createdAt = new Date(task.createdAt);
      return createdAt >= dayStart && createdAt <= dayEnd;
    }).length || 0;
  });

  const dayLabels = last7Days.map(day => day.toLocaleDateString('en', { weekday: 'short' }));

  const maxTasks = Math.max(...tasksByDay, 1);

  // Priority distribution
  const highPriority = tasks?.filter(t => t.priority >= 3).length || 0;
  const mediumPriority = tasks?.filter(t => t.priority === 2).length || 0;
  const lowPriority = tasks?.filter(t => t.priority === 1).length || 0;

  return (
    <div className="space-y-6">
      <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Project Stats</h3>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20">
          <p className="text-2xl font-bold text-white mb-1">{totalTasks}</p>
          <p className="text-sm text-slate-400">Total Tasks</p>
        </div>
        <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-500/10 to-green-500/10 border border-emerald-500/20">
          <p className="text-2xl font-bold text-white mb-1">{completedTasks}</p>
          <p className="text-sm text-slate-400">Completed</p>
        </div>
        <div className="p-4 rounded-xl bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/20">
          <p className="text-2xl font-bold text-white mb-1">{inProgressTasks}</p>
          <p className="text-sm text-slate-400">In Progress</p>
        </div>
        <div className="p-4 rounded-xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20">
          <p className="text-2xl font-bold text-white mb-1">{completionRate}%</p>
          <p className="text-sm text-slate-400">Completion</p>
        </div>
      </div>

      {/* Activity Trend */}
      <div className="p-6 rounded-xl bg-white/5 border border-white/10">
        <h4 className="font-semibold text-white mb-4">Task Creation (7 Days)</h4>
        <div className="h-32 flex items-end justify-between gap-2">
          {tasksByDay.map((count, index) => {
            const height = maxTasks > 0 ? (count / maxTasks) * 100 : 0;
            return (
              <div key={index} className="flex-1 flex flex-col items-center gap-2">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${height}%` }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  className="w-full bg-gradient-to-t from-purple-500 to-pink-500 rounded-t min-h-[4px] relative group"
                >
                  {count > 0 && (
                    <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity">
                      {count}
                    </span>
                  )}
                </motion.div>
                <span className="text-xs text-slate-500">
                  {dayLabels[index]}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Priority Distribution */}
      {totalTasks > 0 && (
        <div className="p-6 rounded-xl bg-white/5 border border-white/10">
          <h4 className="font-semibold text-white mb-4">Priority Distribution</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-400">High Priority</span>
              <span className="text-sm font-semibold text-red-400">{highPriority}</span>
            </div>
            <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(highPriority / totalTasks) * 100}%` }}
                className="h-full bg-gradient-to-r from-red-500 to-orange-500"
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-400">Medium Priority</span>
              <span className="text-sm font-semibold text-orange-400">{mediumPriority}</span>
            </div>
            <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(mediumPriority / totalTasks) * 100}%` }}
                className="h-full bg-gradient-to-r from-orange-500 to-yellow-500"
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-400">Low Priority</span>
              <span className="text-sm font-semibold text-yellow-400">{lowPriority}</span>
            </div>
            <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(lowPriority / totalTasks) * 100}%` }}
                className="h-full bg-gradient-to-r from-yellow-500 to-green-500"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Activity Tab - REAL DATA
const ActivityTab: React.FC<{ projectId: string }> = ({ projectId }) => {
  const { data: tasks, isLoading } = useProjectTasks(projectId);
  const { teamId } = useParams<{ teamId: string }>();
  const { data: teamDetails } = useTeamDetails(teamId!);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
      </div>
    );
  }

  // Sort tasks by most recently updated
  const recentTasks = [...(tasks || [])]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 10);

  const getActivityType = (task: any) => {
    const created = new Date(task.createdAt);
    const updated = new Date(task.updatedAt);
    
    if (task.completed) return 'completed';
    if (updated.getTime() - created.getTime() > 1000) return 'updated';
    return 'created';
  };

  const getActivityText = (type: string) => {
    switch (type) {
      case 'completed': return 'completed task';
      case 'updated': return 'updated task';
      case 'created': return 'created task';
      default: return 'modified task';
    }
  };

  // Helper to get user info from team members
  const getUserInfo = (userId: string) => {
    return teamDetails?.members?.find(m => m.id === userId);
  };

  if (!recentTasks.length) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center mb-4">
          <Activity className="w-10 h-10 text-purple-400" />
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">No Activity Yet</h3>
        <p className="text-sm text-slate-400 max-w-xs">
          Task activity will appear here as your team works
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Recent Activity</h3>
      {recentTasks.map((task, index) => {
        const activityType = getActivityType(task);
        // First try assignee, then try to get creator from team members
        const assignee = task.assignees?.[0];
        const creator = getUserInfo(task.createdBy);
        const actor = assignee || creator;
        const actorName = actor?.username || 'Someone';
        const actorInitial = actorName[0]?.toUpperCase() || 'U';

        return (
          <motion.div
            key={task.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
          >
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                {actorInitial}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white">
                  <span className="font-semibold">{actorName}</span>{' '}
                  <span className="text-slate-400">{getActivityText(activityType)}</span>{' '}
                  <span className="font-medium text-purple-400">{task.title}</span>
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  {formatDistanceToNow(new Date(task.updatedAt), { addSuffix: true })}
                </p>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

// Team Tab - REAL DATA
const TeamTab: React.FC<{ projectId: string }> = ({ projectId: _projectId }) => {
  const { teamId } = useParams<{ teamId: string }>();
  const { data: teamDetails, isLoading } = useTeamDetails(teamId!);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
      </div>
    );
  }

  const members = teamDetails?.members || [];

  if (!members.length) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center mb-4">
          <Users className="w-10 h-10 text-purple-400" />
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">No Team Members</h3>
        <p className="text-sm text-slate-400 max-w-xs">
          Invite team members to collaborate on this project
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
        Team Members ({members.length})
      </h3>
      {members.map((member, index) => (
        <motion.div
          key={member.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
          className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold">
              {member.username[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-white">{member.username}</p>
              <p className="text-sm text-slate-400">{member.email}</p>
            </div>
            <div className="flex flex-col items-end gap-1">
              <span className={`text-xs px-2 py-1 rounded ${
                member.role === 'OWNER' 
                  ? 'bg-purple-500/20 text-purple-400'
                  : member.role === 'ADMIN'
                  ? 'bg-blue-500/20 text-blue-400'
                  : 'bg-slate-500/20 text-slate-400'
              }`}>
                {member.role}
              </span>
              <div className="w-2 h-2 rounded-full bg-emerald-400" />
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};



// Files Tab - PLACEHOLDER
const FilesTab: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center">
      <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center mb-4">
        <FolderOpen className="w-10 h-10 text-blue-400" />
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">File Storage</h3>
      <p className="text-sm text-slate-400 max-w-xs">
        Upload and manage project files and attachments
      </p>
    </div>
  );
};