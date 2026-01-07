'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FaArrowLeft, FaTools, FaSearch } from 'react-icons/fa';

export default function AdminFixBookings() {
  const [checking, setChecking] = useState(false);
  const [fixing, setFixing] = useState(false);
  const [checkResult, setCheckResult] = useState<any>(null);
  const [fixResult, setFixResult] = useState<any>(null);

  const handleCheck = async () => {
    setChecking(true);
    setCheckResult(null);

    try {
      const response = await fetch('/api/fix-booking-visibility', {
        method: 'GET',
      });

      const data = await response.json();
      setCheckResult(data);
    } catch (error: any) {
      setCheckResult({ success: false, error: error.message });
    } finally {
      setChecking(false);
    }
  };

  const handleFix = async () => {
    setFixing(true);
    setFixResult(null);

    try {
      const response = await fetch('/api/fix-booking-visibility', {
        method: 'POST',
      });

      const data = await response.json();
      setFixResult(data);
    } catch (error: any) {
      setFixResult({ success: false, error: error.message });
    } finally {
      setFixing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-6">
          <Link
            href="/admin"
            className="inline-flex items-center text-primary hover:underline mr-4"
          >
            <FaArrowLeft className="mr-2" />
            Back to Admin
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Fix Booking Visibility</h1>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Booking Visibility Issues</h2>
            <p className="text-gray-600 mb-4">
              This tool helps fix bookings that are not showing up in users' "My Bookings" page. 
              This can happen when bookings are created without proper user_id linking.
            </p>
            <p className="text-sm text-gray-500">
              The tool will match bookings to users based on email addresses and update the user_id field.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Check Issues */}
            <div className="border rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">1. Check for Issues</h3>
              <p className="text-gray-600 mb-4">
                Scan the database to identify bookings that need to be linked to user accounts.
              </p>
              
              <button
                onClick={handleCheck}
                disabled={checking}
                className="w-full flex items-center justify-center px-4 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FaSearch className="mr-2" />
                {checking ? 'Checking...' : 'Check Issues'}
              </button>

              {checkResult && (
                <div className={`mt-4 p-4 rounded-lg ${
                  checkResult.success ? 'bg-blue-50 border border-blue-200' : 'bg-red-50 border border-red-200'
                }`}>
                  <div className={`font-semibold ${checkResult.success ? 'text-blue-800' : 'text-red-800'}`}>
                    {checkResult.success ? '📊 Analysis Complete' : '❌ Error'}
                  </div>
                  {checkResult.success ? (
                    <div className="text-sm text-blue-700 mt-2">
                      <div>Orphaned Bookings: {checkResult.orphaned_bookings_count}</div>
                      <div>Potential Matches: {checkResult.potential_matches_count}</div>
                      <div>Total Users: {checkResult.total_users}</div>
                    </div>
                  ) : (
                    <div className="text-sm text-red-700 mt-1">{checkResult.error}</div>
                  )}
                </div>
              )}
            </div>

            {/* Fix Issues */}
            <div className="border rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">2. Fix Issues</h3>
              <p className="text-gray-600 mb-4">
                Automatically link orphaned bookings to their corresponding user accounts.
              </p>
              
              <button
                onClick={handleFix}
                disabled={fixing}
                className="w-full flex items-center justify-center px-4 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FaTools className="mr-2" />
                {fixing ? 'Fixing...' : 'Fix All Issues'}
              </button>

              {fixResult && (
                <div className={`mt-4 p-4 rounded-lg ${
                  fixResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                }`}>
                  <div className={`font-semibold ${fixResult.success ? 'text-green-800' : 'text-red-800'}`}>
                    {fixResult.success ? '✅ Fix Complete' : '❌ Error'}
                  </div>
                  {fixResult.success ? (
                    <div className="text-sm text-green-700 mt-2">
                      <div>Bookings Updated: {fixResult.total_updated}</div>
                      <div>Users Affected: {fixResult.users_affected}</div>
                    </div>
                  ) : (
                    <div className="text-sm text-red-700 mt-1">{fixResult.error}</div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Detailed Results */}
          {checkResult?.success && checkResult.potential_matches?.length > 0 && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Potential Matches Found</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Booking ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Guest Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Guest Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created At
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {checkResult.potential_matches.map((match: any, index: number) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                          {match.booking_id.substring(0, 8)}...
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {match.guest_email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {match.guest_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(match.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}