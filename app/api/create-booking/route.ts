import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Verify the user session with Supabase
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            Authorization: authHeader,
          },
        },
      }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Invalid authentication' },
        { status: 401 }
      );
    }

    const bookingData = await request.json();

    console.log('🔄 Creating booking for authenticated user:', user.id);
    console.log('📝 Booking data:', bookingData);

    // Add user ID to booking data
    const finalBookingData = {
      ...bookingData,
      user_id: user.id
    };

    // Create admin client if service role key is available
    let adminClient = supabase;
    if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
      adminClient = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
          auth: {
            autoRefreshToken: false,
            persistSession: false
          }
        }
      );
    }

    // Create booking using admin client (bypasses RLS)
    const { data: bookingResult, error: bookingError } = await adminClient
      .from('bookings')
      .insert(finalBookingData)
      .select()
      .single();

    if (bookingError) {
      console.error('❌ Booking creation error:', bookingError);
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to create booking record',
          details: bookingError.message
        },
        { status: 500 }
      );
    }

    console.log('✅ Booking created successfully:', bookingResult.id);

    // Update room availability if room_id exists
    if (finalBookingData.room_id) {
      const { data: roomData, error: roomError } = await adminClient
        .from('property_rooms')
        .select('available_beds')
        .eq('id', finalBookingData.room_id)
        .single();

      if (!roomError && roomData && roomData.available_beds > 0) {
        await adminClient
          .from('property_rooms')
          .update({
            available_beds: roomData.available_beds - 1
          })
          .eq('id', finalBookingData.room_id);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Booking created successfully',
      booking_id: bookingResult.id,
      booking: bookingResult
    });

  } catch (error: any) {
    console.error('❌ Create booking API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message
      },
      { status: 500 }
    );
  }
}