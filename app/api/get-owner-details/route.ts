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

    const { booking_id } = await request.json();

    if (!booking_id) {
      return NextResponse.json(
        { success: false, error: 'Booking ID is required' },
        { status: 400 }
      );
    }

    // Get booking details and verify it belongs to the user
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
      .eq('user_id', user.id)
      .eq('payment_status', 'partial') // Only for confirmed bookings
      .single();

    if (bookingError || !booking) {
      return NextResponse.json(
        { success: false, error: 'Booking not found or not authorized' },
        { status: 404 }
      );
    }

    // Return owner details
    const property = (booking as any).properties;
    
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
    console.error('Error fetching owner details:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}