import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    console.log('🔍 Debug: Checking database for real booking creation');

    // Check if we have properties
    const { data: properties, error: propError } = await supabase
      .from('properties')
      .select('id, name, owner_name, owner_phone')
      .limit(3);

    console.log('Properties:', properties?.length || 0);

    // Check if we have profiles
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('id, email, full_name')
      .limit(3);

    console.log('Profiles:', profiles?.length || 0);

    // Check if we have bookings
    const { data: bookings, error: bookingError } = await supabase
      .from('bookings')
      .select('id, guest_name, payment_reference')
      .eq('payment_reference', 'pay_RzMDWPSs34L2tw')
      .limit(1);

    console.log('Existing booking for pay_RzMDWPSs34L2tw:', bookings?.length || 0);

    return NextResponse.json({
      success: true,
      debug: {
        properties_count: properties?.length || 0,
        properties: properties,
        profiles_count: profiles?.length || 0,
        profiles: profiles,
        existing_booking: bookings?.[0] || null,
        errors: {
          properties: propError?.message,
          profiles: profileError?.message,
          bookings: bookingError?.message
        }
      }
    });

  } catch (error: any) {
    console.error('❌ Debug error:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

export async function POST() {
  try {
    console.log('🔄 Creating booking for pay_RzMDWPSs34L2tw');

    // Get the first property with owner details
    const { data: property } = await supabase
      .from('properties')
      .select('*')
      .not('owner_name', 'is', null)
      .limit(1)
      .single();

    if (!property) {
      return NextResponse.json({
        success: false,
        error: 'No property with owner details found'
      }, { status: 404 });
    }

    // Get or create a room for this property
    let { data: room } = await supabase
      .from('property_rooms')
      .select('*')
      .eq('property_id', property.id)
      .limit(1)
      .single();

    if (!room) {
      // Create a room
      const { data: newRoom } = await supabase
        .from('property_rooms')
        .insert({
          property_id: property.id,
          room_number: 'Room 1',
          sharing_type: 'Single',
          price_per_person: property.price,
          security_deposit_per_person: property.security_deposit || property.price * 2,
          total_beds: 1,
          available_beds: 1
        })
        .select()
        .single();
      
      room = newRoom;
    }

    // Simple booking creation with existing schema
    const bookingData = {
      property_id: property.id,
      room_id: room.id,
      guest_name: 'Real Payment Customer',
      guest_email: 'realpayment@niwasnest.com',
      guest_phone: '+91-9876543210',
      sharing_type: 'Single',
      price_per_person: property.price,
      security_deposit_per_person: property.security_deposit || property.price * 2,
      total_amount: property.price + (property.security_deposit || property.price * 2),
      amount_paid: Math.round((property.price + (property.security_deposit || property.price * 2)) * 0.2),
      amount_due: Math.round((property.price + (property.security_deposit || property.price * 2)) * 0.8),
      payment_method: 'razorpay',
      payment_status: 'partial',
      booking_status: 'confirmed',
      check_in_date: new Date().toISOString().split('T')[0],
      check_out_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      notes: 'Real booking for payment pay_RzMDWPSs34L2tw - Owner details available',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert(bookingData)
      .select()
      .single();

    if (bookingError) {
      console.error('❌ Booking error:', bookingError);
      return NextResponse.json({
        success: false,
        error: bookingError.message,
        details: bookingError
      }, { status: 500 });
    }

    console.log('✅ Booking created:', booking.id);

    return NextResponse.json({
      success: true,
      message: 'Booking created successfully for pay_RzMDWPSs34L2tw',
      booking_id: booking.id,
      property_name: property.name,
      owner_details: {
        owner_name: property.owner_name,
        owner_phone: property.owner_phone,
        payment_instructions: property.payment_instructions
      }
    });

  } catch (error: any) {
    console.error('❌ Error:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}