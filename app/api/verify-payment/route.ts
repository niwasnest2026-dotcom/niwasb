import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';
import { ENV_CONFIG } from '@/lib/env-config';

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Payment verification started');
    
    // Validate authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      console.error('❌ No authorization header');
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
      console.error('❌ Authentication failed:', authError);
      return NextResponse.json(
        { success: false, error: 'Invalid authentication' },
        { status: 401 }
      );
    }

    console.log('✅ User authenticated:', user.id);

    // Extract payment data
    const body = await request.json();
    console.log('📝 Request body:', { ...body, razorpay_signature: '[HIDDEN]' });
    
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      propertyId,
      userDetails
    } = body;

    // Validate required fields
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !propertyId || !userDetails) {
      console.error('❌ Missing required fields:', {
        razorpay_order_id: !!razorpay_order_id,
        razorpay_payment_id: !!razorpay_payment_id,
        razorpay_signature: !!razorpay_signature,
        propertyId: !!propertyId,
        userDetails: !!userDetails
      });
      return NextResponse.json(
        { success: false, error: 'Missing required payment verification data' },
        { status: 400 }
      );
    }

    // Verify Razorpay signature
    const signatureBody = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', ENV_CONFIG.RAZORPAY_KEY_SECRET)
      .update(signatureBody.toString())
      .digest('hex');

    const isAuthentic = expectedSignature === razorpay_signature;

    if (!isAuthentic) {
      console.error('❌ Signature verification failed');
      return NextResponse.json(
        { success: false, error: 'Payment verification failed - invalid signature' },
        { status: 400 }
      );
    }

    console.log('✅ Razorpay signature verified');

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
      console.error('❌ Property not found:', propertyError);
      return NextResponse.json(
        { success: false, error: 'Property not found' },
        { status: 404 }
      );
    }

    console.log('✅ Property found:', property.name);

    // Check if booking already exists
    const { data: existingBooking } = await supabaseAdmin
      .from('bookings')
      .select('id')
      .eq('payment_id', razorpay_payment_id)
      .single();

    if (existingBooking) {
      console.log('⚠️ Booking already exists:', existingBooking.id);
      return NextResponse.json({
        success: true,
        message: 'Payment already processed',
        booking_id: existingBooking.id,
        property_name: property.name
      });
    }

    console.log('📝 Creating new booking...');

    // Create booking data matching the database schema
    const bookingData = {
      property_id: propertyId,
      user_id: user.id, // Use authenticated user ID from session
      guest_name: userDetails.name,
      guest_email: userDetails.email || user.email,
      guest_phone: userDetails.phone,
      
      // Booking details
      sharing_type: 'Single Room',
      price_per_person: property.price,
      security_deposit_per_person: property.security_deposit || 0,
      total_amount: property.price,
      amount_paid: Math.round(property.price * 0.2), // 20% advance
      amount_due: Math.round(property.price * 0.8), // 80% remaining
      
      // Payment details
      payment_method: 'razorpay',
      payment_status: 'paid',
      booking_status: 'booked', // Use 'booked' status as required
      payment_id: razorpay_payment_id, // Store payment ID in the correct field
      payment_date: new Date().toISOString(),
      booking_date: new Date().toISOString(),
      notes: `Razorpay Payment: ${razorpay_payment_id} | Order: ${razorpay_order_id} | Signature: ${razorpay_signature}`
    };

    console.log('📝 Booking data to insert:', { ...bookingData, notes: '[PAYMENT_INFO]' });

    const { data: booking, error: bookingError } = await supabaseAdmin
      .from('bookings')
      .insert(bookingData)
      .select()
      .single();

    if (bookingError) {
      console.error('❌ Booking creation failed:', bookingError);
      console.error('📝 Booking data that failed:', { ...bookingData, notes: '[PAYMENT_INFO]' });
      
      return NextResponse.json({
        success: false,
        message: 'Payment received but booking pending. Support will contact you.',
        razorpay_payment_id: razorpay_payment_id,
        support_needed: true,
        error: bookingError.message
      }, { status: 500 });
    }

    console.log('✅ Booking created successfully:', booking.id);
    console.log('✅ Booking details:', {
      id: booking.id,
      user_id: booking.user_id,
      payment_id: booking.payment_id,
      booking_status: booking.booking_status,
      payment_status: booking.payment_status
    });

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