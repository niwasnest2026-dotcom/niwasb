import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { ENV_CONFIG } from '@/lib/env-config';

export async function POST(request: NextRequest) {
  try {
    console.log('🧪 Testing manual booking creation...');

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

    // Get a property and room for testing
    const { data: propertyWithRoom, error: propertyError } = await supabaseAdmin
      .from('properties')
      .select(`
        id, 
        name,
        property_rooms!inner (
          id,
          room_number,
          sharing_type,
          price_per_person,
          security_deposit_per_person
        )
      `)
      .limit(1)
      .single();

    if (propertyError || !propertyWithRoom) {
      return NextResponse.json({
        success: false,
        error: 'No property with rooms found for testing'
      }, { status: 500 });
    }

    const property = propertyWithRoom;
    const room = property.property_rooms[0];

    // Create test booking data
    const testBookingData = {
      property_id: property.id,
      room_id: room.id,
      user_id: null, // Test without user_id first
      guest_name: 'Test Manual Booking',
      guest_email: 'test@manual.com',
      guest_phone: '9999999999',
      sharing_type: room.sharing_type,
      price_per_person: room.price_per_person,
      security_deposit_per_person: room.security_deposit_per_person,
      total_amount: room.price_per_person + room.security_deposit_per_person,
      amount_paid: Math.round((room.price_per_person + room.security_deposit_per_person) * 0.2), // 20%
      amount_due: Math.round((room.price_per_person + room.security_deposit_per_person) * 0.8), // 80%
      payment_method: 'test',
      payment_status: 'partial',
      booking_status: 'confirmed',
      payment_date: new Date().toISOString(),
      booking_date: new Date().toISOString(),
      payment_id: 'test_manual_' + Date.now(),
      notes: 'Manual test booking created for debugging'
    };

    console.log('📝 Creating test booking:', testBookingData);

    // Create the booking
    const { data: bookingResult, error: bookingError } = await supabaseAdmin
      .from('bookings')
      .insert(testBookingData)
      .select()
      .single();

    if (bookingError) {
      console.error('❌ Test booking creation failed:', bookingError);
      return NextResponse.json({
        success: false,
        error: 'Failed to create test booking: ' + bookingError.message,
        details: bookingError
      }, { status: 500 });
    }

    console.log('✅ Test booking created successfully:', bookingResult.id);

    // Verify the booking was created by fetching it back
    const { data: verifyBooking, error: verifyError } = await supabaseAdmin
      .from('bookings')
      .select('*')
      .eq('id', bookingResult.id)
      .single();

    if (verifyError) {
      return NextResponse.json({
        success: false,
        error: 'Booking created but verification failed: ' + verifyError.message
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Test booking created and verified successfully',
      booking: {
        id: bookingResult.id,
        guest_name: bookingResult.guest_name,
        property_name: property.name,
        room_number: room.room_number,
        amount_paid: bookingResult.amount_paid,
        payment_id: bookingResult.payment_id,
        created_at: bookingResult.created_at
      },
      verification: verifyBooking
    });

  } catch (error: any) {
    console.error('❌ Test booking error:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}