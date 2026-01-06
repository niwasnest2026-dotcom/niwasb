'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function FixMissingBookingPage() {
  const [paymentId, setPaymentId] = useState('pay_SWKcJlI4CbfU0'); // Your recent payment ID
  const [guestName, setGuestName] = useState('Kushal');
  const [amount, setAmount] = useState(2);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [debugResult, setDebugResult] = useState<any>(null);

  const debugBooking = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/debug-recent-booking?paymentId=${paymentId}`);
      const data = await response.json();
      setDebugResult(data);
    } catch (error: any) {
      setDebugResult({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const fixBooking = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      if (!token) {
        setResult({ error: 'Please login first' });
        return;
      }

      const response = await fetch('/api/fix-missing-booking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          payment_id: paymentId,
          guest_name: guestName,
          amount: amount
        }),
      });

      const data = await response.json();
      setResult(data);
    } catch (error: any) {
      setResult({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Fix Missing Booking</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Debug Section */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Debug Booking</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment ID:
                </label>
                <input
                  type="text"
                  value={paymentId}
                  onChange={(e) => setPaymentId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              
              <button
                onClick={debugBooking}
                disabled={loading}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md font-medium disabled:opacity-50"
              >
                {loading ? 'Checking...' : 'Check Booking Status'}
              </button>
            </div>

            {debugResult && (
              <div className="mt-4">
                <h3 className="font-medium mb-2">Debug Results:</h3>
                <pre className="bg-gray-100 p-3 rounded-md overflow-auto text-xs">
                  {JSON.stringify(debugResult, null, 2)}
                </pre>
              </div>
            )}
          </div>

          {/* Fix Section */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Create Missing Booking</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment ID:
                </label>
                <input
                  type="text"
                  value={paymentId}
                  onChange={(e) => setPaymentId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Guest Name:
                </label>
                <input
                  type="text"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount Paid (₹):
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              
              <button
                onClick={fixBooking}
                disabled={loading}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-md font-medium disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create Booking'}
              </button>
            </div>

            {result && (
              <div className="mt-4">
                <h3 className="font-medium mb-2">Results:</h3>
                <pre className="bg-gray-100 p-3 rounded-md overflow-auto text-xs">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">Instructions:</h3>
          <ol className="list-decimal list-inside text-yellow-700 space-y-1">
            <li>First, click "Check Booking Status" to see if your booking exists</li>
            <li>If no booking is found, click "Create Booking" to create it manually</li>
            <li>After creating, go to your profile to see the booking</li>
            <li>The booking will be linked to a TEST property with owner details</li>
          </ol>
        </div>

        {/* Quick Links */}
        <div className="mt-6 flex gap-4">
          <a
            href="/profile"
            className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-md font-medium"
          >
            Go to Profile
          </a>
          <a
            href="/bookings"
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-md font-medium"
          >
            View My Bookings
          </a>
        </div>
      </div>
    </div>
  );
}