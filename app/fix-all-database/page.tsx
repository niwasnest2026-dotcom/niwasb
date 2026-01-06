'use client';

import { useState } from 'react';

export default function FixAllDatabase() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const runDatabaseFix = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/fix-all-database-issues', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error('Error running database fix:', error);
      setResult({ 
        success: false, 
        error: 'Failed to run database fix',
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
            🔧 Fix All Database Issues
          </h1>

          <div className="mb-6">
            <p className="text-gray-600 mb-4">
              This tool performs a comprehensive check and fix of all database issues including:
            </p>
            
            <ul className="list-disc list-inside text-gray-600 mb-6 space-y-1">
              <li>Ensures properties table has data</li>
              <li>Validates bookings table schema</li>
              <li>Checks profiles table integrity</li>
              <li>Verifies property_rooms relationships</li>
              <li>Tests complete booking flow</li>
              <li>Fixes UUID validation issues</li>
              <li>Creates sample data if needed</li>
            </ul>
            
            <button
              onClick={runDatabaseFix}
              disabled={loading}
              className="bg-red-500 hover:bg-red-600 text-white px-8 py-4 rounded-lg font-semibold disabled:opacity-50 text-lg"
            >
              {loading ? 'Fixing Database Issues...' : '🚀 Fix All Database Issues'}
            </button>
          </div>

          {result && (
            <div className="mt-8">
              <div className={`p-6 rounded-lg mb-6 ${result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                <h2 className={`text-2xl font-semibold mb-4 ${result.success ? 'text-green-800' : 'text-red-800'}`}>
                  {result.success ? '✅ All Issues Fixed!' : '❌ Issues Found'}
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="bg-white p-4 rounded-lg">
                    <h3 className="font-semibold text-green-700 mb-2">✅ Fixes Applied ({result.fixes_applied})</h3>
                    {result.fixes && result.fixes.length > 0 ? (
                      <ul className="text-sm text-green-600 space-y-1">
                        {result.fixes.map((fix: string, index: number) => (
                          <li key={index}>• {fix}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-gray-500">No fixes needed</p>
                    )}
                  </div>
                  
                  <div className="bg-white p-4 rounded-lg">
                    <h3 className="font-semibold text-red-700 mb-2">❌ Errors Found ({result.errors_found})</h3>
                    {result.errors && result.errors.length > 0 ? (
                      <ul className="text-sm text-red-600 space-y-1">
                        {result.errors.map((error: string, index: number) => (
                          <li key={index}>• {error}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-gray-500">No errors found</p>
                    )}
                  </div>
                </div>

                {result.recommendations && result.recommendations.length > 0 && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h3 className="font-semibold text-yellow-800 mb-2">💡 Recommendations</h3>
                    <ul className="text-sm text-yellow-700 space-y-1">
                      {result.recommendations.map((rec: string, index: number) => (
                        <li key={index}>• {rec}</li>
                      ))}
                    </ul>
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
                <h4 className="font-semibold mb-1">Payment Issues:</h4>
                <ul className="space-y-1">
                  <li>• UUID validation errors</li>
                  <li>• Missing property_id references</li>
                  <li>• Invalid booking data</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-1">Database Structure:</h4>
                <ul className="space-y-1">
                  <li>• Missing sample data</li>
                  <li>• Schema inconsistencies</li>
                  <li>• Orphaned records</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}