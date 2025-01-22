import React, { useState, useEffect } from 'react';
import Sidebar from '../Sidebar';
import { Users, Mail, Building2, UserPlus, Pencil, Trash2, Phone, Calendar, MapPin, Globe, Award, Clock, X } from 'lucide-react';
import { collection, getDocs, doc, deleteDoc, updateDoc, addDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';

// Standard departments list
const DEPARTMENTS = [
  'Executive',
  'Sales',
  'Marketing',
  'Engineering',
  'Operations',
  'Finance',
  'Human Resources',
  'Customer Support',
  'Research & Development',
  'Legal',
  'Product Management',
  'Quality Assurance'
];

// Standard roles list
const ROLES = [
  'CEO',
  'Director',
  'Manager',
  'Team Lead',
  'Senior Engineer',
  'Engineer',
  'Analyst',
  'Specialist',
  'Coordinator',
  'Associate'
];

interface TeamMember {
  uid: string;
  displayName: string;
  email: string;
  role: string;
  department: string;
  photoURL: string | null;
  createdAt: string;
  phone?: string;
  location?: string;
  bio?: string;
  skills?: string[];
  projects?: string[];
  startDate?: string;
  reportsTo?: string;
  languages?: string[];
  certifications?: string[];
  socialLinks?: {
    linkedin?: string;
    twitter?: string;
    github?: string;
  };
}

export default function Team() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    fetchTeamMembers();
  }, []);

  const fetchTeamMembers = async () => {
    try {
      const teamSnapshot = await getDocs(collection(db, 'team'));
      const members = teamSnapshot.docs.map(doc => ({
        uid: doc.id,
        ...doc.data()
      } as TeamMember));
      setTeamMembers(members);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching team members:', err);
      setError('Failed to load team members. Please check your internet connection.');
      setLoading(false);
    }
  };

  const handleEditMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember) return;

    try {
      const memberRef = doc(db, 'team', editingMember.uid);
      await updateDoc(memberRef, editingMember);
      
      setTeamMembers(members => 
        members.map(member => 
          member.uid === editingMember.uid ? editingMember : member
        )
      );
      setIsEditing(false);
      setEditingMember(null);
    } catch (err) {
      console.error('Error updating team member:', err);
      setError('Failed to update team member. Please check your internet connection.');
    }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember) return;

    try {
      const newMember = {
        ...editingMember,
        createdAt: new Date().toISOString(),
        photoURL: null
      };
      
      const docRef = await addDoc(collection(db, 'team'), newMember);
      setTeamMembers(prev => [...prev, { ...newMember, uid: docRef.id }]);
      setIsAdding(false);
      setEditingMember(null);
    } catch (err) {
      console.error('Error adding team member:', err);
      setError('Failed to add team member. Please check your internet connection.');
    }
  };

  const handleDeleteMember = async (uid: string) => {
    if (!window.confirm('Are you sure you want to remove this team member?')) return;

    try {
      await deleteDoc(doc(db, 'team', uid));
      setTeamMembers(members => members.filter(member => member.uid !== uid));
      if (selectedMember?.uid === uid) {
        setSelectedMember(null);
      }
    } catch (err) {
      console.error('Error deleting team member:', err);
      setError('Failed to delete team member. Please check your internet connection.');
    }
  };

  const MemberForm = ({ onSubmit, isAdd = false }: { onSubmit: (e: React.FormEvent) => Promise<void>, isAdd?: boolean }) => (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">{isAdd ? 'Add Team Member' : 'Edit Team Member'}</h3>
          <button
            onClick={() => {
              setIsEditing(false);
              setIsAdding(false);
              setEditingMember(null);
            }}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={onSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <input
                type="text"
                required
                value={editingMember?.displayName || ''}
                onChange={e => setEditingMember(prev => prev ? {...prev, displayName: e.target.value} : null)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
            {isAdd && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  required
                  value={editingMember?.email || ''}
                  onChange={e => setEditingMember(prev => prev ? {...prev, email: e.target.value} : null)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700">Role</label>
              <select
                required
                value={editingMember?.role || ''}
                onChange={e => setEditingMember(prev => prev ? {...prev, role: e.target.value} : null)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="">Select a role</option>
                {ROLES.map(role => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Department</label>
              <select
                required
                value={editingMember?.department || ''}
                onChange={e => setEditingMember(prev => prev ? {...prev, department: e.target.value} : null)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="">Select a department</option>
                {DEPARTMENTS.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Phone</label>
              <input
                type="tel"
                value={editingMember?.phone || ''}
                onChange={e => setEditingMember(prev => prev ? {...prev, phone: e.target.value} : null)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Location</label>
              <input
                type="text"
                value={editingMember?.location || ''}
                onChange={e => setEditingMember(prev => prev ? {...prev, location: e.target.value} : null)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Bio</label>
              <textarea
                rows={3}
                value={editingMember?.bio || ''}
                onChange={e => setEditingMember(prev => prev ? {...prev, bio: e.target.value} : null)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Start Date</label>
              <input
                type="date"
                value={editingMember?.startDate || ''}
                onChange={e => setEditingMember(prev => prev ? {...prev, startDate: e.target.value} : null)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Reports To</label>
              <select
                value={editingMember?.reportsTo || ''}
                onChange={e => setEditingMember(prev => prev ? {...prev, reportsTo: e.target.value} : null)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="">Select a manager</option>
                {teamMembers.map(member => (
                  <option key={member.uid} value={member.uid}>{member.displayName}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => {
                setIsEditing(false);
                setIsAdding(false);
                setEditingMember(null);
              }}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
            >
              {isAdd ? 'Add Member' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  const MemberDetails = ({ member }: { member: TeamMember }) => (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-medium">Member Details</h3>
          <button
            onClick={() => setSelectedMember(null)}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="space-y-6">
          <div className="flex items-center">
            <div className="h-20 w-20 rounded-full bg-indigo-100 flex items-center justify-center">
              {member.photoURL ? (
                <img
                  src={member.photoURL}
                  alt={member.displayName}
                  className="h-20 w-20 rounded-full object-cover"
                />
              ) : (
                <Users className="h-10 w-10 text-indigo-600" />
              )}
            </div>
            <div className="ml-6">
              <h2 className="text-2xl font-bold text-gray-900">{member.displayName}</h2>
              <p className="text-lg text-gray-600">{member.role}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-500">Contact Information</h4>
                <div className="mt-2 space-y-2">
                  <div className="flex items-center text-sm">
                    <Mail className="h-4 w-4 text-gray-400 mr-2" />
                    {member.email}
                  </div>
                  {member.phone && (
                    <div className="flex items-center text-sm">
                      <Phone className="h-4 w-4 text-gray-400 mr-2" />
                      {member.phone}
                    </div>
                  )}
                  {member.location && (
                    <div className="flex items-center text-sm">
                      <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                      {member.location}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-500">Department & Role</h4>
                <div className="mt-2 space-y-2">
                  <div className="flex items-center text-sm">
                    <Building2 className="h-4 w-4 text-gray-400 mr-2" />
                    {member.department}
                  </div>
                  {member.reportsTo && (
                    <div className="flex items-center text-sm">
                      <Users className="h-4 w-4 text-gray-400 mr-2" />
                      Reports to: {teamMembers.find(m => m.uid === member.reportsTo)?.displayName}
                    </div>
                  )}
                </div>
              </div>

              {member.startDate && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Employment</h4>
                  <div className="mt-2 space-y-2">
                    <div className="flex items-center text-sm">
                      <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                      Start Date: {new Date(member.startDate).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-4">
              {member.bio && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Bio</h4>
                  <p className="mt-2 text-sm text-gray-600">{member.bio}</p>
                </div>
              )}

              {member.skills && member.skills.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Skills</h4>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {member.skills.map(skill => (
                      <span
                        key={skill}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {member.certifications && member.certifications.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Certifications</h4>
                  <div className="mt-2 space-y-2">
                    {member.certifications.map(cert => (
                      <div key={cert} className="flex items-center text-sm">
                        <Award className="h-4 w-4 text-gray-400 mr-2" />
                        {cert}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {member.projects && member.projects.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Current Projects</h4>
                  <div className="mt-2 space-y-2">
                    {member.projects.map(project => (
                      <div key={project} className="flex items-center text-sm">
                        <Clock className="h-4 w-4 text-gray-400 mr-2" />
                        {project}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {member.socialLinks && Object.keys(member.socialLinks).length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Social Links</h4>
                  <div className="mt-2 space-y-2">
                    {Object.entries(member.socialLinks).map(([platform, url]) => (
                      <div key={platform} className="flex items-center text-sm">
                        <Globe className="h-4 w-4 text-gray-400 mr-2" />
                        <a
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-indigo-600 hover:text-indigo-500"
                        >
                          {platform.charAt(0).toUpperCase() + platform.slice(1)}
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      
      <div className={`flex-1 ${sidebarOpen ? 'ml-64' : 'ml-20'} transition-all duration-300 ease-in-out p-8`}>
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Team Members</h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage your team members and their roles
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md ${viewMode === 'grid' ? 'bg-indigo-100 text-indigo-600' : 'text-gray-400 hover:text-gray-500'}`}
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md ${viewMode === 'list' ? 'bg-indigo-100 text-indigo-600' : 'text-gray-400 hover:text-gray-500'}`}
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
              </button>
            </div>
            <button
              onClick={() => {
                setEditingMember({
                  uid: '',
                  displayName: '',
                  email: '',
                  role: '',
                  department: '',
                  photoURL: null,
                  createdAt: ''
                });
                setIsAdding(true);
              }}
              className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              <UserPlus className="h-5 w-5 mr-2" />
              Add Member
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-4 rounded">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {teamMembers.map((member) => (
              <div
                key={member.uid}
                className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setSelectedMember(member)}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center">
                      {member.photoURL ? (
                        <img
                          src={member.photoURL}
                          alt={member.displayName}
                          className="h-12 w-12 rounded-full object-cover"
                        />
                      ) : (
                        <Users className="h-6 w-6 text-indigo-600" />
                      )}
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900">{member.displayName}</h3>
                      <p className="text-sm text-gray-500">{member.role}</p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingMember(member);
                        setIsEditing(true);
                      }}
                      className="p-1 text-gray-400 hover:text-indigo-600"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteMember(member.uid);
                      }}
                      className="p-1 text-gray-400 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-gray-500">
                    <Mail className="h-4 w-4 mr-2" />
                    {member.email}
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <Building2 className="h-4 w-4 mr-2" />
                    {member.department}
                  </div>
                  {member.phone && (
                    <div className="flex items-center text-sm text-gray-500">
                      <Phone className="h-4 w-4 mr-2" />
                      {member.phone}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white shadow-sm rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Member
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Department
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {teamMembers.map((member) => (
                  <tr
                    key={member.uid}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => setSelectedMember(member)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                          {member.photoURL ? (
                            <img
                              src={member.photoURL}
                              alt={member.displayName}
                              className="h-10 w-10 rounded-full object-cover"
                            />
                          ) : (
                            <Users className="h-5 w-5 text-indigo-600" />
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {member.displayName}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{member.role}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{member.department}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{member.email}</div>
                      {member.phone && (
                        <div className="text-sm text-gray-500">{member.phone}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingMember(member);
                            setIsEditing(true);
                          }}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteMember(member.uid);
                          }}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {(isEditing || isAdding) && editingMember && (
          <MemberForm onSubmit={isAdding ? handleAddMember : handleEditMember} isAdd={isAdding} />
        )}

        {selectedMember && (
          <MemberDetails member={selectedMember} />
        )}
      </div>
    </div>
  );
}