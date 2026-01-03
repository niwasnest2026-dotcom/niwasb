'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export default function DebugOwnerDetailsPage() {
  const { user } = useAuth();
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const ensureTestData = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/ensure-test-data', {
        method: 'POST'
      });
      const data = await response.json();
      setResult({ type: 'ensure', data });
    } catch (error: any) {
      setResult({ type: 'ensure', error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const checkOwnerDetailsColumns = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/setup-owner-details', {
        method: 'GET'
      });
      const data = await response.json();
      setResult({ type: 'check', data });
    } catch (error: any) {
      setResult({ type: 'check', error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const setupOwnerDetails = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/setup-owner-details', {
        method: 'POST'
      });
      const data = await response.json();
      setResult({ type: 'setup', data });
    } catch (error: any) {
      setResult({ type: 'setup', error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const checkUserBookings = async () => {
    if (!user) {
      alert('Please login first');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/admin/bookings', {
        method: 'GET'
      });
      const data = await response.json();
      setResult({ type: 'bookings', data });
    } catch (error: any) {
      setResult({ type: 'bookings', error: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Owner Details System Debug</h1>
        
        <div className="bg-gray-100 p-4 rounded mb-6">
          <h2 className="font-bold mb-2">Current User:</h2>
          {user ? (
            <div>
              <p><strong>ID:</strong> {user.id}</p>
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Name:</strong> {user.user_metadata?.full_name || user.user_metadata?.name || 'N/A'}</p>
            </div>
          ) : (
            <p className="text-red-600">Not logged in - Please login first</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <button
            onClick={ensureTestData}
            disabled={loading}
            className="bg-orange-500 text-white px-4 py-3 rounded disabled:opacity-50"
          >
            {loading ? 'Ensuring...' : 'Ensure Test Data'}
          </button>

          <button
            onClick={checkOwnerDetailsColumns}
            disabled={loading}
            className="bg-blue-500 text-white px-4 py-3 rounded disabled:opacity-50"
          >
            {loading ? 'Checking...' : 'Check Owner Details Columns'}
          </button>

          <button
            onClick={setupOwnerDetails}
            disabled={loading}
            className="bg-green-500 text-white px-4 py-3 rounded disabled:opacity-50"
          >
            {loading ? 'Setting up...' : 'Setup Owner Details'}
          </button>

          <button
            onClick={checkUserBookings}
            disabled={loading || !user}
            className="bg-purple-500 text-white px-4 py-3 rounded disabled:opacity-50"
          >
            {loading ? 'Checking...' : 'Check My Bookings'}
          </button>
        </div>

        {result && (
          <div className="bg-gray-100 p-6 rounded">
            <h2 className="font-bold mb-4">
              {result.type === 'ensure' && 'Test Data Setup Result'}
              {result.type === 'check' && 'Column Check Result'}
              {result.type === 'setup' && 'Setup Result'}
              {result.type === 'bookings' && 'Bookings Result'}
            </h2>
            
            {result.error ? (
              <div className="text-red-600">
                <strong>Error:</strong> {result.error}
              </div>
            ) : (
              <pre className="text-sm overflow-auto max-h-96">
                {JSON.stringify(result.data, null, 2)}
              </pre>
            )}
          </div>
        )}

        <div className="mt-8 bg-yellow-50 border border-yellow-200 p-6 rounded">
          <h3 className="font-bold text-yellow-800 mb-4">Troubleshooting Steps:</h3>
          <ol className="list-decimal list-inside text-yellow-700 space-y-2">
            <li><strong>Ensure Test Data:</strong> Create properties and owner details if they don't exist</li>
            <li><strong>Check Owner Details Columns:</strong> Verify if the database has the required columns</li>
            <li><strong>Setup Owner Details:</strong> Add sample owner details to existing properties</li>
            <li><strong>Check My Bookings:</strong> See if you have any test bookings created</li>
            <li><strong>Test Payment:</strong> Go to <a href="/test-payment" className="underline">/test-payment</a> to create a test booking</li>
            <li><strong>Check Profile:</strong> Go to <a href="/profile" className="underline">/profile</a> to see owner details</li>
          </ol>
        </div>

        <div className="mt-6 bg-blue-50 border border-blue-200 p-6 rounded">
          <h3 className="font-bold text-blue-800 mb-4">Database Setup Required:</h3>
          <p className="text-blue-700 mb-4">If the column check fails, run this SQL in your Supabase dashboard:</p>
          <pre className="bg-blue-100 p-4 rounded text-sm">
{`ALTER TABLE properties 
ADD COLUMN owner_name TEXT,
ADD COLUMN owner_phone TEXT,
ADD COLUMN payment_instructions TEXT;`}
          </pre>
        </div>
      </div>
    </div>
  );
}