'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { FaMapMarkerAlt, FaTh, FaList, FaTimes, FaSort, FaFilter } from 'react-icons/fa';
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
  const locationDisplay = city && area ? `${area}, ${city}` : city || area || 'All Locations';

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
      <div className="flex items-start md:items-center justify-between mb-6 gap-4 flex-col md:flex-row">
        <div className="flex items-center flex-wrap gap-2">
          <FaMapMarkerAlt className="text-accent flex-shrink-0" />
          <span className="text-base md:text-lg font-semibold text-neutral-900">{locationDisplay}</span>
          {city && (
            <button
              onClick={() => {
                const params = new URLSearchParams(searchParams.toString());
                params.delete('city');
                window.location.href = `/listings?${params.toString()}`;
              }}
              className="bg-primary text-white px-3 py-1 rounded-full text-xs md:text-sm flex items-center space-x-1 hover:bg-primary-dark transition-colors"
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
              className="bg-accent text-white px-3 py-1 rounded-full text-xs md:text-sm flex items-center space-x-1 hover:bg-accent-dark transition-colors"
            >
              <span>{area}</span>
              <FaTimes className="text-xs" />
            </button>
          )}
        </div>

        <div className="hidden md:flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-neutral-600">SORT BY:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent"
            >
              <option value="recommended">Recommended</option>
              <option value="price_low">Price: Low to High</option>
              <option value="price_high">Price: High to Low</option>
              <option value="rating">Rating</option>
            </select>
          </div>

          <div className="flex items-center space-x-2 border border-neutral-300 rounded-lg p-1">
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded ${
                viewMode === 'list' ? 'bg-neutral-200' : 'hover:bg-neutral-100'
              }`}
            >
              <FaList />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded ${
                viewMode === 'grid' ? 'bg-neutral-200' : 'hover:bg-neutral-100'
              }`}
            >
              <FaTh />
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
        </div>
      ) : properties.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-xl text-neutral-600">No properties found</p>
          <p className="text-neutral-500 mt-2">Try adjusting your search criteria</p>
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

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200 p-4 md:hidden">
        <div className="flex space-x-4 max-w-7xl mx-auto">
          <button
            onClick={() => setShowFilters(true)}
            className="flex-1 bg-white border-2 border-primary text-primary py-3 rounded-xl font-semibold flex items-center justify-center space-x-2"
          >
            <FaFilter />
            <span>Filters</span>
          </button>
          <button
            onClick={() => {}}
            className="flex-1 bg-primary text-white py-3 rounded-xl font-semibold flex items-center justify-center space-x-2"
          >
            <FaSort />
            <span>Sort</span>
          </button>
        </div>
      </div>
    </div>
  );
}
