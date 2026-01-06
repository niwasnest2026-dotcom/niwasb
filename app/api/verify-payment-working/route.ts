import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';
import { ENV_CONFIG, debugEnvironment } from '@/lib/env-config';

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Working payment verification started');
    console.log('🔧 Environment debug:', debugEnvironment());

    // Check authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Create clients using ENV_CONFIG
    const supabaseAdmin = createClient(
      ENV_CONFIG.SUPABASE_URL,
      ENV_CONFIG.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
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

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.log('❌ Authentication failed:', authError);
      return NextResponse.json(
        { success: false, error: 'Invalid authentication' },
        { status: 401 }
      );
    }

    console.log('✅ User authenticated:', user.id);

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      booking_details,
    } = await request.json();

    console.log('📋 Payment data received:', {
      order_id: razorpay_order_id,
      payment_id: razorpay_payment_id,
      has_booking_details: !!booking_details
    });

    // Verify payment signature
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
          error: 'Payment verification failed',
        },
        { status: 400 }
      );
    }

    console.log('✅ Payment signature verified');

    // Check if booking already exists (search by notes containing payment_id)
    const { data: existingBooking } = await supabaseAdmin
      .from('bookings')
      .select('id')
      .ilike('notes', `%${razorpay_payment_id}%`)
      .single();

    if (existingBooking) {
      console.log('✅ Booking already exists:', existingBooking.id);
      return NextResponse.json({
        success: true,
        message: 'Payment verified and booking already exists',
        booking_id: existingBooking.id,
      });
    }

    // Create booking data
    let bookingData: any;
    
    if (booking_details) {
      // Handle case where property_id might be 'default'
      let propertyId = booking_details.property_id;
      
      if (propertyId === 'default' || !propertyId) {
        // Get a real property from the database
        const { data: availableProperty } = await supabaseAdmin
          .from('properties')
          .select('id, name, price')
          .limit(1)
          .single();

        if (!availableProperty) {
          return NextResponse.json({
            success: false,
            error: 'No properties available for booking. Please add properties first.'
          }, { status: 500 });
        }
        
        propertyId = availableProperty.id;
        console.log('🏠 Using fallback property:', availableProperty.name, propertyId);
      }

      bookingData = {
        user_id: user.id,
        property_id: propertyId, // Use real property ID
        guest_name: booking_details.guest_name,
        guest_email: booking_details.guest_email || user.email,
        guest_phone: booking_details.guest_phone,
        sharing_type: booking_details.sharing_type,
        price_per_person: booking_details.price_per_person,
        security_deposit_per_person: booking_details.security_deposit_per_person,
        total_amount: booking_details.total_amount,
        amount_paid: booking_details.amount_paid,
        amount_due: booking_details.amount_due,
        payment_method: 'razorpay',
        payment_status: 'partial',
        booking_status: 'confirmed',
        payment_date: new Date().toISOString(),
        notes: `Payment ID: ${razorpay_payment_id}, Order: ${razorpay_order_id}`
      };

      // Add optional fields
      if (booking_details.room_id) {
        bookingData.room_id = booking_details.room_id;
      }
      if (booking_details.check_in) {
        bookingData.check_in_date = booking_details.check_in;
      }
      if (booking_details.check_out) {
        bookingData.check_out_date = booking_details.check_out;
      }
    } else {
      // Create a basic booking from order notes
      const { data: properties } = await supabaseAdmin
        .from('properties')
        .select('id, name, price, owner_name, owner_phone')
        .limit(1)
        .single();

      if (!properties) {
        return NextResponse.json({
          success: false,
          error: 'No properties available for booking'
        }, { status: 500 });
      }

      // Extract amount from order (convert from paise to rupees)
      const amountPaid = Math.round(parseInt(razorpay_order_id.split('_')[1] || '200') / 100) || 200;
      const monthlyRent = amountPaid * 5; // Assume 20% advance
      const securityDeposit = monthlyRent * 2;
      const totalAmount = monthlyRent + securityDeposit;

      bookingData = {
        user_id: user.id,
        property_id: properties.id,
        guest_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Guest',
        guest_email: user.email,
        guest_phone: user.user_metadata?.phone || '9999999999',
        sharing_type: 'Single Room',
        price_per_person: monthlyRent,
        security_deposit_per_person: securityDeposit,
        total_amount: totalAmount,
        amount_paid: amountPaid,
        amount_due: totalAmount - amountPaid,
        payment_method: 'razorpay',
        payment_status: 'partial',
        booking_status: 'confirmed',
        payment_date: new Date().toISOString(),
        notes: `Auto-created booking for payment ${razorpay_payment_id}`
      };
    }

    console.log('📝 Creating booking with data:', bookingData);

    // Create the booking first without payment_id
    const { data: bookingResult, error: bookingError } = await supabaseAdmin
      .from('bookings')
      .insert(bookingData)
      .select()
      .single();

    if (bookingError) {
      console.error('❌ Database insert error:', bookingError);
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to create booking record: ' + bookingError.message,
        },
        { status: 500 }
      );
    }

    console.log('✅ Booking created successfully:', bookingResult.id);

    // Try to update with payment_id if column exists
    try {
      const { error: updateError } = await supabaseAdmin
        .from('bookings')
        .update({ payment_id: razorpay_payment_id })
        .eq('id', bookingResult.id);

      if (updateError) {
        console.log('⚠️ Could not update payment_id (column might not exist):', updateError.message);
      } else {
        console.log('✅ Payment ID updated successfully');
      }
    } catch (updateError: any) {
      console.log('⚠️ Payment ID update failed:', updateError.message);
    }

    // Update available beds count if room_id exists
    if (bookingData.room_id) {
      const { data: roomData, error: roomError } = await supabaseAdmin
        .from('property_rooms')
        .select('available_beds')
        .eq('id', bookingData.room_id)
        .single();

      if (!roomError && roomData && roomData.available_beds > 0) {
        await supabaseAdmin
          .from('property_rooms')
          .update({
            available_beds: roomData.available_beds - 1
          })
          .eq('id', bookingData.room_id);
        
        console.log('✅ Room availability updated');
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Payment verified and booking created successfully',
      booking_id: bookingResult.id,
      payment_id: razorpay_payment_id
    });

  } catch (error: any) {
    console.error('❌ Payment verification error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}