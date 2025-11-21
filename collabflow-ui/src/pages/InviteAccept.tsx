import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertCircle, Sparkles, Zap } from 'lucide-react';
import { useAcceptInvite } from '../hooks/useTeams';
import { Button } from '../components/shared';

export const InviteAccept: React.FC = () => {
  const navigate = useNavigate();
  const { token } = useParams<{ token: string }>();
  const { mutate: acceptInvite, isPending, isSuccess, isError, error } = useAcceptInvite();

  useEffect(() => {
    if (token) {
      acceptInvite(token);
    }
  }, [token, acceptInvite]);

  useEffect(() => {
    if (isSuccess) {
      const timer = setTimeout(() => {
        navigate('/teams');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isSuccess, navigate]);

  const getErrorMessage = () => {
    const errorData = (error as any)?.response?.data;
    if (errorData?.message) {
      return errorData.message;
    }
    if ((error as any)?.response?.status === 400) {
      return 'This invite link has expired or is invalid';
    }
    return 'Failed to join team';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden flex items-center justify-center p-4">
      {/* Animated background gradients */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{
            scale: [1, 1.5, 1],
            x: [0, 100, 0],
            y: [0, -50, 0],
            opacity: isPending ? [0.2, 0.4, 0.2] : isSuccess ? [0.3, 0.5, 0.3] : [0.15, 0.25, 0.15],
          }}
          transition={{
            duration: isPending ? 3 : 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className={`absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl ${
            isSuccess 
              ? 'bg-gradient-to-br from-green-500/30 to-emerald-500/30' 
              : isError 
              ? 'bg-gradient-to-br from-red-500/30 to-orange-500/30'
              : 'bg-gradient-to-br from-blue-500/30 to-purple-500/30'
          }`}
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            x: [0, -80, 0],
            y: [0, 60, 0],
            opacity: isPending ? [0.25, 0.35, 0.25] : [0.2, 0.3, 0.2],
          }}
          transition={{
            duration: isPending ? 2.5 : 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
          className={`absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl ${
            isSuccess 
              ? 'bg-gradient-to-br from-emerald-500/30 to-teal-500/30' 
              : isError 
              ? 'bg-gradient-to-br from-orange-500/30 to-red-500/30'
              : 'bg-gradient-to-br from-purple-500/30 to-pink-500/30'
          }`}
        />
      </div>

      {/* Floating particles for success state */}
      {isSuccess && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ 
                opacity: 0, 
                scale: 0,
                x: '50vw',
                y: '50vh',
              }}
              animate={{
                opacity: [0, 1, 0],
                scale: [0, 1, 0.5],
                x: `${Math.random() * 100}vw`,
                y: `${Math.random() * 100}vh`,
              }}
              transition={{
                duration: 2,
                delay: i * 0.1,
                ease: "easeOut",
              }}
              className="absolute w-2 h-2 bg-gradient-to-br from-green-400 to-emerald-400 rounded-full"
            />
          ))}
        </div>
      )}

      {/* Main card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Glow effect */}
        <motion.div
          animate={{
            opacity: isPending ? [0.5, 0.8, 0.5] : [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className={`absolute inset-0 rounded-3xl blur-2xl ${
            isSuccess 
              ? 'bg-gradient-to-r from-green-500/30 to-emerald-500/30'
              : isError
              ? 'bg-gradient-to-r from-red-500/30 to-orange-500/30'
              : 'bg-gradient-to-r from-blue-500/30 to-purple-500/30'
          }`}
        />

        <div className="relative rounded-3xl border border-white/10 bg-white/5 backdrop-blur-2xl p-10 text-center shadow-2xl overflow-hidden">
          {/* Gradient overlay */}
          <div className={`absolute inset-0 ${
            isSuccess 
              ? 'bg-gradient-to-br from-green-500/5 via-transparent to-emerald-500/5'
              : isError
              ? 'bg-gradient-to-br from-red-500/5 via-transparent to-orange-500/5'
              : 'bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5'
          }`} />

          <div className="relative z-10">
            <AnimatePresence mode="wait">
              {isPending ? (
                <motion.div
                  key="pending"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  {/* Spinner */}
                  <div className="relative mx-auto mb-8 w-20 h-20">
                    <motion.div
                      className="absolute inset-0 rounded-full border-4 border-blue-500/20"
                    />
                    <motion.div
                      className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-500"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                    <motion.div
                      className="absolute inset-2 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center"
                    >
                      <Sparkles className="h-6 w-6 text-blue-400" />
                    </motion.div>
                  </div>

                  <h2 className="text-3xl font-bold text-white mb-3">Processing...</h2>
                  <p className="text-lg text-slate-400 font-medium">Adding you to the team</p>

                  {/* Pulsing dots */}
                  <div className="flex items-center justify-center gap-2 mt-6">
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        className="w-2 h-2 rounded-full bg-blue-400"
                        animate={{
                          scale: [1, 1.5, 1],
                          opacity: [0.5, 1, 0.5],
                        }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          delay: i * 0.2,
                        }}
                      />
                    ))}
                  </div>
                </motion.div>
              ) : isSuccess ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  {/* Success icon */}
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ 
                      type: 'spring', 
                      stiffness: 200, 
                      damping: 15,
                      delay: 0.2 
                    }}
                    className="relative mx-auto mb-8 w-24 h-24"
                  >
                    {/* Glow ring */}
                    <motion.div
                      animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.5, 0.8, 0.5],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                      className="absolute inset-0 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 blur-xl"
                    />
                    <div className="relative w-full h-full rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-2xl">
                      <CheckCircle className="h-12 w-12 text-white" strokeWidth={2.5} />
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <h2 className="text-3xl font-bold text-white mb-4">Welcome!</h2>
                    <p className="text-lg text-slate-300 font-medium mb-2">
                      You've successfully joined the team
                    </p>
                    <p className="text-slate-400">
                      Redirecting you now...
                    </p>
                  </motion.div>

                  {/* Animated emoji */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.6, type: 'spring' }}
                    className="mt-8"
                  >
                    <motion.div
                      animate={{ 
                        y: [0, -15, 0],
                        rotate: [0, 10, -10, 0],
                      }}
                      transition={{ 
                        duration: 2, 
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                      className="text-5xl"
                    >
                      🎉
                    </motion.div>
                  </motion.div>
                </motion.div>
              ) : isError ? (
                <motion.div
                  key="error"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  {/* Error icon */}
                  <motion.div
                    initial={{ scale: 0, rotate: 180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ 
                      type: 'spring', 
                      stiffness: 200, 
                      damping: 15,
                      delay: 0.2 
                    }}
                    className="relative mx-auto mb-8 w-24 h-24"
                  >
                    {/* Glow ring */}
                    <motion.div
                      animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.5, 0.8, 0.5],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                      className="absolute inset-0 rounded-full bg-gradient-to-br from-red-500 to-orange-500 blur-xl"
                    />
                    <div className="relative w-full h-full rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center shadow-2xl">
                      <AlertCircle className="h-12 w-12 text-white" strokeWidth={2.5} />
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <h2 className="text-3xl font-bold text-white mb-4">Oops!</h2>
                    <p className="text-lg text-slate-300 font-medium mb-2">
                      {getErrorMessage()}
                    </p>
                    <p className="text-sm text-slate-400">
                      Please ask your team owner to send you a new invite link.
                    </p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="mt-8"
                  >
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button 
                        onClick={() => navigate('/teams')}
                        className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 border-0 text-white font-semibold shadow-xl shadow-purple-500/25"
                      >
                        Go to Teams
                      </Button>
                    </motion.div>
                  </motion.div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
};