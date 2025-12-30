'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function AdminSetup() {
  const [loading, setLoading] = useState(false);
  const [fixLoading, setFixLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [fixMessage, setFixMessage] = useState('');
  const [fixError, setFixError] = useState('');

  const fixDatabase = async () => {
    setFixLoading(true);
    setFixMessage('');
    setFixError('');

    try {
      const response = await fetch('/api/fix-database', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.success) {
        setFixMessage(data.message);
      } else {
        setFixError(data.error || 'Failed to fix database');
        if (data.instructions) {
          setFixError(data.error + '\n\nManual Steps:\n' + data.instructions.join('\n'));
        }
      }
    } catch (err: any) {
      setFixError(err.message || 'An error occurred while fixing database');
    } finally {
      setFixLoading(false);
    }
  };

  const addSampleProperties = async () => {
    setLoading(true);
    setMessage('');
    setError('');

    try {
      const response = await fetch('/api/add-sample-properties', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.success) {
        setMessage(`Success! ${data.message}. Properties: ${data.propertiesAdded || 0}, Rooms: ${data.roomsAdded || 0}, Images: ${data.imagesAdded || 0}`);
      } else {
        setError(data.error || 'Failed to add sample properties');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-8 px-4 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link href="/admin" className="text-blue-600 hover:underline mb-2 inline-block">
            ← Back to Admin Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Admin Setup</h1>
          <p className="text-gray-600 mt-2">Initialize your platform with sample data</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Database Setup</h2>
          
          {/* Step 1: Fix Database Schema */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Step 1: Fix Database Schema</h3>
            <p className="text-gray-600 mb-4">
              If you're seeing "column properties.is_available does not exist" errors, 
              click this button to fix the database schema.
            </p>
            
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <h4 className="font-semibold text-red-900 mb-2">Common Error:</h4>
              <p className="text-red-800 text-sm">column properties.is_available does not exist</p>
            </div>

            <button
              onClick={fixDatabase}
              disabled={fixLoading}
              className="bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white font-semibold py-3 px-6 rounded-lg transition-colors mr-4"
            >
              {fixLoading ? 'Fixing Database...' : 'Fix Database Schema'}
            </button>
          </div>

          {fixMessage && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <p className="text-green-800">{fixMessage}</p>
            </div>
          )}

          {fixError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-800 whitespace-pre-line">{fixError}</p>
            </div>
          )}

          {/* Step 2: Add Sample Properties */}
          <div className="border-t border-gray-200 pt-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Step 2: Add Sample Properties</h3>
            
            <div className="mb-6">
              <p className="text-gray-600 mb-4">
                This will add 3 sample properties with rooms to get you started. 
                Each property will have Single, Double, and Triple sharing rooms.
              </p>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <h4 className="font-semibold text-blue-900 mb-2">Sample Properties Include:</h4>
                <ul className="text-blue-800 text-sm space-y-1">
                  <li>• Sunrise PG for Students (MG Road, Bangalore) - ₹12,000/month</li>
                  <li>• Green Valley PG (Koramangala, Bangalore) - ₹10,000/month</li>
                  <li>• Elite Residency (Brigade Road, Bangalore) - ₹15,000/month</li>
                  <li>• Each property includes 4 high-quality images</li>
                  <li>• Multiple room types (Single, Double, Triple sharing)</li>
                  <li>• Realistic pricing and availability data</li>
                </ul>
              </div>

              <button
                onClick={addSampleProperties}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                {loading ? 'Adding Properties...' : 'Add Sample Properties'}
              </button>
            </div>

            {message && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                <p className="text-green-800">{message}</p>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <p className="text-red-800">{error}</p>
              </div>
            )}

            <div className="mt-8 pt-6 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Next Steps</h3>
              <div className="space-y-2 text-gray-600">
                <p>1. Fix database schema using the button above</p>
                <p>2. Add sample properties using the button above</p>
                <p>3. Visit the <Link href="/" className="text-blue-600 hover:underline">homepage</Link> to see properties</p>
                <p>4. Go to <Link href="/admin/properties" className="text-blue-600 hover:underline">Properties Management</Link> to add more</p>
                <p>5. Test the booking flow by selecting a property</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}