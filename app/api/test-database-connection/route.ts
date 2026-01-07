import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { ENV_CONFIG } from '@/lib/env-config';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Testing database connection and schema...');

    // Create admin client
    const supabaseAdmin = createClient(
      ENV_CONFIG.SUPABASE_URL,
      ENV_CONFIG.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Test 1: Basic connection
    console.log('📡 Testing basic connection...');
    const { data: connectionTest, error: connectionError } = await supabaseAdmin
      .from('properties')
      .select('count')
      .limit(1);

    if (connectionError) {
      return NextResponse.json({
        success: false,
        error: 'Database connection failed',
        details: connectionError
      }, { status: 500 });
    }

    // Test 2: Check bookings table structure
    console.log('📋 Checking bookings table...');
    const { data: bookingsTest, error: bookingsError } = await supabaseAdmin
      .from('bookings')
      .select('*')
      .limit(1);

    // Test 3: Try to get table info using raw SQL
    console.log('🔍 Getting table schema info...');
    const { data: schemaInfo, error: schemaError } = await supabaseAdmin
      .rpc('get_table_columns', { table_name: 'bookings' })
      .single();

    // If RPC doesn't exist, try direct query
    let columnInfo = null;
    if (schemaError) {
      const { data: directSchema, error: directError } = await supabaseAdmin
        .from('information_schema.columns')
        .select('column_name, data_type, is_nullable')
        .eq('table_name', 'bookings')
        .eq('table_schema', 'public');
      
      columnInfo = { direct_query: directSchema, error: directError };
    }

    // Test 4: Try a simple insert test (will rollback)
    console.log('🧪 Testing insert capability...');
    const testData = {
      property_id: '00000000-0000-0000-0000-000000000000', // Invalid UUID for test
      guest_name: 'Test Guest',
      guest_email: 'test@example.com',
      guest_phone: '9999999999',
      sharing_type: 'Test',
      price_per_person: 1000,
      security_deposit_per_person: 2000,
      total_amount: 3000,
      amount_paid: 300,
      amount_due: 2700,
      payment_method: 'test',
      payment_id: 'test-' + Date.now()
    };

    const { data: insertTest, error: insertError } = await supabaseAdmin
      .from('bookings')
      .insert(testData)
      .select()
      .single();

    // Clean up test data if it was inserted
    if (insertTest) {
      await supabaseAdmin
        .from('bookings')
        .delete()
        .eq('id', insertTest.id);
    }

    return NextResponse.json({
      success: true,
      message: 'Database tests completed',
      results: {
        connection: {
          status: connectionError ? 'failed' : 'success',
          error: connectionError?.message
        },
        bookings_table: {
          accessible: !bookingsError,
          sample_data: bookingsTest ? 'found' : 'empty',
          error: bookingsError?.message
        },
        schema_info: {
          rpc_available: !schemaError,
          rpc_data: schemaInfo,
          column_info: columnInfo
        },
        insert_test: {
          can_insert: !insertError || insertError.code === '23503', // Foreign key constraint is expected
          error: insertError?.message,
          error_code: insertError?.code
        }
      },
      environment: {
        supabase_url: ENV_CONFIG.SUPABASE_URL ? 'configured' : 'missing',
        service_key: ENV_CONFIG.SUPABASE_SERVICE_ROLE_KEY ? 'configured' : 'missing'
      }
    });

  } catch (error: any) {
    console.error('❌ Database test error:', error);
    return NextResponse.json({
      success: false,
      error: 'Database test failed: ' + error.message,
      details: error
    }, { status: 500 });
  }
}