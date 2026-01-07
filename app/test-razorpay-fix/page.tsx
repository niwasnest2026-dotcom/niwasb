'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

export default function TestRazorpayFixPage() {
  const { user } = useAuth();
  const [testResult, setTestResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testRazorpayVerification = async () => {
    setLoading(true);
    setTestResult(null);

    try {
      // Test with sample Razorpay data
      const testData = {
        razorpay_order_id: 'order_test_123456789',
        razorpay_payment_id: 'pay_test_987654321',
        razorpay_signature: 'dummy_signature_for_testing'
      };

      const response = await fetch('/api/test-razorpay-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testData),
      });

      const result = await response.json();
      setTestResult(result);

    } catch (error: any) {
      setTestResult({
        success: false,
        error: error.message,
        type: 'network_error'
      });
    } finally {
      setLoading(false);
    }
  };

  const testFullPaymentFlow = async () => {
    if (!user) {
      alert('Please login first to test payment flow');
      return;
    }

    setLoading(true);
    setTestResult(null);

    try {
      // Step 1: Create order
      console.log('🔄 Step 1: Creating test order...');
      
      const orderPayload = {
        propertyId: 'test-property-123',
        amount: 1000,
        userDetails: {
          name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Test User',
          email: user.email || '',
          phone: '9999999999'
        }
      };

      const { data: { session } } = await supabase.auth.getSession();
      
      const orderResponse = await fetch('/api/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify(orderPayload),
      });

      const orderData = await orderResponse.json();
      console.log('✅ Order created:', orderData);

      if (!orderData.success) {
        throw new Error(`Order creation failed: ${orderData.error}`);
      }

      // Step 2: Simulate payment verification (with test signature)
      console.log('🔄 Step 2: Testing payment verification...');
      
      // Use a test signature (the backend will generate the correct one for comparison)
      const verifyPayload = {
        razorpay_order_id: orderData.order_id,
        razorpay_payment_id: 'pay_test_123456789',
        razorpay_signature: 'test_signature_will_fail_but_shows_process',
        propertyId: 'test-property-123',
        userDetails: orderPayload.userDetails
      };

      const verifyResponse = await fetch('/api/verify-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify(verifyPayload),
      });

      const verifyData = await verifyResponse.json();
      console.log('✅ Verification result:', verifyData);

      setTestResult({
        success: true,
        test_type: 'full_payment_flow',
        order_creation: orderData,
        payment_verification: verifyData,
        verification_successful: verifyData.success
      });

    } catch (error: any) {
      console.error('❌ Full payment flow test error:', error);
      setTestResult({
        success: false,
        error: error.message,
        type: 'full_flow_error'
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Please Login First</h1>
          <p>You need to be logged in to test the Razorpay verification fix.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">🔧 Razorpay Verification Fix Test</h1>
          
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <h2 className="font-semibold text-red-800 mb-2">🚨 ISSUE IDENTIFIED:</h2>
            <ul className="text-sm text-red-700 space-y-1">
              <li>• Razorpay verification API failing with 500 errors</li>
              <li>• Payments succeed but bookings not created</li>
              <li>• Possible signature verification or environment variable issues</li>
            </ul>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <h2 className="font-semibold text-green-800 mb-2">✅ FIXES APPLIED:</h2>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• Enhanced logging for signature verification</li>
              <li>• Added environment variable validation</li>
              <li>• Confirmed NO API calls to Razorpay (local verification only)</li>
              <li>• Better error handling and debugging</li>
            </ul>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <button
              onClick={testRazorpayVerification}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all disabled:opacity-50"
            >
              {loading ? 'Testing...' : '🧪 Test Signature Verification'}
            </button>

            <button
              onClick={testFullPaymentFlow}
              disabled={loading}
              className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-all disabled:opacity-50"
            >
              {loading ? 'Testing...' : '🔄 Test Full Payment Flow'}
            </button>
          </div>

          {testResult && (
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="font-semibold mb-4">Test Results:</h3>
              <pre className="text-sm bg-white p-4 rounded border overflow-auto max-h-96">
                {JSON.stringify(testResult, null, 2)}
              </pre>
              
              {testResult.success && testResult.verification_result && (
                <div className="mt-4 p-4 bg-blue-50 rounded">
                  <h4 className="font-semibold text-blue-800 mb-2">Signature Verification Analysis:</h4>
                  <div className="text-sm text-blue-700 space-y-1">
                    <div>✅ Secret Key Available: {testResult.verification_result.secret_available ? 'Yes' : 'No'}</div>
                    <div>✅ Secret Key Length: {testResult.verification_result.secret_length} characters</div>
                    <div>✅ Signature Valid: {testResult.verification_result.is_valid ? 'Yes' : 'No'}</div>
                  </div>
                </div>
              )}

              {testResult.success && testResult.payment_verification && (
                <div className="mt-4 p-4 bg-green-50 rounded">
                  <h4 className="font-semibold text-green-800 mb-2">Payment Flow Analysis:</h4>
                  <div className="text-sm text-green-700 space-y-1">
                    <div>✅ Order Creation: {testResult.order_creation?.success ? 'Success' : 'Failed'}</div>
                    <div>✅ Payment Verification: {testResult.verification_successful ? 'Success' : 'Failed'}</div>
                    {testResult.payment_verification.booking_id && (
                      <div>✅ Booking Created: {testResult.payment_verification.booking_id}</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="mt-6 text-xs text-gray-500 space-y-2">
            <p><strong>🔧 Debug Info:</strong></p>
            <ul className="list-disc list-inside space-y-1">
              <li>Environment: {process.env.NODE_ENV}</li>
              <li>User ID: {user.id}</li>
              <li>User Email: {user.email}</li>
              <li>This test uses local signature generation to verify the fix</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}