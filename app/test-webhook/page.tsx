'use client';

import { useState } from 'react';

export default function TestWebhookPage() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testWebhook = async (eventType: string) => {
    setLoading(true);
    try {
      // Simulate webhook payload
      const webhookPayload = {
        event: eventType,
        payload: {
          payment: {
            entity: {
              id: 'pay_test_' + Date.now(),
              amount: 200, // ₹2 in paise
              currency: 'INR',
              status: eventType === 'payment.captured' ? 'captured' : 
                     eventType === 'payment.authorized' ? 'authorized' : 'failed',
              order_id: 'order_test_' + Date.now(),
              method: 'card',
              error_description: eventType === 'payment.failed' ? 'Payment declined by bank' : null
            }
          },
          order: {
            entity: {
              id: 'order_test_' + Date.now(),
              amount: 200,
              currency: 'INR',
              status: 'paid'
            }
          }
        }
      };

      // Note: This is just for testing the webhook structure
      // In production, webhooks come directly from Razorpay
      console.log('Test webhook payload:', webhookPayload);
      
      setResult({
        success: true,
        message: `Webhook test for ${eventType} prepared`,
        payload: webhookPayload,
        note: 'This is a test payload. Real webhooks come from Razorpay servers.'
      });
    } catch (error: any) {
      setResult({
        success: false,
        error: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Webhook Testing</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Automatic Payment Updates</h2>
          <p className="text-gray-600 mb-6">
            Test different webhook events to see how the system handles automatic payment updates.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button
              onClick={() => testWebhook('payment.authorized')}
              disabled={loading}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-3 rounded-md font-medium disabled:opacity-50"
            >
              Payment Authorized
            </button>
            
            <button
              onClick={() => testWebhook('payment.captured')}
              disabled={loading}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-3 rounded-md font-medium disabled:opacity-50"
            >
              Payment Captured
            </button>
            
            <button
              onClick={() => testWebhook('payment.failed')}
              disabled={loading}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-3 rounded-md font-medium disabled:opacity-50"
            >
              Payment Failed
            </button>
            
            <button
              onClick={() => testWebhook('order.paid')}
              disabled={loading}
              className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-3 rounded-md font-medium disabled:opacity-50"
            >
              Order Paid
            </button>
          </div>
        </div>

        {result && (
          <div className={`rounded-lg p-6 ${result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
            <h3 className={`text-lg font-semibold mb-2 ${result.success ? 'text-green-800' : 'text-red-800'}`}>
              {result.success ? '✅ Test Result' : '❌ Error'}
            </h3>
            <p className={`mb-4 ${result.success ? 'text-green-700' : 'text-red-700'}`}>
              {result.message || result.error}
            </p>
            {result.payload && (
              <div className="mt-4">
                <h4 className="font-medium mb-2">Webhook Payload:</h4>
                <pre className="bg-gray-100 p-3 rounded-md overflow-auto text-xs">
                  {JSON.stringify(result.payload, null, 2)}
                </pre>
              </div>
            )}
            {result.note && (
              <div className="mt-4 p-3 bg-yellow-100 border border-yellow-200 rounded-md">
                <p className="text-yellow-800 text-sm">{result.note}</p>
              </div>
            )}
          </div>
        )}

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-6">
          <h3 className="text-lg font-semibold text-blue-800 mb-2">Current Automatic Payment Features:</h3>
          <ul className="list-disc list-inside text-blue-700 space-y-1 text-sm">
            <li><strong>Real-time Booking Creation:</strong> Every successful payment creates a booking immediately</li>
            <li><strong>Profile Updates:</strong> Bookings appear in user profile automatically</li>
            <li><strong>Admin Dashboard:</strong> New bookings show up in admin panel instantly</li>
            <li><strong>Payment Tracking:</strong> All payment IDs are stored and linked to bookings</li>
            <li><strong>Owner Details:</strong> Contact information becomes available after payment</li>
            <li><strong>Webhook Processing:</strong> Handles payment status changes from Razorpay</li>
            <li><strong>Bed Availability:</strong> Automatically updates room availability</li>
            <li><strong>Failure Handling:</strong> Restores availability if payment fails</li>
          </ul>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mt-6">
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">Webhook Configuration:</h3>
          <div className="text-yellow-700 text-sm space-y-2">
            <p><strong>Webhook URL:</strong> https://www.niwasnest.com/api/razorpay-webhook</p>
            <p><strong>Events to Subscribe:</strong></p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>payment.authorized - When payment is authorized</li>
              <li>payment.captured - When payment is successfully captured</li>
              <li>payment.failed - When payment fails</li>
              <li>order.paid - When order is fully paid</li>
            </ul>
            <p className="mt-3"><strong>Note:</strong> Configure these webhooks in your Razorpay Dashboard for automatic updates.</p>
          </div>
        </div>

        <div className="flex gap-4 mt-6">
          <a
            href="/test-payment-flow"
            className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-md font-medium"
          >
            Test Payment Flow
          </a>
          <a
            href="/admin/bookings"
            className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-md font-medium"
          >
            View Admin Bookings
          </a>
          <a
            href="/profile"
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-md font-medium"
          >
            View Profile
          </a>
        </div>
      </div>
    </div>
  );
}