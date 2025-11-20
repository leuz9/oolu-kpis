import React, { useState, useRef, useEffect } from 'react';
import { Search, User, Check, ChevronDown, X, Users as UsersIcon } from 'lucide-react';
import type { User as UserType } from '../../../types';

interface UserSelectProps {
  users: UserType[];
  value: string;
  onChange: (userId: string) => void;
  label?: string;
  placeholder?: string;
  required?: boolean;
}

export default function UserSelect({ 
  users, 
  value, 
  onChange, 
  label = 'Assignee',
  placeholder = 'Select or search for a user...',
  required = false
}: UserSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(0); // 0 = unassigned, 1+ = users
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const selectedUser = users.find(u => u.id === value);
  const filteredUsers = users.filter(user => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      user.displayName?.toLowerCase().includes(search) ||
      user.email?.toLowerCase().includes(search) ||
      user.id.toLowerCase().includes(search)
    );
  });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
        setHighlightedIndex(0);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      inputRef.current?.focus();
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && listRef.current) {
      const highlightedElement = listRef.current.children[highlightedIndex] as HTMLElement;
      if (highlightedElement) {
        highlightedElement.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    }
  }, [highlightedIndex, isOpen]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < filteredUsers.length ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => prev > 0 ? prev - 1 : 0);
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex === 0) {
          handleSelect('');
        } else if (filteredUsers[highlightedIndex - 1]) {
          handleSelect(filteredUsers[highlightedIndex - 1].id);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        setSearchTerm('');
        setHighlightedIndex(0);
        break;
    }
  };

  const handleSelect = (userId: string) => {
    onChange(userId);
    setIsOpen(false);
    setSearchTerm('');
    setHighlightedIndex(0);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    setSearchTerm('');
  };

  const getUserInitials = (user: UserType) => {
    if (user.displayName) {
      const parts = user.displayName.split(' ');
      if (parts.length >= 2) {
        return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
      }
      return user.displayName.substring(0, 2).toUpperCase();
    }
    if (user.email) {
      return user.email.substring(0, 2).toUpperCase();
    }
    return 'U';
  };

  const getUserAvatar = (user: UserType) => {
    if (user.photoURL) return user.photoURL;
    return null;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
        <UsersIcon className="h-4 w-4" />
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>

      <div className="relative">
        <div
          className={`w-full px-4 py-3 rounded-lg border-2 transition-all duration-200 text-left flex items-center justify-between gap-3 ${
            isOpen
              ? 'border-primary-500 ring-4 ring-primary-200 bg-white'
              : 'border-gray-200 hover:border-gray-300 focus-within:border-primary-500 bg-white'
          } ${!selectedUser ? 'text-gray-500' : 'text-gray-900'}`}
        >
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            onKeyDown={handleKeyDown}
            className="flex items-center gap-3 flex-1 min-w-0 text-left"
          >
            {selectedUser ? (
              <>
                <div className="flex-shrink-0">
                  {getUserAvatar(selectedUser) ? (
                    <img
                      src={getUserAvatar(selectedUser)!}
                      alt={selectedUser.displayName || selectedUser.email}
                      className="w-8 h-8 rounded-full object-cover ring-2 ring-primary-200"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-purple-500 flex items-center justify-center text-white font-semibold text-sm ring-2 ring-primary-200">
                      {getUserInitials(selectedUser)}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 truncate">
                    {selectedUser.displayName || selectedUser.email}
                  </div>
                  {selectedUser.email && selectedUser.displayName && (
                    <div className="text-xs text-gray-500 truncate">
                      {selectedUser.email}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                  <User className="h-4 w-4 text-gray-400" />
                </div>
                <span className="text-gray-400">{placeholder}</span>
              </div>
            )}
          </button>
          <div className="flex items-center gap-2 flex-shrink-0">
            {selectedUser && (
              <button
                type="button"
                onClick={handleClear}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ChevronDown
                className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${
                  isOpen ? 'transform rotate-180' : ''
                }`}
              />
            </button>
          </div>
        </div>

        {isOpen && (
          <div className="absolute z-50 w-full mt-2 bg-white rounded-xl shadow-2xl border-2 border-gray-200 overflow-hidden animate-slide-down">
            {/* Search Input */}
            <div className="p-3 border-b border-gray-200 bg-gray-50">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  ref={inputRef}
                  type="text"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setHighlightedIndex(0);
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder="Search users..."
                  className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200 text-sm"
                />
              </div>
            </div>

            {/* Users List */}
            <div
              ref={listRef}
              className="max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
            >
              {/* Unassigned Option */}
              <button
                type="button"
                onClick={() => handleSelect('')}
                onMouseEnter={() => setHighlightedIndex(0)}
                className={`w-full px-4 py-3 flex items-center gap-3 transition-all duration-150 border-b border-gray-100 ${
                  highlightedIndex === 0
                    ? 'bg-primary-50 border-l-4 border-primary-500'
                    : !value
                    ? 'bg-primary-50/50 border-l-4 border-primary-300'
                    : 'hover:bg-gray-50 border-l-4 border-transparent'
                }`}
              >
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                    <User className="h-5 w-5 text-gray-500" />
                  </div>
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <div className={`font-medium ${!value ? 'text-primary-700' : 'text-gray-900'}`}>
                    Unassigned
                  </div>
                  <div className="text-xs text-gray-500">
                    No one assigned to this task
                  </div>
                </div>
                {!value && (
                  <div className="flex-shrink-0">
                    <div className="w-6 h-6 rounded-full bg-primary-600 flex items-center justify-center">
                      <Check className="h-4 w-4 text-white" />
                    </div>
                  </div>
                )}
              </button>

              {filteredUsers.length > 0 ? (
                <>
                  {filteredUsers.map((user, index) => {
                    const actualIndex = index + 1; // Adjust index for unassigned option (0)
                    const isSelected = user.id === value;
                    const isHighlighted = actualIndex === highlightedIndex;
                    
                    return (
                      <button
                        key={user.id}
                        type="button"
                        onClick={() => handleSelect(user.id)}
                        onMouseEnter={() => setHighlightedIndex(actualIndex)}
                        className={`w-full px-4 py-3 flex items-center gap-3 transition-all duration-150 ${
                          isHighlighted
                            ? 'bg-primary-50 border-l-4 border-primary-500'
                            : 'hover:bg-gray-50 border-l-4 border-transparent'
                        } ${isSelected ? 'bg-primary-50' : ''}`}
                      >
                        <div className="flex-shrink-0">
                          {getUserAvatar(user) ? (
                            <img
                              src={getUserAvatar(user)!}
                              alt={user.displayName || user.email}
                              className="w-10 h-10 rounded-full object-cover ring-2 ring-gray-200"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-purple-500 flex items-center justify-center text-white font-semibold text-sm ring-2 ring-gray-200">
                              {getUserInitials(user)}
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0 text-left">
                          <div className={`font-medium truncate ${
                            isSelected ? 'text-primary-700' : 'text-gray-900'
                          }`}>
                            {user.displayName || user.email}
                          </div>
                          {user.email && user.displayName && (
                            <div className="text-xs text-gray-500 truncate">
                              {user.email}
                            </div>
                          )}
                        </div>
                        {isSelected && (
                          <div className="flex-shrink-0">
                            <div className="w-6 h-6 rounded-full bg-primary-600 flex items-center justify-center">
                              <Check className="h-4 w-4 text-white" />
                            </div>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </>
              ) : (
                <div className="px-4 py-8 text-center">
                  <User className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">No users found</p>
                  <p className="text-xs text-gray-400 mt-1">Try a different search term</p>
                </div>
              )}
            </div>

            {/* Footer */}
            {filteredUsers.length > 0 && (
              <div className="px-4 py-2 border-t border-gray-200 bg-gray-50 text-xs text-gray-500">
                <div className="flex items-center justify-between">
                  <span>{filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''} found</span>
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 bg-white border border-gray-300 rounded text-xs">↑↓</kbd>
                    <span>navigate</span>
                    <kbd className="px-1.5 py-0.5 bg-white border border-gray-300 rounded text-xs ml-2">Enter</kbd>
                    <span>select</span>
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

