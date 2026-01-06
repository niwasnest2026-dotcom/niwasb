'use client';

import { useState } from 'react';

export default function DebugRecentBookings() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const checkRecentBookings = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/debug-recent-bookings');
      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error('Error checking recent bookings:', error);
      setResult({ error: 'Failed to check recent bookings' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            🔍 Debug Recent Bookings
          </h1>

          <div className="mb-6">
            <p className="text-gray-600 mb-4">
              This tool checks the most recent bookings in the database to help debug why bookings aren't showing up.
            </p>
            
            <button
              onClick={checkRecentBookings}
              disabled={loading}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold disabled:opacity-50"
            >
              {loading ? 'Checking...' : 'Check Recent Bookings'}
            </button>
          </div>

          {result && (
            <div className="mt-8">
              <h2 className="text-xl font-semibold mb-4">Debug Results:</h2>
              
              {result.success ? (
                <div className="space-y-6">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h3 className="font-semibold text-green-800 mb-2">✅ Database Connection OK</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-green-700 text-sm">
                      <div>Recent Bookings: {result.debug_info.recent_bookings_count}</div>
                      <div>Properties: {result.debug_info.sample_properties?.length || 0}</div>
                      <div>Rooms: {result.debug_info.sample_rooms?.length || 0}</div>
                      <div>Profiles: {result.debug_info.sample_profiles?.length || 0}</div>
                    </div>
                  </div>

                  {result.debug_info.recent_bookings_count > 0 ? (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h3 className="font-semibold text-blue-800 mb-4">📋 Recent Bookings Found</h3>
                      <div className="space-y-4">
                        {result.debug_info.recent_bookings.map((booking: any, index: number) => (
                          <div key={booking.id} className="bg-white p-4 rounded border">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                              <div>
                                <strong>Booking #{index + 1}</strong>
                                <div>ID: {booking.id}</div>
                                <div>Guest: {booking.guest_name}</div>
                                <div>Email: {booking.guest_email}</div>
                                <div>Phone: {booking.guest_phone}</div>
                              </div>
                              <div>
                                <div>Property ID: {booking.property_id}</div>
                                <div>Room ID: {booking.room_id || 'None'}</div>
                                <div>User ID: {booking.user_id || 'None'}</div>
                                <div>Payment ID: {booking.payment_id || 'None'}</div>
                                <div>Status: {booking.booking_status}</div>
                                <div>Amount Paid: ₹{booking.amount_paid}</div>
                                <div>Created: {new Date(booking.created_at).toLocaleString()}</div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <h3 className="font-semibold text-yellow-800 mb-2">⚠️ No Recent Bookings Found</h3>
                      <p className="text-yellow-700">
                        The database connection is working, but no bookings were found. This could mean:
                      </p>
                      <ul className="list-disc list-inside text-yellow-700 mt-2 space-y-1">
                        <li>The booking creation failed silently</li>
                        <li>The booking was created in a different table</li>
                        <li>There's an issue with the payment verification process</li>
                      </ul>
                    </div>
                  )}

                  <details className="bg-gray-50 rounded-lg p-4">
                    <summary className="cursor-pointer font-semibold text-gray-700 mb-2">
                      🔍 View Full Technical Details
                    </summary>
                    <pre className="text-xs overflow-auto whitespace-pre-wrap bg-white p-4 rounded border">
                      {JSON.stringify(result, null, 2)}
                    </pre>
                  </details>
                </div>
              ) : (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h3 className="font-semibold text-red-800 mb-2">❌ Error</h3>
                  <p className="text-red-700">{result.error}</p>
                </div>
              )}
            </div>
          )}

          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">🎯 What This Checks:</h3>
            <ul className="text-blue-700 text-sm space-y-1">
              <li>• Recent bookings in the database</li>
              <li>• Database table connectivity</li>
              <li>• Booking record structure</li>
              <li>• User ID and Payment ID associations</li>
              <li>• Property and room relationships</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}