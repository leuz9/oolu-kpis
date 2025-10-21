import React, { useState, useEffect } from 'react';
import { X, Globe, Search } from 'lucide-react';
import { User } from '../../../types';
import { countryService } from '../../../services/countryService';

interface UserCountryModalProps {
  user: User;
  onClose: () => void;
  onSave: (userId: string, countryIds: string[]) => void;
}

interface Country {
  id: string;
  name: string;
  code: string;
  flag: string;
}

export default function UserCountryModal({ user, onClose, onSave }: UserCountryModalProps) {
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCountryIds, setSelectedCountryIds] = useState<string[]>(user.countryIds || []);

  useEffect(() => {
    loadCountries();
  }, []);

  const loadCountries = async () => {
    try {
      setLoading(true);
      const data = await countryService.getActiveCountries();
      setCountries(data);
    } catch (error) {
      console.error('Error loading countries:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    onSave(user.id, selectedCountryIds);
    onClose();
  };

  const toggleCountry = (countryId: string) => {
    setSelectedCountryIds(prev => 
      prev.includes(countryId) 
        ? prev.filter(id => id !== countryId)
        : [...prev, countryId]
    );
  };

  const filteredCountries = countries.filter(country =>
    country.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    country.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Globe className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Set User Countries</h2>
                <p className="text-sm text-gray-600">Assign countries to {user.displayName}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search countries..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredCountries.map((country) => (
                <button
                  key={country.id}
                  onClick={() => toggleCountry(country.id)}
                  className={`w-full flex items-center space-x-3 p-3 rounded-lg border-2 transition-all ${
                    selectedCountryIds.includes(country.id)
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <span className="text-2xl">{country.flag}</span>
                  <div className="flex-1 text-left">
                    <p className="font-medium text-gray-900">{country.name}</p>
                    <p className="text-sm text-gray-600">{country.code}</p>
                  </div>
                  {selectedCountryIds.includes(country.id) && (
                    <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}

          {filteredCountries.length === 0 && !loading && (
            <div className="text-center py-8">
              <Globe className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No countries found</h3>
              <p className="text-gray-600">Try adjusting your search terms.</p>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Save Countries ({selectedCountryIds.length})
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
