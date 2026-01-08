import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { ENV_CONFIG } from '@/lib/env-config';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const bookingId = searchParams.get('bookingId');
    const paymentId = searchParams.get('paymentId');

    if (!bookingId && !paymentId) {
      return NextResponse.json(
        { success: false, error: 'Booking ID or Payment ID required' },
        { status: 400 }
      );
    }

    // Create admin client
    const supabaseAdmin = createClient(
      ENV_CONFIG.SUPABASE_URL,
      ENV_CONFIG.SUPABASE_SERVICE_ROLE_KEY
    );

    // Query booking with property details
    let query = supabaseAdmin
      .from('bookings')
      .select(`
        *,
        properties (
          id,
          name,
          address,
          city,
          featured_image,
          owner_name,
          owner_phone,
          price,
          security_deposit
        )
      `);

    if (bookingId) {
      query = query.eq('id', bookingId);
    } else {
      query = query.eq('payment_id', paymentId); // Use payment_id instead of razorpay_payment_id
    }

    const { data: booking, error } = await query.single();

    if (error || !booking) {
      return NextResponse.json(
        { success: false, error: 'Booking not found' },
        { status: 404 }
      );
    }

    // Calculate remaining amount
    const remainingAmount = booking.total_amount - booking.amount_paid;

    return NextResponse.json({
      success: true,
      booking: {
        id: booking.id,
        guest_name: booking.guest_name,
        guest_email: booking.guest_email,
        guest_phone: booking.guest_phone,
        payment_id: booking.payment_id,
        amount_paid: booking.amount_paid,
        amount_due: booking.amount_due,
        total_amount: booking.total_amount,
        remaining_amount: remainingAmount,
        booking_status: booking.booking_status,
        payment_status: booking.payment_status,
        booking_date: booking.booking_date,
        payment_date: booking.payment_date,
        property: {
          id: booking.properties.id,
          name: booking.properties.name,
          address: booking.properties.address,
          city: booking.properties.city,
          featured_image: booking.properties.featured_image,
          owner_name: booking.properties.owner_name,
          owner_phone: booking.properties.owner_phone,
          monthly_rent: booking.properties.price,
          security_deposit: booking.properties.security_deposit
        }
      }
    });

  } catch (error: any) {
    console.error('Error fetching booking details:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch booking details'
      },
      { status: 500 }
    );
  }
}