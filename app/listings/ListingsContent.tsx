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
  const [error, setError] = useState<string | null>(null);

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
      setError(null);

      console.log('🔍 Starting property fetch...');
      console.log('Search params:', { location, gender, city, area });

      // Start with basic query - ensure only available properties
      let query = supabase
        .from('properties')
        .select(`
          id,
          name,
          price,
          area,
          city,
          address,
          featured_image,
          property_type,
          gender_preference,
          rating,
          created_at,
          is_available,
          description,
          security_deposit,
          verified,
          instant_book,
          secure_booking
        `)
        .eq('is_available', true);

      // Handle location search with simplified logic
      const locationParam = searchParams.get('location');
      if (locationParam && locationParam.trim()) {
        const searchTerm = locationParam.trim();
        console.log('🔍 Searching by location:', searchTerm);
        // Use simpler OR condition that's more reliable
        query = query.or(`area.ilike.%${searchTerm}%,city.ilike.%${searchTerm}%,name.ilike.%${searchTerm}%,address.ilike.%${searchTerm}%`);
      }
      
      // Handle legacy parameters for backward compatibility
      const cityParam = searchParams.get('city');
      if (cityParam && cityParam.trim() && !locationParam) {
        console.log('🔍 Searching by city:', cityParam);
        query = query.or(`city.ilike.%${cityParam}%,area.ilike.%${cityParam}%`);
      }

      const areaParam = searchParams.get('area');
      if (areaParam && areaParam.trim() && !locationParam) {
        console.log('🔍 Searching by area:', areaParam);
        query = query.ilike('area', `%${areaParam}%`);
      }

      // Handle gender preference with simpler logic
      const genderParam = searchParams.get('gender');
      if (genderParam && genderParam !== 'any') {
        console.log('🔍 Filtering by gender:', genderParam);
        query = query.or(`gender_preference.eq.${genderParam},gender_preference.eq.any`);
      }

      // Order by created_at (newest first)
      query = query.order('created_at', { ascending: false });

      console.log('📡 Executing database query...');
      const { data, error } = await query;

      if (error) {
        console.error('❌ Database query error:', error);
        throw error;
      }

      console.log('✅ Properties fetched:', data?.length || 0);

      // Format properties with minimal data structure
      const formattedProperties = data?.map((property: any) => ({
        ...property,
        amenities: [], // Load amenities separately if needed
        images: [], // Load images separately if needed
      })) || [];

      setProperties(formattedProperties);

      // If no properties found, try a fallback query without filters
      if (formattedProperties.length === 0 && (locationParam || cityParam || areaParam || genderParam)) {
        console.log('🔄 No properties found with filters, trying fallback...');
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('properties')
          .select(`
            id,
            name,
            price,
            area,
            city,
            address,
            featured_image,
            property_type,
            gender_preference,
            rating,
            created_at,
            is_available,
            description,
            security_deposit,
            verified,
            instant_book,
            secure_booking
          `)
          .eq('is_available', true)
          .order('created_at', { ascending: false });

        if (!fallbackError && fallbackData) {
          console.log('✅ Fallback properties found:', fallbackData.length);
          const fallbackFormatted = fallbackData.map((property: any) => ({
            ...property,
            amenities: [],
            images: [],
          }));
          setProperties(fallbackFormatted);
        }
      }

    } catch (error: any) {
      console.error('❌ Error fetching properties:', error);
      setError(error.message || 'Failed to load properties');
      
      // Final fallback - try to get any available properties
      try {
        console.log('🆘 Attempting emergency fallback query...');
        const { data: emergencyData, error: emergencyError } = await supabase
          .from('properties')
          .select('*')
          .eq('is_available', true)
          .limit(10);

        if (!emergencyError && emergencyData) {
          console.log('🆘 Emergency fallback found:', emergencyData.length, 'properties');
          const emergencyFormatted = emergencyData.map((property: any) => ({
            ...property,
            amenities: [],
            images: [],
          }));
          setProperties(emergencyFormatted);
          setError(null); // Clear error if emergency fallback works
        }
      } catch (emergencyErr) {
        console.error('💥 Emergency fallback also failed:', emergencyErr);
      }
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

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <div className="text-red-600 mr-3">⚠️</div>
            <div>
              <h3 className="text-red-800 font-semibold">Error Loading Properties</h3>
              <p className="text-red-700 text-sm mt-1">{error}</p>
              <button
                onClick={() => {
                  setError(null);
                  fetchProperties();
                }}
                className="mt-2 text-red-600 hover:text-red-800 text-sm underline"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Results Count */}
      {!loading && !error && (
        <div className="mb-4">
          <p className="text-gray-600">
            {properties.length === 0 ? 'No properties found' : `${properties.length} ${properties.length === 1 ? 'property' : 'properties'} found`}
          </p>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading properties...</p>
          </div>
        </div>
      ) : properties.length === 0 && !error ? (
        <div className="text-center py-20">
          <div className="max-w-md mx-auto">
            <FaMapMarkerAlt className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No properties found</h3>
            <p className="text-gray-600 mb-6">
              We couldn't find any properties matching your search criteria. Try adjusting your filters or search in a different area.
            </p>
            <div className="space-y-3">
              <button
                onClick={() => window.location.href = '/listings'}
                className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors block w-full"
              >
                View All Properties
              </button>
              <button
                onClick={() => window.location.href = '/admin/setup'}
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors block w-full"
              >
                Add Sample Properties (Admin)
              </button>
            </div>
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