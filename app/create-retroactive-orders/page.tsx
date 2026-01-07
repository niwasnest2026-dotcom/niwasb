'use client';

import { useState } from 'react';

export default function CreateRetroactiveOrders() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const createOrders = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/create-retroactive-orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error('Error creating retroactive orders:', error);
      setResult({ 
        success: false, 
        error: 'Failed to create retroactive orders',
        fixes: [],
        errors: ['Network error or API unavailable']
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            📋 Create Retroactive Orders
          </h1>

          <div className="mb-6">
            <p className="text-gray-600 mb-4">
              This tool creates order records for previously completed payments that don't have proper order tracking. It will:
            </p>
            
            <ul className="list-disc list-inside text-gray-600 mb-6 space-y-1">
              <li>Find all bookings with payment_id but no order records</li>
              <li>Create synthetic Razorpay order IDs for tracking</li>
              <li>Link payments to proper order records</li>
              <li>Maintain payment history and audit trail</li>
              <li>Enable better payment tracking and reporting</li>
            </ul>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-blue-800 mb-2">📊 What This Creates</h3>
              <p className="text-blue-700 text-sm">
                For each existing payment, this creates an order record with:
              </p>
              <ul className="list-disc list-inside text-blue-700 text-sm mt-2 space-y-1">
                <li>Synthetic Razorpay order ID (order_retro_[payment_id])</li>
                <li>Original payment ID and amount</li>
                <li>Booking relationship and guest details</li>
                <li>Order status marked as 'paid'</li>
                <li>Original creation timestamp</li>
              </ul>
            </div>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-yellow-800 mb-2">⚠️ Prerequisites</h3>
              <p className="text-yellow-700 text-sm">
                This requires an 'orders' table in your database. If it doesn't exist, you'll need to create it manually using the SQL provided in the results.
              </p>
            </div>
            
            <button
              onClick={createOrders}
              disabled={loading}
              className="bg-purple-500 hover:bg-purple-600 text-white px-8 py-4 rounded-lg font-semibold disabled:opacity-50 text-lg"
            >
              {loading ? 'Creating Retroactive Orders...' : '🚀 Create Orders for Existing Payments'}
            </button>
          </div>

          {result && (
            <div className="mt-8">
              <div className={`p-6 rounded-lg mb-6 ${result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                <h2 className={`text-2xl font-semibold mb-4 ${result.success ? 'text-green-800' : 'text-red-800'}`}>
                  {result.success ? '✅ Orders Created Successfully!' : '❌ Some Issues Found'}
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="bg-white p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-purple-600">{result.orders_created || 0}</div>
                    <div className="text-sm text-gray-600">Orders Created</div>
                  </div>
                  <div className="bg-white p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-green-600">{result.fixes_applied || 0}</div>
                    <div className="text-sm text-gray-600">Fixes Applied</div>
                  </div>
                  <div className="bg-white p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-red-600">{result.errors_found || 0}</div>
                    <div className="text-sm text-gray-600">Errors Found</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="bg-white p-4 rounded-lg">
                    <h3 className="font-semibold text-green-700 mb-2">✅ Actions Completed</h3>
                    {result.fixes && result.fixes.length > 0 ? (
                      <ul className="text-sm text-green-600 space-y-1 max-h-40 overflow-y-auto">
                        {result.fixes.map((fix: string, index: number) => (
                          <li key={index}>• {fix}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-gray-500">No actions needed</p>
                    )}
                  </div>
                  
                  <div className="bg-white p-4 rounded-lg">
                    <h3 className="font-semibold text-red-700 mb-2">❌ Issues Found</h3>
                    {result.errors && result.errors.length > 0 ? (
                      <ul className="text-sm text-red-600 space-y-1 max-h-40 overflow-y-auto">
                        {result.errors.map((error: string, index: number) => (
                          <li key={index}>• {error}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-gray-500">No errors found</p>
                    )}
                  </div>
                </div>

                {result.table_creation_sql && (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-800 mb-2">🗄️ Database Setup (if needed)</h3>
                    <p className="text-gray-600 text-sm mb-2">
                      If the orders table doesn't exist, run this SQL in your Supabase SQL editor:
                    </p>
                    <pre className="text-xs bg-gray-800 text-green-400 p-4 rounded overflow-x-auto">
                      {result.table_creation_sql}
                    </pre>
                  </div>
                )}
              </div>

              <details className="bg-gray-50 rounded-lg p-4">
                <summary className="cursor-pointer font-semibold text-gray-700 mb-2">
                  🔍 View Full Technical Details
                </summary>
                <pre className="text-xs overflow-auto whitespace-pre-wrap bg-white p-4 rounded border">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </details>
            </div>
          )}

          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">🎯 Benefits of Retroactive Orders:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-blue-700 text-sm">
              <div>
                <h4 className="font-semibold mb-1">Payment Tracking:</h4>
                <ul className="space-y-1">
                  <li>• Complete payment audit trail</li>
                  <li>• Proper order-to-payment linking</li>
                  <li>• Better financial reporting</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-1">System Integration:</h4>
                <ul className="space-y-1">
                  <li>• Consistent data structure</li>
                  <li>• Improved admin dashboard</li>
                  <li>• Better user experience</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <h3 className="font-semibold text-green-800 mb-2">✅ After Creating Retroactive Orders:</h3>
            <ul className="text-green-700 text-sm space-y-1">
              <li>• All payments will have corresponding order records</li>
              <li>• Payment tracking will be complete and consistent</li>
              <li>• Admin reports will include all historical data</li>
              <li>• Future integrations will work with existing payments</li>
              <li>• Audit trail will be complete for all transactions</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}