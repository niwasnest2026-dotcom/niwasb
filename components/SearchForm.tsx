'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { 
  FaMapMarkerAlt, FaSearch, FaCalendarAlt, FaUser, FaUsers
} from 'react-icons/fa';
import { supabase } from '@/lib/supabase';

const genderOptions = [
  { value: 'any', label: 'Any', icon: FaUsers },
  { value: 'boys', label: 'Boys', icon: FaUser },
  { value: 'girls', label: 'Girls', icon: FaUser }
];

export default function SearchForm() {
  const router = useRouter();
  const [location, setLocation] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [moveInDate, setMoveInDate] = useState('');
  const [gender, setGender] = useState('any');
  const [nearbyProperties, setNearbyProperties] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [availableLocations, setAvailableLocations] = useState<string[]>([]);
  const [locationsLoading, setLocationsLoading] = useState(true);
  
  const locationInputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Fetch available locations from database
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await fetch('/api/get-locations');
        const data = await response.json();
        
        if (data.success) {
          setAvailableLocations(data.locations);
          console.log(`📍 Loaded ${data.dynamic_count} dynamic + ${data.static_count} static locations`);
        } else {
          console.error('Failed to fetch locations:', data.error);
          // Fallback to empty array - will show "no locations" message
          setAvailableLocations([]);
        }
      } catch (error) {
        console.error('Error fetching locations:', error);
        setAvailableLocations([]);
      } finally {
        setLocationsLoading(false);
      }
    };

    fetchLocations();
  }, []);

  // Memoized filtered locations for better performance
  const filteredLocations = useMemo(() => {
    if (!location.trim()) return availableLocations.slice(0, 8);
    return availableLocations.filter(loc => 
      loc.toLowerCase().includes(location.toLowerCase())
    ).slice(0, 10);
  }, [location, availableLocations]);

  // Set default move-in date to today
  useEffect(() => {
    const today = new Date();
    setMoveInDate(today.toISOString().split('T')[0]);
  }, []);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current && 
        !suggestionsRef.current.contains(event.target as Node) &&
        !locationInputRef.current?.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLocationSelect = useCallback((selectedLocation: string) => {
    setLocation(selectedLocation);
    setShowSuggestions(false);
    // Fetch nearby properties after location selection
    fetchNearbyProperties(selectedLocation);
  }, []);

  const fetchNearbyProperties = useCallback(async (searchLocation: string) => {
    if (!searchLocation.trim()) return;
    
    setIsSearching(true);
    try {
      // Extract city from location string
      const city = searchLocation.split(',').pop()?.trim() || searchLocation;
      
      const { data, error } = await supabase
        .from('properties')
        .select(`
          id, name, price, area, city, featured_image, 
          property_type, gender_preference, available_beds
        `)
        .or(`city.ilike.%${city}%,area.ilike.%${searchLocation}%,address.ilike.%${searchLocation}%`)
        .eq('is_available', true)
        .limit(6);

      if (error) throw error;
      setNearbyProperties(data || []);
    } catch (error) {
      console.error('Error fetching nearby properties:', error);
      setNearbyProperties([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    
    if (!location.trim()) {
      alert('Please enter a location to search');
      return;
    }

    // Build search parameters
    const params = new URLSearchParams({
      location: location.trim(),
      gender: gender,
    });

    if (moveInDate) {
      params.append('moveIn', moveInDate);
    }

    router.push(`/listings?${params.toString()}`);
  }, [location, gender, moveInDate, router]);

  const formatDate = useCallback((dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  }, []);

  return (
    <div className="w-full max-w-5xl mx-auto">
      <form onSubmit={handleSearch} className="space-y-6">
        {/* Main Search Card */}
        <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-xl p-6 md:p-8">
          {/* Primary Location Search */}
          <div className="mb-6 relative">
            <div className="relative">
              <FaMapMarkerAlt className="absolute left-6 top-1/2 -translate-y-1/2 text-orange-500 text-xl" />
              <input
                ref={locationInputRef}
                type="text"
                placeholder={locationsLoading ? "Loading locations..." : "Search by area, college, or office"}
                value={location}
                onChange={(e) => {
                  setLocation(e.target.value);
                  setShowSuggestions(true);
                  if (!e.target.value.trim()) {
                    setNearbyProperties([]);
                  }
                }}
                onFocus={() => setShowSuggestions(true)}
                disabled={locationsLoading}
                className="w-full pl-16 pr-6 py-5 text-xl font-medium border-3 border-gray-200 rounded-2xl focus:border-orange-500 focus:outline-none transition-all shadow-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                style={{ 
                  fontSize: '18px', 
                  color: '#111827 !important',
                  backgroundColor: locationsLoading ? '#f3f4f6' : '#ffffff',
                  WebkitTextFillColor: '#111827'
                }}
              />
              {locationsLoading && (
                <div className="absolute right-6 top-1/2 -translate-y-1/2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-orange-500"></div>
                </div>
              )}
            </div>

            {/* Location Suggestions */}
            {showSuggestions && !locationsLoading && (
              <div 
                ref={suggestionsRef}
                className="absolute top-full left-0 right-0 mt-3 bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 max-h-80 overflow-y-auto"
                style={{ 
                  backgroundColor: '#ffffff',
                  boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
                  border: '1px solid #e5e7eb'
                }}
              >
                {filteredLocations.length > 0 ? (
                  <>
                    <div className="px-4 py-3 border-b border-gray-100">
                      <span className="text-sm font-semibold text-gray-600">
                        Available Locations ({availableLocations.length} total)
                      </span>
                    </div>
                    {filteredLocations.map((locationName) => (
                      <button
                        key={locationName}
                        type="button"
                        onClick={() => handleLocationSelect(locationName)}
                        className="w-full px-6 py-4 text-left hover:bg-orange-50 transition-colors flex items-center space-x-4 border-b border-gray-50 last:border-b-0"
                        style={{ 
                          color: '#1f2937',
                          backgroundColor: 'transparent'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#fff7ed';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                      >
                        <FaMapMarkerAlt className="text-orange-400 flex-shrink-0" style={{ color: '#fb923c' }} />
                        <div>
                          <div className="font-medium" style={{ color: '#111827' }}>
                            {locationName.split(',')[0]}
                          </div>
                          {locationName.includes(',') && (
                            <div className="text-sm text-gray-500">
                              {locationName.split(',').slice(1).join(',').trim()}
                            </div>
                          )}
                        </div>
                      </button>
                    ))}
                  </>
                ) : location.trim() ? (
                  <div className="px-6 py-8 text-center">
                    <div className="text-gray-500 mb-3" style={{ color: '#6b7280' }}>
                      No properties found in "{location}"
                    </div>
                    <div className="text-sm text-gray-400">
                      Try searching for nearby areas or add properties in this location through admin panel
                    </div>
                  </div>
                ) : (
                  <div className="px-6 py-4 text-center">
                    <div className="text-gray-500 mb-2">Start typing to search locations</div>
                    <div className="text-xs text-gray-400">
                      {availableLocations.length} locations available from your properties
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Secondary Filters Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Move-in Date */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Move-in Date
              </label>
              <div className="relative">
                <FaCalendarAlt className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-400 text-lg" />
                <input
                  type="date"
                  value={moveInDate}
                  onChange={(e) => setMoveInDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full pl-12 pr-4 py-4 text-lg font-medium border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none transition-colors"
                  style={{ 
                    color: '#111827 !important',
                    backgroundColor: '#ffffff',
                    WebkitTextFillColor: '#111827'
                  }}
                />
              </div>
            </div>

            {/* Gender Preference */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Gender Preference
              </label>
              <div className="grid grid-cols-3 gap-2">
                {genderOptions.map((option) => {
                  const IconComponent = option.icon;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setGender(option.value)}
                      className={`flex items-center justify-center space-x-2 py-4 px-3 rounded-xl font-semibold transition-all ${
                        gender === option.value
                          ? 'bg-orange-500 text-white shadow-lg'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <IconComponent className="text-lg" />
                      <span>{option.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Find My PG Button */}
          <button
            type="submit"
            disabled={!location.trim()}
            className="w-full py-5 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 disabled:from-gray-300 disabled:to-gray-400 text-white font-bold text-xl rounded-2xl transition-all shadow-xl hover:shadow-2xl transform hover:scale-[1.02] disabled:transform-none disabled:cursor-not-allowed"
          >
            <div className="flex items-center justify-center space-x-3">
              <FaSearch className="text-xl" />
              <span>Find My PG</span>
            </div>
          </button>

          {/* Move-in Date Display */}
          {moveInDate && (
            <div className="mt-4 text-center">
              <div className="inline-flex items-center space-x-2 px-4 py-2 bg-orange-100 rounded-full">
                <FaCalendarAlt className="text-orange-600" />
                <span className="text-orange-800 font-medium">
                  Moving in: {formatDate(moveInDate)}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Nearby Properties Preview */}
        {nearbyProperties.length > 0 && (
          <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">
                Properties near "{location}"
              </h3>
              <span className="text-sm text-gray-600">
                {nearbyProperties.length} found
              </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {nearbyProperties.map((property) => (
                <div
                  key={property.id}
                  className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => router.push(`/property/${property.id}`)}
                >
                  <div className="flex items-start space-x-3">
                    {property.featured_image && (
                      <img
                        src={property.featured_image}
                        alt={property.name}
                        className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900 truncate">
                        {property.name}
                      </h4>
                      <p className="text-sm text-gray-600 truncate">
                        {property.area}, {property.city}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-lg font-bold text-orange-600">
                          ₹{property.price?.toLocaleString()}
                        </span>
                        {property.available_beds && (
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                            {property.available_beds} beds
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-4 text-center">
              <button
                onClick={() => handleSearch({ preventDefault: () => {} } as any)}
                className="px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition-colors"
              >
                View All Properties
              </button>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isSearching && (
          <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-lg p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Searching for properties near you...</p>
          </div>
        )}
      </form>
    </div>
  );
}