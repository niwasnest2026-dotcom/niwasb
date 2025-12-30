'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface DebugInfo {
  totalProperties: number;
  availableProperties: number;
  sampleProperties: any[];
  databaseError: string | null;
  connectionStatus: 'connected' | 'error' | 'checking';
}

export default function PropertiesDebugInfo() {
  const [debugInfo, setDebugInfo] = useState<DebugInfo>({
    totalProperties: 0,
    availableProperties: 0,
    sampleProperties: [],
    databaseError: null,
    connectionStatus: 'checking'
  });

  useEffect(() => {
    const checkDatabase = async () => {
      try {
        console.log('🔍 Debug: Checking database connection...');
        
        // Test basic connection
        const { data: testData, error: testError } = await supabase
          .from('properties')
          .select('count')
          .limit(1);

        if (testError) {
          console.error('❌ Debug: Database connection failed:', testError);
          setDebugInfo(prev => ({
            ...prev,
            connectionStatus: 'error',
            databaseError: testError.message
          }));
          return;
        }

        console.log('✅ Debug: Database connection successful');

        // Get all properties
        const { data: allProps, error: allError } = await supabase
          .from('properties')
          .select('*')
          .order('created_at', { ascending: false });

        if (allError) throw allError;

        // Get available properties
        const { data: availableProps, error: availableError } = await supabase
          .from('properties')
          .select('*')
          .eq('is_available', true)
          .order('created_at', { ascending: false });

        if (availableError) throw availableError;

        console.log('📊 Debug: Properties found:', {
          total: allProps?.length || 0,
          available: availableProps?.length || 0
        });

        setDebugInfo({
          totalProperties: allProps?.length || 0,
          availableProperties: availableProps?.length || 0,
          sampleProperties: availableProps?.slice(0, 3) || [],
          databaseError: null,
          connectionStatus: 'connected'
        });

      } catch (error: any) {
        console.error('💥 Debug: Database check failed:', error);
        setDebugInfo(prev => ({
          ...prev,
          connectionStatus: 'error',
          databaseError: error.message
        }));
      }
    };

    checkDatabase();
  }, []);

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-300 rounded-lg shadow-lg p-4 max-w-sm z-50">
      <div className="text-sm">
        <h3 className="font-bold text-gray-800 mb-2">🔍 Properties Debug Info</h3>
        
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Connection:</span>
            <span className={`font-semibold ${
              debugInfo.connectionStatus === 'connected' ? 'text-green-600' : 
              debugInfo.connectionStatus === 'error' ? 'text-red-600' : 'text-yellow-600'
            }`}>
              {debugInfo.connectionStatus === 'connected' ? '✅ Connected' :
               debugInfo.connectionStatus === 'error' ? '❌ Error' : '⏳ Checking...'}
            </span>
          </div>
          
          <div className="flex justify-between">
            <span>Total Properties:</span>
            <span className="font-semibold">{debugInfo.totalProperties}</span>
          </div>
          
          <div className="flex justify-between">
            <span>Available Properties:</span>
            <span className="font-semibold text-green-600">{debugInfo.availableProperties}</span>
          </div>

          {debugInfo.databaseError && (
            <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs">
              <strong>Error:</strong> {debugInfo.databaseError}
            </div>
          )}

          {debugInfo.sampleProperties.length > 0 && (
            <div className="mt-2">
              <strong>Sample Properties:</strong>
              <ul className="text-xs mt-1 space-y-1">
                {debugInfo.sampleProperties.map((prop, index) => (
                  <li key={prop.id} className="truncate">
                    {index + 1}. {prop.name} ({prop.area})
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-3 pt-2 border-t border-gray-200">
            <a 
              href="/admin/setup" 
              className="text-blue-600 hover:underline text-xs"
            >
              → Add Sample Properties
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}