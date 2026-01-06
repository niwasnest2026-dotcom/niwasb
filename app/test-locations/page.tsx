'use client';

import { useState, useEffect } from 'react';

export default function TestLocationsPage() {
  const [locations, setLocations] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await fetch('/api/get-locations');
        const data = await response.json();
        setLocations(data);
      } catch (error) {
        console.error('Error fetching locations:', error);
        setLocations({ success: false, error: 'Failed to fetch locations' });
      } finally {
        setLoading(false);
      }
    };

    fetchLocations();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Dynamic Locations Test</h1>
        
        {locations?.success ? (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Location Statistics</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="text-2xl font-bold text-green-600">{locations.dynamic_count}</div>
                  <div className="text-sm text-green-700">Dynamic Locations</div>
                  <div className="text-xs text-green-600">From your properties</div>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="text-2xl font-bold text-blue-600">{locations.static_count}</div>
                  <div className="text-sm text-blue-700">Static Locations</div>
                  <div className="text-xs text-blue-600">Popular fallbacks</div>
                </div>
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <div className="text-2xl font-bold text-orange-600">{locations.total_count}</div>
                  <div className="text-sm text-orange-700">Total Locations</div>
                  <div className="text-xs text-orange-600">Available for search</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">All Available Locations</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 max-h-96 overflow-y-auto">
                {locations.locations.map((location: string, index: number) => (
                  <div
                    key={index}
                    className={`p-2 rounded-md text-sm ${
                      index < locations.dynamic_count
                        ? 'bg-green-100 text-green-800 border border-green-200'
                        : 'bg-gray-100 text-gray-700 border border-gray-200'
                    }`}
                  >
                    {location}
                    {index < locations.dynamic_count && (
                      <span className="ml-2 text-xs bg-green-200 text-green-700 px-1 rounded">
                        Dynamic
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-yellow-800 mb-2">How it works:</h3>
              <ul className="list-disc list-inside text-yellow-700 space-y-1 text-sm">
                <li><strong>Dynamic Locations</strong> are automatically extracted from properties you add</li>
                <li>When you add a property with city/area, those locations become searchable</li>
                <li><strong>Static Locations</strong> are popular fallback locations for major cities</li>
                <li>The search form now shows locations from your actual properties first</li>
                <li>Users can search for the exact locations where you have properties</li>
              </ul>
            </div>

            <div className="flex gap-4">
              <a
                href="/"
                className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-md font-medium"
              >
                Test Search Form
              </a>
              <a
                href="/admin/properties/add"
                className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-md font-medium"
              >
                Add Property
              </a>
              <a
                href="/listings"
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-md font-medium"
              >
                View Listings
              </a>
            </div>
          </div>
        ) : (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-red-800 mb-2">Error</h2>
            <p className="text-red-700">{locations?.error || 'Unknown error occurred'}</p>
          </div>
        )}
      </div>
    </div>
  );
}