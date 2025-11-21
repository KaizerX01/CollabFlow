import React, { useState } from 'react';
import { ArrowRight, Users, Sparkles, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card, Badge, Button } from './shared';
import type { Team } from '../api/teams';

interface TeamCardProps {
  team: Team;
  onViewDetails: () => void;
}

export const TeamCard: React.FC<TeamCardProps> = ({ team, onViewDetails }) => {
  const [isHovered, setIsHovered] = useState(false);

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
      {/* Animated gradient glow on hover */}
      <motion.div
        className="absolute -inset-0.5 rounded-3xl bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 opacity-0 blur-2xl transition-opacity duration-500"
        animate={{ opacity: isHovered ? 0.3 : 0 }}
      />

      {/* Main card wrapper */}
      <Card hover className="!p-0 h-full relative overflow-hidden rounded-3xl border-slate-200/60 dark:border-slate-700/60">
        {/* Animated mesh gradient background */}
        <motion.div
          className="absolute inset-0 opacity-0 transition-opacity duration-700"
          animate={{ opacity: isHovered ? 1 : 0 }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10" />
          <motion.div
            className="absolute top-0 left-0 w-full h-full"
            animate={{
              background: [
                'radial-gradient(circle at 20% 30%, rgba(59, 130, 246, 0.1) 0%, transparent 50%)',
                'radial-gradient(circle at 80% 70%, rgba(168, 85, 247, 0.1) 0%, transparent 50%)',
                'radial-gradient(circle at 40% 60%, rgba(236, 72, 153, 0.1) 0%, transparent 50%)',
                'radial-gradient(circle at 20% 30%, rgba(59, 130, 246, 0.1) 0%, transparent 50%)',
              ],
            }}
            transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
          />
        </motion.div>

        {/* Content container */}
        <div className="relative flex flex-col h-full p-6 backdrop-blur-sm">
          {/* Header section with decorative elements */}
          <div className="flex items-start justify-between mb-4">
            <motion.div
              className="flex-1"
              initial={{ x: -10, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              {/* Team icon with gradient */}
              <motion.div
                className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30 dark:border-purple-500/30 mb-4"
                whileHover={{ scale: 1.05, rotate: 5 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </motion.div>

              {/* Team name with hover effect */}
              <motion.h3
                className="text-xl font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2"
                whileHover={{ x: 2 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                {team.name}
                {isHovered && (
                  <motion.span
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    exit={{ scale: 0, rotate: 180 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    <Sparkles className="h-4 w-4 text-purple-500" />
                  </motion.span>
                )}
              </motion.h3>
            </motion.div>

            {/* Trending indicator */}
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 dark:bg-emerald-400/10 border border-emerald-500/20"
            >
              <TrendingUp className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">Active</span>
            </motion.div>
          </div>

          {/* Description section */}
          <motion.div
            className="flex-1 mb-6"
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.15 }}
          >
            <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
              {team.description}
            </p>
          </motion.div>

          {/* Decorative divider with gradient */}
          <motion.div
            className="relative h-px mb-6"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-700 to-transparent" />
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-blue-500/50 via-purple-500/50 to-pink-500/50 opacity-0"
              animate={{ opacity: isHovered ? 1 : 0 }}
              transition={{ duration: 0.3 }}
            />
          </motion.div>

          {/* Footer with action button */}
          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.25 }}
            className="flex items-center justify-between"
          >
            {/* Stats badge (you can customize this based on your Team type) */}
            <div className="flex items-center gap-2">
              <motion.div
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100/80 dark:bg-slate-700/50 backdrop-blur-sm border border-slate-200/50 dark:border-slate-600/50"
                whileHover={{ scale: 1.05 }}
                transition={{ type: 'spring', stiffness: 400 }}
              >
                <Users className="h-3.5 w-3.5 text-slate-600 dark:text-slate-400" />
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Team
                </span>
              </motion.div>
            </div>

            {/* View Details button */}
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                variant="outline"
                size="sm"
                onClick={onViewDetails}
                className="group/btn relative overflow-hidden rounded-xl border-slate-200/60 dark:border-slate-700/60 hover:border-blue-500/50 dark:hover:border-blue-400/50 transition-all duration-300"
              >
                {/* Button gradient background on hover */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"
                />
                
                <span className="relative flex items-center gap-2 font-semibold">
                  <span className="text-slate-700 dark:text-slate-300">View Details</span>
                  <motion.span
                    animate={{ x: isHovered ? 3 : 0 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    <ArrowRight className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </motion.span>
                </span>
              </Button>
            </motion.div>
          </motion.div>
        </div>

        {/* Corner accent decoration */}
        <motion.div
          className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-transparent rounded-bl-full opacity-0"
          animate={{ opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        />
        <motion.div
          className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-purple-500/10 to-transparent rounded-tr-full opacity-0"
          animate={{ opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        />
      </Card>
    </motion.div>
  );
};