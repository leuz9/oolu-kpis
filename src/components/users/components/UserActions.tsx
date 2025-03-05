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
  const isSuperadmin = user.role === 'superadmin';

  return (
    <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
      <div className="py-1" role="menu">
        <button
          onClick={() => {
            onEdit(user);
            onClose();
          }}
          disabled={isSuperadmin}
          className={`flex items-center w-full px-4 py-2 text-sm ${
            isSuperadmin 
              ? 'text-gray-400 cursor-not-allowed bg-gray-50' 
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          <Edit className="h-4 w-4 mr-3" />
          Edit User
        </button>

        <button
          onClick={() => {
            onPasswordReset(user.id);
            onClose();
          }}
          disabled={isSuperadmin}
          className={`flex items-center w-full px-4 py-2 text-sm ${
            isSuperadmin 
              ? 'text-gray-400 cursor-not-allowed bg-gray-50' 
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          <Key className="h-4 w-4 mr-3" />
          Reset Password
        </button>

        <button
          onClick={() => {
            onLinkTeamMember(user);
            onClose();
          }}
          disabled={isSuperadmin}
          className={`flex items-center w-full px-4 py-2 text-sm ${
            isSuperadmin 
              ? 'text-gray-400 cursor-not-allowed bg-gray-50' 
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          <Link className="h-4 w-4 mr-3" />
          Link Team Member
        </button>

        <button
          className={`flex items-center w-full px-4 py-2 text-sm ${
            isSuperadmin 
              ? 'text-gray-400 cursor-not-allowed bg-gray-50' 
              : 'text-gray-700 hover:bg-gray-100'
          }`}
          disabled={isSuperadmin}
        >
          <Send className="h-4 w-4 mr-3" />
          Send Welcome Email
        </button>

        <button
          className={`flex items-center w-full px-4 py-2 text-sm ${
            isSuperadmin 
              ? 'text-gray-400 cursor-not-allowed bg-gray-50' 
              : 'text-gray-700 hover:bg-gray-100'
          }`}
          disabled={isSuperadmin}
        >
          <Lock className="h-4 w-4 mr-3" />
          Manage Permissions
        </button>

        <button
          className={`flex items-center w-full px-4 py-2 text-sm ${
            isSuperadmin 
              ? 'text-gray-400 cursor-not-allowed bg-gray-50' 
              : 'text-gray-700 hover:bg-gray-100'
          }`}
          disabled={isSuperadmin}
        >
          <Eye className="h-4 w-4 mr-3" />
          View Activity
        </button>

        <button
          onClick={() => {
            onDelete(user.id);
            onClose();
          }}
          disabled={isSuperadmin}
          className={`flex items-center w-full px-4 py-2 text-sm ${
            isSuperadmin 
              ? 'text-gray-400 cursor-not-allowed bg-gray-50' 
              : 'text-red-600 hover:bg-red-50'
          }`}
        >
          <UserX className="h-4 w-4 mr-3" />
          Delete User
        </button>

        {isSuperadmin && (
          <div className="px-4 py-2 text-xs text-gray-500 bg-gray-50 border-t border-gray-100">
            Actions disabled for superadmin users
          </div>
        )}
      </div>
    </div>
  );
}