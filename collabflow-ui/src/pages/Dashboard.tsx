import React, { lazy } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Users,
  ListTodo,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  Clock,
  Zap,
  Loader2,
  LayoutDashboard,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useDashboard } from "../hooks/useDashboard";
import { Button } from "../components/shared";
import { formatDistanceToNow } from "date-fns";

const PremiumBackground = lazy(() =>
  import("../components/PremiumBackground").then((m) => ({
    default: m.PremiumBackground,
  }))
);

const priorityConfig: Record<number, { label: string; color: string }> = {
  0: { label: "None", color: "text-slate-400 bg-slate-500/10" },
  1: { label: "Low", color: "text-blue-400 bg-blue-500/10" },
  2: { label: "Medium", color: "text-yellow-400 bg-yellow-500/10" },
  3: { label: "High", color: "text-orange-400 bg-orange-500/10" },
  4: { label: "Urgent", color: "text-red-400 bg-red-500/10" },
  5: { label: "Critical", color: "text-red-500 bg-red-500/20" },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.2 },
  },
};

const staggerItem = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 300, damping: 30 },
  },
};

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { data: dashboard, isLoading, error } = useDashboard();

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const userName = currentUser?.displayName || currentUser?.username || "there";

  if (isLoading) {
    return (
      <PremiumBackground variant="teams" intensity="low">
        <div className="min-h-screen flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center gap-4"
          >
            <Loader2 className="h-8 w-8 text-blue-400 animate-spin" />
            <p className="text-slate-400 text-sm">Loading dashboard...</p>
          </motion.div>
        </div>
      </PremiumBackground>
    );
  }

  if (error) {
    return (
      <PremiumBackground variant="teams" intensity="low">
        <div className="min-h-screen flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative z-10 max-w-md w-full mx-4"
          >
            <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 shadow-2xl text-center">
              <Zap className="h-12 w-12 text-red-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">
                Failed to load dashboard
              </h3>
              <p className="text-slate-400 mb-6">
                Please check your connection and try again.
              </p>
              <Button
                onClick={() => window.location.reload()}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 border-0 text-white font-semibold"
              >
                Retry
              </Button>
            </div>
          </motion.div>
        </div>
      </PremiumBackground>
    );
  }

  const stats = dashboard?.stats;
  const statCards = [
    {
      label: "Teams",
      value: stats?.totalTeams ?? 0,
      icon: <Users className="h-5 w-5" />,
      gradient: "from-blue-500 to-cyan-500",
      shadow: "shadow-blue-500/20",
    },
    {
      label: "Active Tasks",
      value: stats?.totalAssignedTasks ?? 0,
      icon: <ListTodo className="h-5 w-5" />,
      gradient: "from-purple-500 to-pink-500",
      shadow: "shadow-purple-500/20",
    },
    {
      label: "Overdue",
      value: stats?.overdueTasks ?? 0,
      icon: <AlertTriangle className="h-5 w-5" />,
      gradient: "from-orange-500 to-red-500",
      shadow: "shadow-orange-500/20",
    },
    {
      label: "Completed",
      value: stats?.completedTasksThisWeek ?? 0,
      icon: <CheckCircle2 className="h-5 w-5" />,
      gradient: "from-emerald-500 to-teal-500",
      shadow: "shadow-emerald-500/20",
    },
  ];

  return (
    <PremiumBackground variant="teams" intensity="medium">
      <div className="min-h-screen relative overflow-hidden">
        <div className="relative z-10 mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          {/* Welcome header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-10"
          >
            <div className="flex items-center gap-4 mb-2">
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{
                  duration: 20,
                  repeat: Infinity,
                  ease: "linear",
                }}
                className="hidden sm:flex h-14 w-14 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 items-center justify-center shadow-lg shadow-blue-500/25"
              >
                <LayoutDashboard className="h-7 w-7 text-white" />
              </motion.div>
              <div>
                <h1 className="text-3xl lg:text-4xl font-bold text-white">
                  {greeting()},{" "}
                  <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    {userName}
                  </span>
                </h1>
                <p className="mt-1 text-slate-400">
                  Here's what's happening across your workspace
                </p>
              </div>
            </div>
          </motion.div>

          {/* Stats row */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10"
          >
            {statCards.map((stat) => (
              <motion.div key={stat.label} variants={staggerItem}>
                <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-2xl p-5 hover:bg-white/[0.07] transition-colors">
                  <div className="flex items-center justify-between mb-3">
                    <div
                      className={`h-10 w-10 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-lg ${stat.shadow}`}
                    >
                      {stat.icon}
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-white">{stat.value}</p>
                  <p className="text-sm text-slate-400 mt-1">{stat.label}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left column: Teams + Tasks */}
            <div className="lg:col-span-2 space-y-8">
              {/* My Teams */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-white">
                    My Teams
                  </h2>
                  <button
                    onClick={() => navigate("/teams")}
                    className="text-sm text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1"
                  >
                    View All
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>

                {dashboard?.teams && dashboard.teams.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {dashboard.teams.slice(0, 4).map((team) => (
                      <motion.button
                        key={team.id}
                        onClick={() => navigate(`/teams/${team.id}`)}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4 text-left hover:bg-white/[0.07] transition-all group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center flex-shrink-0">
                            <Users className="h-5 w-5 text-blue-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-white font-medium truncate group-hover:text-blue-300 transition-colors">
                              {team.name}
                            </p>
                            <p className="text-xs text-slate-400">
                              {team.memberCount} member
                              {team.memberCount !== 1 ? "s" : ""} &middot;{" "}
                              {team.role}
                            </p>
                          </div>
                          <ArrowRight className="h-4 w-4 text-slate-500 group-hover:text-white group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                        </div>
                      </motion.button>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white/5 border border-white/10 rounded-xl p-8 text-center">
                    <Users className="h-10 w-10 text-slate-500 mx-auto mb-3" />
                    <p className="text-slate-400 mb-4">
                      You're not in any teams yet
                    </p>
                    <Button
                      onClick={() => navigate("/teams")}
                      className="bg-gradient-to-r from-blue-500 to-purple-600 border-0 text-white font-medium"
                    >
                      Browse Teams
                    </Button>
                  </div>
                )}
              </motion.div>

              {/* Assigned Tasks */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <h2 className="text-lg font-semibold text-white mb-4">
                  Assigned Tasks
                </h2>

                {dashboard?.assignedTasks &&
                dashboard.assignedTasks.length > 0 ? (
                  <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-2xl overflow-hidden">
                    <div className="divide-y divide-white/5">
                      {dashboard.assignedTasks
                        .filter((t) => !t.completed)
                        .slice(0, 8)
                        .map((task) => {
                          const isOverdue =
                            task.dueDate &&
                            new Date(task.dueDate) < new Date() &&
                            !task.completed;
                          const prio =
                            priorityConfig[task.priority] || priorityConfig[0];

                          return (
                            <button
                              key={task.id}
                              onClick={() =>
                                navigate(
                                  `/teams/${task.teamId}/projects/${task.projectId}/workspace`
                                )
                              }
                              className="w-full flex items-center gap-4 px-5 py-4 hover:bg-white/[0.03] transition-colors text-left group"
                            >
                              <div
                                className={`w-2 h-2 rounded-full flex-shrink-0 ${
                                  isOverdue
                                    ? "bg-red-400 animate-pulse"
                                    : task.completed
                                    ? "bg-emerald-400"
                                    : "bg-blue-400"
                                }`}
                              />
                              <div className="flex-1 min-w-0">
                                <p className="text-white text-sm font-medium truncate group-hover:text-blue-300 transition-colors">
                                  {task.title}
                                </p>
                                <p className="text-xs text-slate-500 truncate">
                                  {task.projectName} &middot;{" "}
                                  {task.taskListName}
                                </p>
                              </div>
                              <span
                                className={`text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${prio.color}`}
                              >
                                {prio.label}
                              </span>
                              {task.dueDate && (
                                <span
                                  className={`text-xs flex-shrink-0 flex items-center gap-1 ${
                                    isOverdue
                                      ? "text-red-400"
                                      : "text-slate-400"
                                  }`}
                                >
                                  <Clock className="h-3 w-3" />
                                  {formatDistanceToNow(
                                    new Date(task.dueDate),
                                    { addSuffix: true }
                                  )}
                                </span>
                              )}
                            </button>
                          );
                        })}
                    </div>
                  </div>
                ) : (
                  <div className="bg-white/5 border border-white/10 rounded-xl p-8 text-center">
                    <CheckCircle2 className="h-10 w-10 text-emerald-400 mx-auto mb-3" />
                    <p className="text-slate-400">
                      No tasks assigned to you. You're all caught up!
                    </p>
                  </div>
                )}
              </motion.div>
            </div>

            {/* Right column: Activity feed */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
            >
              <h2 className="text-lg font-semibold text-white mb-4">
                Recent Activity
              </h2>

              <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-2xl p-4">
                {dashboard?.recentActivity &&
                dashboard.recentActivity.length > 0 ? (
                  <div className="space-y-1">
                    {dashboard.recentActivity.slice(0, 12).map((activity) => (
                      <div
                        key={activity.id}
                        className="flex gap-3 p-3 rounded-xl hover:bg-white/[0.03] transition-colors"
                      >
                        <div className="flex-shrink-0 mt-0.5">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center">
                            <span className="text-xs font-bold text-blue-400">
                              {activity.actorUsername?.[0]?.toUpperCase() || "?"}
                            </span>
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-slate-300 leading-snug">
                            {activity.message}
                          </p>
                          <p className="text-xs text-slate-500 mt-1">
                            {formatDistanceToNow(
                              new Date(activity.occurredAt),
                              { addSuffix: true }
                            )}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Clock className="h-8 w-8 text-slate-500 mx-auto mb-3" />
                    <p className="text-slate-400 text-sm">
                      No recent activity
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </PremiumBackground>
  );
};
