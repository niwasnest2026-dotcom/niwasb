'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import RazorpayPayment from '@/components/RazorpayPayment';

export default function TestPaymentFlowPage() {
  const { user } = useAuth();
  const [paymentResult, setPaymentResult] = useState<any>(null);

  const handlePaymentSuccess = (paymentId: string) => {
    setPaymentResult({
      success: true,
      paymentId,
      message: 'Payment successful! Check your profile for the booking.'
    });
  };

  const handlePaymentError = (error: string) => {
    setPaymentResult({
      success: false,
      error,
      message: 'Payment failed. Please try again.'
    });
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please Login</h1>
          <p>You need to be logged in to test payments.</p>
          <a href="/login" className="text-blue-500 hover:underline">Go to Login</a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Test Payment Flow</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Test Payment (₹2)</h2>
          <p className="text-gray-600 mb-6">
            This will test the complete payment-to-booking flow. After successful payment, 
            a booking should automatically appear in your profile.
          </p>
          
          <RazorpayPayment
            amount={2}
            bookingId={`test_${Date.now()}`}
            guestName={user.user_metadata?.full_name || user.email?.split('@')[0] || 'Test User'}
            guestEmail={user.email || 'test@example.com'}
            guestPhone={user.user_metadata?.phone || '9999999999'}
            propertyName="TEST Property"
            roomNumber="Test Room"
            onSuccess={handlePaymentSuccess}
            onError={handlePaymentError}
            bookingDetails={{
              property_id: 'test-property',
              sharing_type: 'Single Room',
              price_per_person: 10000, // ₹10,000 monthly rent
              security_deposit_per_person: 20000, // ₹20,000 security
              total_amount: 30000, // Total ₹30,000
              amount_paid: 2, // ₹2 advance (for testing)
              amount_due: 29998, // Remaining amount
            }}
          />
        </div>

        {paymentResult && (
          <div className={`rounded-lg p-6 ${paymentResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
            <h3 className={`text-lg font-semibold mb-2 ${paymentResult.success ? 'text-green-800' : 'text-red-800'}`}>
              {paymentResult.success ? '✅ Success!' : '❌ Error'}
            </h3>
            <p className={`mb-4 ${paymentResult.success ? 'text-green-700' : 'text-red-700'}`}>
              {paymentResult.message}
            </p>
            {paymentResult.success && (
              <div className="space-y-2">
                <p className="text-sm text-green-600">
                  <strong>Payment ID:</strong> {paymentResult.paymentId}
                </p>
                <div className="flex gap-4">
                  <a
                    href="/profile"
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                  >
                    View Profile
                  </a>
                  <a
                    href="/bookings"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                  >
                    View Bookings
                  </a>
                </div>
              </div>
            )}
            {paymentResult.error && (
              <p className="text-sm text-red-600">
                <strong>Error:</strong> {paymentResult.error}
              </p>
            )}
          </div>
        )}

        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">How it works:</h3>
          <ol className="list-decimal list-inside text-yellow-700 space-y-1 text-sm">
            <li>Click "Pay ₹2 Razorpay" to start the payment process</li>
            <li>Complete the payment using any test payment method</li>
            <li>The system will automatically create a booking linked to your account</li>
            <li>Check your profile or bookings page to see the new booking</li>
            <li>Owner details will be available in the booking</li>
          </ol>
        </div>
      </div>
    </div>
  );
}