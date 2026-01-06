'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function TestOwnerDetailsPage() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [bookingId, setBookingId] = useState('');

  const testAPI = async () => {
    setLoading(true);
    try {
      // First test GET endpoint
      const getResponse = await fetch('/api/get-owner-details');
      const getData = await getResponse.json();
      
      console.log('GET response:', getData);
      
      // Test POST endpoint if we have a booking ID
      if (bookingId) {
        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.access_token;

        if (token) {
          const postResponse = await fetch('/api/get-owner-details', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ booking_id: bookingId }),
          });

          const postData = await postResponse.json();
          console.log('POST response:', postData);
          
          setResult({
            get: getData,
            post: postData,
            authenticated: !!token
          });
        } else {
          setResult({
            get: getData,
            post: { error: 'Not authenticated' },
            authenticated: false
          });
        }
      } else {
        setResult({
          get: getData,
          post: null,
          authenticated: !!session?.access_token
        });
      }
    } catch (error: any) {
      setResult({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Test Owner Details API</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">API Test</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Booking ID (optional for POST test):
              </label>
              <input
                type="text"
                value={bookingId}
                onChange={(e) => setBookingId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Enter booking ID to test POST endpoint"
              />
            </div>
            
            <button
              onClick={testAPI}
              disabled={loading}
              className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-md font-medium disabled:opacity-50"
            >
              {loading ? 'Testing...' : 'Test API'}
            </button>
          </div>
        </div>

        {result && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Results</h2>
            <pre className="bg-gray-100 p-4 rounded-md overflow-auto text-sm">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}