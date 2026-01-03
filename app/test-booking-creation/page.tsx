'use client';

import { useState } from 'react';

export default function TestBookingCreationPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const createManualBooking = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/create-manual-booking', {
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

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            Test Booking Creation for pay_RzMDWPSs34L2tw
          </h1>

          <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">What this does:</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Creates a booking record for real payment ID pay_RzMDWPSs34L2tw</li>
              <li>• Links it to a property with owner details (easywest)</li>
              <li>• Creates a user profile for the booking</li>
              <li>• Makes owner details accessible through the booking</li>
              <li>• Fixes the 404 error in owner details modal</li>
            </ul>
          </div>

          <button
            onClick={createManualBooking}
            disabled={loading}
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 mb-6"
          >
            {loading ? 'Creating Booking...' : 'Create Manual Booking'}
          </button>

          {result && (
            <div className="bg-gray-100 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold mb-4">
                {result.success ? '✅ Success!' : '❌ Error'}
              </h3>
              <pre className="text-sm overflow-auto mb-4">
                {JSON.stringify(result, null, 2)}
              </pre>
              
              {result.success && (
                <div className="space-y-2">
                  <p className="text-green-700 font-medium">
                    Booking created! Now you can:
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <a
                      href="/admin/bookings"
                      className="block bg-blue-600 text-white text-center py-2 px-4 rounded-lg hover:bg-blue-700"
                    >
                      View in Admin Dashboard
                    </a>
                    <a
                      href="/profile"
                      className="block bg-green-600 text-white text-center py-2 px-4 rounded-lg hover:bg-green-700"
                    >
                      View in User Profile
                    </a>
                  </div>
                  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                    <p className="text-sm text-yellow-800">
                      <strong>Booking ID:</strong> {result.data?.booking_id}<br/>
                      <strong>User ID:</strong> {result.data?.user_id}<br/>
                      <strong>Owner:</strong> {result.data?.owner_details?.owner_name}<br/>
                      <strong>Phone:</strong> {result.data?.owner_details?.owner_phone}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h3 className="font-semibold text-yellow-800 mb-2">After creating the booking:</h3>
            <ol className="list-decimal list-inside text-yellow-700 space-y-1 text-sm">
              <li>The booking will appear in the admin bookings dashboard</li>
              <li>The user can see it in their profile (if logged in as that user)</li>
              <li>Owner details modal will work without 404 errors</li>
              <li>Real-time booking system will be functional</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}