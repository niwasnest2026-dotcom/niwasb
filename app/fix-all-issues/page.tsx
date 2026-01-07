'use client';

import { useState } from 'react';

export default function FixAllIssuesPage() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const runComprehensiveTest = async () => {
    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const response = await fetch('/api/test-payment-system', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      setResults(data);

      if (!data.success) {
        setError(data.error || 'Payment system test failed');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to run payment system test');
    } finally {
      setLoading(false);
    }
  };

  const fixImages = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/fix-image-urls', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (data.success) {
        alert(`Image fix completed! ${data.summary.fixes_applied} images fixed.`);
        // Re-run comprehensive test
        await runComprehensiveTest();
      } else {
        setError(data.error || 'Image fix failed');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fix images');
    } finally {
      setLoading(false);
    }
  };

  const fixSchema = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/migrate-bookings-schema', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (data.success) {
        alert('Schema migration completed successfully!');
        // Re-run comprehensive test
        await runComprehensiveTest();
      } else {
        setError(data.error || 'Schema migration failed');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to migrate schema');
    } finally {
      setLoading(false);
    }
  };

  const fixAllIssues = async () => {
    setLoading(true);
    setError(null);

    try {
      // Step 1: Fix schema
      console.log('Step 1: Fixing schema...');
      await fetch('/api/migrate-bookings-schema', { method: 'POST' });
      
      // Step 2: Fix images
      console.log('Step 2: Fixing images...');
      await fetch('/api/fix-image-urls', { method: 'POST' });
      
      // Step 3: Fix schema cache
      console.log('Step 3: Fixing schema cache...');
      await fetch('/api/fix-schema-cache', { method: 'POST' });
      
      // Step 4: Run comprehensive test
      console.log('Step 4: Running final test...');
      await runComprehensiveTest();
      
      alert('All fixes completed! Check the results below.');
    } catch (err: any) {
      setError(err.message || 'Failed to fix all issues');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">🔧 Fix All System Issues</h1>
          
          <div className="mb-6">
            <p className="text-gray-600 mb-4">
              This comprehensive tool fixes all known issues with the payment system, database schema, and image loading.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <button
              onClick={runComprehensiveTest}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Testing...' : '🔍 Test System'}
            </button>

            <button
              onClick={fixSchema}
              disabled={loading}
              className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Fixing...' : '🗄️ Fix Schema'}
            </button>

            <button
              onClick={fixImages}
              disabled={loading}
              className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Fixing...' : '🖼️ Fix Images'}
            </button>

            <button
              onClick={fixAllIssues}
              disabled={loading}
              className="bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Fixing...' : '🚀 Fix Everything'}
            </button>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <h3 className="text-red-800 font-semibold mb-2">Error</h3>
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {/* Results Display */}
          {results && (
            <div className="space-y-6">
              {/* System Status */}
              <div className={`border rounded-lg p-6 ${
                results.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
              }`}>
                <h3 className={`text-xl font-bold mb-3 ${
                  results.success ? 'text-green-800' : 'text-red-800'
                }`}>
                  {results.success ? '✅ System Status: READY' : '❌ System Status: NEEDS ATTENTION'}
                </h3>
                <p className={`mb-4 ${results.success ? 'text-green-700' : 'text-red-700'}`}>
                  {results.message}
                </p>
                
                {results.summary && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold">{results.summary.passed}</div>
                      <div className="text-sm">Tests Passed</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{results.summary.failed}</div>
                      <div className="text-sm">Issues Found</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{results.summary.critical_issues}</div>
                      <div className="text-sm">Critical Issues</div>
                    </div>
                    <div className="text-center">
                      <div className={`text-2xl font-bold ${
                        results.summary.system_status === 'READY' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {results.summary.system_status}
                      </div>
                      <div className="text-sm">System Status</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Tests Passed */}
              {results.tests_passed && results.tests_passed.length > 0 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="text-green-800 font-semibold mb-3">✅ Tests Passed</h3>
                  <ul className="space-y-1">
                    {results.tests_passed.map((test: string, index: number) => (
                      <li key={index} className="text-green-700 text-sm">{test}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Errors Found */}
              {results.errors_found && results.errors_found.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h3 className="text-red-800 font-semibold mb-3">❌ Issues Found</h3>
                  <ul className="space-y-1">
                    {results.errors_found.map((error: string, index: number) => (
                      <li key={index} className="text-red-700 text-sm">{error}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Recommendations */}
              {results.recommendations && results.recommendations.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="text-blue-800 font-semibold mb-3">💡 Recommendations</h3>
                  <div className="space-y-3">
                    {results.recommendations.map((rec: any, index: number) => (
                      <div key={index} className="border-l-4 border-blue-400 pl-4">
                        <h4 className="font-medium text-blue-800">{rec.issue}</h4>
                        <p className="text-blue-700 text-sm mb-2">{rec.action}</p>
                        {rec.endpoint && (
                          <code className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                            {rec.endpoint}
                          </code>
                        )}
                        <span className={`ml-2 px-2 py-1 rounded text-xs ${
                          rec.priority === 'CRITICAL' ? 'bg-red-100 text-red-800' : 
                          rec.priority === 'HIGH' ? 'bg-orange-100 text-orange-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {rec.priority}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Next Steps */}
              {results.next_steps && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h3 className="text-gray-800 font-semibold mb-3">📝 Next Steps</h3>
                  <ul className="space-y-1">
                    {results.next_steps.map((step: string, index: number) => (
                      <li key={index} className="text-gray-700 text-sm">• {step}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Instructions */}
          <div className="mt-8 bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h3 className="text-gray-800 font-semibold mb-3">📖 How to Use</h3>
            <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
              <li><strong>Test System:</strong> Run comprehensive diagnostics to identify all issues</li>
              <li><strong>Fix Schema:</strong> Create/update database tables and columns</li>
              <li><strong>Fix Images:</strong> Replace invalid image URLs with working ones</li>
              <li><strong>Fix Everything:</strong> Run all fixes automatically in sequence</li>
            </ol>
            
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded">
              <p className="text-green-800 text-sm">
                <strong>Recommended:</strong> Click "Fix Everything" to automatically resolve all known issues, then test your payment flow.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}