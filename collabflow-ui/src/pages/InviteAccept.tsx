import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, AlertCircle } from 'lucide-react';
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
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="w-full max-w-md rounded-lg border border-gray-200 bg-white p-8 text-center dark:border-gray-700 dark:bg-gray-900 shadow-xl"
      >
        {isPending ? (
          <>
            <motion.div
              className="mx-auto mb-6 h-16 w-16 rounded-full border-4 border-gray-200 border-r-blue-600 dark:border-gray-700 dark:border-r-blue-500"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity }}
            />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Processing...</h2>
            <p className="mt-2 text-gray-600 dark:text-gray-300">Adding you to the team</p>
          </>
        ) : isSuccess ? (
          <>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.2 }}
              className="mx-auto mb-6 text-green-500"
            >
              <CheckCircle className="h-16 w-16 mx-auto" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Welcome!</h2>
              <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
                You've successfully joined the team. Redirecting you now...
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mt-8"
            >
              <div className="inline-block">
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-4xl"
                >
                  🎉
                </motion.div>
              </div>
            </motion.div>
          </>
        ) : isError ? (
          <>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.2 }}
              className="mx-auto mb-6 text-red-500"
            >
              <AlertCircle className="h-16 w-16 mx-auto" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Oops!</h2>
              <p className="mt-4 text-gray-600 dark:text-gray-300">{getErrorMessage()}</p>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Please ask your team owner to send you a new invite link.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="mt-8"
            >
              <Button onClick={() => navigate('/teams')}>Go to Teams</Button>
            </motion.div>
          </>
        ) : null}
      </motion.div>
    </div>
  );
};
