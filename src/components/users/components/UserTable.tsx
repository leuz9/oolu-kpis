import React from 'react';
import { User } from '../../../types';
import UserTableRow from './UserTableRow';

interface UserTableProps {
  users: User[];
  selectedUsers: Set<string>;
  onSelectUser: (userId: string) => void;
  onSelectAll: (selected: boolean) => void;
  onShowActions: (userId: string | null) => void;
  showActions: string | null;
  onEdit: (user: User) => void;
  onDelete: (userId: string) => void;
  onPasswordReset: (userId: string) => void;
  onLinkTeamMember: (user: User) => void;
}

export default function UserTable({
  users,
  selectedUsers,
  onSelectUser,
  onSelectAll,
  onShowActions,
  showActions,
  onEdit,
  onDelete,
  onPasswordReset,
  onLinkTeamMember
}: UserTableProps) {
  return (
    <div className="bg-white shadow-sm rounded-lg overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left">
              <input
                type="checkbox"
                checked={selectedUsers.size === users.length}
                onChange={(e) => onSelectAll(e.target.checked)}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              User
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Role & Department
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Last Activity
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {users.map((user) => (
            <UserTableRow
              key={user.id}
              user={user}
              selected={selectedUsers.has(user.id)}
              onSelect={onSelectUser}
              showActions={showActions === user.id}
              onShowActions={onShowActions}
              onEdit={onEdit}
              onDelete={onDelete}
              onPasswordReset={onPasswordReset}
              onLinkTeamMember={onLinkTeamMember}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}