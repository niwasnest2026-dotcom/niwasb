'use client';

import { useState } from 'react';

export default function TestEnvDebug() {
  const [envData, setEnvData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const checkEnvironment = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/test-env');
      const data = await response.json();
      setEnvData(data);
    } catch (error) {
      console.error('Error checking environment:', error);
      setEnvData({ error: 'Failed to check environment' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            Environment Variables Debug
          </h1>

          <button
            onClick={checkEnvironment}
            disabled={loading}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold disabled:opacity-50"
          >
            {loading ? 'Checking...' : 'Check Environment Variables'}
          </button>

          {envData && (
            <div className="mt-8">
              <h2 className="text-xl font-semibold mb-4">Environment Check Results:</h2>
              <pre className="bg-gray-100 p-4 rounded-lg overflow-auto text-sm">
                {JSON.stringify(envData, null, 2)}
              </pre>
            </div>
          )}

          <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h3 className="font-semibold text-yellow-800 mb-2">Debug Info:</h3>
            <p className="text-yellow-700 text-sm">
              This page helps debug environment variable loading issues. 
              If environment variables are not loading properly, it could be due to:
            </p>
            <ul className="list-disc list-inside text-yellow-700 text-sm mt-2 space-y-1">
              <li>.env file not being read in production</li>
              <li>Environment variables not set in deployment platform</li>
              <li>Caching issues with environment variables</li>
              <li>Build-time vs runtime environment variable issues</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}