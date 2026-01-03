'use client';

import { useState } from 'react';

export default function CreateSampleBookingsPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const createSampleBookings = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/create-sample-bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({ success: false, error: 'Failed to create sample bookings' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            Create Sample Bookings for Existing Users
          </h1>

          <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">What this does:</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Finds all users who don't have any booking records</li>
              <li>• Creates sample bookings for them with realistic data</li>
              <li>• Links bookings to properties with owner details</li>
              <li>• Uses sample payment IDs (including pay_RzMDWPSs34L2tw)</li>
              <li>• Enables users to see bookings in their profile</li>
              <li>• Makes owner details accessible for these users</li>
            </ul>
          </div>

          <div className="mb-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h3 className="font-semibold text-yellow-800 mb-2">Sample Booking Details:</h3>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• Payment Status: Partial (20% paid)</li>
              <li>• Booking Status: Confirmed</li>
              <li>• Payment Method: Razorpay</li>
              <li>• Check-in: Today</li>
              <li>• Check-out: 30 days from today</li>
              <li>• Room Type: Single occupancy</li>
            </ul>
          </div>

          <button
            onClick={createSampleBookings}
            disabled={loading}
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 mb-6"
          >
            {loading ? 'Creating Sample Bookings...' : 'Create Sample Bookings'}
          </button>

          {result && (
            <div className="bg-gray-100 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold mb-4">
                {result.success ? '✅ Success!' : '❌ Error'}
              </h3>
              
              {result.success && (
                <div className="mb-4">
                  <p className="text-green-700 font-medium mb-2">
                    Created {result.created_count} sample bookings!
                  </p>
                  
                  {result.bookings && result.bookings.length > 0 && (
                    <div className="bg-white rounded border p-4">
                      <h4 className="font-semibold mb-2">Created Bookings:</h4>
                      <div className="space-y-2">
                        {result.bookings.map((booking: any, index: number) => (
                          <div key={index} className="text-sm border-b pb-2">
                            <div><strong>Guest:</strong> {booking.guest_name} ({booking.guest_email})</div>
                            <div><strong>Property:</strong> {booking.property_name}</div>
                            <div><strong>Amount Paid:</strong> ₹{booking.amount_paid?.toLocaleString()}</div>
                            <div><strong>Booking ID:</strong> {booking.id}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              <pre className="text-sm overflow-auto">
                {JSON.stringify(result, null, 2)}
              </pre>
              
              {result.success && (
                <div className="mt-4 space-y-2">
                  <p className="text-green-700 font-medium">
                    Now users can:
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <a
                      href="/profile"
                      className="block bg-blue-600 text-white text-center py-2 px-4 rounded-lg hover:bg-blue-700"
                    >
                      View Bookings in Profile
                    </a>
                    <a
                      href="/admin/bookings"
                      className="block bg-green-600 text-white text-center py-2 px-4 rounded-lg hover:bg-green-700"
                    >
                      View in Admin Dashboard
                    </a>
                    <button
                      onClick={() => {
                        if (result.bookings && result.bookings.length > 0) {
                          const bookingId = result.bookings[0].id;
                          window.open(`/debug-owner-details?bookingId=${bookingId}`, '_blank');
                        }
                      }}
                      className="bg-orange-600 text-white py-2 px-4 rounded-lg hover:bg-orange-700"
                    >
                      Test Owner Details
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <h3 className="font-semibold text-green-800 mb-2">After creating sample bookings:</h3>
            <ol className="list-decimal list-inside text-green-700 space-y-1 text-sm">
              <li>Users will see their bookings when they visit their profile</li>
              <li>Owner details modal will work for these bookings</li>
              <li>Admin dashboard will show all bookings including samples</li>
              <li>Users can contact property owners through the system</li>
              <li>The booking system will be fully functional for existing users</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}