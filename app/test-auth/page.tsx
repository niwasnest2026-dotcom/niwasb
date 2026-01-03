'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

export default function TestAuthPage() {
  const { user } = useAuth();
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testAuth = async () => {
    setLoading(true);
    setResult(null);

    try {
      // Get the session token properly from Supabase
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      console.log('Session:', session);
      console.log('Token:', token?.substring(0, 50) + '...');

      const response = await fetch('/api/test-auth', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });

      const data = await response.json();
      setResult(data);
    } catch (error: any) {
      setResult({
        success: false,
        error: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Authentication Test</h1>
        
        <div className="bg-gray-100 p-4 rounded mb-6">
          <h2 className="font-bold mb-2">Current User:</h2>
          {user ? (
            <pre className="text-sm">{JSON.stringify(user, null, 2)}</pre>
          ) : (
            <p>Not logged in</p>
          )}
        </div>

        <button
          onClick={testAuth}
          disabled={loading || !user}
          className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {loading ? 'Testing...' : 'Test Authentication'}
        </button>

        {result && (
          <div className="mt-6 bg-gray-100 p-4 rounded">
            <h2 className="font-bold mb-2">API Response:</h2>
            <pre className="text-sm">{JSON.stringify(result, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  );
}