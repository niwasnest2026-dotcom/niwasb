import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    // Get recent bookings with property details
    const { data: bookings, error: bookingsError } = await supabase
      .from('bookings')
      .select(`
        id,
        user_id,
        guest_name,
        payment_status,
        booking_status,
        created_at,
        properties!inner(
          id,
          name,
          owner_name,
          owner_phone
        )
      `)
      .order('created_at', { ascending: false })
      .limit(10);

    // Get properties with owner details
    const { data: properties, error: propertiesError } = await supabase
      .from('properties')
      .select('id, name, owner_name, owner_phone, payment_instructions')
      .limit(5);

    // Get rooms
    const { data: rooms, error: roomsError } = await supabase
      .from('property_rooms')
      .select('id, property_id, room_number')
      .limit(5);

    return NextResponse.json({
      success: true,
      data: {
        bookings: bookings || [],
        properties: properties || [],
        rooms: rooms || [],
        errors: {
          bookings: bookingsError?.message,
          properties: propertiesError?.message,
          rooms: roomsError?.message
        }
      },
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}