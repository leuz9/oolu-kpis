import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../Sidebar';
import { adminService } from '../../services/adminService';
import { countryService } from '../../services/countryService';
import { useAuth } from '../../contexts/AuthContext';
import AccessDenied from '../AccessDenied';
import { 
  UserCog, 
  AlertTriangle, 
  CheckCircle2, 
  Upload, 
  Download
} from 'lucide-react';
import type { User } from '../../types';
import UserEditModal from './components/UserEditModal';
import UserCountryModal from './components/UserCountryModal';
import UserTable from './components/UserTable';
import UserFilters from './components/UserFilters';
import BulkActions from './components/BulkActions';

export default function UserManagement() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [filterRole, setFilterRole] = useState('all');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [showCountryModal, setShowCountryModal] = useState<User | null>(null);
  const [countries, setCountries] = useState<any[]>([]);

  // Check if user has access
  if (!user?.role || user.role !== 'superadmin') {
    return (
      <AccessDenied 
        message="Only superadmin users can access the user management section. Please contact your administrator if you need access."
      />
    );
  }

  useEffect(() => {
    fetchUsers();
    fetchCountries();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const fetchedUsers = await adminService.getUsers();
      setUsers(fetchedUsers);
    } catch (err) {
      setError('Failed to load users. Please try again later.');
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCountries = async () => {
    try {
      const fetchedCountries = await countryService.getActiveCountries();
      setCountries(fetchedCountries);
    } catch (err) {
      console.error('Error fetching countries:', err);
    }
  };

  const handleEditUser = async (userId: string, data: Partial<User>) => {
    try {
      await adminService.updateUser(userId, data);
      setUsers(prev => prev.map(user => 
        user.id === userId ? { ...user, ...data } : user
      ));
      setSuccess('User updated successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to update user. Please try again.');
      console.error('Error updating user:', err);
    }
  };

  const handleSetCountries = async (userId: string, countryIds: string[]) => {
    try {
      await adminService.updateUser(userId, { countryIds });
      setUsers(prev => prev.map(user => 
        user.id === userId ? { ...user, countryIds } : user
      ));
      setSuccess(`User countries updated successfully (${countryIds.length} countries assigned)`);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to update user countries. Please try again.');
      console.error('Error updating user countries:', err);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      await adminService.deleteUser(userId);
      setUsers(prev => prev.filter(user => user.id !== userId));
      setShowDeleteConfirm(null);
      setSuccess('User deleted successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to delete user. Please try again.');
      console.error('Error deleting user:', err);
    }
  };

  const handleBulkAction = async (action: 'activate' | 'deactivate' | 'delete') => {
    try {
      // Filter out superadmin users from selection
      const selectedNonSuperadmins = Array.from(selectedUsers).filter(userId => {
        const user = users.find(u => u.id === userId);
        return user?.role !== 'superadmin';
      });

      if (selectedNonSuperadmins.length !== selectedUsers.size) {
        setError('Cannot perform actions on superadmin users. They have been excluded from the selection.');
      }

      if (selectedNonSuperadmins.length === 0) {
        return;
      }

      switch (action) {
        case 'activate':
          await Promise.all(
            selectedNonSuperadmins.map(userId =>
              adminService.updateUser(userId, { status: 'active' })
            )
          );
          setSuccess(`Successfully activated ${selectedNonSuperadmins.length} users`);
          break;
        case 'deactivate':
          await Promise.all(
            selectedNonSuperadmins.map(userId =>
              adminService.updateUser(userId, { status: 'inactive' })
            )
          );
          setSuccess(`Successfully deactivated ${selectedNonSuperadmins.length} users`);
          break;
        case 'delete':
          if (window.confirm(`Are you sure you want to delete ${selectedNonSuperadmins.length} users?`)) {
            await Promise.all(
              selectedNonSuperadmins.map(userId => adminService.deleteUser(userId))
            );
            setSuccess(`Successfully deleted ${selectedNonSuperadmins.length} users`);
          }
          break;
      }
      setSelectedUsers(new Set());
      fetchUsers();
    } catch (err: any) {
      setError(err.message || 'Failed to perform bulk action. Please try again.');
      console.error('Error performing bulk action:', err);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.department?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    const matchesDepartment = filterDepartment === 'all' || user.department === filterDepartment;
    const matchesStatus = filterStatus === 'all' || user.status === filterStatus;
    return matchesSearch && matchesRole && matchesDepartment && matchesStatus;
  });

  const roles = Array.from(new Set(users.map(user => user.role).filter(Boolean)));
  const departments = Array.from(new Set(users.map(user => user.department).filter(Boolean)));

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      
      <div className={`flex-1 w-full ${sidebarOpen ? 'ml-64' : 'ml-20'} transition-all duration-300 ease-in-out p-3 sm:p-4 lg:p-6`}>
        <div className="w-full">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
              <p className="mt-1 text-sm text-gray-500">
                Manage system users and their permissions
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <label className="relative cursor-pointer">
                <input
                  type="file"
                  accept=".json"
                  onChange={() => {/* Implement import logic */}}
                  className="hidden"
                />
                <span className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
                  <Upload className="h-4 w-4 mr-2" />
                  Import Users
                </span>
              </label>
              <button
                onClick={() => {/* Implement export logic */}}
                className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                <Download className="h-4 w-4 mr-2" />
                Export Users
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-4 rounded">
              <div className="flex">
                <AlertTriangle className="h-5 w-5 text-red-400" />
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          {success && (
            <div className="mb-4 bg-green-50 border-l-4 border-green-400 p-4 rounded">
              <div className="flex">
                <CheckCircle2 className="h-5 w-5 text-green-400" />
                <div className="ml-3">
                  <p className="text-sm text-green-700">{success}</p>
                </div>
              </div>
            </div>
          )}

          <UserFilters
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            filterRole={filterRole}
            onRoleChange={setFilterRole}
            filterDepartment={filterDepartment}
            onDepartmentChange={setFilterDepartment}
            filterStatus={filterStatus}
            onStatusChange={setFilterStatus}
            roles={roles}
            departments={departments}
          />

          <BulkActions
            selectedCount={selectedUsers.size}
            onActivate={() => handleBulkAction('activate')}
            onDeactivate={() => handleBulkAction('deactivate')}
            onDelete={() => handleBulkAction('delete')}
            onClearSelection={() => setSelectedUsers(new Set())}
          />

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
          ) : (
            <UserTable
              users={filteredUsers}
              selectedUsers={selectedUsers}
              onSelectUser={(userId) => {
                const user = users.find(u => u.id === userId);
                if (user?.role === 'superadmin') {
                  setError('Cannot select superadmin users');
                  return;
                }
                const newSelected = new Set(selectedUsers);
                if (newSelected.has(userId)) {
                  newSelected.delete(userId);
                } else {
                  newSelected.add(userId);
                }
                setSelectedUsers(newSelected);
              }}
              onSelectAll={(selected) => {
                // Filter out superadmin users when selecting all
                const selectableUsers = filteredUsers.filter(u => u.role !== 'superadmin');
                setSelectedUsers(selected ? new Set(selectableUsers.map(u => u.id)) : new Set());
              }}
              onEdit={setEditingUser}
              onDelete={(userId) => {
                const user = users.find(u => u.id === userId);
                if (user?.role === 'superadmin') {
                  setError('Cannot delete superadmin users');
                  return;
                }
                setShowDeleteConfirm(userId);
              }}
              onPasswordReset={(userId) => {
                const user = users.find(u => u.id === userId);
                if (user?.role === 'superadmin') {
                  setError('Cannot reset password for superadmin users');
                  return;
                }
                // Implement password reset logic
              }}
              onLinkTeamMember={(user) => {
                if (user.role === 'superadmin') {
                  setError('Cannot modify superadmin users');
                  return;
                }
                setEditingUser(user);
                // Implement team member linking logic
              }}
              onSetCountry={(user) => {
                if (user.role === 'superadmin') {
                  setError('Cannot modify superadmin users');
                  return;
                }
                setShowCountryModal(user);
              }}
              countries={countries}
            />
          )}
        </div>
      </div>

      {editingUser && (
        <UserEditModal
          user={editingUser}
          onClose={() => setEditingUser(null)}
          onSave={handleEditUser}
        />
      )}

      {showCountryModal && (
        <UserCountryModal
          user={showCountryModal}
          onClose={() => setShowCountryModal(null)}
          onSave={handleSetCountries}
        />
      )}

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Confirm Delete User</h3>
            <p className="text-sm text-gray-500 mb-6">
              Are you sure you want to delete this user? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteUser(showDeleteConfirm)}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}