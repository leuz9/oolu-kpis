import React, { useState, useEffect, useCallback } from 'react';
import { Users, Mail, Building2, ChevronDown, ChevronRight, Target, PieChart } from 'lucide-react';
import type { User, Objective, KPI } from '../../../../types';

interface ContributorsProps {
  contributors: User[];
  childObjectives?: Objective[];
  childContributors?: Map<string, User[]>;
  kpis?: KPI[];
  kpiContributors?: Map<string, User[]>;
  loading: boolean;
  isCompanyLevel?: boolean;
}

export default function Contributors({ 
  contributors, 
  childObjectives = [], 
  childContributors = new Map(), 
  kpis = [],
  kpiContributors = new Map(),
  loading,
  isCompanyLevel = false 
}: ContributorsProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [uniqueContributorCount, setUniqueContributorCount] = useState<number>(0);

  // Calculate unique contributors count only when dependencies change
  useEffect(() => {
    const contributorIds = new Set<string>();
    
    // Add direct contributors
    contributors.forEach(c => contributorIds.add(c.id));
    
    // Add child objective contributors
    childContributors.forEach(users => {
      users.forEach(user => contributorIds.add(user.id));
    });

    // Add KPI contributors
    kpiContributors.forEach(users => {
      users.forEach(user => contributorIds.add(user.id));
    });

    setUniqueContributorCount(contributorIds.size);
  }, [contributors, childContributors, kpiContributors]);

  const toggleSection = useCallback((sectionId: string) => {
    setExpandedSections(prev => {
      const newExpanded = new Set(prev);
      if (newExpanded.has(sectionId)) {
        newExpanded.delete(sectionId);
      } else {
        newExpanded.add(sectionId);
      }
      return newExpanded;
    });
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-20">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!isCompanyLevel) {
    if (contributors.length === 0) {
      return (
        <div className="text-sm text-gray-500 text-center py-4">
          No contributors assigned to this objective
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {contributors.map((contributor) => (
          <ContributorCard key={contributor.id} contributor={contributor} />
        ))}
      </div>
    );
  }

  // Company level view with department and KPI grouping
  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="text-sm text-gray-600">
          Total unique contributors: {uniqueContributorCount}
        </div>
      </div>

      {/* Direct Contributors */}
      {contributors.length > 0 && (
        <div>
          <div 
            className="flex items-center justify-between cursor-pointer"
            onClick={() => toggleSection('direct')}
          >
            <h4 className="text-sm font-medium text-gray-700 flex items-center">
              <Target className="h-4 w-4 mr-2 text-primary-600" />
              Direct Contributors
            </h4>
            <div className="flex items-center">
              <span className="text-sm text-gray-500 mr-2">
                {contributors.length} contributors
              </span>
              {expandedSections.has('direct') ? (
                <ChevronDown className="h-4 w-4 text-gray-400" />
              ) : (
                <ChevronRight className="h-4 w-4 text-gray-400" />
              )}
            </div>
          </div>

          {expandedSections.has('direct') && (
            <div className="mt-3 space-y-4">
              {contributors.map((contributor) => (
                <ContributorCard 
                  key={contributor.id} 
                  contributor={contributor}
                  showDepartment
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Department Contributors */}
      {childObjectives.map((objective) => {
        const departmentContributors = childContributors.get(objective.id) || [];
        const isExpanded = expandedSections.has(objective.id);

        return (
          <div key={objective.id} className="border-t pt-4 first:border-t-0 first:pt-0">
            <div 
              className="flex items-center justify-between cursor-pointer"
              onClick={() => toggleSection(objective.id)}
            >
              <h4 className="text-sm font-medium text-gray-700 flex items-center">
                <Building2 className="h-4 w-4 mr-2 text-blue-600" />
                {objective.title}
              </h4>
              <div className="flex items-center">
                <span className="text-sm text-gray-500 mr-2">
                  {departmentContributors.length} contributors
                </span>
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                )}
              </div>
            </div>

            {isExpanded && departmentContributors.length > 0 && (
              <div className="mt-3 space-y-4">
                {departmentContributors.map((contributor) => (
                  <ContributorCard 
                    key={contributor.id} 
                    contributor={contributor}
                    showDepartment={false}
                  />
                ))}
              </div>
            )}
          </div>
        );
      })}

      {/* KPI Contributors */}
      {kpis.length > 0 && (
        <div className="border-t pt-4">
          <div 
            className="flex items-center justify-between cursor-pointer"
            onClick={() => toggleSection('kpis')}
          >
            <h4 className="text-sm font-medium text-gray-700 flex items-center">
              <PieChart className="h-4 w-4 mr-2 text-green-600" />
              KPI Contributors
            </h4>
            <div className="flex items-center">
              <span className="text-sm text-gray-500 mr-2">
                {Array.from(kpiContributors.values()).reduce((total, users) => total + users.length, 0)} contributors
              </span>
              {expandedSections.has('kpis') ? (
                <ChevronDown className="h-4 w-4 text-gray-400" />
              ) : (
                <ChevronRight className="h-4 w-4 text-gray-400" />
              )}
            </div>
          </div>

          {expandedSections.has('kpis') && (
            <div className="mt-3 space-y-6">
              {kpis.map((kpi) => {
                const kpiUsers = kpiContributors.get(kpi.id) || [];
                if (kpiUsers.length === 0) return null;

                return (
                  <div key={kpi.id} className="ml-4">
                    <h5 className="text-sm font-medium text-gray-600 mb-3">{kpi.name}</h5>
                    <div className="space-y-4">
                      {kpiUsers.map((contributor) => (
                        <ContributorCard 
                          key={contributor.id} 
                          contributor={contributor}
                          showDepartment
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

interface ContributorCardProps {
  contributor: User;
  showDepartment?: boolean;
}

function ContributorCard({ contributor, showDepartment = true }: ContributorCardProps) {
  return (
    <div className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
      <div className="flex items-center">
        <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
          {contributor.photoURL ? (
            <img
              src={contributor.photoURL}
              alt={contributor.displayName || ''}
              className="h-10 w-10 rounded-full object-cover"
            />
          ) : (
            <span className="text-primary-600 font-medium text-sm">
              {contributor.displayName?.charAt(0) || contributor.email.charAt(0)}
            </span>
          )}
        </div>
        <div className="ml-4 flex-1">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-900">
              {contributor.displayName || contributor.email}
            </h4>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
              {contributor.role}
            </span>
          </div>
          <div className="mt-1 grid grid-cols-2 gap-2 text-sm text-gray-500">
            <div className="flex items-center">
              <Mail className="h-4 w-4 mr-1.5" />
              {contributor.email}
            </div>
            {showDepartment && contributor.department && (
              <div className="flex items-center">
                <Building2 className="h-4 w-4 mr-1.5" />
                {contributor.department}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}