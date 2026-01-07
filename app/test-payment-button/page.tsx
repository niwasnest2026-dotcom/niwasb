'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import RazorpayPayment from '@/components/RazorpayPayment';

export default function TestPaymentButtonPage() {
  const { user } = useAuth();
  const [paymentResult, setPaymentResult] = useState<string>('');

  const handlePaymentSuccess = (paymentId: string, bookingId: string) => {
    setPaymentResult(`✅ SUCCESS! Payment ID: ${paymentId}, Booking ID: ${bookingId}`);
  };

  const handlePaymentError = (error: string) => {
    setPaymentResult(`❌ ERROR: ${error}`);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Please Login First</h1>
          <p>You need to be logged in to test the payment button.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">🧪 Payment Button Test</h1>
          
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <h2 className="font-semibold text-green-800 mb-2">✅ FIXES APPLIED:</h2>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• Safe state initialization (no more undefined errors)</li>
              <li>• Hard validation guard before payment</li>
              <li>• Proper userDetails object structure</li>
              <li>• Backward compatibility with legacy props</li>
              <li>• Generic error messages for users</li>
            </ul>
          </div>

          <div className="mb-6">
            <h3 className="font-semibold mb-4">Test Data:</h3>
            <div className="grid grid-cols-2 gap-4 text-sm bg-gray-50 p-4 rounded">
              <div>
                <span className="font-medium">Property ID:</span> test-property-123
              </div>
              <div>
                <span className="font-medium">Amount:</span> ₹1,000
              </div>
              <div>
                <span className="font-medium">User Name:</span> {user.user_metadata?.full_name || user.email?.split('@')[0] || 'Test User'}
              </div>
              <div>
                <span className="font-medium">User Email:</span> {user.email}
              </div>
            </div>
          </div>

          <RazorpayPayment
            amount={1000}
            propertyId="test-property-123"
            propertyName="Test Property"
            userDetails={{
              name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Test User',
              email: user.email || '',
              phone: '9999999999',
              sharing_type: 'Single Room',
              price_per_person: 5000,
              security_deposit_per_person: 10000,
              total_amount: 15000,
              amount_paid: 1000,
              amount_due: 14000,
            }}
            onSuccess={handlePaymentSuccess}
            onError={handlePaymentError}
          />

          {paymentResult && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold mb-2">Payment Result:</h3>
              <pre className="text-sm whitespace-pre-wrap">{paymentResult}</pre>
            </div>
          )}

          <div className="mt-6 text-xs text-gray-500 space-y-2">
            <p><strong>🔧 Debug Info:</strong></p>
            <ul className="list-disc list-inside space-y-1">
              <li>If button shows "Please fill all details to continue" → userDetails validation working</li>
              <li>If button shows "Pay ₹1,000 Securely" → all validations passed</li>
              <li>If clicking opens Razorpay → payment flow working</li>
              <li>If error shows "Unable to start payment" → backend validation issue</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}