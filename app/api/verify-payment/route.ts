import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
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

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      booking_details,
    } = await request.json();

    // Verify payment signature
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(body.toString())
      .digest('hex');

    const isAuthentic = expectedSignature === razorpay_signature;

    if (!isAuthentic) {
      return NextResponse.json(
        {
          success: false,
          error: 'Payment verification failed',
        },
        { status: 400 }
      );
    }

    // If booking_details is provided, create booking in database
    if (booking_details) {
      // Add user ID to booking details for security
      const bookingData: any = {
        property_id: booking_details.property_id,
        guest_name: booking_details.guest_name,
        guest_email: booking_details.guest_email || user.email, // Use form email or fallback to user email
        guest_phone: booking_details.guest_phone,
        sharing_type: booking_details.sharing_type,
        price_per_person: booking_details.price_per_person,
        security_deposit_per_person: booking_details.security_deposit_per_person,
        total_amount: booking_details.total_amount,
        amount_paid: booking_details.amount_paid,
        amount_due: booking_details.amount_due,
        payment_method: 'razorpay',
        payment_status: 'partial', // 20% paid
        booking_status: 'confirmed',
        payment_reference: razorpay_payment_id,
        payment_date: new Date().toISOString(),
        notes: `Booking made through Razorpay. Order ID: ${razorpay_order_id}. User ID: ${user.id}.`
      };

      // Add optional fields only if they exist and are provided
      if (booking_details.room_id) {
        bookingData.room_id = booking_details.room_id;
      }
      
      if (booking_details.duration) {
        bookingData.duration_months = parseInt(booking_details.duration);
        bookingData.notes += ` Duration: ${booking_details.duration} months.`;
      }
      
      if (booking_details.check_in) {
        bookingData.check_in_date = booking_details.check_in;
      }
      
      if (booking_details.check_out) {
        bookingData.check_out_date = booking_details.check_out;
      }

      if (user.id) {
        bookingData.user_id = user.id;
      }

      // Start a transaction-like operation
      const { data: bookingResult, error: bookingError } = await supabase
        .from('bookings')
        .insert(bookingData)
        .select()
        .single();

      if (bookingError) {
        console.error('Database insert error:', bookingError);
        return NextResponse.json(
          {
            success: false,
            error: 'Failed to create booking record',
          },
          { status: 500 }
        );
      }

      // Update available beds count - decrease by 1 (only if room_id exists)
      if (bookingData.room_id) {
        const { data: roomData, error: roomError } = await supabase
          .from('property_rooms')
          .select('available_beds')
          .eq('id', bookingData.room_id)
          .single();

        if (!roomError && roomData && roomData.available_beds > 0) {
          // Decrease available beds by 1
          const { error: updateError } = await supabase
            .from('property_rooms')
            .update({
              available_beds: roomData.available_beds - 1,
              updated_at: new Date().toISOString()
            })
            .eq('id', bookingData.room_id);

          if (updateError) {
            console.error('Failed to update available beds:', updateError);
          }
        } else {
          console.error('Room not found or no available beds:', roomError);
        }
      }

      return NextResponse.json({
        success: true,
        message: 'Payment verified and booking created successfully',
        booking_id: bookingResult.id,
      });
    }

    // If no booking_details, just return payment verification success
    return NextResponse.json({
      success: true,
      message: 'Payment verified successfully',
    });
  } catch (error: any) {
    console.error('Payment verification error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}