'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import RazorpayPayment from '@/components/RazorpayPayment';

export default function TestRealPaymentPage() {
  const { user } = useAuth();
  const [result, setResult] = useState<any>(null);

  // Mock booking details for testing
  const mockBookingDetails = {
    property_id: 'bbd5ef50-27a6-487d-b5c2-fb1c1a292b56', // easywest property from debug
    sharing_type: 'Single',
    price_per_person: 15000,
    security_deposit_per_person: 30000,
    total_amount: 45000,
    amount_paid: 9000, // 20% of total
    amount_due: 36000, // 80% remaining
    check_in: new Date().toISOString().split('T')[0],
    check_out: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  };

  const handlePaymentSuccess = (paymentId: string) => {
    setResult({
      success: true,
      message: 'Payment successful! Booking should be created.',
      paymentId,
      user: user?.email,
    });
  };

  const handlePaymentError = (error: string) => {
    setResult({
      success: false,
      error,
    });
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please Login</h1>
          <p>You need to be logged in to test payments</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            Test Real Payment Flow
          </h1>

          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">Test Details:</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• User: {user.email}</li>
              <li>• Property: easywest (has owner details)</li>
              <li>• Amount: ₹9,000 (20% of ₹45,000 total)</li>
              <li>• This will create a real booking record</li>
              <li>• Booking will appear in profile and admin dashboard</li>
              <li>• Owner details will be accessible after payment</li>
            </ul>
          </div>

          {!result ? (
            <RazorpayPayment
              amount={9000}
              bookingId={`test_${Date.now()}`}
              guestName={user.user_metadata?.full_name || 'Test User'}
              guestEmail={user.email || ''}
              guestPhone={user.user_metadata?.phone || '+91-9999999999'}
              propertyName="easywest"
              roomNumber="Single Room"
              bookingDetails={mockBookingDetails}
              onSuccess={handlePaymentSuccess}
              onError={handlePaymentError}
            />
          ) : (
            <div className="bg-gray-100 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">
                {result.success ? '✅ Success!' : '❌ Error'}
              </h3>
              <pre className="text-sm overflow-auto">
                {JSON.stringify(result, null, 2)}
              </pre>
              
              {result.success && (
                <div className="mt-4 space-y-2">
                  <a
                    href="/profile"
                    className="block bg-blue-600 text-white text-center py-2 px-4 rounded-lg hover:bg-blue-700"
                  >
                    Check My Bookings in Profile
                  </a>
                  <a
                    href="/admin/bookings"
                    className="block bg-green-600 text-white text-center py-2 px-4 rounded-lg hover:bg-green-700"
                  >
                    Check Admin Bookings Dashboard
                  </a>
                </div>
              )}
            </div>
          )}

          <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h3 className="font-semibold text-yellow-800 mb-2">What This Tests:</h3>
            <ol className="list-decimal list-inside text-yellow-700 space-y-1 text-sm">
              <li>Real payment processing with booking details</li>
              <li>Booking creation linked to authenticated user</li>
              <li>User can see booking in profile</li>
              <li>Admin can see booking in dashboard</li>
              <li>Owner details become accessible</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}