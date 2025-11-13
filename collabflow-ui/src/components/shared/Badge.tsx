import React from 'react';

interface BadgeProps {
  variant: 'OWNER' | 'ADMIN' | 'MEMBER';
  children: React.ReactNode;
}

const variantStyles = {
  OWNER: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  ADMIN: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  MEMBER: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
};

export const Badge: React.FC<BadgeProps> = ({ variant, children }) => {
  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${variantStyles[variant]}`}>
      {children}
    </span>
  );
};
