'use client';

import { useState } from 'react';

export default function FixPaymentPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const fixPayment = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/fix-payment-booking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentId: 'pay_RzMfl1pXGP3Ux',
          guestName: 'testone',
          propertyName: 'Kushal'
        }),
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({ success: false, error: 'Failed to fix payment' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            Fix Payment: pay_RzMfl1pXGP3Ux
          </h1>

          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg">
            <h3 className="font-semibold text-red-800 mb-2">Issue:</h3>
            <ul className="text-sm text-red-700 space-y-1">
              <li>• Payment was successful but booking record wasn't created</li>
              <li>• User can't see booking in profile</li>
              <li>• Admin can't see booking in dashboard</li>
              <li>• Owner details showing "not found" error</li>
            </ul>
          </div>

          <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">Fix Details:</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Payment ID: pay_RzMfl1pXGP3Ux</li>
              <li>• Guest: testone</li>
              <li>• Property: Kushal</li>
              <li>• Will create missing booking record</li>
              <li>• Will link to user profile</li>
              <li>• Will enable owner details access</li>
            </ul>
          </div>

          <button
            onClick={fixPayment}
            disabled={loading}
            className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 disabled:opacity-50 mb-6"
          >
            {loading ? 'Fixing Payment...' : 'Fix Payment & Create Booking'}
          </button>

          {result && (
            <div className="bg-gray-100 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold mb-4">
                {result.success ? '✅ Fixed!' : '❌ Error'}
              </h3>
              <pre className="text-sm overflow-auto mb-4">
                {JSON.stringify(result, null, 2)}
              </pre>
              
              {result.success && (
                <div className="space-y-2">
                  <p className="text-green-700 font-medium">
                    Payment fixed! Now you can:
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                    <button
                      onClick={() => {
                        // Test owner details modal
                        const bookingId = result.data?.booking_id;
                        if (bookingId) {
                          window.open(`/debug-owner-details?bookingId=${bookingId}`, '_blank');
                        }
                      }}
                      className="bg-orange-600 text-white py-2 px-4 rounded-lg hover:bg-orange-700"
                    >
                      Test Owner Details
                    </button>
                  </div>
                  <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded">
                    <p className="text-sm text-green-800">
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
            <h3 className="font-semibold text-yellow-800 mb-2">After fixing:</h3>
            <ol className="list-decimal list-inside text-yellow-700 space-y-1 text-sm">
              <li>Booking will appear in admin dashboard</li>
              <li>User can see booking in their profile</li>
              <li>Owner details modal will work</li>
              <li>Payment will be properly linked to booking</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}