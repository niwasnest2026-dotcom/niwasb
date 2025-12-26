'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
  FaMapMarkerAlt, FaSearch, FaBuilding, FaLocationArrow, 
  FaSpinner, FaHistory 
} from 'react-icons/fa';
import { supabase } from '@/lib/supabase';

interface Property {
  id: string;
  name: string;
  city: string;
  area: string;
  address: string;
  price: number;
  property_type: string;
}

const popularCities = [
  'Bangalore', 'Mumbai', 'Delhi', 'Pune', 'Hyderabad', 'Chennai', 
  'Kolkata', 'Ahmedabad', 'Jaipur', 'Lucknow', 'Kanpur', 'Nagpur'
];

export default function SearchForm() {
  const router = useRouter();
  const [city, setCity] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoadingProperties, setIsLoadingProperties] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [locationPermission, setLocationPermission] = useState<'granted' | 'denied' | 'prompt' | null>(null);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  
  const cityInputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recentCitySearches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  // Check geolocation permission
  useEffect(() => {
    if ('geolocation' in navigator && 'permissions' in navigator) {
      navigator.permissions.query({ name: 'geolocation' }).then((result) => {
        setLocationPermission(result.state as 'granted' | 'denied' | 'prompt');
      });
    }
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

  const filteredCities = popularCities.filter(cityName =>
    cityName.toLowerCase().includes(city.toLowerCase())
  );

  const handleCityInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCity(value);
    
    if (value.trim().length >= 2) {
      fetchProperties(value);
    } else {
      setProperties([]);
    }
  };

  const handleCityInputFocus = () => {
    setShowSuggestions(true);
  };

  const handleCitySelect = (selectedCity: string) => {
    setCity(selectedCity);
    setShowSuggestions(false);
    setProperties([]);
  };

  const handlePropertySelect = (property: Property) => {
    router.push(`/property/${property.id}`);
  };

  const requestLocation = async () => {
    if (locationPermission === 'denied') {
      alert('Location access is denied. Please enable it in your browser settings.');
      return;
    }
    
    await getCurrentLocation();
  };

  const fetchProperties = async (searchCity: string) => {
    if (!searchCity.trim()) return;
    
    setIsLoadingProperties(true);
    
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('id, name, city, area, address, price, property_type')
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
          const detectedCity = address.city || address.town || address.village || address.state_district || address.state;
          
          if (detectedCity) {
            setCity(detectedCity);
            setShowSuggestions(false);
            fetchProperties(detectedCity);
          }
        }
      }
    } catch (error) {
      console.error('Error getting location:', error);
      alert('Unable to get your location. Please enter your city manually.');
    } finally {
      setIsGettingLocation(false);
    }
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

    router.push(`/listings?${params.toString()}`);
  };

  return (
    <div className="saas-card rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-6 md:p-8 max-w-3xl mx-auto border-gradient">
      <div className="space-y-4 sm:space-y-6">
        <div className="relative">
          <label className="block text-sm font-semibold text-neutral mb-2 sm:mb-3 uppercase tracking-wide">
            Where do you want to stay?
          </label>
          <div className="relative">
            <FaMapMarkerAlt className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-secondary text-base sm:text-lg z-10" />
            <input
              ref={cityInputRef}
              type="text"
              value={city}
              onChange={handleCityInputChange}
              onFocus={handleCityInputFocus}
              placeholder="Search city, area or property"
              className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-3 sm:py-4 border-2 border-primary/20 focus:border-secondary outline-none text-neutral bg-neutral-white rounded-lg sm:rounded-xl placeholder-neutral/50 text-base sm:text-lg font-medium transition-all duration-300 focus:shadow-lg"
            />
            
            {/* City Suggestions Dropdown */}
            {showSuggestions && (
              <div 
                ref={suggestionsRef}
                className="absolute top-full left-0 right-0 saas-card border-2 border-primary/10 rounded-lg sm:rounded-xl shadow-2xl z-50 max-h-80 overflow-y-auto mt-2"
              >
                {/* Use Current Location Option */}
                {locationPermission !== 'denied' && (
                  <button
                    onClick={requestLocation}
                    disabled={isGettingLocation}
                    className="w-full px-4 sm:px-6 py-3 sm:py-4 text-left hover:bg-primary/5 flex items-center space-x-3 sm:space-x-4 border-b border-primary/10 disabled:opacity-50 transition-all duration-300"
                  >
                    <div className="w-8 sm:w-10 h-8 sm:h-10 bg-gradient-to-br from-primary to-secondary rounded-lg sm:rounded-xl flex items-center justify-center">
                      {isGettingLocation ? (
                        <FaSpinner className="animate-spin text-neutral-white text-sm sm:text-lg" />
                      ) : (
                        <FaLocationArrow className="text-neutral-white text-sm sm:text-lg" />
                      )}
                    </div>
                    <div>
                      <div className="font-semibold text-secondary text-base sm:text-lg">
                        {isGettingLocation ? 'Getting location...' : 'Use current location'}
                      </div>
                      <div className="text-neutral/70 text-sm sm:text-base">Properties near me</div>
                    </div>
                  </button>
                )}

                {/* Recent Searches */}
                {recentSearches.length > 0 && !city.trim() && (
                  <>
                    <div className="px-4 sm:px-6 py-2 sm:py-3 text-xs sm:text-sm font-bold text-neutral uppercase bg-primary/5 tracking-wide">
                      Recent searches
                    </div>
                    {recentSearches.map((recentCity, index) => (
                      <button
                        key={`recent-${index}`}
                        onClick={() => handleCitySelect(recentCity)}
                        className="w-full px-4 sm:px-6 py-3 sm:py-4 text-left hover:bg-primary/5 flex items-center space-x-3 sm:space-x-4 transition-all duration-300"
                      >
                        <div className="w-8 sm:w-10 h-8 sm:h-10 bg-neutral-light rounded-lg sm:rounded-xl flex items-center justify-center">
                          <FaHistory className="text-secondary text-sm sm:text-lg" />
                        </div>
                        <div>
                          <div className="font-semibold text-neutral text-base sm:text-lg">{recentCity}</div>
                        </div>
                      </button>
                    ))}
                  </>
                )}

                {/* Locality Suggestions - Show first when typing */}
                {city.trim() && filteredCities.length > 0 && (
                  <>
                    <div className="px-4 sm:px-6 py-2 sm:py-3 text-xs sm:text-sm font-bold text-neutral uppercase bg-primary/5 tracking-wide">
                      Cities
                    </div>
                    {filteredCities.slice(0, 5).map((cityName, index) => (
                      <button
                        key={`filtered-${index}`}
                        onClick={() => handleCitySelect(cityName)}
                        className="w-full px-4 sm:px-6 py-3 sm:py-4 text-left hover:bg-primary/5 flex items-center space-x-3 sm:space-x-4 transition-all duration-300"
                      >
                        <div className="w-8 sm:w-10 h-8 sm:h-10 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-lg sm:rounded-xl flex items-center justify-center">
                          <FaMapMarkerAlt className="text-secondary text-sm sm:text-lg" />
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-neutral text-base sm:text-lg">{cityName}</div>
                        </div>
                        <div className="text-xs sm:text-sm text-neutral/70 bg-primary/10 px-2 sm:px-3 py-1 rounded-lg font-medium">
                          City
                        </div>
                      </button>
                    ))}
                  </>
                )}

                {/* Properties from Database - Show only for complete city names */}
                {city.trim() && properties.length > 0 && (
                  <>
                    <div className="px-4 sm:px-6 py-2 sm:py-3 text-xs sm:text-sm font-bold text-neutral uppercase bg-primary/5 tracking-wide flex items-center justify-between">
                      <span>Properties in {city}</span>
                      {isLoadingProperties && <FaSpinner className="animate-spin text-base sm:text-lg" />}
                    </div>
                    {properties.map((property) => (
                      <button
                        key={property.id}
                        onClick={() => handlePropertySelect(property)}
                        className="w-full px-4 sm:px-6 py-3 sm:py-4 text-left hover:bg-primary/5 flex items-center space-x-3 sm:space-x-4 border-b border-primary/5 last:border-b-0 transition-all duration-300"
                      >
                        <div className="w-8 sm:w-10 h-8 sm:h-10 bg-gradient-to-br from-secondary to-primary rounded-lg sm:rounded-xl flex items-center justify-center">
                          <FaBuilding className="text-neutral-white text-sm sm:text-lg" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-neutral text-base sm:text-lg truncate">{property.name}</div>
                          <div className="text-neutral/70 text-sm sm:text-base mb-1">
                            <span className="truncate">{property.address}</span>
                          </div>
                          <div className="text-neutral/70 flex items-center space-x-2 text-sm sm:text-base">
                            <span>{property.area || property.city}</span>
                            <span className="text-primary/50">•</span>
                            <span className="font-bold text-secondary">₹{property.price?.toLocaleString()}/month</span>
                          </div>
                        </div>
                        <div className="text-xs sm:text-sm text-neutral/70 bg-secondary/10 px-2 sm:px-3 py-1 rounded-lg font-medium">
                          Property
                        </div>
                      </button>
                    ))}
                  </>
                )}

                {/* Popular Cities */}
                {!city.trim() && (
                  <>
                    <div className="px-4 sm:px-6 py-2 sm:py-3 text-xs sm:text-sm font-bold text-neutral uppercase bg-primary/5 tracking-wide">
                      Popular cities
                    </div>
                    {popularCities.slice(0, 10).map((cityName, index) => (
                      <button
                        key={`popular-${index}`}
                        onClick={() => handleCitySelect(cityName)}
                        className="w-full px-4 sm:px-6 py-3 sm:py-4 text-left hover:bg-primary/5 flex items-center space-x-3 sm:space-x-4 transition-all duration-300"
                      >
                        <div className="w-8 sm:w-10 h-8 sm:h-10 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-lg sm:rounded-xl flex items-center justify-center">
                          <FaMapMarkerAlt className="text-secondary text-sm sm:text-lg" />
                        </div>
                        <div>
                          <div className="font-semibold text-neutral text-base sm:text-lg">{cityName}</div>
                        </div>
                      </button>
                    ))}
                  </>
                )}

                {/* No Results */}
                {city.trim() && !isLoadingProperties && properties.length === 0 && filteredCities.length === 0 && (
                  <div className="px-4 sm:px-6 py-6 sm:py-8 text-center text-neutral/70">
                    <div className="text-base sm:text-lg font-medium">No cities or properties found matching "{city}"</div>
                    <div className="text-sm mt-2">Try searching for a popular city name</div>
                  </div>
                )}

                {/* Loading State */}
                {city.trim() && isLoadingProperties && (
                  <div className="px-4 sm:px-6 py-6 sm:py-8 text-center text-neutral/70">
                    <FaSpinner className="animate-spin mx-auto mb-3 text-xl sm:text-2xl text-secondary" />
                    <div className="text-base sm:text-lg font-medium">Searching for properties in {city}...</div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <button
          onClick={handleSearch}
          className="saas-button-primary w-full py-3 sm:py-4 rounded-xl font-bold text-base sm:text-lg transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl"
        >
          <FaSearch />
          <span>Search Properties</span>
        </button>
      </div>
    </div>
  );
}