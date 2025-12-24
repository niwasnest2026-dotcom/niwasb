'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function PropertyTestPage({ params }: { params: { id: string } }) {
  const [property, setProperty] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProperty() {
      try {
        const { data, error } = await supabase
          .from('properties')
          .select('*')
          .eq('id', params.id)
          .single();

        if (error) throw error;
        setProperty(data);
      } catch (err: any) {
        setError(err.message);
        console.error('Error fetching property:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchProperty();
  }, [params.id]);

  if (loading) {
    return <div className="p-8">Loading property...</div>;
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 p-4 rounded">
          <h2 className="text-red-800 font-semibold">Error loading property</h2>
          <p className="text-red-600">{error}</p>
        </div>
        <button
          onClick={() => window.location.href = '/'}
          className="mt-4 px-4 py-2 bg-primary text-white rounded"
        >
          Go Home
        </button>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold">Property not found</h1>
        <button
          onClick={() => window.location.href = '/'}
          className="mt-4 px-4 py-2 bg-primary text-white rounded"
        >
          Go Home
        </button>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">{property.name}</h1>
      <p className="text-gray-600 mb-2">{property.city}</p>
      <p className="text-2xl font-semibold text-primary">₹{property.price?.toLocaleString()}/month</p>
      
      {property.description && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-2">Description</h2>
          <p className="text-gray-700">{property.description}</p>
        </div>
      )}

      <button
        onClick={() => window.location.href = '/'}
        className="mt-6 px-6 py-3 bg-primary text-white rounded-lg"
      >
        Back to Home
      </button>
    </div>
  );
}