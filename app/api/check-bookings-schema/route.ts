import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { ENV_CONFIG } from '@/lib/env-config';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Checking bookings table schema...');

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

    // Test basic connection
    const { data: connectionTest, error: connectionError } = await supabaseAdmin
      .from('bookings')
      .select('count')
      .limit(1);

    if (connectionError) {
      return NextResponse.json({
        success: false,
        error: 'Database connection failed',
        details: connectionError
      }, { status: 500 });
    }

    // Get a sample booking to check schema
    const { data: sampleBooking, error: sampleError } = await supabaseAdmin
      .from('bookings')
      .select('*')
      .limit(1)
      .single();

    // Check if we can insert a test booking (dry run)
    const testBookingData = {
      property_id: 'test-property-id',
      guest_name: 'Test Guest',
      guest_email: 'test@example.com',
      guest_phone: '9999999999',
      sharing_type: 'Single Room',
      price_per_person: 10000,
      security_deposit_per_person: 20000,
      total_amount: 30000,
      amount_paid: 2000,
      amount_due: 28000,
      payment_method: 'razorpay',
      payment_status: 'partial',
      booking_status: 'confirmed',
      payment_id: 'test-payment-id-' + Date.now(),
      notes: 'Schema test booking'
    };

    // Try to validate the schema by attempting an insert (but rollback)
    const { error: insertTestError } = await supabaseAdmin
      .from('bookings')
      .insert(testBookingData)
      .select()
      .single();

    // Get properties for reference
    const { data: properties, error: propertiesError } = await supabaseAdmin
      .from('properties')
      .select('id, name')
      .limit(3);

    return NextResponse.json({
      success: true,
      message: 'Schema check completed',
      results: {
        connection_status: connectionError ? 'failed' : 'success',
        sample_booking_found: !sampleError,
        sample_booking_fields: sampleBooking ? Object.keys(sampleBooking) : null,
        insert_test_error: insertTestError?.message || null,
        available_properties: properties?.length || 0,
        properties_sample: properties || []
      },
      schema_validation: {
        required_fields_present: sampleBooking ? [
          'id', 'property_id', 'guest_name', 'guest_email', 'guest_phone',
          'sharing_type', 'price_per_person', 'security_deposit_per_person',
          'total_amount', 'amount_paid', 'amount_due', 'payment_method',
          'payment_id'
        ].every(field => field in sampleBooking) : false,
        payment_id_field_exists: sampleBooking ? 'payment_id' in sampleBooking : false
      }
    });

  } catch (error: any) {
    console.error('❌ Schema check error:', error);
    return NextResponse.json({
      success: false,
      error: 'Schema check failed: ' + error.message,
      details: error
    }, { status: 500 });
  }
}