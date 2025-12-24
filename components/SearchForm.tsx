'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { FaMapMarkerAlt, FaClock, FaCalendar, FaUsers, FaSearch, FaChevronDown, FaLocationArrow, FaSpinner, FaHistory, FaBuilding } from 'react-icons/fa';
import { supabase } from '@/lib/supabase';

const popularCities = [
  'Goa', 'Bangalore', 'New Delhi', 'Mumbai', 'Pune', 'Chennai', 
  'Hyderabad', 'Jaipur', 'Gurgaon', 'Agra', 'Ahmedabad', 'Kolkata',
  'Kochi', 'Chandigarh', 'Indore', 'Bhopal', 'Lucknow', 'Nagpur'
];

const durations = ['1 Month', '3 Months', '6 Months', '12 Months'];
const guestOptions = ['1 Guest', '2 Guests', '3 Guests', '4+ Guests'];

interface Property {
  id: string;
  name: string;
  city: string;
  area: string | null;
  price: number;
  property_type: string;
}

export default function SearchForm() {
  const router = useRouter();
  const [city, setCity] = useState('');
  const [duration, setDuration] = useState('1 Month');
  const [moveIn, setMoveIn] = useState('');
  const [guests, setGuests] = useState('1 Guest');
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [locationPermission, setLocationPermission] = useState<'granted' | 'denied' | 'prompt' | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredCities, setFilteredCities] = useState<string[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoadingProperties, setIsLoadingProperties] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const cityInputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load recent searches from localStorage
    const saved = localStorage.getItem('recentCitySearches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }

    // Check if geolocation is supported and get permission status
    if ('geolocation' in navigator && 'permissions' in navigator) {
      navigator.permissions.query({ name: 'geolocation' }).then((result) => {
        setLocationPermission(result.state as 'granted' | 'denied' | 'prompt');
      });
    }

    // Close suggestions when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        cityInputRef.current &&
        !cityInputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    // Filter cities based on input
    if (city.trim()) {
      const filtered = popularCities.filter(cityName =>
        cityName.toLowerCase().includes(city.toLowerCase())
      );
      setFilteredCities(filtered);
      
      // Only fetch properties if the entered city matches exactly with popular cities
      // or if it's a complete city name (more than 3 characters and no exact match in popular cities)
      const exactMatch = popularCities.find(cityName => 
        cityName.toLowerCase() === city.toLowerCase()
      );
      
      if (exactMatch || (city.trim().length > 3 && filtered.length === 0)) {
        fetchProperties(city.trim());
      } else {
        setProperties([]);
      }
    } else {
      setFilteredCities([]);
      setProperties([]);
    }
  }, [city]);

  const fetchProperties = async (searchCity: string) => {
    setIsLoadingProperties(true);
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('id, name, city, area, price, property_type')
        .or(`city.ilike.%${searchCity}%,area.ilike.%${searchCity}%,name.ilike.%${searchCity}%`)
        .limit(6);

      if (error) {
        console.error('Error fetching properties:', error);
        setProperties([]);
      } else {
        setProperties(data || []);
      }
    } catch (error) {
      console.error('Error fetching properties:', error);
      setProperties([]);
    } finally {
      setIsLoadingProperties(false);
    }
  };

  const getCurrentLocation = async () => {
    setIsGettingLocation(true);
    
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        });
      });

      const { latitude, longitude } = position.coords;
      
      // Use free reverse geocoding service
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'NiwasNest Property Search'
          }
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        const address = data.address;
        
        if (address) {
          // Extract city information
          const detectedCity = address.city || address.town || address.village || address.county || address.state_district;
          
          if (detectedCity) {
            setCity(detectedCity);
            setShowSuggestions(false);
          }
        }
      }
    } catch (error) {
      console.error('Error getting location:', error);
    } finally {
      setIsGettingLocation(false);
    }
  };

  const requestLocation = () => {
    if (locationPermission === 'denied') {
      alert('Location access is denied. Please enable location permissions in your browser settings to auto-detect your city.');
      return;
    }
    getCurrentLocation();
  };

  const handleCitySelect = (selectedCity: string) => {
    setCity(selectedCity);
    setShowSuggestions(false);
    
    // Add to recent searches
    const updatedRecent = [selectedCity, ...recentSearches.filter(c => c !== selectedCity)].slice(0, 3);
    setRecentSearches(updatedRecent);
    localStorage.setItem('recentCitySearches', JSON.stringify(updatedRecent));
  };

  const handleCityInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCity(e.target.value);
    setShowSuggestions(true);
  };

  const handleCityInputFocus = () => {
    setShowSuggestions(true);
  };

  const handlePropertySelect = (property: Property) => {
    router.push(`/property/${property.id}`);
  };

  // Calculate move-out date based on move-in date and duration
  const calculateMoveOutDate = () => {
    if (!moveIn || !duration) return 'Auto-calculated';
    
    const moveInDate = new Date(moveIn);
    const durationMonths = parseInt(duration.split(' ')[0]);
    
    const moveOutDate = new Date(moveInDate);
    moveOutDate.setMonth(moveOutDate.getMonth() + durationMonths);
    
    return moveOutDate.toISOString().split('T')[0];
  };

  const handleSearch = () => {
    if (city.trim()) {
      // Add to recent searches
      const updatedRecent = [city, ...recentSearches.filter(c => c !== city)].slice(0, 3);
      setRecentSearches(updatedRecent);
      localStorage.setItem('recentCitySearches', JSON.stringify(updatedRecent));
    }

    const params = new URLSearchParams();
    if (city) params.set('city', city);
    if (duration) params.set('duration', duration);
    if (moveIn) params.set('moveIn', moveIn);
    if (guests) params.set('guests', guests);

    router.push(`/listings?${params.toString()}`);
  };

  return (
    <div className="glass-card rounded-3xl shadow-glass-lg p-4 sm:p-6 max-w-2xl mx-auto">
      <div className="space-y-3 sm:space-y-4">
        <div className="relative">
          <label className="block text-xs sm:text-sm font-medium text-neutral-600 mb-1.5 sm:mb-2 uppercase">
            CITY
          </label>
          <div className="relative">
            <FaMapMarkerAlt className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-neutral-400 text-sm z-10" />
            <input
              ref={cityInputRef}
              type="text"
              value={city}
              onChange={handleCityInputChange}
              onFocus={handleCityInputFocus}
              placeholder="Search city, area or hotel"
              className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-2.5 sm:py-3 border-b border-neutral-200 focus:border-accent outline-none text-neutral-900 bg-transparent placeholder-neutral-400 text-sm sm:text-base"
            />
            
            {/* City Suggestions Dropdown */}
            {showSuggestions && (
              <div 
                ref={suggestionsRef}
                className="absolute top-full left-0 right-0 bg-white border border-neutral-200 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto mt-1"
              >
                {/* Use Current Location Option */}
                {locationPermission !== 'denied' && (
                  <button
                    onClick={requestLocation}
                    disabled={isGettingLocation}
                    className="w-full px-4 py-3 text-left hover:bg-neutral-50 flex items-center space-x-3 border-b border-neutral-100 disabled:opacity-50"
                  >
                    <div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center">
                      {isGettingLocation ? (
                        <FaSpinner className="animate-spin text-blue-500 text-sm" />
                      ) : (
                        <FaLocationArrow className="text-blue-500 text-sm" />
                      )}
                    </div>
                    <div>
                      <div className="font-medium text-blue-600">
                        {isGettingLocation ? 'Getting location...' : 'Use current location'}
                      </div>
                      <div className="text-sm text-neutral-500">Properties near me</div>
                    </div>
                  </button>
                )}

                {/* Recent Searches */}
                {recentSearches.length > 0 && !city.trim() && (
                  <>
                    <div className="px-4 py-2 text-xs font-medium text-neutral-500 uppercase bg-neutral-50">
                      Recent searches
                    </div>
                    {recentSearches.map((recentCity, index) => (
                      <button
                        key={`recent-${index}`}
                        onClick={() => handleCitySelect(recentCity)}
                        className="w-full px-4 py-3 text-left hover:bg-neutral-50 flex items-center space-x-3"
                      >
                        <div className="w-8 h-8 bg-neutral-100 rounded-full flex items-center justify-center">
                          <FaHistory className="text-neutral-500 text-sm" />
                        </div>
                        <div>
                          <div className="font-medium text-neutral-900">{recentCity}</div>
                        </div>
                      </button>
                    ))}
                  </>
                )}

                {/* Locality Suggestions - Show first when typing */}
                {city.trim() && filteredCities.length > 0 && (
                  <>
                    <div className="px-4 py-2 text-xs font-medium text-neutral-500 uppercase bg-neutral-50">
                      Cities
                    </div>
                    {filteredCities.slice(0, 5).map((cityName, index) => (
                      <button
                        key={`filtered-${index}`}
                        onClick={() => handleCitySelect(cityName)}
                        className="w-full px-4 py-3 text-left hover:bg-neutral-50 flex items-center space-x-3"
                      >
                        <div className="w-8 h-8 bg-neutral-100 rounded-full flex items-center justify-center">
                          <FaMapMarkerAlt className="text-neutral-500 text-sm" />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-neutral-900">{cityName}</div>
                        </div>
                        <div className="text-xs text-neutral-400 bg-neutral-100 px-2 py-1 rounded">
                          City
                        </div>
                      </button>
                    ))}
                  </>
                )}

                {/* Properties from Database - Show only for complete city names */}
                {city.trim() && properties.length > 0 && (
                  <>
                    <div className="px-4 py-2 text-xs font-medium text-neutral-500 uppercase bg-neutral-50 flex items-center justify-between">
                      <span>Properties in {city}</span>
                      {isLoadingProperties && <FaSpinner className="animate-spin text-sm" />}
                    </div>
                    {properties.map((property) => (
                      <button
                        key={property.id}
                        onClick={() => handlePropertySelect(property)}
                        className="w-full px-4 py-3 text-left hover:bg-neutral-50 flex items-center space-x-3 border-b border-neutral-50 last:border-b-0"
                      >
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                          <FaBuilding className="text-primary text-sm" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-neutral-900 truncate">{property.name}</div>
                          <div className="text-sm text-neutral-500 flex items-center space-x-1">
                            <span>{property.area || property.city}</span>
                            <span className="text-neutral-300">•</span>
                            <span className="font-medium text-primary">₹{property.price?.toLocaleString()}/month</span>
                          </div>
                        </div>
                        <div className="text-xs text-neutral-400 bg-neutral-100 px-2 py-1 rounded">
                          Property
                        </div>
                      </button>
                    ))}
                  </>
                )}

                {/* Popular Cities */}
                {!city.trim() && (
                  <>
                    <div className="px-4 py-2 text-xs font-medium text-neutral-500 uppercase bg-neutral-50">
                      Popular cities
                    </div>
                    {popularCities.slice(0, 10).map((cityName, index) => (
                      <button
                        key={`popular-${index}`}
                        onClick={() => handleCitySelect(cityName)}
                        className="w-full px-4 py-3 text-left hover:bg-neutral-50 flex items-center space-x-3"
                      >
                        <div className="w-8 h-8 bg-neutral-100 rounded-full flex items-center justify-center">
                          <FaMapMarkerAlt className="text-neutral-500 text-sm" />
                        </div>
                        <div>
                          <div className="font-medium text-neutral-900">{cityName}</div>
                        </div>
                      </button>
                    ))}
                  </>
                )}

                {/* No Results */}
                {city.trim() && !isLoadingProperties && properties.length === 0 && filteredCities.length === 0 && (
                  <div className="px-4 py-6 text-center text-neutral-500">
                    <div className="text-sm">No cities or properties found matching "{city}"</div>
                    <div className="text-xs mt-1">Try searching for a popular city name</div>
                  </div>
                )}

                {/* Loading State */}
                {city.trim() && isLoadingProperties && (
                  <div className="px-4 py-6 text-center text-neutral-500">
                    <FaSpinner className="animate-spin mx-auto mb-2" />
                    <div className="text-sm">Searching for properties in {city}...</div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="relative">
          <label className="block text-xs sm:text-sm font-medium text-neutral-600 mb-1.5 sm:mb-2 uppercase">
            DURATION
          </label>
          <div className="relative">
            <FaClock className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-neutral-400 text-sm" />
            <select
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="w-full pl-10 sm:pl-12 pr-8 sm:pr-10 py-2.5 sm:py-3 border-b border-neutral-200 focus:border-accent outline-none text-neutral-900 appearance-none bg-transparent text-sm sm:text-base"
            >
              {durations.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
            <FaChevronDown className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none text-sm" />
          </div>
        </div>

        <div className="relative">
          <label className="block text-xs sm:text-sm font-medium text-neutral-600 mb-1.5 sm:mb-2 uppercase">
            MOVE-IN
          </label>
          <div className="relative">
            <FaCalendar className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-neutral-400 text-sm" />
            <input
              type="date"
              value={moveIn}
              onChange={(e) => setMoveIn(e.target.value)}
              className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-2.5 sm:py-3 border-b border-neutral-200 focus:border-accent outline-none text-neutral-900 bg-transparent text-sm sm:text-base"
            />
          </div>
        </div>

        <div className="relative">
          <label className="block text-xs sm:text-sm font-medium text-neutral-600 mb-1.5 sm:mb-2 uppercase">
            MOVE-OUT
          </label>
          <div className="relative">
            <FaCalendar className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-neutral-400 text-sm" />
            <input
              type="text"
              value={calculateMoveOutDate()}
              disabled
              className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-2.5 sm:py-3 border-b border-neutral-200 outline-none text-neutral-400 bg-transparent text-sm sm:text-base"
            />
          </div>
        </div>

        <div className="relative">
          <label className="block text-xs sm:text-sm font-medium text-neutral-600 mb-1.5 sm:mb-2 uppercase">
            GUESTS
          </label>
          <div className="relative">
            <FaUsers className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-neutral-400 text-sm" />
            <select
              value={guests}
              onChange={(e) => setGuests(e.target.value)}
              className="w-full pl-10 sm:pl-12 pr-8 sm:pr-10 py-2.5 sm:py-3 border-b border-neutral-200 focus:border-accent outline-none text-neutral-900 appearance-none bg-transparent text-sm sm:text-base"
            >
              {guestOptions.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
            <FaChevronDown className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none text-sm" />
          </div>
        </div>

        <button
          onClick={handleSearch}
          className="w-full gradient-glass text-primary hover:glow-primary py-3 sm:py-4 rounded-xl font-bold text-base sm:text-lg transition-all duration-300 flex items-center justify-center space-x-2 mt-4 sm:mt-6 shadow-glass hover:shadow-glass-lg"
        >
          <FaSearch />
          <span>Search</span>
        </button>
      </div>
    </div>
  );
}
