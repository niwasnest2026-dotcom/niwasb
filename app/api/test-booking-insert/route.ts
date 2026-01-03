import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST() {
  try {
    console.log('🧪 Testing booking insert with minimal data...');

    // Create admin client if service role key is available
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!serviceKey) {
      return NextResponse.json({
        success: false,
        error: 'Service role key not configured. Cannot test booking insertion.'
      }, { status: 400 });
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Test 1: Try with minimal required fields
    const minimalBooking = {
      property_id: 'bbd5ef50-27a6-487d-b5c2-fb1c1a292b56', // easywest property
      guest_name: 'Test User',
      guest_email: 'test@test.com',
      guest_phone: '+91-9999999999',
      sharing_type: 'Single',
      price_per_person: 15000,
      security_deposit_per_person: 30000,
      total_amount: 45000,
      amount_paid: 9000,
      amount_due: 36000,
      payment_method: 'razorpay'
    };

    console.log('📝 Attempting minimal booking insert...');
    const { data: result1, error: error1 } = await supabaseAdmin
      .from('bookings')
      .insert(minimalBooking)
      .select()
      .single();

    if (result1) {
      console.log('✅ Minimal booking created:', result1.id);
      // Clean up
      await supabaseAdmin.from('bookings').delete().eq('id', result1.id);
      
      return NextResponse.json({
        success: true,
        message: 'Minimal booking insert works',
        test_result: {
          minimal_booking: { success: true, id: result1.id },
          required_fields: Object.keys(minimalBooking)
        }
      });
    }

    // Test 2: Try with additional common fields
    const extendedBooking = {
      ...minimalBooking,
      payment_status: 'partial',
      booking_status: 'confirmed',
      payment_date: new Date().toISOString(),
      check_in_date: new Date().toISOString().split('T')[0],
      check_out_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      notes: 'Test booking for schema validation',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    console.log('📝 Attempting extended booking insert...');
    const { data: result2, error: error2 } = await supabaseAdmin
      .from('bookings')
      .insert(extendedBooking)
      .select()
      .single();

    if (result2) {
      console.log('✅ Extended booking created:', result2.id);
      // Clean up
      await supabaseAdmin.from('bookings').delete().eq('id', result2.id);
      
      return NextResponse.json({
        success: true,
        message: 'Extended booking insert works',
        test_result: {
          extended_booking: { success: true, id: result2.id },
          working_fields: Object.keys(extendedBooking)
        }
      });
    }

    // If both failed, return the errors
    return NextResponse.json({
      success: false,
      message: 'Both booking inserts failed',
      errors: {
        minimal_error: error1?.message || 'Unknown error',
        extended_error: error2?.message || 'Unknown error',
        minimal_details: error1,
        extended_details: error2
      }
    }, { status: 400 });

  } catch (error: any) {
    console.error('❌ Test booking insert error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}