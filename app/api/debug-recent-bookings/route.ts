import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { ENV_CONFIG } from '@/lib/env-config';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Debugging recent bookings...');

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

    // Get recent bookings with all details
    const { data: recentBookings, error: bookingsError } = await supabaseAdmin
      .from('bookings')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);

    if (bookingsError) {
      console.error('❌ Error fetching bookings:', bookingsError);
      return NextResponse.json({
        success: false,
        error: bookingsError.message
      }, { status: 500 });
    }

    // Get properties for reference
    const { data: properties, error: propertiesError } = await supabaseAdmin
      .from('properties')
      .select('id, name, city, area')
      .limit(5);

    // Get rooms for reference
    const { data: rooms, error: roomsError } = await supabaseAdmin
      .from('property_rooms')
      .select('id, property_id, room_number, sharing_type')
      .limit(5);

    // Get profiles for reference
    const { data: profiles, error: profilesError } = await supabaseAdmin
      .from('profiles')
      .select('id, email, full_name')
      .limit(5);

    console.log('✅ Debug data collected');

    return NextResponse.json({
      success: true,
      debug_info: {
        recent_bookings: recentBookings || [],
        recent_bookings_count: recentBookings?.length || 0,
        sample_properties: properties || [],
        sample_rooms: rooms || [],
        sample_profiles: profiles || [],
        table_info: {
          bookings_table_exists: !!recentBookings,
          properties_table_exists: !!properties,
          rooms_table_exists: !!rooms,
          profiles_table_exists: !!profiles
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