import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';
import { ENV_CONFIG } from '@/lib/env-config';

export async function POST(request: NextRequest) {
  try {
    // Validate authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Verify user session
    const supabase = createClient(
      ENV_CONFIG.SUPABASE_URL,
      ENV_CONFIG.SUPABASE_ANON_KEY,
      {
        global: {
          headers: { Authorization: authHeader },
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

    // Extract payment data
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      propertyId,
      userDetails
    } = await request.json();

    // Validate required fields
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !propertyId || !userDetails) {
      return NextResponse.json(
        { success: false, error: 'Missing required payment verification data' },
        { status: 400 }
      );
    }

    // Verify Razorpay signature
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', ENV_CONFIG.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    const isAuthentic = expectedSignature === razorpay_signature;

    if (!isAuthentic) {
      return NextResponse.json(
        { success: false, error: 'Payment verification failed - invalid signature' },
        { status: 400 }
      );
    }

    // Create admin client for database operations
    const supabaseAdmin = createClient(
      ENV_CONFIG.SUPABASE_URL,
      ENV_CONFIG.SUPABASE_SERVICE_ROLE_KEY
    );

    // Validate property exists
    const { data: property, error: propertyError } = await supabaseAdmin
      .from('properties')
      .select('id, name, price, security_deposit')
      .eq('id', propertyId)
      .single();

    if (propertyError || !property) {
      return NextResponse.json(
        { success: false, error: 'Property not found' },
        { status: 404 }
      );
    }

    // Check if booking already exists
    const { data: existingBooking } = await supabaseAdmin
      .from('bookings')
      .select('id')
      .eq('razorpay_payment_id', razorpay_payment_id)
      .single();

    if (existingBooking) {
      return NextResponse.json({
        success: true,
        message: 'Payment already processed',
        booking_id: existingBooking.id,
        property_name: property.name
      });
    }

    // Create booking
    const bookingData = {
      property_id: propertyId,
      user_id: user.id,
      guest_name: userDetails.name,
      guest_email: userDetails.email || user.email,
      guest_phone: userDetails.phone,
      
      // Razorpay fields
      razorpay_payment_id: razorpay_payment_id,
      razorpay_order_id: razorpay_order_id,
      razorpay_signature: razorpay_signature,
      payment_status: 'paid',
      payment_method: 'razorpay',
      
      // Booking details
      sharing_type: 'Single Room',
      price_per_person: property.price,
      security_deposit_per_person: property.security_deposit || 0,
      total_amount: property.price,
      amount_paid: Math.round(property.price * 0.2), // 20% advance
      amount_due: Math.round(property.price * 0.8), // 80% remaining
      booking_status: 'booked',
      payment_date: new Date().toISOString(),
      booking_date: new Date().toISOString(),
      notes: `Payment verified: ${razorpay_payment_id}`
    };

    const { data: booking, error: bookingError } = await supabaseAdmin
      .from('bookings')
      .insert(bookingData)
      .select()
      .single();

    if (bookingError) {
      console.error('Booking creation failed:', bookingError);
      
      return NextResponse.json({
        success: false,
        message: 'Payment received but booking pending. Support will contact you.',
        razorpay_payment_id: razorpay_payment_id,
        support_needed: true
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Payment verified and booking created successfully',
      booking_id: booking.id,
      razorpay_payment_id: razorpay_payment_id,
      property_name: property.name,
      guest_name: bookingData.guest_name,
      amount_paid: bookingData.amount_paid,
      amount_due: bookingData.amount_due
    });

  } catch (error: any) {
    console.error('Payment verification error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Payment verification failed',
        message: 'Technical error occurred. Please contact support if payment was deducted.'
      },
      { status: 500 }
    );
  }
}