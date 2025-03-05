import React, { useState } from 'react';
import { ChevronRight, ChevronDown, Building2, Users, User as UserIcon } from 'lucide-react';
import type { User } from '../../../types';

interface TeamHierarchyProps {
  users: User[];
}

interface TreeNode {
  user: User;
  children: TreeNode[];
}

export default function TeamHierarchy({ users }: TeamHierarchyProps) {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  // Build the hierarchy tree
  const buildHierarchy = (users: User[]): TreeNode[] => {
    const userMap = new Map(users.map(user => [user.id, { user, children: [] }]));
    const roots: TreeNode[] = [];

    // Organize users into hierarchy
    users.forEach(user => {
      const node = userMap.get(user.id)!;
      if (user.managerId && userMap.has(user.managerId)) {
        userMap.get(user.managerId)!.children.push(node);
      } else {
        roots.push(node);
      }
    });

    // Sort each level
    const sortNodes = (nodes: TreeNode[]) => {
      nodes.sort((a, b) => {
        // Sort by role level first
        const roleOrder = {
          superadmin: 0,
          admin: 1,
          director: 2,
          manager: 3,
          team_lead: 4,
          senior_employee: 5,
          employee: 6,
          intern: 7,
          external: 8
        };
        const roleA = roleOrder[a.user.role as keyof typeof roleOrder] ?? 999;
        const roleB = roleOrder[b.user.role as keyof typeof roleOrder] ?? 999;
        if (roleA !== roleB) return roleA - roleB;
        
        // Then by name
        return (a.user.displayName || a.user.email).localeCompare(b.user.displayName || b.user.email);
      });
      nodes.forEach(node => sortNodes(node.children));
    };

    sortNodes(roots);
    return roots;
  };

  const toggleNode = (userId: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(userId)) {
      newExpanded.delete(userId);
    } else {
      newExpanded.add(userId);
    }
    setExpandedNodes(newExpanded);
  };

  const renderNode = (node: TreeNode, level: number = 0) => {
    const { user, children } = node;
    const hasChildren = children.length > 0;
    const isExpanded = expandedNodes.has(user.id);

    return (
      <div key={user.id} className="select-none">
        <div 
          className={`
            flex items-center p-2 hover:bg-gray-50 cursor-pointer
            ${level > 0 ? 'ml-6' : ''}
          `}
        >
          <div className="flex items-center flex-1">
            {hasChildren ? (
              <button
                onClick={() => toggleNode(user.id)}
                className="p-1 hover:bg-gray-100 rounded-full"
              >
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                )}
              </button>
            ) : (
              <div className="w-6" />
            )}
            
            {user.role === 'director' && <Building2 className="h-4 w-4 text-primary-600 mr-2" />}
            {['manager', 'team_lead'].includes(user.role || '') && <Users className="h-4 w-4 text-blue-600 mr-2" />}
            {!['director', 'manager', 'team_lead'].includes(user.role || '') && <UserIcon className="h-4 w-4 text-green-600 mr-2" />}
            
            <div className="flex items-center">
              <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center mr-3">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || ''}
                    className="h-8 w-8 rounded-full object-cover"
                  />
                ) : (
                  <span className="text-primary-600 font-medium text-sm">
                    {user.displayName?.charAt(0) || user.email.charAt(0)}
                  </span>
                )}
              </div>
              <div>
                <div className="text-sm font-medium text-gray-900">
                  {user.displayName || user.email}
                </div>
                <div className="text-xs text-gray-500">
                  {user.jobTitle}
                  {user.department && ` • ${user.department}`}
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
              {user.role}
            </span>
          </div>
        </div>
        
        {isExpanded && hasChildren && (
          <div className="ml-4 border-l border-gray-200 mt-1">
            {children.map(child => renderNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  const hierarchy = buildHierarchy(users);

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b">
        <h2 className="text-lg font-medium text-gray-900">Organization Structure</h2>
        <div className="mt-2 flex items-center space-x-6 text-sm text-gray-500">
          <div className="flex items-center">
            <Building2 className="h-4 w-4 text-primary-600 mr-1.5" />
            Directors
          </div>
          <div className="flex items-center">
            <Users className="h-4 w-4 text-blue-600 mr-1.5" />
            Managers
          </div>
          <div className="flex items-center">
            <UserIcon className="h-4 w-4 text-green-600 mr-1.5" />
            Team Members
          </div>
        </div>
      </div>
      <div className="p-4">
        <div className="space-y-2">
          {hierarchy.map(node => renderNode(node))}
        </div>
      </div>
    </div>
  );
}