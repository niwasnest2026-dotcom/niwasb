'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function SyncMyBookings() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [syncing, setSyncing] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleSync = async () => {
    if (!user) return;

    setSyncing(true);
    setResult(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setResult({ success: false, error: 'No active session' });
        return;
      }

      const response = await fetch('/api/sync-user-bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      const data = await response.json();
      setResult(data);

      if (data.success && data.updated_count > 0) {
        // Redirect to bookings page after successful sync
        setTimeout(() => {
          router.push('/bookings');
        }, 2000);
      }
    } catch (error: any) {
      setResult({ success: false, error: error.message });
    } finally {
      setSyncing(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    router.push('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Sync My Bookings</h1>
          
          <div className="mb-6">
            <p className="text-gray-600 mb-4">
              If you're not seeing your recent bookings, click the button below to sync them with your account.
            </p>
            <p className="text-sm text-gray-500">
              This will link any bookings made with your email address ({user.email}) to your account.
            </p>
          </div>

          <button
            onClick={handleSync}
            disabled={syncing}
            className="w-full px-6 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {syncing ? 'Syncing...' : 'Sync My Bookings'}
          </button>

          {result && (
            <div className={`mt-6 p-4 rounded-lg ${
              result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
            }`}>
              <div className={`font-semibold ${result.success ? 'text-green-800' : 'text-red-800'}`}>
                {result.success ? '✅ Success!' : '❌ Error'}
              </div>
              <div className={`text-sm mt-1 ${result.success ? 'text-green-700' : 'text-red-700'}`}>
                {result.message || result.error}
              </div>
              {result.success && result.updated_count > 0 && (
                <div className="text-sm text-green-600 mt-2">
                  Redirecting to your bookings page...
                </div>
              )}
            </div>
          )}

          <div className="mt-6 text-center">
            <button
              onClick={() => router.push('/bookings')}
              className="text-primary hover:underline"
            >
              Go to My Bookings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}