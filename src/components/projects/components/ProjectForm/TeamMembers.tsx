import React, { useState, useEffect } from 'react';
import { Users, Trash2, Plus } from 'lucide-react';
import { userService } from '../../../../services/userService';
import type { User } from '../../../../types';

interface TeamMembersProps {
  teamMembers: string[];
  departmentId: string;
  onAdd: (member: string) => void;
  onRemove: (index: number) => void;
}

export default function TeamMembers({ teamMembers, departmentId, onAdd, onRemove }: TeamMembersProps) {
  const [departmentUsers, setDepartmentUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState('');

  useEffect(() => {
    if (departmentId) {
      fetchDepartmentUsers();
    }
  }, [departmentId]);

  const fetchDepartmentUsers = async () => {
    try {
      setLoading(true);
      const users = await userService.getAllUsers();
      const filteredUsers = users.filter(user => user.department === departmentId);
      setDepartmentUsers(filteredUsers);
    } catch (err) {
      console.error('Error fetching department users:', err);
      setError('Failed to load team members');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    if (selectedUser) {
      onAdd(selectedUser);
      setSelectedUser('');
    }
  };

  if (!departmentId) {
    return (
      <div className="bg-gray-50 p-4 rounded-lg">
        <p className="text-sm text-gray-500">Please select a department first to add team members.</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 p-4 rounded-lg space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-gray-900">Team Members</h4>
        <span className="text-sm text-gray-500">{teamMembers.length} members</span>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-20">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
          <span className="ml-2 text-sm text-gray-500">Loading team members...</span>
        </div>
      ) : (
        <>
          <div className="flex space-x-2">
            <select
              value={selectedUser}
              onChange={e => setSelectedUser(e.target.value)}
              className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            >
              <option value="">Select team member</option>
              {departmentUsers.map(user => (
                <option key={user.id} value={user.id}>
                  {user.displayName || user.email}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={handleAdd}
              disabled={!selectedUser}
              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="h-5 w-5" />
            </button>
          </div>

          <div className="space-y-2">
            {teamMembers.map((memberId, index) => {
              const member = departmentUsers.find(u => u.id === memberId);
              return (
                <div
                  key={memberId}
                  className="flex items-center justify-between p-2 bg-white rounded-md"
                >
                  <div className="flex items-center">
                    <Users className="h-5 w-5 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-900">
                      {member ? (member.displayName || member.email) : memberId}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => onRemove(index)}
                    className="text-gray-400 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}