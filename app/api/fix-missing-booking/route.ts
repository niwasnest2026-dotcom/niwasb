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

    // Create admin client
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Verify the user session
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

    const { payment_id, property_name, guest_name, amount } = await request.json();

    if (!payment_id) {
      return NextResponse.json(
        { success: false, error: 'Payment ID is required' },
        { status: 400 }
      );
    }

    // Check if booking already exists
    const { data: existingBooking } = await supabaseAdmin
      .from('bookings')
      .select('id')
      .eq('payment_id', payment_id)
      .single();

    if (existingBooking) {
      return NextResponse.json({
        success: false,
        error: 'Booking already exists for this payment ID',
        booking_id: existingBooking.id
      });
    }

    // Find a property to associate with (preferably TEST property or first available)
    const { data: properties } = await supabaseAdmin
      .from('properties')
      .select('id, name, owner_name, owner_phone')
      .or('name.ilike.%TEST%,name.ilike.%test%')
      .limit(1);

    let propertyId = properties?.[0]?.id;

    if (!propertyId) {
      // Get any property if no TEST property found
      const { data: anyProperty } = await supabaseAdmin
        .from('properties')
        .select('id')
        .limit(1)
        .single();
      
      propertyId = anyProperty?.id;
    }

    if (!propertyId) {
      return NextResponse.json({
        success: false,
        error: 'No properties found in database'
      }, { status: 500 });
    }

    // Create the missing booking
    const bookingData = {
      user_id: user.id,
      property_id: propertyId,
      guest_name: guest_name || 'Kushal',
      guest_email: user.email,
      guest_phone: '9999999999',
      sharing_type: 'Single Room',
      price_per_person: amount ? Math.floor(amount * 0.8) : 1600, // 80% of total as monthly rent
      security_deposit_per_person: amount ? Math.floor(amount * 0.2) : 400, // 20% as security
      total_amount: amount || 2000,
      amount_paid: amount || 2000, // 20% advance paid
      amount_due: amount ? Math.floor(amount * 4) : 8000, // Remaining 80% (4x the advance)
      payment_method: 'razorpay',
      payment_status: 'partial',
      booking_status: 'confirmed',
      payment_date: new Date().toISOString(),
      payment_id: payment_id,
      notes: `Manual booking creation for payment ${payment_id}`,
      created_at: new Date().toISOString()
    };

    const { data: newBooking, error: bookingError } = await supabaseAdmin
      .from('bookings')
      .insert(bookingData)
      .select()
      .single();

    if (bookingError) {
      return NextResponse.json({
        success: false,
        error: 'Failed to create booking: ' + bookingError.message
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Booking created successfully',
      booking: newBooking,
      property_id: propertyId
    });

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}