'use client';

import { useState, useEffect } from 'react';
import SearchForm from '@/components/SearchForm';

export default function TestSearchSuggestionsPage() {
  const [locations, setLocations] = useState<any>(null);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await fetch('/api/get-locations');
        const data = await response.json();
        setLocations(data);
      } catch (error) {
        console.error('Error fetching locations:', error);
      }
    };

    fetchLocations();
  }, []);

  return (
    <div className="min-h-screen p-8" style={{ 
      background: 'linear-gradient(135deg, #FF6711 0%, #FFD082 50%, #FF6711 100%)',
      backgroundSize: '400% 400%',
      animation: 'gradientShift 20s ease infinite'
    }}>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8 text-center">
          Test Search Suggestions
        </h1>
        
        <div className="mb-8">
          <SearchForm />
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">How to Test:</h2>
          <ol className="list-decimal list-inside space-y-2 text-gray-700">
            <li><strong>Click on the search box</strong> - Should show available locations immediately</li>
            <li><strong>Leave it empty and click</strong> - Should display all available locations</li>
            <li><strong>Start typing</strong> - Should filter locations as you type</li>
            <li><strong>Click on a location</strong> - Should select it and show nearby properties</li>
          </ol>

          {locations && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold mb-2">Available Locations ({locations.total_count}):</h3>
              <div className="text-sm text-gray-600">
                <p>• Dynamic locations from properties: {locations.dynamic_count}</p>
                <p>• Static fallback locations: {locations.static_count}</p>
                <p>• When search box is empty, shows first 12 locations</p>
                <p>• When typing, filters and shows up to 10 matching locations</p>
              </div>
            </div>
          )}

          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">Expected Behavior:</h3>
            <ul className="list-disc list-inside text-blue-700 space-y-1 text-sm">
              <li>Empty search box shows available locations on click/focus</li>
              <li>Displays "Properties are available in these locations" message</li>
              <li>Shows up to 12 locations when empty (more than when filtering)</li>
              <li>Typing filters locations in real-time</li>
              <li>Clicking a location selects it and may show property previews</li>
              <li>Clear visual indication of how many total locations are available</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}