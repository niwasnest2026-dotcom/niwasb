'use client';

import { useEffect, useState } from 'react';
import PropertyCard from './PropertyCard';
import { supabase } from '@/lib/supabase';
import type { PropertyWithDetails } from '@/types/database';

export default function FeaturedProperties() {
  const [properties, setProperties] = useState<PropertyWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProperties() {
      try {
        setLoading(true);

        // Fetch properties with related amenities and images
        const { data, error } = await supabase
          .from('properties')
          .select(`
            *,
            amenities:property_amenities(
              amenity:amenities(*)
            ),
            images:property_images(*)
          `)
          .order('created_at', { ascending: false })
          .limit(12);

        if (error) throw error;

        // Flatten the data structure for easier use in the Card
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
    }

    fetchProperties();
  }, []);

  // --- PREMIUM LOADING STATE ---
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32">
        <div className="relative h-16 w-16">
          <div className="absolute inset-0 rounded-full border-4 border-gray-200"></div>
          <div className="absolute inset-0 rounded-full border-4 border-rose-500 border-t-transparent animate-spin"></div>
        </div>
        <p className="mt-4 text-gray-500 font-medium animate-pulse">Finding best stays...</p>
      </div>
    );
  }

  // --- PREMIUM EMPTY STATE ---
  if (properties.length === 0) {
    return (
      <div className="text-center py-20 px-6 rounded-3xl bg-white/30 backdrop-blur-md border border-white/50 shadow-sm mx-auto max-w-2xl">
        <div className="text-5xl mb-4">🏠</div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">No properties found</h3>
        <p className="text-gray-600">We couldn&apos;t find any listings right now. Please check back later.</p>
      </div>
    );
  }

  // --- GRID LAYOUT ---
  return (
    // Increased gap to 'gap-8' so the glass shadows don't overlap
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {properties.map((property) => (
        <PropertyCard key={property.id} property={property} />
      ))}
    </div>
  );
}