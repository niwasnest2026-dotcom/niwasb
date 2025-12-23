'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaMapMarkerAlt, FaClock, FaCalendar, FaUsers, FaSearch, FaChevronDown, FaBuilding, FaLocationArrow, FaSpinner } from 'react-icons/fa';

const cities = ['Bangalore', 'Mumbai', 'Delhi', 'Pune', 'Hyderabad', 'Chennai'];
const durations = ['1 Month', '3 Months', '6 Months', '12 Months'];
const guestOptions = ['1 Guest', '2 Guests', '3 Guests', '4+ Guests'];

export default function SearchForm() {
  const router = useRouter();
  const [city, setCity] = useState('');
  const [area, setArea] = useState('');
  const [duration, setDuration] = useState('1 Month');
  const [moveIn, setMoveIn] = useState('');
  const [guests, setGuests] = useState('1 Guest');
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [locationPermission, setLocationPermission] = useState<'granted' | 'denied' | 'prompt' | null>(null);
  const [isLocationDetected, setIsLocationDetected] = useState(false);

  useEffect(() => {
    // Check if geolocation is supported and get permission status
    if ('geolocation' in navigator && 'permissions' in navigator) {
      navigator.permissions.query({ name: 'geolocation' }).then((result) => {
        setLocationPermission(result.state as 'granted' | 'denied' | 'prompt');
        
        // If permission is already granted, get location automatically
        if (result.state === 'granted') {
          getCurrentLocation();
        }
      });
    }
  }, []);

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
          // Extract city and area information
          const detectedCity = address.city || address.town || address.village || address.county || address.state_district;
          const detectedArea = address.suburb || address.neighbourhood || address.residential || address.hamlet || address.road;
          
          if (detectedCity) {
            setCity(detectedCity);
            setIsLocationDetected(true);
          }
          if (detectedArea) {
            setArea(detectedArea);
            setIsLocationDetected(true);
          }
        }
      }
    } catch (error) {
      console.error('Error getting location:', error);
      // You might want to show a user-friendly error message here
    } finally {
      setIsGettingLocation(false);
    }
  };

  const requestLocation = () => {
    if (locationPermission === 'denied') {
      alert('Location access is denied. Please enable location permissions in your browser settings to auto-detect your area.');
      return;
    }
    getCurrentLocation();
  };

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (city) params.set('city', city);
    if (area) params.set('area', area);
    if (duration) params.set('duration', duration);
    if (moveIn) params.set('moveIn', moveIn);
    if (guests) params.set('guests', guests);

    router.push(`/listings?${params.toString()}`);
  };

  return (
    <div className="glass-card rounded-3xl shadow-glass-lg p-4 sm:p-6 max-w-2xl mx-auto">
      <div className="space-y-3 sm:space-y-4">
        <div className="relative">
          <label className="block text-xs sm:text-sm font-medium text-neutral-600 mb-1.5 sm:mb-2 uppercase flex items-center justify-between">
            CITY
            {locationPermission !== 'denied' && (
              <button
                onClick={requestLocation}
                disabled={isGettingLocation}
                className="flex items-center space-x-1 text-xs text-rose-500 hover:text-rose-600 disabled:opacity-50"
              >
                {isGettingLocation ? (
                  <FaSpinner className="animate-spin" />
                ) : (
                  <FaLocationArrow />
                )}
                <span>{isGettingLocation ? 'Getting...' : 'Use my location'}</span>
              </button>
            )}
          </label>
          <div className="relative">
            <FaMapMarkerAlt className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-neutral-400 text-sm" />
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Enter city or use location"
              className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-2.5 sm:py-3 border-b border-neutral-200 focus:border-accent outline-none text-neutral-900 bg-transparent placeholder-neutral-400 text-sm sm:text-base"
            />
          </div>
        </div>

        <div className="relative">
          <label className="block text-xs sm:text-sm font-medium text-neutral-600 mb-1.5 sm:mb-2 uppercase">
            AREA
            {isLocationDetected && area && (
              <span className="text-green-600 text-xs ml-2">(Auto-detected)</span>
            )}
          </label>
          <div className="relative">
            <FaBuilding className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-neutral-400 text-sm" />
            <input
              type="text"
              value={area}
              onChange={(e) => setArea(e.target.value)}
              placeholder={isGettingLocation ? "Detecting area..." : "Enter area or neighborhood"}
              className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-2.5 sm:py-3 border-b border-neutral-200 focus:border-accent outline-none text-neutral-900 bg-transparent placeholder-neutral-400 text-sm sm:text-base"
            />
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
              value="Auto-calculated"
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
