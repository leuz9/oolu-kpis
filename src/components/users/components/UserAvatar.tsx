import React from 'react';
import { User } from '../../../types';

interface UserAvatarProps {
  user: User;
  size?: 'sm' | 'md' | 'lg';
}

export default function UserAvatar({ user, size = 'md' }: UserAvatarProps) {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12'
  };

  const sizeClass = sizeClasses[size];

  return (
    <div className={`${sizeClass} rounded-full bg-primary-100 flex items-center justify-center`}>
      {user.photoURL ? (
        <img
          src={user.photoURL}
          alt={user.displayName || ''}
          className={`${sizeClass} rounded-full object-cover`}
        />
      ) : (
        <span className="text-primary-600 font-medium text-sm">
          {user.displayName?.charAt(0) || user.email.charAt(0)}
        </span>
      )}
    </div>
  );
}