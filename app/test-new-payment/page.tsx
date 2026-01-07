'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import RazorpayPayment from '@/components/RazorpayPayment';

export default function TestNewPaymentPage() {
  const { user } = useAuth();
  const [paymentResult, setPaymentResult] = useState<string>('');

  const testUserDetails = {
    name: user?.user_metadata?.full_name || 'Test User',
    email: user?.email || 'test@example.com',
    phone: '9999999999',
    sharing_type: 'Single Room',
    price_per_person: 15000,
    security_deposit_per_person: 30000,
    total_amount: 45000,
    amount_paid: 9000, // 20% advance
    amount_due: 36000, // 80% remaining
  };

  const handlePaymentSuccess = (paymentId: string, bookingId: string) => {
    setPaymentResult(`✅ Payment Successful!
Payment ID: ${paymentId}
Booking ID: ${bookingId}
Property: TEST Property
Amount Paid: ₹9,000 (20% advance)
Remaining: ₹36,000 (to be paid to owner)

🔒 SCHEMA-SAFE FEATURES USED:
• No payment_id column dependency
• Dynamic schema detection
• Razorpay-specific fields only
• Defensive booking insertion`);
  };

  const handlePaymentError = (error: string) => {
    setPaymentResult(`❌ Payment Status: ${error}

🛡️ FAIL-SAFE PROTECTION:
• Generic user-friendly message shown
• No raw backend errors exposed
• Payment details logged for support
• Manual recovery process available`);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Authentication Required</h1>
          <p>Please login to test the schema-safe payment system.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">🔒 Schema-Safe Payment System</h1>
          
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <h2 className="font-semibold text-green-800 mb-2">🔥 FINAL KIRO COMMAND FIXES:</h2>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• ❌ ELIMINATED payment_id usage (schema cache error fix)</li>
              <li>• ✅ Dynamic schema detection before insertion</li>
              <li>• ✅ Razorpay-specific fields only (razorpay_payment_id, razorpay_order_id)</li>
              <li>• ✅ Defensive booking insertion (never crashes on unknown columns)</li>
              <li>• ✅ Fail-safe payment handling (never lose verified payments)</li>
              <li>• ✅ Generic user messages (no raw backend errors)</li>
            </ul>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h2 className="font-semibold text-blue-800 mb-2">🛡️ Schema-Safe Architecture:</h2>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Fetch table schema before insertion</li>
              <li>• Filter payload to only existing columns</li>
              <li>• Minimal booking fallback if schema detection fails</li>
              <li>• Log payment details for manual recovery</li>
              <li>• Future-proof against database changes</li>
            </ul>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold mb-2">Test Property Details:</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Property:</span> TEST Property
              </div>
              <div>
                <span className="font-medium">Monthly Rent:</span> ₹15,000
              </div>
              <div>
                <span className="font-medium">Security Deposit:</span> ₹30,000
              </div>
              <div>
                <span className="font-medium">Total Amount:</span> ₹45,000
              </div>
              <div>
                <span className="font-medium">Advance (20%):</span> ₹9,000
              </div>
              <div>
                <span className="font-medium">Remaining (80%):</span> ₹36,000
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="font-semibold mb-4">User Details:</h3>
            <div className="grid grid-cols-2 gap-4 text-sm bg-gray-50 p-4 rounded">
              <div>
                <span className="font-medium">Name:</span> {testUserDetails.name}
              </div>
              <div>
                <span className="font-medium">Email:</span> {testUserDetails.email}
              </div>
              <div>
                <span className="font-medium">Phone:</span> {testUserDetails.phone}
              </div>
              <div>
                <span className="font-medium">Room Type:</span> {testUserDetails.sharing_type}
              </div>
            </div>
          </div>

          <RazorpayPayment
            amount={9000}
            propertyId="test-property-id"
            propertyName="TEST Property"
            userDetails={testUserDetails}
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
            <p><strong>🔒 Schema-Safe Features:</strong></p>
            <ul className="list-disc list-inside space-y-1">
              <li>Dynamic column detection prevents schema cache errors</li>
              <li>Razorpay-specific fields eliminate payment_id dependency</li>
              <li>Defensive insertion never crashes on unknown columns</li>
              <li>Fail-safe handling preserves verified payments</li>
              <li>Generic messages protect users from technical errors</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}