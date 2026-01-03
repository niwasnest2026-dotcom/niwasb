import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  try {
    // Simple debug endpoint to check if API is working
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Get recent bookings for debugging
    const { data: recentBookings } = await supabase
      .from('bookings')
      .select('id, user_id, payment_status, property_id, guest_name')
      .order('created_at', { ascending: false })
      .limit(5);

    return NextResponse.json({
      success: true,
      message: 'Owner details API is working',
      recent_bookings: recentBookings,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Owner details API called');

    // Check authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      console.log('❌ No auth header');
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
      console.log('❌ Auth error:', authError);
      return NextResponse.json(
        { success: false, error: 'Invalid authentication' },
        { status: 401 }
      );
    }

    console.log('✅ User authenticated:', user.id);

    const { booking_id } = await request.json();
    console.log('🔍 Looking for booking:', booking_id);

    if (!booking_id) {
      return NextResponse.json(
        { success: false, error: 'Booking ID is required' },
        { status: 400 }
      );
    }

    // First, let's check if the booking exists at all
    const { data: bookingCheck, error: checkError } = await supabase
      .from('bookings')
      .select('id, user_id, payment_status, property_id')
      .eq('id', booking_id)
      .single();

    console.log('📋 Booking check result:', { bookingCheck, checkError });

    if (checkError || !bookingCheck) {
      // Try to find any booking for this user
      const { data: userBookings } = await supabase
        .from('bookings')
        .select('id, user_id, payment_status, property_id')
        .eq('user_id', user.id)
        .limit(5);

      console.log('👤 User bookings:', userBookings);

      return NextResponse.json(
        { 
          success: false, 
          error: 'Booking not found',
          debug: {
            booking_id,
            user_id: user.id,
            user_bookings: userBookings,
            check_error: checkError?.message
          }
        },
        { status: 404 }
      );
    }

    // Check if booking belongs to user
    if (bookingCheck.user_id !== user.id) {
      return NextResponse.json(
        { success: false, error: 'Booking not authorized for this user' },
        { status: 403 }
      );
    }

    // Get full booking details with property info
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select(`
        *,
        properties!inner(
          id,
          name,
          owner_name,
          owner_phone,
          payment_instructions
        )
      `)
      .eq('id', booking_id)
      .single();

    console.log('📋 Full booking result:', { booking, bookingError });

    if (bookingError || !booking) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to fetch booking details',
          debug: {
            booking_error: bookingError?.message
          }
        },
        { status: 500 }
      );
    }

    // Return owner details
    const property = (booking as any).properties;
    
    if (!property.owner_name) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Owner details not available for this property',
          debug: {
            property_id: property.id,
            property_name: property.name,
            has_owner_name: !!property.owner_name
          }
        },
        { status: 404 }
      );
    }

    console.log('✅ Returning owner details for property:', property.name);

    return NextResponse.json({
      success: true,
      ownerDetails: {
        owner_name: property.owner_name,
        owner_phone: property.owner_phone,
        payment_instructions: property.payment_instructions,
        property_name: property.name,
        booking_id: booking.id,
        amount_due: booking.amount_due,
        check_in_date: booking.check_in_date,
        room_sharing: booking.sharing_type
      }
    });
  } catch (error: any) {
    console.error('❌ Error fetching owner details:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message,
        debug: {
          stack: error.stack
        }
      },
      { status: 500 }
    );
  }
}