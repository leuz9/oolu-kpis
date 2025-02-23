import React from 'react';
import { 
  Edit, 
  Key, 
  Link, 
  Send, 
  Lock, 
  Eye, 
  UserX 
} from 'lucide-react';
import { User } from '../../../types';

interface UserActionsProps {
  user: User;
  onEdit: (user: User) => void;
  onDelete: (userId: string) => void;
  onPasswordReset: (userId: string) => void;
  onLinkTeamMember: (user: User) => void;
  onClose: () => void;
}

export default function UserActions({
  user,
  onEdit,
  onDelete,
  onPasswordReset,
  onLinkTeamMember,
  onClose
}: UserActionsProps) {
  return (
    <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
      <div className="py-1" role="menu">
        <button
          onClick={() => {
            onEdit(user);
            onClose();
          }}
          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
        >
          <Edit className="h-4 w-4 mr-3" />
          Edit User
        </button>

        <button
          onClick={() => {
            onPasswordReset(user.id);
            onClose();
          }}
          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
        >
          <Key className="h-4 w-4 mr-3" />
          Reset Password
        </button>

        <button
          onClick={() => {
            onLinkTeamMember(user);
            onClose();
          }}
          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
        >
          <Link className="h-4 w-4 mr-3" />
          Link Team Member
        </button>

        <button
          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
        >
          <Send className="h-4 w-4 mr-3" />
          Send Welcome Email
        </button>

        <button
          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
        >
          <Lock className="h-4 w-4 mr-3" />
          Manage Permissions
        </button>

        <button
          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
        >
          <Eye className="h-4 w-4 mr-3" />
          View Activity
        </button>

        <button
          onClick={() => {
            onDelete(user.id);
            onClose();
          }}
          className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
        >
          <UserX className="h-4 w-4 mr-3" />
          Delete User
        </button>
      </div>
    </div>
  );
}