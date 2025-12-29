'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { 
  FaMapMarkerAlt, FaSearch, FaCalendarAlt, FaClock 
} from 'react-icons/fa';

const popularCities = [
  'Bangalore', 'Mumbai', 'Delhi', 'Pune', 'Hyderabad', 'Chennai'
];

const durationOptions = [
  { value: 1, label: '1 Month' },
  { value: 2, label: '2 Months' },
  { value: 3, label: '3 Months' },
  { value: 4, label: '4 Months' },
  { value: 5, label: '5 Months' },
  { value: 6, label: '6 Months' },
  { value: 7, label: '7 Months' },
  { value: 8, label: '8 Months' },
  { value: 9, label: '9 Months' },
  { value: 12, label: '12 Months' },
];

export default function SearchForm() {
  const router = useRouter();
  const [city, setCity] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [duration, setDuration] = useState<number>(6);
  const [checkInDate, setCheckInDate] = useState('');
  const [checkOutDate, setCheckOutDate] = useState('');
  
  const cityInputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Memoized filtered cities for better performance
  const filteredCities = useMemo(() => {
    if (!city.trim()) return popularCities.slice(0, 4);
    return popularCities.filter(cityName => 
      cityName.toLowerCase().includes(city.toLowerCase())
    ).slice(0, 6); // Show more cities when searching
  }, [city]);

  // Calculate check-out date when check-in date or duration changes
  const calculateCheckOutDate = useCallback((checkIn: string, months: number) => {
    if (checkIn && months) {
      const checkInDate = new Date(checkIn);
      const checkOutDate = new Date(checkInDate);
      checkOutDate.setMonth(checkOutDate.getMonth() + months);
      return checkOutDate.toISOString().split('T')[0];
    }
    return '';
  }, []);

  useEffect(() => {
    const checkOut = calculateCheckOutDate(checkInDate, duration);
    setCheckOutDate(checkOut);
  }, [checkInDate, duration, calculateCheckOutDate]);

  // Set default check-in date to today
  useEffect(() => {
    const today = new Date();
    setCheckInDate(today.toISOString().split('T')[0]);
  }, []);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current && 
        !suggestionsRef.current.contains(event.target as Node) &&
        !cityInputRef.current?.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCitySelect = useCallback((selectedCity: string) => {
    setCity(selectedCity);
    setShowSuggestions(false);
  }, []);

  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    
    if (!city.trim()) {
      alert('Please enter a city to search');
      return;
    }

    // Build search parameters
    const params = new URLSearchParams({
      city: city.trim(),
      duration: duration.toString(),
    });

    if (checkInDate) {
      params.append('checkIn', checkInDate);
    }
    
    if (checkOutDate) {
      params.append('checkOut', checkOutDate);
    }

    router.push(`/listings?${params.toString()}`);
  }, [city, duration, checkInDate, checkOutDate, router]);

  const formatDate = useCallback((dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric'
    });
  }, []);

  return (
    <div className="w-full max-w-4xl mx-auto">
      <form onSubmit={handleSearch} className="space-y-4">
        {/* Main Search Row */}
        <div className="flex flex-col lg:flex-row gap-4 p-4 bg-white/95 backdrop-blur-md rounded-2xl shadow-lg">
          {/* City Input */}
          <div className="flex-1 relative">
            <div className="relative">
              <FaMapMarkerAlt className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
              <input
                ref={cityInputRef}
                type="text"
                placeholder="Enter city (e.g., Bangalore, Mumbai)"
                value={city}
                onChange={(e) => {
                  setCity(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                className="w-full pl-12 pr-4 py-4 text-lg font-medium border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none transition-colors"
              />
            </div>

            {/* City Suggestions */}
            {showSuggestions && (
              <div 
                ref={suggestionsRef}
                className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-200 z-50 max-h-60 overflow-y-auto"
                style={{ 
                  backgroundColor: '#ffffff',
                  boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
                  border: '1px solid #e5e7eb'
                }}
              >
                {filteredCities.length > 0 ? (
                  filteredCities.map((cityName) => (
                    <button
                      key={cityName}
                      type="button"
                      onClick={() => handleCitySelect(cityName)}
                      className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center space-x-3 border-b border-gray-100 last:border-b-0"
                      style={{ 
                        color: '#1f2937',
                        backgroundColor: 'transparent'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#f9fafb';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      <FaMapMarkerAlt className="text-gray-400 flex-shrink-0" style={{ color: '#9ca3af' }} />
                      <span className="font-medium" style={{ color: '#111827' }}>{cityName}</span>
                    </button>
                  ))
                ) : city.trim() ? (
                  <div className="px-4 py-3 text-gray-500 text-sm" style={{ color: '#6b7280' }}>
                    No cities found. Try searching for major cities like Bangalore, Mumbai, Delhi.
                  </div>
                ) : null}
              </div>
            )}
          </div>

          {/* Duration Selector */}
          <div className="lg:w-48">
            <div className="relative">
              <FaClock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
              <select
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="w-full pl-12 pr-4 py-4 text-lg font-medium border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none transition-colors appearance-none bg-white"
              >
                {durationOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Search Button */}
          <button
            type="submit"
            className="lg:w-20 h-16 bg-orange-500 hover:bg-orange-600 text-white rounded-xl transition-colors flex items-center justify-center font-semibold text-lg shadow-lg"
          >
            <FaSearch className="text-xl" />
          </button>
        </div>

        {/* Date Row */}
        <div className="flex flex-col sm:flex-row gap-4 p-4 bg-white/90 backdrop-blur-md rounded-xl">
          {/* Check-in Date */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Check-in Date
            </label>
            <div className="relative">
              <FaCalendarAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="date"
                value={checkInDate}
                onChange={(e) => setCheckInDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none transition-colors"
              />
            </div>
          </div>

          {/* Check-out Date (Read-only) */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Check-out Date
            </label>
            <div className="relative">
              <FaCalendarAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="date"
                value={checkOutDate}
                readOnly
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
              />
            </div>
          </div>

          {/* Date Summary */}
          <div className="flex items-end">
            <div className="px-4 py-3 bg-orange-100 rounded-lg">
              <div className="text-sm font-medium text-orange-800">
                {checkInDate && checkOutDate ? (
                  <>
                    {formatDate(checkInDate)} - {formatDate(checkOutDate)}
                    <div className="text-xs text-orange-600 mt-1">
                      {duration} month{duration > 1 ? 's' : ''}
                    </div>
                  </>
                ) : (
                  'Select dates'
                )}
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}