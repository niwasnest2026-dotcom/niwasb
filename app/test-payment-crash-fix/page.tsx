'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import RazorpayPayment from '@/components/RazorpayPayment';

export default function TestPaymentCrashFixPage() {
  const { user } = useAuth();
  const [paymentResult, setPaymentResult] = useState<string>('');
  const [testScenario, setTestScenario] = useState<'valid' | 'undefined' | 'empty'>('valid');

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

  // Test different scenarios
  const getTestUserDetails = () => {
    switch (testScenario) {
      case 'valid':
        return {
          name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Test User',
          email: user.email || '',
          phone: '9999999999',
          sharing_type: 'Single Room',
          price_per_person: 5000,
          security_deposit_per_person: 10000,
          total_amount: 15000,
          amount_paid: 1000,
          amount_due: 14000,
        };
      case 'undefined':
        return undefined as any; // This should trigger the crash fix
      case 'empty':
        return {
          name: '',
          email: '',
          phone: '',
          sharing_type: '',
          price_per_person: 0,
          security_deposit_per_person: 0,
          total_amount: 0,
          amount_paid: 0,
          amount_due: 0,
        };
      default:
        return {};
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">🧪 Payment Crash Fix Test</h1>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h2 className="font-semibold text-blue-800 mb-2">🔧 CRASH FIX APPLIED:</h2>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Added safe optional chaining (?.) for userDetails access</li>
              <li>• Enhanced logging to debug prop initialization</li>
              <li>• Added null checks in destructuring</li>
              <li>• Protected button disabled condition</li>
              <li>• Safe debug info rendering</li>
            </ul>
          </div>

          <div className="mb-6">
            <h3 className="font-semibold mb-4">Test Scenarios:</h3>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="scenario"
                  value="valid"
                  checked={testScenario === 'valid'}
                  onChange={(e) => setTestScenario(e.target.value as any)}
                  className="mr-2"
                />
                Valid userDetails (should work normally)
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="scenario"
                  value="undefined"
                  checked={testScenario === 'undefined'}
                  onChange={(e) => setTestScenario(e.target.value as any)}
                  className="mr-2"
                />
                Undefined userDetails (should NOT crash)
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="scenario"
                  value="empty"
                  checked={testScenario === 'empty'}
                  onChange={(e) => setTestScenario(e.target.value as any)}
                  className="mr-2"
                />
                Empty userDetails (should show "fill details" message)
              </label>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="font-semibold mb-4">Current Test Data:</h3>
            <div className="bg-gray-50 p-4 rounded text-sm">
              <pre>{JSON.stringify(getTestUserDetails(), null, 2)}</pre>
            </div>
          </div>

          <RazorpayPayment
            amount={1000}
            propertyId="test-property-123"
            propertyName="Test Property"
            userDetails={getTestUserDetails()}
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
            <p><strong>🔧 Expected Behavior:</strong></p>
            <ul className="list-disc list-inside space-y-1">
              <li><strong>Valid:</strong> Button shows "Pay ₹1,000 Securely" and works</li>
              <li><strong>Undefined:</strong> Button shows "Please fill all details" (NO CRASH)</li>
              <li><strong>Empty:</strong> Button shows "Please fill all details"</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}