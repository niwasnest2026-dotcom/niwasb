import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    console.log('🔍 Checking actual database schema...');

    // Check bookings table structure
    const { data: bookingsData, error: bookingsError } = await supabase
      .from('bookings')
      .select('*')
      .limit(1);

    // Check properties table structure  
    const { data: propertiesData, error: propertiesError } = await supabase
      .from('properties')
      .select('*')
      .limit(1);

    // Check property_rooms table structure
    const { data: roomsData, error: roomsError } = await supabase
      .from('property_rooms')
      .select('*')
      .limit(1);

    // Check profiles table structure
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);

    // Try to insert a test booking to see what fields are required/missing
    const testBookingData = {
      property_id: 'test',
      guest_name: 'Test User',
      guest_email: 'test@test.com',
      guest_phone: '+91-9999999999',
      sharing_type: 'Single',
      price_per_person: 15000,
      security_deposit_per_person: 30000,
      total_amount: 45000,
      amount_paid: 9000,
      amount_due: 36000,
      payment_method: 'razorpay',
      payment_status: 'partial',
      booking_status: 'confirmed'
    };

    const { data: testInsert, error: testInsertError } = await supabase
      .from('bookings')
      .insert(testBookingData)
      .select();

    // If test insert worked, delete it
    if (testInsert && testInsert.length > 0) {
      await supabase
        .from('bookings')
        .delete()
        .eq('id', testInsert[0].id);
    }

    return NextResponse.json({
      success: true,
      schema_check: {
        bookings: {
          sample_data: bookingsData?.[0] || null,
          error: bookingsError?.message || null,
          columns: bookingsData?.[0] ? Object.keys(bookingsData[0]) : []
        },
        properties: {
          sample_data: propertiesData?.[0] || null,
          error: propertiesError?.message || null,
          columns: propertiesData?.[0] ? Object.keys(propertiesData[0]) : []
        },
        property_rooms: {
          sample_data: roomsData?.[0] || null,
          error: roomsError?.message || null,
          columns: roomsData?.[0] ? Object.keys(roomsData[0]) : []
        },
        profiles: {
          sample_data: profilesData?.[0] || null,
          error: profilesError?.message || null,
          columns: profilesData?.[0] ? Object.keys(profilesData[0]) : []
        },
        test_insert: {
          success: !testInsertError,
          error: testInsertError?.message || null,
          data: testInsert?.[0] || null
        }
      }
    });

  } catch (error: any) {
    console.error('❌ Schema check error:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}