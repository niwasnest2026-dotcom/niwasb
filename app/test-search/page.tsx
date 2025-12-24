'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function TestSearchPage() {
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('id, name, city, area, price, property_type')
        .limit(10);

      if (error) {
        console.error('Error:', error);
      } else {
        setProperties(data || []);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8">Loading properties...</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Test Search - Properties in Database</h1>
      <p className="mb-4">Found {properties.length} properties:</p>
      
      {properties.length === 0 ? (
        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded">
          <p>No properties found in database. You may need to add some sample properties first.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {properties.map((property) => (
            <div key={property.id} className="border p-4 rounded">
              <h3 className="font-semibold">{property.name}</h3>
              <p className="text-gray-600">
                {property.area || property.city} • ₹{property.price?.toLocaleString()}/month
              </p>
              <p className="text-sm text-gray-500">Type: {property.property_type}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}