'use client';

import { useState, useEffect } from 'react';

export default function TestLocationsTablePage() {
  const [tableStatus, setTableStatus] = useState<any>(null);
  const [searchResults, setSearchResults] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkTableStatus();
  }, []);

  const checkTableStatus = async () => {
    try {
      const response = await fetch('/api/setup-locations-table');
      const data = await response.json();
      setTableStatus(data);
    } catch (error) {
      console.error('Error checking table status:', error);
    }
  };

  const setupTable = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/setup-locations-table', {
        method: 'POST'
      });
      const data = await response.json();
      setTableStatus(data);
      
      if (data.success) {
        alert('Locations table setup completed successfully!');
      } else {
        alert('Setup failed: ' + data.error);
      }
    } catch (error: any) {
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const searchLocations = async () => {
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/search-locations?q=${encodeURIComponent(searchQuery)}&limit=10`);
      const data = await response.json();
      setSearchResults(data);
    } catch (error) {
      console.error('Error searching locations:', error);
    } finally {
      setLoading(false);
    }
  };

  const updatePopularity = async (locationName: string, city: string, action: string) => {
    try {
      await fetch('/api/search-locations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          location_name: locationName,
          city: city,
          action: action
        })
      });
      
      // Refresh search results
      if (searchQuery) {
        searchLocations();
      }
    } catch (error) {
      console.error('Error updating popularity:', error);
    }
  };

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Locations Table System Test</h1>
        
        {/* Table Status */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Table Status</h2>
          
          {tableStatus ? (
            <div className="space-y-4">
              <div className={`p-4 rounded-lg ${tableStatus.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                <div className={`font-semibold ${tableStatus.success ? 'text-green-800' : 'text-red-800'}`}>
                  {tableStatus.success ? '✅ Table Ready' : '❌ Setup Needed'}
                </div>
                <p className={`text-sm mt-1 ${tableStatus.success ? 'text-green-700' : 'text-red-700'}`}>
                  {tableStatus.message || tableStatus.error}
                </p>
              </div>

              {tableStatus.table_exists === false && (
                <div className="space-y-4">
                  <button
                    onClick={setupTable}
                    disabled={loading}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-md font-medium disabled:opacity-50"
                  >
                    {loading ? 'Setting up...' : 'Setup Locations Table'}
                  </button>

                  {tableStatus.sql_needed && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <h3 className="font-semibold text-yellow-800 mb-2">Manual Setup Required:</h3>
                      <p className="text-yellow-700 text-sm mb-3">
                        Run this SQL in your Supabase Dashboard SQL Editor:
                      </p>
                      <div className="bg-gray-100 p-3 rounded-md overflow-auto text-xs">
                        <code>{tableStatus.sql_needed}</code>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {tableStatus.sample_locations && (
                <div className="mt-4">
                  <h3 className="font-semibold mb-2">Sample Locations:</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 max-h-40 overflow-y-auto">
                    {tableStatus.sample_locations.map((location: any, index: number) => (
                      <div key={index} className="bg-gray-100 p-2 rounded text-sm">
                        <div className="font-medium">{location.name}</div>
                        <div className="text-gray-600">{location.city}, {location.state}</div>
                        <div className="text-xs text-gray-500">
                          Popularity: {location.popularity} | Properties: {location.property_count}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          )}
        </div>

        {/* Search Test */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Search Test</h2>
          
          <div className="flex gap-4 mb-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search locations (e.g., Bangalore, Koramangala, etc.)"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              onKeyPress={(e) => e.key === 'Enter' && searchLocations()}
            />
            <button
              onClick={searchLocations}
              disabled={loading || !searchQuery.trim()}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-md font-medium disabled:opacity-50"
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>

          {searchResults && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">
                  Search Results ({searchResults.count})
                </h3>
                <div className="text-sm text-gray-600">
                  Source: {searchResults.source} | Performance: {searchResults.performance}
                </div>
              </div>

              {searchResults.results && searchResults.results.length > 0 ? (
                <div className="space-y-2">
                  {searchResults.results.map((result: any, index: number) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="font-medium text-lg">{result.display_name}</div>
                          <div className="text-sm text-gray-600">
                            {result.name !== result.city && `${result.name} in `}{result.city}
                            {result.state && `, ${result.state}`}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            Popularity: {result.popularity} | Properties: {result.property_count}
                            {result.coordinates && ` | Coords: ${result.coordinates.lat.toFixed(4)}, ${result.coordinates.lng.toFixed(4)}`}
                          </div>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <button
                            onClick={() => updatePopularity(result.name, result.city, 'search')}
                            className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded text-xs"
                          >
                            +1 Search
                          </button>
                          <button
                            onClick={() => updatePopularity(result.name, result.city, 'select')}
                            className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-xs"
                          >
                            +2 Select
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No locations found for "{searchResults.query}"
                </div>
              )}

              {searchResults.suggestion && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-yellow-700 text-sm">{searchResults.suggestion}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Schema Information */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Database Schema</h2>
          
          <div className="bg-gray-100 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Locations Table Structure:</h3>
            <pre className="text-sm text-gray-700 whitespace-pre-wrap">
              {`CREATE TABLE locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,              -- "Whitefield"
  city TEXT NOT NULL,              -- "Bangalore"  
  state TEXT,                      -- "Karnataka"
  latitude DOUBLE PRECISION,       -- GPS coordinates
  longitude DOUBLE PRECISION,      -- GPS coordinates
  popularity INTEGER DEFAULT 0,    -- searches/selections
  property_count INTEGER DEFAULT 0, -- number of properties
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_location_name ON locations USING gin (name gin_trgm_ops);
CREATE INDEX idx_location_city ON locations(city);
CREATE INDEX idx_location_state ON locations(state);
CREATE INDEX idx_location_popularity ON locations(popularity DESC);
CREATE INDEX idx_location_coords ON locations(latitude, longitude);`}
            </pre>
          </div>

          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">Benefits of Dedicated Locations Table:</h3>
            <ul className="list-disc list-inside text-blue-700 space-y-1 text-sm">
              <li><strong>Performance:</strong> Optimized indexes for fast search queries</li>
              <li><strong>Popularity Tracking:</strong> Track which locations are searched/selected most</li>
              <li><strong>GPS Coordinates:</strong> Store precise location data for mapping</li>
              <li><strong>Property Count:</strong> Track how many properties exist in each location</li>
              <li><strong>Scalability:</strong> Efficient queries even with thousands of locations</li>
              <li><strong>Analytics:</strong> Understand user search patterns and preferences</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}