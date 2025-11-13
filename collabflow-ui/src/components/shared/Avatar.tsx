import React from 'react';

interface AvatarProps {
  name: string;
  avatar?: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizeStyles = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-12 w-12 text-base',
};

const getInitials = (name: string) => {
  return name
    .split(' ')
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
};

const getColorFromName = (name: string) => {
  const colors = [
    'bg-red-500',
    'bg-blue-500',
    'bg-green-500',
    'bg-yellow-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-indigo-500',
    'bg-teal-500',
  ];
  const charCode = name.charCodeAt(0);
  return colors[charCode % colors.length];
};

export const Avatar: React.FC<AvatarProps> = ({ name, avatar, size = 'md' }) => {
  if (avatar) {
    return (
      <img
        src={avatar}
        alt={name}
        className={`${sizeStyles[size]} rounded-full object-cover`}
      />
    );
  }

  return (
    <div
      className={`${sizeStyles[size]} ${getColorFromName(name)} flex items-center justify-center rounded-full font-semibold text-white`}
    >
      {getInitials(name)}
    </div>
  );
};
