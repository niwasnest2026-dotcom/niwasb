import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
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

    // Create booking in database
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data: bookingData, error: bookingError } = await supabase
      .from('bookings')
      .insert({
        property_id: booking_details.property_id,
        room_id: booking_details.room_id,
        guest_name: booking_details.guest_name,
        guest_email: booking_details.guest_email,
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
        duration_months: booking_details.duration ? parseInt(booking_details.duration) : null,
        check_in_date: booking_details.check_in || null,
        check_out_date: booking_details.check_out || null,
        notes: `Booking made through Razorpay. Order ID: ${razorpay_order_id}. ${booking_details.duration ? `Duration: ${booking_details.duration} months.` : ''}`
      })
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

    return NextResponse.json({
      success: true,
      message: 'Payment verified and booking created successfully',
      booking_id: bookingData.id,
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