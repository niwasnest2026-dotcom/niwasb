import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';
import { ENV_CONFIG } from '@/lib/env-config';

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Minimal payment verification started');

    // Check authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Create simple Supabase clients without type constraints
    const supabaseAdmin = createClient(
      ENV_CONFIG.SUPABASE_URL,
      ENV_CONFIG.SUPABASE_SERVICE_ROLE_KEY
    );

    const supabase = createClient(
      ENV_CONFIG.SUPABASE_URL,
      ENV_CONFIG.SUPABASE_ANON_KEY,
      {
        global: {
          headers: {
            Authorization: authHeader,
          },
        },
      }
    );

    // Verify user authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.log('❌ Authentication failed:', authError);
      return NextResponse.json(
        { success: false, error: 'Invalid authentication' },
        { status: 401 }
      );
    }

    console.log('✅ User authenticated:', user.id);

    // Parse request body
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      booking_details,
    } = await request.json();

    console.log('📋 Payment data received:', {
      order_id: razorpay_order_id,
      payment_id: razorpay_payment_id,
      has_booking_details: !!booking_details,
      property_id: booking_details?.property_id
    });

    // Verify payment signature
    if (!ENV_CONFIG.RAZORPAY_KEY_SECRET) {
      return NextResponse.json(
        { success: false, error: 'Razorpay configuration missing' },
        { status: 500 }
      );
    }

    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', ENV_CONFIG.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    const isAuthentic = expectedSignature === razorpay_signature;

    if (!isAuthentic) {
      console.log('❌ Payment signature verification failed');
      return NextResponse.json(
        {
          success: false,
          error: 'Payment verification failed - invalid signature',
        },
        { status: 400 }
      );
    }

    console.log('✅ Payment signature verified');

    // Check if booking already exists for this payment using simple query
    console.log('🔍 Checking for existing booking...');
    const { data: existingBookings, error: existingError } = await supabaseAdmin
      .from('bookings')
      .select('id, property_id, guest_name')
      .eq('payment_id', razorpay_payment_id);

    if (existingError) {
      console.error('❌ Error checking existing bookings:', existingError);
      return NextResponse.json({
        success: false,
        error: 'Database query failed: ' + existingError.message
      }, { status: 500 });
    }

    if (existingBookings && existingBookings.length > 0) {
      const existingBooking = existingBookings[0];
      console.log('✅ Booking already exists:', existingBooking.id);
      
      // Get property name
      const { data: property } = await supabaseAdmin
        .from('properties')
        .select('name')
        .eq('id', existingBooking.property_id)
        .single();

      return NextResponse.json({
        success: true,
        message: 'Payment verified and booking already exists',
        booking_id: existingBooking.id,
        property_name: property?.name || 'Unknown Property',
        guest_name: existingBooking.guest_name
      });
    }

    // Create new booking with minimal required fields
    console.log('🔄 Creating new booking...');
    
    let propertyId = null;
    let propertyName = 'Unknown Property';
    
    if (booking_details && booking_details.property_id) {
      // Verify the property exists
      const { data: selectedProperty, error: propertyError } = await supabaseAdmin
        .from('properties')
        .select('id, name, price, security_deposit')
        .eq('id', booking_details.property_id)
        .single();

      if (propertyError) {
        console.error('❌ Selected property not found:', booking_details.property_id, propertyError);
        return NextResponse.json({
          success: false,
          error: `Selected property not found: ${booking_details.property_id}`
        }, { status: 400 });
      }

      propertyId = selectedProperty.id;
      propertyName = selectedProperty.name;
      console.log('✅ Property verified:', propertyName);
    } else {
      // Get any available property as fallback
      const { data: properties } = await supabaseAdmin
        .from('properties')
        .select('id, name')
        .limit(1);

      if (properties && properties.length > 0) {
        propertyId = properties[0].id;
        propertyName = properties[0].name;
        console.log('⚠️ Using fallback property:', propertyName);
      } else {
        return NextResponse.json({
          success: false,
          error: 'No properties available for booking'
        }, { status: 500 });
      }
    }

    // Create minimal booking data
    const bookingData = {
      property_id: propertyId,
      user_id: user.id,
      guest_name: booking_details?.guest_name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'Guest',
      guest_email: booking_details?.guest_email || user.email || '',
      guest_phone: booking_details?.guest_phone || user.user_metadata?.phone || '9999999999',
      sharing_type: booking_details?.sharing_type || 'Single Room',
      price_per_person: booking_details?.price_per_person || 10000,
      security_deposit_per_person: booking_details?.security_deposit_per_person || 20000,
      total_amount: booking_details?.total_amount || 30000,
      amount_paid: booking_details?.amount_paid || 2000,
      amount_due: booking_details?.amount_due || 28000,
      payment_method: 'razorpay',
      payment_status: 'partial',
      booking_status: 'confirmed',
      payment_date: new Date().toISOString(),
      booking_date: new Date().toISOString(),
      payment_id: razorpay_payment_id,
      notes: `Payment ID: ${razorpay_payment_id}, Order: ${razorpay_order_id}, Property: ${propertyName}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Add optional fields if provided
    if (booking_details?.room_id) {
      bookingData.room_id = booking_details.room_id;
    }
    if (booking_details?.check_in) {
      bookingData.check_in_date = booking_details.check_in;
    }
    if (booking_details?.check_out) {
      bookingData.check_out_date = booking_details.check_out;
    }

    console.log('📝 Creating booking with data:', {
      property_id: bookingData.property_id,
      guest_name: bookingData.guest_name,
      amount_paid: bookingData.amount_paid,
      payment_id: bookingData.payment_id
    });

    // Insert booking into database
    const { data: bookingResult, error: bookingError } = await supabaseAdmin
      .from('bookings')
      .insert(bookingData)
      .select('id, property_id, guest_name')
      .single();

    if (bookingError) {
      console.error('❌ Database insert error:', bookingError);
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to create booking record: ' + bookingError.message,
          details: bookingError
        },
        { status: 500 }
      );
    }

    console.log('✅ Booking created successfully:', bookingResult.id);

    return NextResponse.json({
      success: true,
      message: 'Payment verified and booking created successfully',
      booking_id: bookingResult.id,
      payment_id: razorpay_payment_id,
      property_name: propertyName,
      guest_name: bookingResult.guest_name
    });

  } catch (error: any) {
    console.error('❌ Payment verification error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Payment verification failed: ' + error.message,
        details: error
      },
      { status: 500 }
    );
  }
}