import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MoreVertical,
  Edit3,
  Trash2,
  Calendar,
  FolderOpen,
  Clock,
  TrendingUp,
  Zap,
} from 'lucide-react';
import type { ProjectResponse } from '../api/projects';
import { Button } from './shared';

interface ProjectCardProps {
  project: ProjectResponse;
  onEdit: () => void;
  onDelete: () => void;
  onClick: () => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  onEdit,
  onDelete,
  onClick,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays}d ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)}w ago`;
    return formatDate(dateString);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="group relative h-full"
    >
      {/* Animated gradient border */}
      <motion.div
        className="absolute -inset-[1px] rounded-3xl opacity-0"
        style={{
          background: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 25%, #ec4899 50%, #8b5cf6 75%, #f59e0b 100%)',
          backgroundSize: '200% 200%',
        }}
        animate={{ 
          opacity: isHovered ? 1 : 0,
          backgroundPosition: isHovered ? ['0% 50%', '100% 50%', '0% 50%'] : '0% 50%',
        }}
        transition={{
          opacity: { duration: 0.3 },
          backgroundPosition: { duration: 3, repeat: Infinity, ease: 'linear' },
        }}
      />

      {/* Outer glow */}
      <motion.div
        className="absolute inset-0 rounded-3xl blur-2xl"
        style={{
          background: 'radial-gradient(circle at center, rgba(245, 158, 11, 0.4), rgba(139, 92, 246, 0.3), transparent)',
        }}
        animate={{ opacity: isHovered ? 0.7 : 0 }}
        transition={{ duration: 0.3 }}
      />

      {/* Main card */}
      <motion.div
        className="relative h-full rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900/95 via-slate-800/95 to-slate-900/95 backdrop-blur-xl overflow-hidden cursor-pointer shadow-2xl"
        whileHover={{ y: -8 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        onClick={onClick}
      >
        {/* Header with animated gradient */}
        <div className="relative h-40 overflow-hidden">
          {/* Base gradient */}
          <motion.div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.3) 0%, rgba(239, 68, 68, 0.2) 50%, rgba(139, 92, 246, 0.3) 100%)',
            }}
            animate={{
              backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              ease: 'linear',
            }}
          />

          {/* Animated grid */}
          <motion.div
            className="absolute inset-0"
            style={{
              backgroundImage: `
                linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)
              `,
              backgroundSize: '30px 30px',
            }}
            animate={{
              backgroundPosition: isHovered ? ['0px 0px', '30px 30px'] : '0px 0px',
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: 'linear',
            }}
          />

          {/* Floating orbs */}
          <motion.div
            animate={{
              x: [0, 60, 0],
              y: [0, -40, 0],
              scale: [1, 1.3, 1],
              opacity: [0.4, 0.8, 0.4],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="absolute -top-10 -left-10 w-40 h-40 bg-orange-500/50 rounded-full blur-3xl"
          />
          <motion.div
            animate={{
              x: [0, -50, 0],
              y: [0, 30, 0],
              scale: [1.2, 1, 1.2],
              opacity: [0.3, 0.7, 0.3],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 2,
            }}
            className="absolute -bottom-10 -right-10 w-40 h-40 bg-purple-500/50 rounded-full blur-3xl"
          />

          {/* Project icon with 3D effect */}
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              whileHover={{ 
                scale: 1.15, 
                rotateY: 15, 
                rotateX: 15,
              }}
              transition={{ type: 'spring', stiffness: 300 }}
              style={{ transformStyle: 'preserve-3d' }}
              className="relative"
            >
              {/* Icon shadow */}
              <div className="absolute inset-0 w-20 h-20 bg-gradient-to-br from-orange-600/60 to-purple-600/60 rounded-2xl blur-xl" />
              
              {/* Icon container */}
              <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-orange-500 via-red-500 to-purple-600 flex items-center justify-center border border-white/30 shadow-2xl">
                <FolderOpen className="h-10 w-10 text-white" strokeWidth={2} />
                
                {/* Shine effect */}
                <motion.div
                  className="absolute inset-0 rounded-2xl"
                  style={{
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.6) 0%, transparent 50%)',
                  }}
                  animate={{
                    opacity: isHovered ? [0, 0.8, 0] : 0,
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: isHovered ? Infinity : 0,
                  }}
                />
              </div>
            </motion.div>
          </div>

          {/* Scanlines */}
          <motion.div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.05) 2px, rgba(255,255,255,0.05) 4px)',
            }}
            animate={{
              y: isHovered ? [0, -100] : 0,
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'linear',
            }}
          />
        </div>

        {/* Card content */}
        <div className="relative p-6">
          {/* Glass overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />

          <div className="relative space-y-4">
            {/* Title and dropdown */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <h3 className="text-xl font-bold text-white truncate mb-1 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-orange-400 group-hover:via-red-400 group-hover:to-purple-400 group-hover:bg-clip-text transition-all duration-300">
                  {project.name}
                </h3>
                <p className="text-sm text-slate-400 line-clamp-2 min-h-[2.5rem] leading-relaxed">
                  {project.description || 'No description provided'}
                </p>
              </div>

              {/* Dropdown */}
              <div ref={dropdownRef} className="relative flex-shrink-0">
                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9 w-9 p-0 rounded-xl border-white/10 bg-white/5 backdrop-blur-sm hover:bg-white/10 hover:border-white/20"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsDropdownOpen((prev) => !prev);
                    }}
                  >
                    <motion.div
                      animate={{ rotate: isDropdownOpen ? 90 : 0 }}
                      transition={{ type: 'spring', stiffness: 300 }}
                    >
                      <MoreVertical className="h-4 w-4 text-slate-300" />
                    </motion.div>
                  </Button>
                </motion.div>

                <AnimatePresence>
                  {isDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -10 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-56 origin-top-right rounded-2xl bg-slate-900/98 backdrop-blur-2xl shadow-2xl ring-1 ring-white/10 z-50 overflow-hidden"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {/* Header */}
                      <div className="bg-gradient-to-r from-orange-500/10 via-red-500/10 to-purple-500/10 px-4 py-3 border-b border-white/10">
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                          <Zap className="h-3 w-3" />
                          Actions
                        </p>
                      </div>

                      <div className="py-2">
                        <motion.button
                          whileHover={{ x: 4, backgroundColor: 'rgba(245, 158, 11, 0.1)' }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsDropdownOpen(false);
                            onEdit();
                          }}
                          className="w-full text-left px-4 py-3 text-sm font-medium text-slate-200 transition-colors flex items-center gap-3 rounded-lg mx-1"
                        >
                          <Edit3 className="h-4 w-4 text-orange-400" />
                          <span>Edit Project</span>
                        </motion.button>

                        <div className="h-px bg-white/10 my-2 mx-3" />

                        <motion.button
                          whileHover={{ x: 4, backgroundColor: 'rgba(239, 68, 68, 0.1)' }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsDropdownOpen(false);
                            onDelete();
                          }}
                          className="w-full text-left px-4 py-3 text-sm font-medium text-red-400 transition-colors flex items-center gap-3 rounded-lg mx-1"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span>Delete Project</span>
                        </motion.button>
                      </div>

                      {/* Footer */}
                      <div className="h-1 bg-gradient-to-r from-orange-500/20 via-red-500/20 to-purple-500/20" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

            {/* Metadata */}
            <div className="flex items-center justify-between gap-4 text-xs">
              <div className="flex items-center gap-2 text-slate-400">
                <Calendar className="h-3.5 w-3.5 text-orange-400/70" />
                <span>{formatDate(project.createdAt)}</span>
              </div>

              {project.updatedAt !== project.createdAt && (
                <div className="flex items-center gap-2 text-slate-400">
                  <Clock className="h-3.5 w-3.5 text-purple-400/70" />
                  <span>{getRelativeTime(project.updatedAt)}</span>
                </div>
              )}
            </div>

            {/* Status badges */}
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-emerald-500/10 to-green-500/10 border border-emerald-500/30">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-semibold text-emerald-400">Active</span>
              </div>
              
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-orange-500/10 to-amber-500/10 border border-orange-500/30">
                <TrendingUp className="h-3 w-3 text-orange-400" />
                <span className="text-xs font-semibold text-orange-400">In Progress</span>
              </div>
            </div>
          </div>
        </div>

        {/* Hover shimmer */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)',
          }}
          animate={{
            x: isHovered ? ['-100%', '200%'] : '-100%',
          }}
          transition={{
            duration: 1.5,
            ease: 'easeInOut',
          }}
        />
      </motion.div>
    </motion.div>
  );
};