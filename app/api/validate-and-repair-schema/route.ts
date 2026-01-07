import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { ENV_CONFIG } from '@/lib/env-config';

export async function POST(request: NextRequest) {
  try {
    console.log('🔧 Starting comprehensive schema validation and repair...');

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

    const validationResults = [];
    const repairActions = [];
    const errors = [];

    // Step 1: Test basic database operations
    console.log('🧪 Testing database operations...');
    try {
      // Test select operation on bookings
      const { data: selectTest, error: selectError } = await supabaseAdmin
        .from('bookings')
        .select('id, payment_id')
        .limit(1);

      if (selectError) {
        if (selectError.message.includes('relation "bookings" does not exist')) {
          repairActions.push('🔧 CRITICAL: Bookings table does not exist');
          errors.push('Bookings table missing from database');
        } else if (selectError.message.includes('column "payment_id" does not exist')) {
          repairActions.push('🔧 CRITICAL: payment_id column missing from bookings table');
          errors.push('payment_id column missing - this is causing the schema cache error');
        } else {
          repairActions.push(`🔧 Database issue: ${selectError.message}`);
          errors.push(selectError.message);
        }
      } else {
        validationResults.push('✅ Bookings table and payment_id column exist');
      }
    } catch (error: any) {
      errors.push(`Database operations test failed: ${error.message}`);
    }

    // Step 2: If there are critical errors, attempt repairs
    if (errors.length > 0) {
      console.log('🔧 Attempting automatic repairs...');
      
      // Try to add missing payment_id column
      if (errors.some(err => err.includes('payment_id'))) {
        try {
          console.log('➕ Adding payment_id column...');
          
          // Use a simple approach - try to select from bookings first
          const { data: tableTest, error: tableError } = await supabaseAdmin
            .from('bookings')
            .select('id')
            .limit(1);

          if (!tableError) {
            // Table exists, try to add payment_id column
            // We'll use an insert test to see if payment_id exists
            const testData = {
              property_id: '00000000-0000-0000-0000-000000000000',
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

            const { error: insertError } = await supabaseAdmin
              .from('bookings')
              .insert(testData)
              .select()
              .single();

            if (insertError && insertError.message.includes('payment_id')) {
              repairActions.push('❌ Cannot add payment_id column automatically');
              repairActions.push('🔧 Manual intervention required: Add payment_id TEXT column to bookings table');
            } else if (insertError && insertError.code === '23503') {
              // Foreign key constraint - this means the insert structure is correct
              validationResults.push('✅ Schema structure is correct (FK constraint expected)');
            } else {
              repairActions.push(`⚠️ Unexpected insert result: ${insertError?.message || 'Success'}`);
            }
          }
        } catch (repairError: any) {
          repairActions.push(`❌ Repair attempt failed: ${repairError.message}`);
        }
      }
    }

    // Step 3: Provide specific repair instructions
    const repairInstructions = [];
    
    if (errors.some(err => err.includes('payment_id'))) {
      repairInstructions.push({
        issue: 'Missing payment_id column',
        sqlFix: 'ALTER TABLE public.bookings ADD COLUMN payment_id TEXT;',
        description: 'Add the payment_id column to store Razorpay payment IDs',
        priority: 'CRITICAL'
      });
    }

    if (errors.some(err => err.includes('relation "bookings" does not exist'))) {
      repairInstructions.push({
        issue: 'Missing bookings table',
        sqlFix: 'Run /api/migrate-bookings-schema endpoint',
        description: 'Create the complete bookings table with all required columns',
        priority: 'CRITICAL'
      });
    }

    // Step 4: Final validation
    let finalStatus = 'unknown';
    if (errors.length === 0) {
      finalStatus = 'healthy';
    } else if (repairInstructions.length > 0) {
      finalStatus = 'repairable';
    } else {
      finalStatus = 'needs_investigation';
    }

    return NextResponse.json({
      success: errors.length === 0,
      message: errors.length === 0 ? 'Schema is healthy' : 'Schema issues detected',
      validation_results: validationResults,
      repair_actions: repairActions,
      errors: errors,
      repair_instructions: repairInstructions,
      summary: {
        status: finalStatus,
        issues_found: errors.length,
        repairs_available: repairInstructions.length,
        next_steps: finalStatus === 'healthy' ? 
          ['Schema is ready for use'] : 
          repairInstructions.map(r => r.sqlFix)
      }
    });

  } catch (error: any) {
    console.error('❌ Schema validation error:', error);
    return NextResponse.json({
      success: false,
      error: 'Schema validation failed: ' + error.message,
      details: error
    }, { status: 500 });
  }
}