import React, { useState, useRef, useEffect } from 'react';
import { Search, Globe, Check, ChevronDown, X } from 'lucide-react';
import { countryService } from '../../../services/countryService';

interface Country {
  id: string;
  name: string;
  code: string;
  flag: string;
}

interface CountrySelectProps {
  selectedCountryIds: string[];
  onChange: (countryIds: string[]) => void;
  label?: string;
  placeholder?: string;
  required?: boolean;
}

export default function CountrySelect({ 
  selectedCountryIds = [], 
  onChange, 
  label = 'Countries',
  placeholder = 'Select countries...',
  required = false
}: CountrySelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

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

  const filteredCountries = countries.filter(country => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      country.name.toLowerCase().includes(search) ||
      country.code.toLowerCase().includes(search)
    );
  });

  const selectedCountries = countries.filter(c => selectedCountryIds.includes(c.id));

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
          prev < filteredCountries.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => prev > 0 ? prev - 1 : 0);
        break;
      case 'Enter':
        e.preventDefault();
        if (filteredCountries[highlightedIndex]) {
          toggleCountry(filteredCountries[highlightedIndex].id);
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

  const toggleCountry = (countryId: string) => {
    const newSelection = selectedCountryIds.includes(countryId)
      ? selectedCountryIds.filter(id => id !== countryId)
      : [...selectedCountryIds, countryId];
    onChange(newSelection);
  };

  const handleRemoveCountry = (e: React.MouseEvent, countryId: string) => {
    e.stopPropagation();
    onChange(selectedCountryIds.filter(id => id !== countryId));
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
        <Globe className="h-4 w-4" />
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>

      <div className="relative">
        <div
          className={`w-full min-h-[42px] px-4 py-2 rounded-lg border-2 transition-all duration-200 flex items-center justify-between gap-3 ${
            isOpen
              ? 'border-primary-500 ring-4 ring-primary-200 bg-white'
              : 'border-gray-200 hover:border-gray-300 focus-within:border-primary-500 bg-white'
          }`}
        >
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            onKeyDown={handleKeyDown}
            className="flex items-center gap-2 flex-1 min-w-0 text-left"
          >
            {selectedCountries.length > 0 ? (
              <div className="flex flex-wrap gap-2 flex-1">
                {selectedCountries.map((country) => (
                  <div
                    key={country.id}
                    className="flex items-center gap-1.5 bg-primary-50 text-primary-700 px-2.5 py-1 rounded-md text-sm font-medium"
                  >
                    <span className="text-base">{country.flag}</span>
                    <span className="truncate max-w-[120px]">{country.name}</span>
                    <button
                      type="button"
                      onClick={(e) => handleRemoveCountry(e, country.id)}
                      className="ml-1 hover:bg-primary-100 rounded-full p-0.5 transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <span className="text-gray-400">{placeholder}</span>
            )}
          </button>
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0"
          >
            <ChevronDown
              className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${
                isOpen ? 'transform rotate-180' : ''
              }`}
            />
          </button>
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
                  placeholder="Search countries..."
                  className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200 text-sm"
                />
              </div>
            </div>

            {/* Countries List */}
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              </div>
            ) : (
              <div
                ref={listRef}
                className="max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
              >
                {filteredCountries.length > 0 ? (
                  filteredCountries.map((country, index) => {
                    const isSelected = selectedCountryIds.includes(country.id);
                    const isHighlighted = index === highlightedIndex;
                    
                    return (
                      <button
                        key={country.id}
                        type="button"
                        onClick={() => toggleCountry(country.id)}
                        onMouseEnter={() => setHighlightedIndex(index)}
                        className={`w-full px-4 py-3 flex items-center gap-3 transition-all duration-150 ${
                          isHighlighted
                            ? 'bg-primary-50 border-l-4 border-primary-500'
                            : 'hover:bg-gray-50 border-l-4 border-transparent'
                        } ${isSelected ? 'bg-primary-50' : ''}`}
                      >
                        <span className="text-2xl flex-shrink-0">{country.flag}</span>
                        <div className="flex-1 min-w-0 text-left">
                          <div className={`font-medium truncate ${
                            isSelected ? 'text-primary-700' : 'text-gray-900'
                          }`}>
                            {country.name}
                          </div>
                          <div className="text-xs text-gray-500 truncate">
                            {country.code}
                          </div>
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
                  })
                ) : (
                  <div className="px-4 py-8 text-center">
                    <Globe className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">No countries found</p>
                    <p className="text-xs text-gray-400 mt-1">Try a different search term</p>
                  </div>
                )}
              </div>
            )}

            {/* Footer */}
            {filteredCountries.length > 0 && (
              <div className="px-4 py-2 border-t border-gray-200 bg-gray-50 text-xs text-gray-500">
                <div className="flex items-center justify-between">
                  <span>
                    {selectedCountryIds.length > 0 
                      ? `${selectedCountryIds.length} selected` 
                      : 'No countries selected'}
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 bg-white border border-gray-300 rounded text-xs">↑↓</kbd>
                    <span>navigate</span>
                    <kbd className="px-1.5 py-0.5 bg-white border border-gray-300 rounded text-xs ml-2">Enter</kbd>
                    <span>toggle</span>
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

