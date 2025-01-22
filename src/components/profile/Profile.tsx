import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Camera, 
  Save, 
  Mail, 
  Phone, 
  MapPin, 
  Building2, 
  Shield, 
  Calendar, 
  Globe, 
  Link as LinkIcon,
  Briefcase,
  Languages,
  Award,
  GraduationCap,
  AlertTriangle
} from 'lucide-react';
import Sidebar from '../Sidebar';

export default function Profile() {
  const { user, updateUserProfile } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    displayName: user?.displayName || '',
    email: user?.email || '',
    photoURL: user?.photoURL || '',
    phone: user?.phone || '',
    location: user?.location || '',
    role: user?.role || 'User',
    department: user?.department || 'Not specified',
    bio: user?.bio || '',
    jobTitle: user?.jobTitle || '',
    startDate: user?.startDate || '',
    languages: user?.languages || [],
    skills: user?.skills || [],
    education: user?.education || [],
    certifications: user?.certifications || [],
    socialLinks: user?.socialLinks || {
      linkedin: '',
      twitter: '',
      github: '',
      website: ''
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateUserProfile(formData);
      setSuccess('Profile updated successfully');
      setIsEditing(false);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to update profile');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleArrayInput = (field: 'languages' | 'skills' | 'education' | 'certifications', value: string) => {
    if (value.trim()) {
      setFormData(prev => ({
        ...prev,
        [field]: [...prev[field], value.trim()]
      }));
    }
  };

  const removeArrayItem = (field: 'languages' | 'skills' | 'education' | 'certifications', index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div className={`flex-1 ${sidebarOpen ? 'ml-64' : 'ml-20'} transition-all duration-300 ease-in-out`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {/* Cover Image */}
            <div className="relative h-48 bg-gradient-to-r from-primary-600 to-primary-800">
              <div className="absolute -bottom-16 left-8">
                <div className="relative">
                  <div className="h-32 w-32 bg-white rounded-full p-2 shadow-lg">
                    <div className="h-full w-full rounded-full overflow-hidden bg-gray-100">
                      {isEditing ? (
                        <div className="h-full flex items-center justify-center">
                          <input
                            type="text"
                            value={formData.photoURL}
                            onChange={(e) => setFormData({ ...formData, photoURL: e.target.value })}
                            placeholder="Enter image URL"
                            className="w-full text-xs text-center px-2"
                          />
                        </div>
                      ) : (
                        <img
                          src={formData.photoURL || "https://via.placeholder.com/200"}
                          alt="Profile"
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            const img = e.target as HTMLImageElement;
                            img.src = "https://via.placeholder.com/200";
                          }}
                        />
                      )}
                    </div>
                  </div>
                  {isEditing && (
                    <div className="absolute bottom-0 right-0 p-2 bg-primary-600 rounded-full text-white">
                      <Camera className="h-5 w-5" />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Profile Content */}
            <div className="pt-20 px-8 pb-8">
              {/* Header */}
              <div className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-bold text-gray-900">
                  {isEditing ? 'Edit Profile' : 'My Profile'}
                </h1>
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
                  >
                    Edit Profile
                  </button>
                )}
              </div>

              {/* Alerts */}
              {error && (
                <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-4 rounded">
                  <div className="flex">
                    <AlertTriangle className="h-5 w-5 text-red-400" />
                    <p className="ml-3 text-sm text-red-700">{error}</p>
                  </div>
                </div>
              )}

              {success && (
                <div className="mb-4 bg-green-50 border-l-4 border-green-400 p-4 rounded">
                  <div className="flex">
                    <Save className="h-5 w-5 text-green-400" />
                    <p className="ml-3 text-sm text-green-700">{success}</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Basic Information */}
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Full Name</label>
                      <input
                        type="text"
                        value={formData.displayName}
                        onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                        disabled={!isEditing}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 disabled:bg-gray-50 disabled:text-gray-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Email</label>
                      <div className="mt-1 flex items-center">
                        <Mail className="h-5 w-5 text-gray-400 mr-2" />
                        <input
                          type="email"
                          value={formData.email}
                          disabled
                          className="block w-full rounded-md border-gray-300 shadow-sm bg-gray-50 text-gray-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Phone</label>
                      <div className="mt-1 flex items-center">
                        <Phone className="h-5 w-5 text-gray-400 mr-2" />
                        <input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          disabled={!isEditing}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 disabled:bg-gray-50 disabled:text-gray-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Location</label>
                      <div className="mt-1 flex items-center">
                        <MapPin className="h-5 w-5 text-gray-400 mr-2" />
                        <input
                          type="text"
                          value={formData.location}
                          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                          disabled={!isEditing}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 disabled:bg-gray-50 disabled:text-gray-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Professional Information */}
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Job Title</label>
                      <div className="mt-1 flex items-center">
                        <Briefcase className="h-5 w-5 text-gray-400 mr-2" />
                        <input
                          type="text"
                          value={formData.jobTitle}
                          onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                          disabled={!isEditing}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 disabled:bg-gray-50 disabled:text-gray-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Department</label>
                      <div className="mt-1 flex items-center">
                        <Building2 className="h-5 w-5 text-gray-400 mr-2" />
                        <input
                          type="text"
                          value={formData.department}
                          onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                          disabled={!isEditing}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 disabled:bg-gray-50 disabled:text-gray-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Role</label>
                      <div className="mt-1 flex items-center">
                        <Shield className="h-5 w-5 text-gray-400 mr-2" />
                        <input
                          type="text"
                          value={formData.role}
                          disabled
                          className="block w-full rounded-md border-gray-300 shadow-sm bg-gray-50 text-gray-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Start Date</label>
                      <div className="mt-1 flex items-center">
                        <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                        <input
                          type="date"
                          value={formData.startDate}
                          onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                          disabled={!isEditing}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 disabled:bg-gray-50 disabled:text-gray-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bio */}
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700">Bio</label>
                  <textarea
                    rows={4}
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    disabled={!isEditing}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 disabled:bg-gray-50 disabled:text-gray-500"
                  />
                </div>

                {/* Skills and Languages */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Skills</label>
                    <div className="mt-1 space-y-2">
                      {formData.skills.map((skill, index) => (
                        <div key={index} className="flex items-center">
                          <span className="flex-1 text-sm text-gray-700">{skill}</span>
                          {isEditing && (
                            <button
                              type="button"
                              onClick={() => removeArrayItem('skills', index)}
                              className="text-red-600 hover:text-red-800"
                            >
                              ×
                            </button>
                          )}
                        </div>
                      ))}
                      {isEditing && (
                        <input
                          type="text"
                          placeholder="Add a skill"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleArrayInput('skills', (e.target as HTMLInputElement).value);
                              (e.target as HTMLInputElement).value = '';
                            }
                          }}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                        />
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Languages</label>
                    <div className="mt-1 space-y-2">
                      {formData.languages.map((language, index) => (
                        <div key={index} className="flex items-center">
                          <Languages className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="flex-1 text-sm text-gray-700">{language}</span>
                          {isEditing && (
                            <button
                              type="button"
                              onClick={() => removeArrayItem('languages', index)}
                              className="text-red-600 hover:text-red-800"
                            >
                              ×
                            </button>
                          )}
                        </div>
                      ))}
                      {isEditing && (
                        <input
                          type="text"
                          placeholder="Add a language"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleArrayInput('languages', (e.target as HTMLInputElement).value);
                              (e.target as HTMLInputElement).value = '';
                            }
                          }}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                        />
                      )}
                    </div>
                  </div>
                </div>

                {/* Education and Certifications */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Education</label>
                    <div className="mt-1 space-y-2">
                      {formData.education.map((edu, index) => (
                        <div key={index} className="flex items-center">
                          <GraduationCap className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="flex-1 text-sm text-gray-700">{edu}</span>
                          {isEditing && (
                            <button
                              type="button"
                              onClick={() => removeArrayItem('education', index)}
                              className="text-red-600 hover:text-red-800"
                            >
                              ×
                            </button>
                          )}
                        </div>
                      ))}
                      {isEditing && (
                        <input
                          type="text"
                          placeholder="Add education"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleArrayInput('education', (e.target as HTMLInputElement).value);
                              (e.target as HTMLInputElement).value = '';
                            }
                          }}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                        />
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Certifications</label>
                    <div className="mt-1 space-y-2">
                      {formData.certifications.map((cert, index) => (
                        <div key={index} className="flex items-center">
                          <Award className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="flex-1 text-sm text-gray-700">{cert}</span>
                          {isEditing && (
                            <button
                              type="button"
                              onClick={() => removeArrayItem('certifications', index)}
                              className="text-red-600 hover:text-red-800"
                            >
                              ×
                            </button>
                          )}
                        </div>
                      ))}
                      {isEditing && (
                        <input
                          type="text"
                          placeholder="Add certification"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleArrayInput('certifications', (e.target as HTMLInputElement).value);
                              (e.target as HTMLInputElement).value = '';
                            }
                          }}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                        />
                      )}
                    </div>
                  </div>
                </div>

                {/* Social Links */}
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Social Links</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-center">
                        <Globe className="h-5 w-5 text-gray-400 mr-2" />
                        <input
                          type="url"
                          placeholder="Website"
                          value={formData.socialLinks.website}
                          onChange={(e) => setFormData({
                            ...formData,
                            socialLinks: { ...formData.socialLinks, website: e.target.value }
                          })}
                          disabled={!isEditing}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 disabled:bg-gray-50 disabled:text-gray-500"
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center">
                        <LinkIcon className="h-5 w-5 text-gray-400 mr-2" />
                        <input
                          type="url"
                          placeholder="LinkedIn"
                          value={formData.socialLinks.linkedin}
                          onChange={(e) => setFormData({
                            ...formData,
                            socialLinks: { ...formData.socialLinks, linkedin: e.target.value }
                          })}
                          disabled={!isEditing}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 disabled:bg-gray-50 disabled:text-gray-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {isEditing && (
                  <div className="mt-6 flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </button>
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}