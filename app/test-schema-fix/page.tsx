'use client';

import { useState } from 'react';

export default function TestSchemaFix() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const runSchemaFix = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/fix-bookings-schema', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error('Error running schema fix:', error);
      setResult({ error: 'Failed to run schema fix' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            Bookings Schema Fix
          </h1>

          <div className="mb-6">
            <p className="text-gray-600 mb-4">
              This tool checks and fixes the bookings table schema, specifically ensuring the payment_id column exists and works correctly.
            </p>
            
            <button
              onClick={runSchemaFix}
              disabled={loading}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold disabled:opacity-50"
            >
              {loading ? 'Running Schema Fix...' : 'Run Schema Fix'}
            </button>
          </div>

          {result && (
            <div className="mt-8">
              <h2 className="text-xl font-semibold mb-4">Results:</h2>
              <div className={`p-4 rounded-lg ${result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                <pre className="text-sm overflow-auto whitespace-pre-wrap">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </div>
            </div>
          )}

          <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h3 className="font-semibold text-yellow-800 mb-2">Common Issues:</h3>
            <ul className="list-disc list-inside text-yellow-700 text-sm space-y-1">
              <li>payment_id column missing from bookings table</li>
              <li>Supabase schema cache not updated</li>
              <li>Database permissions issues</li>
              <li>Column exists but has wrong data type</li>
            </ul>
            
            <div className="mt-4">
              <h4 className="font-semibold text-yellow-800 mb-2">Manual Fix (if needed):</h4>
              <p className="text-yellow-700 text-sm mb-2">
                If the automatic fix fails, run this SQL in your Supabase SQL editor:
              </p>
              <code className="block bg-yellow-100 p-2 rounded text-xs">
                ALTER TABLE bookings ADD COLUMN IF NOT EXISTS payment_id TEXT;
              </code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}