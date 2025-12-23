'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function TestConnection() {
  const [status, setStatus] = useState('Testing connection...');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    testConnection();
  }, []);

  const testConnection = async () => {
    try {
      // Test basic connection
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        throw new Error(`Auth error: ${error.message}`);
      }

      setStatus('✅ Supabase connection successful!');
      
      // Try to query a table (this will fail if tables don't exist)
      try {
        const { data: propertiesData, error: propertiesError } = await supabase
          .from('properties')
          .select('count')
          .limit(1);

        if (propertiesError) {
          setError(`Database tables not found: ${propertiesError.message}`);
        } else {
          setStatus('✅ Database connection and tables working!');
        }
      } catch (dbError: any) {
        setError(`Database error: ${dbError.message}`);
      }

    } catch (err: any) {
      setError(err.message);
      setStatus('❌ Connection failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Connection Test</h1>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-lg mb-4">{status}</p>
            
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4">
                <strong>Error:</strong> {error}
              </div>
            )}

            <div className="text-sm text-gray-600 space-y-2">
              <p><strong>Supabase URL:</strong> {process.env.NEXT_PUBLIC_SUPABASE_URL}</p>
              <p><strong>API Key:</strong> {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Configured' : 'Missing'}</p>
            </div>

            <button
              onClick={testConnection}
              className="mt-4 w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
            >
              Test Again
            </button>

            <a
              href="/"
              className="mt-2 block w-full bg-gray-600 text-white py-2 px-4 rounded hover:bg-gray-700 text-center"
            >
              Back to Home
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}