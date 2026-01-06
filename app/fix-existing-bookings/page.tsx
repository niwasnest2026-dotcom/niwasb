'use client';

import { useState } from 'react';

export default function FixExistingBookings() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const runBookingsFix = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/fix-existing-bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error('Error running bookings fix:', error);
      setResult({ 
        success: false, 
        error: 'Failed to run bookings fix',
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
            🔧 Fix Existing Bookings
          </h1>

          <div className="mb-6">
            <p className="text-gray-600 mb-4">
              This tool fixes existing bookings that aren't showing up in user profiles or admin panel by:
            </p>
            
            <ul className="list-disc list-inside text-gray-600 mb-6 space-y-1">
              <li>Linking bookings to user accounts by matching email addresses</li>
              <li>Adding missing room_id to bookings (creates rooms if needed)</li>
              <li>Extracting payment_id from booking notes if missing</li>
              <li>Ensuring all bookings have proper relationships</li>
              <li>Making bookings visible in user profiles and admin panel</li>
            </ul>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-yellow-800 mb-2">⚠️ Important</h3>
              <p className="text-yellow-700 text-sm">
                This will update existing booking records to ensure they appear correctly. 
                Run this if users have made payments but can't see their bookings.
              </p>
            </div>
            
            <button
              onClick={runBookingsFix}
              disabled={loading}
              className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-lg font-semibold disabled:opacity-50 text-lg"
            >
              {loading ? 'Fixing Existing Bookings...' : '🚀 Fix All Existing Bookings'}
            </button>
          </div>

          {result && (
            <div className="mt-8">
              <div className={`p-6 rounded-lg mb-6 ${result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                <h2 className={`text-2xl font-semibold mb-4 ${result.success ? 'text-green-800' : 'text-red-800'}`}>
                  {result.success ? '✅ Bookings Fixed Successfully!' : '❌ Some Issues Found'}
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="bg-white p-4 rounded-lg">
                    <h3 className="font-semibold text-green-700 mb-2">✅ Fixes Applied ({result.fixes_applied})</h3>
                    {result.fixes && result.fixes.length > 0 ? (
                      <ul className="text-sm text-green-600 space-y-1 max-h-40 overflow-y-auto">
                        {result.fixes.map((fix: string, index: number) => (
                          <li key={index}>• {fix}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-gray-500">No fixes needed - all bookings are already properly configured</p>
                    )}
                  </div>
                  
                  <div className="bg-white p-4 rounded-lg">
                    <h3 className="font-semibold text-red-700 mb-2">❌ Errors Found ({result.errors_found})</h3>
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

                {result.final_bookings_sample && result.final_bookings_sample.length > 0 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="font-semibold text-blue-800 mb-2">📋 Recent Bookings Sample</h3>
                    <div className="space-y-2">
                      {result.final_bookings_sample.slice(0, 5).map((booking: any, index: number) => (
                        <div key={booking.id} className="bg-white p-3 rounded text-sm">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                            <div><strong>Guest:</strong> {booking.guest_name}</div>
                            <div><strong>Email:</strong> {booking.guest_email}</div>
                            <div><strong>User ID:</strong> {booking.user_id ? '✅ Linked' : '❌ Missing'}</div>
                            <div><strong>Room ID:</strong> {booking.room_id ? '✅ Assigned' : '❌ Missing'}</div>
                          </div>
                        </div>
                      ))}
                    </div>
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
            <h3 className="font-semibold text-blue-800 mb-2">🎯 What This Fixes:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-blue-700 text-sm">
              <div>
                <h4 className="font-semibold mb-1">User Profile Issues:</h4>
                <ul className="space-y-1">
                  <li>• Bookings not showing in "My Bookings"</li>
                  <li>• Missing user account links</li>
                  <li>• Email address mismatches</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-1">Admin Panel Issues:</h4>
                <ul className="space-y-1">
                  <li>• Bookings not visible to admin</li>
                  <li>• Missing room assignments</li>
                  <li>• Payment ID tracking problems</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <h3 className="font-semibold text-green-800 mb-2">✅ After Running This Fix:</h3>
            <ul className="text-green-700 text-sm space-y-1">
              <li>• All existing bookings will be linked to user accounts</li>
              <li>• Users will see their bookings in their profile</li>
              <li>• Admin panel will show all bookings with complete details</li>
              <li>• Payment tracking will work properly</li>
              <li>• Room assignments will be complete</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}