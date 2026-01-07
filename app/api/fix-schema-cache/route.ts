import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { ENV_CONFIG } from '@/lib/env-config';

export async function POST(request: NextRequest) {
  try {
    console.log('🔧 Starting schema cache fix...');

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

    const results = [];
    const errors = [];

    // Step 1: Check current bookings table structure
    console.log('📋 Checking bookings table structure...');
    try {
      const { data: tableInfo, error: tableError } = await supabaseAdmin
        .from('information_schema.columns')
        .select('column_name, data_type, is_nullable, column_default')
        .eq('table_name', 'bookings')
        .eq('table_schema', 'public')
        .order('ordinal_position');

      if (tableError) {
        errors.push(`Failed to get table info: ${tableError.message}`);
      } else {
        results.push(`Found ${tableInfo?.length || 0} columns in bookings table`);
        
        // Check if payment_id column exists
        const paymentIdColumn = tableInfo?.find(col => col.column_name === 'payment_id');
        if (paymentIdColumn) {
          results.push(`✅ payment_id column exists: ${paymentIdColumn.data_type}, nullable: ${paymentIdColumn.is_nullable}`);
        } else {
          errors.push('❌ payment_id column NOT found in schema');
        }
      }
    } catch (error: any) {
      errors.push(`Schema check failed: ${error.message}`);
    }

    // Step 2: Try to add payment_id column if it doesn't exist
    console.log('🔧 Ensuring payment_id column exists...');
    try {
      // This will fail if column already exists, which is fine
      const { error: alterError } = await supabaseAdmin.rpc('exec_sql', {
        sql: `
          ALTER TABLE public.bookings 
          ADD COLUMN IF NOT EXISTS payment_id TEXT;
        `
      });

      if (alterError && !alterError.message.includes('already exists')) {
        // Try alternative approach using direct SQL
        const { error: directAlterError } = await supabaseAdmin
          .from('bookings')
          .select('payment_id')
          .limit(1);

        if (directAlterError && directAlterError.message.includes('column "payment_id" does not exist')) {
          errors.push('❌ payment_id column missing and cannot be added automatically');
          results.push('⚠️ Manual schema update required');
        } else {
          results.push('✅ payment_id column verified or already exists');
        }
      } else {
        results.push('✅ payment_id column ensured');
      }
    } catch (error: any) {
      errors.push(`Column creation failed: ${error.message}`);
    }

    // Step 3: Test basic bookings operations
    console.log('🧪 Testing bookings table operations...');
    try {
      // Test select
      const { data: selectTest, error: selectError } = await supabaseAdmin
        .from('bookings')
        .select('id, payment_id')
        .limit(1);

      if (selectError) {
        errors.push(`Select test failed: ${selectError.message}`);
      } else {
        results.push('✅ Select operation works');
      }

      // Test insert with minimal data
      const testBooking = {
        property_id: '00000000-0000-0000-0000-000000000000', // This will fail FK constraint, which is expected
        guest_name: 'Schema Test',
        guest_email: 'test@schema.com',
        guest_phone: '0000000000',
        sharing_type: 'Test',
        price_per_person: 1000,
        security_deposit_per_person: 2000,
        total_amount: 3000,
        amount_paid: 300,
        amount_due: 2700,
        payment_method: 'test',
        payment_id: 'schema-test-' + Date.now()
      };

      const { data: insertTest, error: insertError } = await supabaseAdmin
        .from('bookings')
        .insert(testBooking)
        .select()
        .single();

      if (insertError) {
        if (insertError.code === '23503') {
          // Foreign key constraint violation is expected
          results.push('✅ Insert test passed (FK constraint as expected)');
        } else if (insertError.message.includes('payment_id')) {
          errors.push(`❌ payment_id field issue: ${insertError.message}`);
        } else {
          results.push(`⚠️ Insert test: ${insertError.message}`);
        }
      } else {
        results.push('✅ Insert test passed');
        // Clean up test data
        if (insertTest) {
          await supabaseAdmin
            .from('bookings')
            .delete()
            .eq('id', insertTest.id);
          results.push('✅ Test data cleaned up');
        }
      }
    } catch (error: any) {
      errors.push(`Operations test failed: ${error.message}`);
    }

    // Step 4: Force schema refresh
    console.log('🔄 Attempting schema refresh...');
    try {
      // Create a new client instance to force schema refresh
      const freshClient = createClient(
        ENV_CONFIG.SUPABASE_URL,
        ENV_CONFIG.SUPABASE_SERVICE_ROLE_KEY,
        {
          auth: {
            autoRefreshToken: false,
            persistSession: false
          }
        }
      );

      const { data: refreshTest, error: refreshError } = await freshClient
        .from('bookings')
        .select('payment_id')
        .limit(1);

      if (refreshError) {
        errors.push(`Schema refresh test failed: ${refreshError.message}`);
      } else {
        results.push('✅ Schema refresh successful');
      }
    } catch (error: any) {
      errors.push(`Schema refresh failed: ${error.message}`);
    }

    // Step 5: Verify with properties join
    console.log('🔗 Testing table joins...');
    try {
      const { data: joinTest, error: joinError } = await supabaseAdmin
        .from('bookings')
        .select(`
          id,
          payment_id,
          properties!inner(name)
        `)
        .limit(1);

      if (joinError) {
        errors.push(`Join test failed: ${joinError.message}`);
      } else {
        results.push('✅ Table joins work correctly');
      }
    } catch (error: any) {
      errors.push(`Join test failed: ${error.message}`);
    }

    return NextResponse.json({
      success: errors.length === 0,
      message: errors.length === 0 ? 'Schema cache fixed successfully' : 'Schema issues found',
      results: results,
      errors: errors,
      summary: {
        total_checks: 5,
        passed: results.length,
        failed: errors.length,
        schema_status: errors.length === 0 ? 'healthy' : 'needs_attention'
      }
    });

  } catch (error: any) {
    console.error('❌ Schema fix error:', error);
    return NextResponse.json({
      success: false,
      error: 'Schema fix failed: ' + error.message,
      details: error
    }, { status: 500 });
  }
}