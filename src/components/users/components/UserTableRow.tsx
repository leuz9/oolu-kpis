import React from 'react';
import { 
  MoreVertical, 
  Edit, 
  Key, 
  Link, 
  Send, 
  Lock, 
  Eye, 
  UserX 
} from 'lucide-react';
import { User } from '../../../types';
import UserAvatar from './UserAvatar';
import UserActions from './UserActions';

interface UserTableRowProps {
  user: User;
  selected: boolean;
  onSelect: (userId: string) => void;
  showActions: boolean;
  onShowActions: (userId: string | null) => void;
  onEdit: (user: User) => void;
  onDelete: (userId: string) => void;
  onPasswordReset: (userId: string) => void;
  onLinkTeamMember: (user: User) => void;
}

export default function UserTableRow({
  user,
  selected,
  onSelect,
  showActions,
  onShowActions,
  onEdit,
  onDelete,
  onPasswordReset,
  onLinkTeamMember
}: UserTableRowProps) {
  return (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4">
        <input
          type="checkbox"
          checked={selected}
          onChange={() => onSelect(user.id)}
          className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
        />
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <UserAvatar user={user} />
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">
              {user.displayName}
            </div>
            <div className="text-sm text-gray-500">{user.email}</div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex flex-col">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
            {user.role}
          </span>
          {user.department && (
            <span className="mt-1 text-sm text-gray-500">
              {user.department}
            </span>
          )}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          user.status === 'active' ? 'bg-green-100 text-green-800' :
          user.status === 'inactive' ? 'bg-red-100 text-red-800' :
          'bg-yellow-100 text-yellow-800'
        }`}>
          {user.status}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {user.lastLogin ? (
          <div className="flex flex-col">
            <span>Last login: {new Date(user.lastLogin).toLocaleDateString()}</span>
            <span className="text-xs text-gray-400">
              {new Date(user.lastLogin).toLocaleTimeString()}
            </span>
          </div>
        ) : (
          'Never'
        )}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <div className="relative inline-block text-left">
          <button
            onClick={() => onShowActions(showActions ? null : user.id)}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
          >
            <MoreVertical className="h-5 w-5" />
          </button>

          {showActions && (
            <UserActions
              user={user}
              onEdit={onEdit}
              onDelete={onDelete}
              onPasswordReset={onPasswordReset}
              onLinkTeamMember={onLinkTeamMember}
              onClose={() => onShowActions(null)}
            />
          )}
        </div>
      </td>
    </tr>
  );
}