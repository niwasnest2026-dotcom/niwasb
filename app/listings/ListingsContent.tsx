'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { FaMapMarkerAlt, FaTimes, FaCalendarAlt, FaUser, FaUsers } from 'react-icons/fa';
import PropertyCard from '@/components/PropertyCard';
import { supabase } from '@/lib/supabase';
import type { PropertyWithDetails } from '@/types/database';

export default function ListingsContent() {
  const searchParams = useSearchParams();
  const [properties, setProperties] = useState<PropertyWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  // New search parameters from redesigned SearchForm
  const location = searchParams.get('location') || '';
  const gender = searchParams.get('gender') || '';
  const moveIn = searchParams.get('moveIn') || '';
  
  // Legacy parameters for backward compatibility
  const city = searchParams.get('city') || '';
  const area = searchParams.get('area') || '';
  const duration = searchParams.get('duration') || '';
  const checkIn = searchParams.get('checkIn') || '';
  const checkOut = searchParams.get('checkOut') || '';
  
  const locationDisplay = location || (city && area ? `${area}, ${city}` : city || area || 'All Locations');

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getGenderIcon = (genderValue: string) => {
    switch (genderValue) {
      case 'boys': return FaUser;
      case 'girls': return FaUser;
      default: return FaUsers;
    }
  };

  const getGenderLabel = (genderValue: string) => {
    switch (genderValue) {
      case 'boys': return 'Boys Only';
      case 'girls': return 'Girls Only';
      default: return 'Any Gender';
    }
  };

  const fetchProperties = useCallback(async () => {
    try {
      setLoading(true);

      let query = supabase
        .from('properties')
        .select(`
          *,
          amenities:property_amenities(
            amenity:amenities(*)
          ),
          images:property_images(*)
        `);

      // Handle new location parameter (primary search)
      const locationParam = searchParams.get('location');
      if (locationParam && locationParam.trim()) {
        // Extract city from location string (e.g., "Koramangala, Bangalore" -> "Bangalore")
        const locationParts = locationParam.split(',').map(part => part.trim());
        const searchArea = locationParts[0]; // First part (area/college/office)
        const searchCity = locationParts.length > 1 ? locationParts[locationParts.length - 1] : ''; // Last part (city)
        
        // Search across multiple fields with OR condition
        const searchTerms = [];
        if (searchArea) {
          searchTerms.push(`area.ilike.%${searchArea}%`);
          searchTerms.push(`name.ilike.%${searchArea}%`);
          searchTerms.push(`address.ilike.%${searchArea}%`);
        }
        if (searchCity) {
          searchTerms.push(`city.ilike.%${searchCity}%`);
        }
        
        if (searchTerms.length > 0) {
          query = query.or(searchTerms.join(','));
        }
      }
      // Handle legacy city parameter for backward compatibility
      else {
        const cityParam = searchParams.get('city');
        if (cityParam && cityParam.trim()) {
          const searchTerm = cityParam.trim().replace(/[%_]/g, '\\$&');
          query = query.or(`city.ilike.%${searchTerm}%,area.ilike.%${searchTerm}%,name.ilike.%${searchTerm}%`);
        }

        const areaParam = searchParams.get('area');
        if (areaParam) {
          query = query.ilike('area', `%${areaParam}%`);
        }
      }

      // Handle gender preference
      const genderParam = searchParams.get('gender');
      if (genderParam && genderParam !== 'any') {
        query = query.or(`gender_preference.eq.${genderParam},gender_preference.eq.any`);
      }

      // Ensure only available properties are shown
      query = query.eq('is_available', true);

      // Default sorting by created_at (newest first)
      query = query.order('created_at', { ascending: false });

      const { data, error } = await query;

      if (error) throw error;

      const formattedProperties = data?.map((property: any) => ({
        ...property,
        amenities: property.amenities?.map((pa: any) => pa.amenity).filter(Boolean) || [],
        images: property.images || [],
      })) || [];

      setProperties(formattedProperties);
    } catch (error) {
      console.error('Error fetching properties:', error);
    } finally {
      setLoading(false);
    }
  }, [searchParams]);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  const clearFilter = (paramName: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete(paramName);
    window.location.href = `/listings?${params.toString()}`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Search Summary */}
      <div className="flex items-start md:items-center justify-between mb-6 gap-4 flex-col md:flex-row">
        <div className="flex items-center flex-wrap gap-2">
          <FaMapMarkerAlt className="flex-shrink-0 text-orange-500" />
          <span className="text-base md:text-lg font-semibold text-gray-900">{locationDisplay}</span>
          
          {/* Search Filters Display */}
          <div className="flex items-center flex-wrap gap-2 ml-2">
            {/* New Location Filter */}
            {location && (
              <button
                onClick={() => clearFilter('location')}
                className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 rounded-full text-xs md:text-sm flex items-center space-x-1 transition-colors"
              >
                <span>{location}</span>
                <FaTimes className="text-xs" />
              </button>
            )}
            
            {/* Gender Filter */}
            {gender && gender !== 'any' && (
              <button
                onClick={() => clearFilter('gender')}
                className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-full text-xs md:text-sm flex items-center space-x-1 transition-colors"
              >
                <span>{getGenderLabel(gender)}</span>
                <FaTimes className="text-xs" />
              </button>
            )}

            {/* Legacy Filters for Backward Compatibility */}
            {city && !location && (
              <button
                onClick={() => clearFilter('city')}
                className="bg-teal-500 hover:bg-teal-600 text-white px-3 py-1 rounded-full text-xs md:text-sm flex items-center space-x-1 transition-colors"
              >
                <span>{city}</span>
                <FaTimes className="text-xs" />
              </button>
            )}
            {area && !location && (
              <button
                onClick={() => clearFilter('area')}
                className="bg-teal-600 hover:bg-teal-700 text-white px-3 py-1 rounded-full text-xs md:text-sm flex items-center space-x-1 transition-colors"
              >
                <span>{area}</span>
                <FaTimes className="text-xs" />
              </button>
            )}
            {duration && (
              <div className="bg-teal-100 text-teal-800 px-3 py-1 rounded-full text-xs md:text-sm font-medium">
                {duration} month{parseInt(duration) > 1 ? 's' : ''}
              </div>
            )}
          </div>
        </div>

        {/* Date Range Display */}
        {(moveIn || (checkIn && checkOut)) && (
          <div className="flex items-center space-x-2 px-4 py-2 bg-orange-50 rounded-lg">
            <FaCalendarAlt className="text-orange-600" />
            <span className="text-sm font-medium text-orange-800">
              {moveIn ? `Moving in: ${formatDate(moveIn)}` : `${formatDate(checkIn)} - ${formatDate(checkOut)}`}
            </span>
          </div>
        )}
      </div>

      {/* Results Count */}
      {!loading && (
        <div className="mb-4">
          <p className="text-gray-600">
            {properties.length === 0 ? 'No properties found' : `${properties.length} ${properties.length === 1 ? 'property' : 'properties'} found`}
          </p>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        </div>
      ) : properties.length === 0 ? (
        <div className="text-center py-20">
          <div className="max-w-md mx-auto">
            <FaMapMarkerAlt className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No properties found</h3>
            <p className="text-gray-600 mb-6">
              We couldn't find any properties matching your search criteria. Try adjusting your filters or search in a different area.
            </p>
            <button
              onClick={() => window.location.href = '/listings'}
              className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              View All Properties
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      )}
    </div>
  );
}