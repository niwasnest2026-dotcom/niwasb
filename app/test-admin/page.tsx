'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

export default function TestAdminPage() {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [testResults, setTestResults] = useState<string[]>([]);

  useEffect(() => {
    testDatabaseConnection();
  }, [user]);

  const testDatabaseConnection = async () => {
    const results: string[] = [];
    
    try {
      // Test 1: Check if user is logged in
      if (!user) {
        results.push('❌ User not logged in');
        setTestResults(results);
        setLoading(false);
        return;
      }
      results.push('✅ User logged in: ' + user.email);

      // Test 2: Check admin status
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .maybeSingle();

      if (profileError) {
        results.push('❌ Profile error: ' + profileError.message);
      } else if (!profile) {
        results.push('❌ Profile not found');
      } else {
        const adminStatus = (profile as any).is_admin;
        setIsAdmin(adminStatus);
        results.push(adminStatus ? '✅ User is admin' : '❌ User is not admin');
      }

      // Test 3: Check properties table structure
      const { data: properties, error: propertiesError } = await supabase
        .from('properties')
        .select('id, name, gender_preference')
        .limit(1);

      if (propertiesError) {
        results.push('❌ Properties table error: ' + propertiesError.message);
      } else {
        results.push('✅ Properties table accessible');
        if (properties && properties.length > 0) {
          const prop = properties[0] as any;
          results.push(`✅ Sample property: ${prop.name}`);
          results.push(`✅ Gender preference field: ${prop.gender_preference || 'NULL'}`);
        }
      }

      // Test 4: Test property insertion (if admin)
      if (isAdmin) {
        try {
          const testProperty = {
            name: 'Test Property - DELETE ME',
            address: 'Test Address',
            city: 'Test City',
            property_type: 'PG',
            price: 10000,
            gender_preference: 'Co-living',
            verified: true,
            secure_booking: true,
          };

          const { data: insertedProperty, error: insertError } = await supabase
            .from('properties')
            .insert([testProperty])
            .select()
            .single();

          if (insertError) {
            results.push('❌ Property insert failed: ' + insertError.message);
            if (insertError.message.includes('row-level security')) {
              results.push('💡 Fix: Run quick-rls-fix.sql to disable RLS');
            }
          } else {
            results.push('✅ Property insert successful');
            
            // Clean up test property
            await supabase
              .from('properties')
              .delete()
              .eq('id', (insertedProperty as any).id);
            results.push('✅ Test property cleaned up');
          }
        } catch (error: any) {
          results.push('❌ Property insert error: ' + error.message);
        }
      } else {
        results.push('⚠️ Skipping insert test (not admin)');
      }

    } catch (error: any) {
      results.push('❌ Unexpected error: ' + error.message);
    }

    setTestResults(results);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Database & Admin Test</h1>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Test Results:</h2>
          
          <div className="space-y-2 font-mono text-sm">
            {testResults.map((result, index) => (
              <div 
                key={index} 
                className={`p-2 rounded ${
                  result.startsWith('✅') 
                    ? 'bg-green-50 text-green-800' 
                    : 'bg-red-50 text-red-800'
                }`}
              >
                {result}
              </div>
            ))}
          </div>

          <div className="mt-6 pt-6 border-t">
            <h3 className="font-semibold mb-2">Quick Fixes:</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>1. <strong>RLS Error:</strong> Run <code>quick-rls-fix.sql</code> (fastest fix)</li>
              <li>2. <strong>Not Admin:</strong> Run <code>admin-setup.sql</code></li>
              <li>3. <strong>Missing Tables:</strong> Run <code>simple-database-fix.sql</code></li>
              <li>4. <strong>ON CONFLICT Error:</strong> Use simple scripts instead of complete ones</li>
            </ul>
          </div>

          <div className="mt-4">
            <button
              onClick={testDatabaseConnection}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
            >
              Run Tests Again
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}