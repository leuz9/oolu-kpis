import React from 'react';
import { Edit, Key, Link, Globe, UserX } from 'lucide-react';
import { User } from '../../../types';
import UserAvatar from './UserAvatar';

interface Country {
  id: string;
  name: string;
  flag: string;
}

interface UserTableRowProps {
  user: User;
  selected: boolean;
  onSelect: (userId: string) => void;
  onEdit: (user: User) => void;
  onDelete: (userId: string) => void;
  onPasswordReset: (userId: string) => void;
  onLinkTeamMember: (user: User) => void;
  onSetCountry: (user: User) => void;
  countries: Country[];
}

export default function UserTableRow({
  user,
  selected,
  onSelect,
  onEdit,
  onDelete,
  onPasswordReset,
  onLinkTeamMember,
  onSetCountry,
  countries
}: UserTableRowProps) {
  const isSuperadmin = user.role === 'superadmin';

  return (
    <tr className={`hover:bg-gray-50 ${isSuperadmin ? 'bg-gray-50' : ''}`}>
      <td className="px-6 py-4">
        <input
          type="checkbox"
          checked={selected}
          onChange={() => onSelect(user.id)}
          disabled={isSuperadmin}
          className={`rounded border-gray-300 text-primary-600 focus:ring-primary-500 ${
            isSuperadmin ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        />
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <UserAvatar user={user} />
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">
              {user.displayName}
              {isSuperadmin && (
                <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                  Superadmin
                </span>
              )}
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
      <td className="px-6 py-4">
        {(() => {
          const userCountries = countries.filter(country => user.countryIds?.includes(country.id));
          if (userCountries.length === 0) {
            return <span className="text-sm text-gray-400 italic">No countries assigned</span>;
          }
          
          if (userCountries.length === 1) {
            const country = userCountries[0];
            return (
              <div className="flex items-center space-x-2">
                <span className="text-lg">{country.flag}</span>
                <span className="text-sm text-gray-900">{country.name}</span>
              </div>
            );
          }
          
          return (
            <div className="flex flex-wrap gap-1">
              {userCountries.map((country, index) => (
                <div key={country.id} className="flex items-center space-x-1 bg-gray-100 rounded-full px-2 py-1">
                  <span className="text-sm">{country.flag}</span>
                  <span className="text-xs text-gray-700">{country.name}</span>
                </div>
              ))}
            </div>
          );
        })()}
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
      <td className="px-6 py-4 whitespace-nowrap text-right">
        <div className="flex items-center justify-end space-x-2">
          <button
            onClick={() => onEdit(user)}
            disabled={isSuperadmin}
            className={`p-2 rounded-lg transition-colors ${
              isSuperadmin 
                ? 'text-gray-300 cursor-not-allowed' 
                : 'text-blue-600 hover:bg-blue-50 hover:text-blue-700'
            }`}
            title="Edit User"
          >
            <Edit className="h-4 w-4" />
          </button>
          
          <button
            onClick={() => onPasswordReset(user.id)}
            disabled={isSuperadmin}
            className={`p-2 rounded-lg transition-colors ${
              isSuperadmin 
                ? 'text-gray-300 cursor-not-allowed' 
                : 'text-amber-600 hover:bg-amber-50 hover:text-amber-700'
            }`}
            title="Reset Password"
          >
            <Key className="h-4 w-4" />
          </button>
          
          <button
            onClick={() => onLinkTeamMember(user)}
            disabled={isSuperadmin}
            className={`p-2 rounded-lg transition-colors ${
              isSuperadmin 
                ? 'text-gray-300 cursor-not-allowed' 
                : 'text-purple-600 hover:bg-purple-50 hover:text-purple-700'
            }`}
            title="Link Team Member"
          >
            <Link className="h-4 w-4" />
          </button>
          
          <button
            onClick={() => onSetCountry(user)}
            disabled={isSuperadmin}
            className={`p-2 rounded-lg transition-colors ${
              isSuperadmin 
                ? 'text-gray-300 cursor-not-allowed' 
                : 'text-green-600 hover:bg-green-50 hover:text-green-700'
            }`}
            title="Set Country"
          >
            <Globe className="h-4 w-4" />
          </button>
          
          <button
            onClick={() => onDelete(user.id)}
            disabled={isSuperadmin}
            className={`p-2 rounded-lg transition-colors ${
              isSuperadmin 
                ? 'text-gray-300 cursor-not-allowed' 
                : 'text-red-600 hover:bg-red-50 hover:text-red-700'
            }`}
            title="Delete User"
          >
            <UserX className="h-4 w-4" />
          </button>
        </div>
      </td>
    </tr>
  );
}