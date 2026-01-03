'use client';

import { useState } from 'react';

export default function TestBookingFixPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const testBookingInsert = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/test-booking-insert', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({ success: false, error: 'Failed to test booking insert' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            Test Booking Database Schema
          </h1>

          <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">What this tests:</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Tests if booking insert works with current database schema</li>
              <li>• Identifies which fields are required vs optional</li>
              <li>• Shows exact error messages if fields are missing</li>
              <li>• Helps fix the booking creation issue</li>
            </ul>
          </div>

          <button
            onClick={testBookingInsert}
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 mb-6"
          >
            {loading ? 'Testing...' : 'Test Booking Insert'}
          </button>

          {result && (
            <div className="bg-gray-100 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">
                {result.success ? '✅ Test Results' : '❌ Test Failed'}
              </h3>
              <pre className="text-sm overflow-auto">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}

          <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h3 className="font-semibold text-yellow-800 mb-2">Expected Issues:</h3>
            <ul className="list-disc list-inside text-yellow-700 space-y-1 text-sm">
              <li>Missing required fields (like room_id)</li>
              <li>Invalid field names (like payment_reference, duration_months)</li>
              <li>Data type mismatches</li>
              <li>Foreign key constraint violations</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}