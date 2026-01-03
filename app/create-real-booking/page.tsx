'use client';

import { useState } from 'react';

export default function CreateRealBookingPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const createBooking = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/debug-real-booking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({ success: false, error: 'Failed to create booking' });
    } finally {
      setLoading(false);
    }
  };

  const checkDatabase = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/debug-real-booking', {
        method: 'GET',
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({ success: false, error: 'Failed to check database' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            Create Real Booking for pay_RzMDWPSs34L2tw
          </h1>

          <div className="space-y-4 mb-8">
            <button
              onClick={checkDatabase}
              disabled={loading}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Checking...' : 'Check Database Status'}
            </button>

            <button
              onClick={createBooking}
              disabled={loading}
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 ml-4"
            >
              {loading ? 'Creating...' : 'Create Real Booking'}
            </button>
          </div>

          {result && (
            <div className="bg-gray-100 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Result:</h3>
              <pre className="text-sm overflow-auto">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}

          <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h3 className="font-semibold text-yellow-800 mb-2">Instructions:</h3>
            <ol className="list-decimal list-inside text-yellow-700 space-y-1">
              <li>First click "Check Database Status" to see current data</li>
              <li>Then click "Create Real Booking" to create booking for pay_RzMDWPSs34L2tw</li>
              <li>This will create a booking record that the owner details modal can use</li>
              <li>After creation, you can test the owner details modal with the booking ID</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}