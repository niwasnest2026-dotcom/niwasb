'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { FaMapMarkerAlt, FaTh, FaList, FaTimes, FaSort, FaFilter, FaCalendarAlt } from 'react-icons/fa';
import PropertyCard from '@/components/PropertyCard';
import { supabase } from '@/lib/supabase';
import type { PropertyWithDetails } from '@/types/database';

export default function ListingsContent() {
  const searchParams = useSearchParams();
  const [properties, setProperties] = useState<PropertyWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('recommended');
  const [showFilters, setShowFilters] = useState(false);

  const city = searchParams.get('city') || '';
  const area = searchParams.get('area') || '';
  const duration = searchParams.get('duration') || '';
  const checkIn = searchParams.get('checkIn') || '';
  const checkOut = searchParams.get('checkOut') || '';
  
  const locationDisplay = city && area ? `${area}, ${city}` : city || area || 'All Locations';

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
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

      const cityParam = searchParams.get('city');
      if (cityParam) {
        query = query.eq('city', cityParam);
      }

      const areaParam = searchParams.get('area');
      if (areaParam) {
        query = query.ilike('area', `%${areaParam}%`);
      }

      if (sortBy === 'price_low') {
        query = query.order('price', { ascending: true });
      } else if (sortBy === 'price_high') {
        query = query.order('price', { ascending: false });
      } else if (sortBy === 'rating') {
        query = query.order('rating', { ascending: false });
      } else {
        query = query.order('created_at', { ascending: false });
      }

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
  }, [searchParams, sortBy]);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 pb-24 md:pb-6">
      {/* Search Summary */}
      <div className="flex items-start md:items-center justify-between mb-6 gap-4 flex-col md:flex-row">
        <div className="flex items-center flex-wrap gap-2">
          <FaMapMarkerAlt className="flex-shrink-0" style={{ color: '#2B7A78' }} />
          <span className="text-base md:text-lg font-semibold" style={{ color: '#17252A' }}>{locationDisplay}</span>
          
          {/* Search Filters Display */}
          <div className="flex items-center flex-wrap gap-2 ml-2">
            {city && (
              <button
                onClick={() => {
                  const params = new URLSearchParams(searchParams.toString());
                  params.delete('city');
                  window.location.href = `/listings?${params.toString()}`;
                }}
                className="text-white px-3 py-1 rounded-full text-xs md:text-sm flex items-center space-x-1 transition-colors"
                style={{ backgroundColor: '#3AAFA9' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2B7A78'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#3AAFA9'}
              >
                <span>{city}</span>
                <FaTimes className="text-xs" />
              </button>
            )}
            {area && (
              <button
                onClick={() => {
                  const params = new URLSearchParams(searchParams.toString());
                  params.delete('area');
                  window.location.href = `/listings?${params.toString()}`;
                }}
                className="text-white px-3 py-1 rounded-full text-xs md:text-sm flex items-center space-x-1 transition-colors"
                style={{ backgroundColor: '#2B7A78' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#17252A'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#2B7A78'}
              >
                <span>{area}</span>
                <FaTimes className="text-xs" />
              </button>
            )}
            {duration && (
              <div className="px-3 py-1 rounded-full text-xs md:text-sm font-medium" style={{ backgroundColor: 'rgba(58, 175, 169, 0.1)', color: '#2B7A78' }}>
                {duration} month{parseInt(duration) > 1 ? 's' : ''}
              </div>
            )}
          </div>
        </div>

        {/* Date Range Display */}
        {checkIn && checkOut && (
          <div className="flex items-center space-x-2 px-4 py-2 rounded-lg" style={{ backgroundColor: 'rgba(222, 242, 241, 0.5)' }}>
            <FaCalendarAlt style={{ color: '#2B7A78' }} />
            <span className="text-sm font-medium" style={{ color: '#17252A' }}>
              {formatDate(checkIn)} - {formatDate(checkOut)}
            </span>
          </div>
        )}

        <div className="hidden md:flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm" style={{ color: 'rgba(23, 37, 42, 0.7)' }}>SORT BY:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="rounded-lg px-3 py-2 text-sm focus:outline-none"
              style={{ 
                border: '1px solid rgba(43, 122, 120, 0.3)',
                backgroundColor: '#FEFFFF',
                color: '#17252A'
              }}
              onFocus={(e) => e.currentTarget.style.borderColor = '#3AAFA9'}
              onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(43, 122, 120, 0.3)'}
            >
              <option value="recommended">Recommended</option>
              <option value="price_low">Price: Low to High</option>
              <option value="price_high">Price: High to Low</option>
              <option value="rating">Rating</option>
            </select>
          </div>

          <div className="flex items-center space-x-2 rounded-lg p-1" style={{ border: '1px solid rgba(43, 122, 120, 0.3)' }}>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded transition-colors ${
                viewMode === 'list' 
                  ? 'text-white' 
                  : 'hover:bg-neutral-100'
              }`}
              style={viewMode === 'list' ? { backgroundColor: '#3AAFA9' } : { color: '#17252A' }}
            >
              <FaList />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded transition-colors ${
                viewMode === 'grid' 
                  ? 'text-white' 
                  : 'hover:bg-neutral-100'
              }`}
              style={viewMode === 'grid' ? { backgroundColor: '#3AAFA9' } : { color: '#17252A' }}
            >
              <FaTh />
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: '#3AAFA9' }}></div>
        </div>
      ) : properties.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-xl" style={{ color: 'rgba(23, 37, 42, 0.7)' }}>No properties found</p>
          <p className="mt-2" style={{ color: 'rgba(23, 37, 42, 0.5)' }}>Try adjusting your search criteria</p>
        </div>
      ) : (
        <div
          className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
              : 'space-y-6'
          }
        >
          {properties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      )}

      <div className="fixed bottom-0 left-0 right-0 p-4 md:hidden" style={{ 
        backgroundColor: '#FEFFFF', 
        borderTop: '1px solid rgba(43, 122, 120, 0.2)' 
      }}>
        <div className="flex space-x-4 max-w-7xl mx-auto">
          <button
            onClick={() => setShowFilters(true)}
            className="flex-1 py-3 rounded-xl font-semibold flex items-center justify-center space-x-2"
            style={{ 
              backgroundColor: '#FEFFFF', 
              border: '2px solid #3AAFA9', 
              color: '#3AAFA9' 
            }}
          >
            <FaFilter />
            <span>Filters</span>
          </button>
          <button
            onClick={() => {}}
            className="flex-1 text-white py-3 rounded-xl font-semibold flex items-center justify-center space-x-2"
            style={{ backgroundColor: '#3AAFA9' }}
          >
            <FaSort />
            <span>Sort</span>
          </button>
        </div>
      </div>
    </div>
  );
}
