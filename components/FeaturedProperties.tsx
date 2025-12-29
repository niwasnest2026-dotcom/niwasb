'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import PropertyCard from './PropertyCard';
import { supabase } from '@/lib/supabase';
import type { PropertyWithDetails } from '@/types/database';

export default function FeaturedProperties() {
  const [properties, setProperties] = useState<PropertyWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProperties = useCallback(async () => {
    try {
      setLoading(true);

      // First, try to get properties with rooms
      const { data, error } = await supabase
        .from('properties')
        .select(`
          id,
          name,
          price,
          area,
          city,
          featured_image,
          property_type,
          gender_preference,
          rating,
          created_at,
          rooms:property_rooms(
            available_beds,
            total_beds
          )
        `)
        .order('created_at', { ascending: false })
        .limit(6);

      if (error) throw error;

      // Format properties - show all properties, filter by availability if rooms exist
      const formattedProperties = data?.map((property: any) => {
        const totalAvailableBeds = property.rooms?.reduce((sum: number, room: any) => 
          sum + (room.available_beds || 0), 0) || 0;
        
        return {
          ...property,
          amenities: [], // Load amenities on demand
          images: [], // Load images on demand
          hasAvailableBeds: totalAvailableBeds > 0 || !property.rooms || property.rooms.length === 0
        };
      }).filter((property: any) => property.hasAvailableBeds) || [];

      setProperties(formattedProperties);
    } catch (error) {
      console.error('Error fetching properties:', error);
      // Fallback: try to get properties without rooms
      try {
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('properties')
          .select(`
            id,
            name,
            price,
            area,
            city,
            featured_image,
            property_type,
            gender_preference,
            rating,
            created_at
          `)
          .order('created_at', { ascending: false })
          .limit(6);

        if (fallbackError) throw fallbackError;

        const fallbackProperties = fallbackData?.map((property: any) => ({
          ...property,
          amenities: [],
          images: [],
          rooms: []
        })) || [];

        setProperties(fallbackProperties);
      } catch (fallbackErr) {
        console.error('Fallback query also failed:', fallbackErr);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  // Memoized loading component
  const LoadingComponent = useMemo(() => (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="relative h-12 w-12">
        <div className="absolute inset-0 rounded-full border-4 border-gray-200"></div>
        <div className="absolute inset-0 rounded-full border-4 border-orange-500 border-t-transparent animate-spin"></div>
      </div>
      <p className="mt-4 text-gray-500 font-medium">Loading properties...</p>
    </div>
  ), []);

  // Memoized empty state component
  const EmptyComponent = useMemo(() => (
    <div className="text-center py-16 px-6 rounded-3xl bg-white/30 backdrop-blur-md border border-white/50 shadow-sm mx-auto max-w-2xl">
      <div className="text-4xl mb-4">🏠</div>
      <h3 className="text-xl font-bold text-gray-800 mb-2">No properties available</h3>
      <p className="text-gray-600">Check back later for new listings.</p>
    </div>
  ), []);

  if (loading) return LoadingComponent;
  if (properties.length === 0) return EmptyComponent;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {properties.map((property) => (
        <PropertyCard key={property.id} property={property} />
      ))}
    </div>
  );
}