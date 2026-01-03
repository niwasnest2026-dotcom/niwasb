'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function FixUsersPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleSyncProfiles = async () => {
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/sync-missing-profiles', {
        method: 'POST'
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

  const handleCheckStatus = async () => {
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/fix-user-count');
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
    <div className="min-h-screen py-8 px-4" style={{ 
      background: 'linear-gradient(135deg, #DEF2F1 0%, #FEFFFF 50%, #DEF2F1 100%)'
    }}>
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link href="/admin" className="hover:underline mb-2 inline-block" style={{ color: '#2B7A78' }}>
            ← Back to Admin Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Fix User Count Issue</h1>
          <p className="text-gray-600 mt-2">Diagnose and fix the user count problem in admin dashboard</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Problem Diagnosis</h2>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
            <h3 className="font-semibold text-yellow-800">Issue Identified:</h3>
            <p className="text-yellow-700 mt-1">
              The admin dashboard shows "Total Users: 1" but the profiles table is empty. 
              This happens when users sign up through Google OAuth but their profile records aren't created properly.
            </p>
          </div>

          <div className="space-y-4">
            <button
              onClick={handleCheckStatus}
              disabled={loading}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold disabled:opacity-50 mr-4"
            >
              {loading ? 'Checking...' : 'Check Current Status'}
            </button>

            <button
              onClick={handleSyncProfiles}
              disabled={loading}
              className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-semibold disabled:opacity-50"
            >
              {loading ? 'Syncing...' : 'Sync Missing Profiles'}
            </button>
          </div>
        </div>

        {result && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Result</h2>
            
            {result.success ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-semibold text-green-800">Success!</h3>
                <pre className="text-green-700 mt-2 text-sm overflow-auto">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </div>
            ) : (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h3 className="font-semibold text-red-800">Error:</h3>
                <p className="text-red-700 mt-1">{result.error}</p>
                
                {result.instructions && (
                  <div className="mt-4">
                    <h4 className="font-semibold text-red-800">Instructions:</h4>
                    <ol className="list-decimal list-inside text-red-700 mt-2 space-y-1">
                      {result.instructions.map((instruction: string, index: number) => (
                        <li key={index}>{instruction}</li>
                      ))}
                    </ol>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        <div className="bg-white rounded-xl shadow-lg p-6 mt-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Manual Steps</h2>
          <div className="space-y-4 text-gray-700">
            <div>
              <h3 className="font-semibold">Step 1: Add Service Role Key</h3>
              <p>Add <code className="bg-gray-100 px-2 py-1 rounded">SUPABASE_SERVICE_ROLE_KEY</code> to your .env file</p>
            </div>
            <div>
              <h3 className="font-semibold">Step 2: Restart Server</h3>
              <p>Restart your development server after adding the key</p>
            </div>
            <div>
              <h3 className="font-semibold">Step 3: Sync Profiles</h3>
              <p>Click "Sync Missing Profiles" to create profile records for existing users</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}