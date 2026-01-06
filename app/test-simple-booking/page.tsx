'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import RazorpayPayment from '@/components/RazorpayPayment';

export default function TestSimpleBooking() {
  const { user } = useAuth();
  const [paymentResult, setPaymentResult] = useState<string>('');

  const handlePaymentSuccess = (paymentId: string) => {
    setPaymentResult(`✅ Payment successful! Payment ID: ${paymentId}`);
  };

  const handlePaymentError = (error: string) => {
    setPaymentResult(`❌ Payment failed: ${error}`);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h1>
          <p className="text-gray-600">Please login to test the booking system.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            🧪 Test Simple Booking System
          </h1>

          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h2 className="font-semibold text-blue-800 mb-2">Simple Booking Logic:</h2>
            <ul className="text-blue-700 text-sm space-y-1">
              <li>• Automatically finds available property and room</li>
              <li>• Creates fallback property/room if none exists</li>
              <li>• Always provides valid room_id (no null constraint issues)</li>
              <li>• Simple, robust booking creation</li>
              <li>• No complex booking details required</li>
            </ul>
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Test Payment</h2>
            <p className="text-gray-600 mb-4">
              This will test the complete payment flow with the new simple booking logic.
            </p>
            
            <RazorpayPayment
              amount={500} // ₹500 test amount
              bookingId="test-simple-booking"
              guestName={user.user_metadata?.full_name || user.email?.split('@')[0] || 'Test User'}
              guestEmail={user.email || 'test@example.com'}
              guestPhone={user.user_metadata?.phone || '9999999999'}
              propertyName="Test Property"
              roomNumber="Test Room"
              onSuccess={handlePaymentSuccess}
              onError={handlePaymentError}
            />
          </div>

          {paymentResult && (
            <div className={`p-4 rounded-lg ${paymentResult.includes('✅') ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
              <h3 className="font-semibold mb-2">Payment Result:</h3>
              <p className="text-sm">{paymentResult}</p>
            </div>
          )}

          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-800 mb-2">What This Tests:</h3>
            <ul className="text-gray-600 text-sm space-y-1">
              <li>• Payment signature verification</li>
              <li>• Automatic property/room selection</li>
              <li>• Booking creation with valid room_id</li>
              <li>• Room availability updates</li>
              <li>• User profile integration</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}