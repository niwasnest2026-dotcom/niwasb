'use client';

import { useState } from 'react';

export default function FixSchemaPage() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const runSchemaValidation = async () => {
    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const response = await fetch('/api/validate-and-repair-schema', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      setResults(data);

      if (!data.success) {
        setError(data.error || 'Schema validation failed');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to run schema validation');
    } finally {
      setLoading(false);
    }
  };

  const runSchemaMigration = async () => {
    setLoading(true);
    setError(null);

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
        // Re-run validation
        await runSchemaValidation();
      } else {
        setError(data.error || 'Schema migration failed');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to run schema migration');
    } finally {
      setLoading(false);
    }
  };

  const runSchemaFix = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/fix-schema-cache', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (data.success) {
        alert('Schema cache fix completed!');
        // Re-run validation
        await runSchemaValidation();
      } else {
        setError(data.error || 'Schema cache fix failed');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to run schema cache fix');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Database Schema Diagnostics & Repair</h1>
          
          <div className="mb-6">
            <p className="text-gray-600 mb-4">
              This tool helps diagnose and fix database schema issues, particularly the "payment_id column not found" error.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <button
              onClick={runSchemaValidation}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Running...' : '🔍 Validate Schema'}
            </button>

            <button
              onClick={runSchemaMigration}
              disabled={loading}
              className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Running...' : '🔧 Migrate Schema'}
            </button>

            <button
              onClick={runSchemaFix}
              disabled={loading}
              className="bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Running...' : '🔄 Fix Cache'}
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
              {/* Summary */}
              <div className={`border rounded-lg p-4 ${
                results.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
              }`}>
                <h3 className={`font-semibold mb-2 ${
                  results.success ? 'text-green-800' : 'text-red-800'
                }`}>
                  {results.success ? '✅ Schema Status: Healthy' : '❌ Schema Issues Detected'}
                </h3>
                <p className={results.success ? 'text-green-700' : 'text-red-700'}>
                  {results.message}
                </p>
                
                {results.summary && (
                  <div className="mt-3">
                    <p className="text-sm font-medium">Status: {results.summary.status}</p>
                    <p className="text-sm">Issues Found: {results.summary.issues_found}</p>
                    <p className="text-sm">Repairs Available: {results.summary.repairs_available}</p>
                  </div>
                )}
              </div>

              {/* Validation Results */}
              {results.validation_results && results.validation_results.length > 0 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="text-green-800 font-semibold mb-3">✅ Validation Results</h3>
                  <ul className="space-y-1">
                    {results.validation_results.map((result: string, index: number) => (
                      <li key={index} className="text-green-700 text-sm">{result}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Repair Actions */}
              {results.repair_actions && results.repair_actions.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h3 className="text-yellow-800 font-semibold mb-3">🔧 Repair Actions</h3>
                  <ul className="space-y-1">
                    {results.repair_actions.map((action: string, index: number) => (
                      <li key={index} className="text-yellow-700 text-sm">{action}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Errors */}
              {results.errors && results.errors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h3 className="text-red-800 font-semibold mb-3">❌ Errors Found</h3>
                  <ul className="space-y-1">
                    {results.errors.map((error: string, index: number) => (
                      <li key={index} className="text-red-700 text-sm">{error}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Repair Instructions */}
              {results.repair_instructions && results.repair_instructions.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="text-blue-800 font-semibold mb-3">📋 Repair Instructions</h3>
                  <div className="space-y-3">
                    {results.repair_instructions.map((instruction: any, index: number) => (
                      <div key={index} className="border-l-4 border-blue-400 pl-4">
                        <h4 className="font-medium text-blue-800">{instruction.issue}</h4>
                        <p className="text-blue-700 text-sm mb-2">{instruction.description}</p>
                        <code className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                          {instruction.sqlFix}
                        </code>
                        <span className={`ml-2 px-2 py-1 rounded text-xs ${
                          instruction.priority === 'CRITICAL' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {instruction.priority}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Next Steps */}
              {results.summary && results.summary.next_steps && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h3 className="text-gray-800 font-semibold mb-3">📝 Next Steps</h3>
                  <ul className="space-y-1">
                    {results.summary.next_steps.map((step: string, index: number) => (
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
              <li><strong>Validate Schema:</strong> Check current database schema for issues</li>
              <li><strong>Migrate Schema:</strong> Create or update the bookings table with all required columns</li>
              <li><strong>Fix Cache:</strong> Refresh Supabase schema cache and test operations</li>
            </ol>
            
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
              <p className="text-yellow-800 text-sm">
                <strong>Note:</strong> If you see "payment_id column not found" errors, run "Migrate Schema" first, then "Fix Cache".
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}