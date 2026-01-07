import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';
import { ENV_CONFIG } from '@/lib/env-config';
import { Database } from '@/types/database';

// Type for booking insert according to schema
type BookingInsert = Database['public']['Tables']['bookings']['Insert'];

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Rebuilt payment verification started');

    // Check authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Create Supabase clients with proper typing
    const supabaseAdmin = createClient<Database>(
      ENV_CONFIG.SUPABASE_URL,
      ENV_CONFIG.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    const supabase = createClient<Database>(
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

    // Check if booking already exists for this payment
    const { data: existingBooking, error: existingError } = await supabaseAdmin
      .from('bookings')
      .select(`
        id, 
        property_id, 
        guest_name,
        properties!inner(name)
      `)
      .eq('payment_id', razorpay_payment_id)
      .single();

    if (existingBooking && !existingError) {
      console.log('✅ Booking already exists:', existingBooking.id);
      return NextResponse.json({
        success: true,
        message: 'Payment verified and booking already exists',
        booking_id: existingBooking.id,
        property_name: (existingBooking.properties as any)?.name || 'Unknown Property',
        guest_name: existingBooking.guest_name
      });
    }

    // Create new booking
    console.log('🔄 Creating new booking...');
    
    let bookingData: BookingInsert;
    
    if (booking_details && booking_details.property_id) {
      // Use specific property from booking details
      console.log('📍 Using EXACT property from booking details:', booking_details.property_id);
      
      // Verify the property exists
      const { data: selectedProperty, error: propertyError } = await supabaseAdmin
        .from('properties')
        .select('id, name, price, security_deposit')
        .eq('id', booking_details.property_id)
        .single();

      if (propertyError || !selectedProperty) {
        console.error('❌ Selected property not found:', booking_details.property_id, propertyError);
        return NextResponse.json({
          success: false,
          error: `Selected property not found: ${booking_details.property_id}`
        }, { status: 400 });
      }

      console.log('✅ Property verified:', selectedProperty.name);

      // Create booking data according to schema
      bookingData = {
        property_id: booking_details.property_id,
        user_id: user.id,
        guest_name: booking_details.guest_name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'Guest',
        guest_email: booking_details.guest_email || user.email || '',
        guest_phone: booking_details.guest_phone || user.user_metadata?.phone || '9999999999',
        sharing_type: booking_details.sharing_type || 'Single Room',
        price_per_person: booking_details.price_per_person || selectedProperty.price,
        security_deposit_per_person: booking_details.security_deposit_per_person || selectedProperty.security_deposit || (booking_details.price_per_person || selectedProperty.price) * 2,
        total_amount: booking_details.total_amount || 0,
        amount_paid: booking_details.amount_paid || 0,
        amount_due: booking_details.amount_due || 0,
        payment_method: 'razorpay',
        payment_status: 'partial',
        booking_status: 'confirmed',
        payment_date: new Date().toISOString(),
        booking_date: new Date().toISOString(),
        payment_id: razorpay_payment_id,
        notes: `Payment ID: ${razorpay_payment_id}, Order: ${razorpay_order_id}, Property: ${selectedProperty.name}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Add optional fields if provided
      if (booking_details.room_id) {
        bookingData.room_id = booking_details.room_id;
      }
      if (booking_details.check_in) {
        bookingData.check_in_date = booking_details.check_in;
      }
      if (booking_details.check_out) {
        bookingData.check_out_date = booking_details.check_out;
      }
      if (booking_details.duration) {
        bookingData.notes += `, Duration: ${booking_details.duration} months`;
      }

    } else {
      // Fallback logic with better property selection
      console.log('⚠️ No booking details provided, using fallback logic');
      
      // Get available properties
      const { data: properties, error: propertiesError } = await supabaseAdmin
        .from('properties')
        .select('id, name, price, security_deposit')
        .limit(5);

      if (propertiesError || !properties || properties.length === 0) {
        console.error('❌ No properties available:', propertiesError);
        return NextResponse.json({
          success: false,
          error: 'No properties available for booking'
        }, { status: 500 });
      }

      const fallbackProperty = properties[0];
      console.log('⚠️ Using fallback property:', fallbackProperty.name);

      // Calculate amounts from order
      const amountPaid = Math.round(parseInt(razorpay_order_id.split('_')[1] || '200') / 100) || 200;
      const monthlyRent = amountPaid * 5; // Assume 20% advance
      const securityDeposit = fallbackProperty.security_deposit || monthlyRent * 2;
      const totalAmount = monthlyRent + securityDeposit;

      bookingData = {
        property_id: fallbackProperty.id,
        user_id: user.id,
        guest_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Guest',
        guest_email: user.email || '',
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
        booking_date: new Date().toISOString(),
        payment_id: razorpay_payment_id,
        notes: `Fallback booking for payment ${razorpay_payment_id}, Property: ${fallbackProperty.name}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
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
      .select(`
        id, 
        property_id, 
        guest_name,
        properties!inner(name)
      `)
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

    // Update room availability if room_id exists
    if (bookingData.room_id) {
      try {
        const { data: roomData, error: roomError } = await supabaseAdmin
          .from('property_rooms')
          .select('available_beds')
          .eq('id', bookingData.room_id)
          .single();

        if (!roomError && roomData && roomData.available_beds > 0) {
          await supabaseAdmin
            .from('property_rooms')
            .update({
              available_beds: roomData.available_beds - 1,
              updated_at: new Date().toISOString()
            })
            .eq('id', bookingData.room_id);
          
          console.log('✅ Room availability updated');
        }
      } catch (roomUpdateError) {
        console.warn('⚠️ Room availability update failed:', roomUpdateError);
        // Don't fail the entire booking for this
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Payment verified and booking created successfully',
      booking_id: bookingResult.id,
      payment_id: razorpay_payment_id,
      property_name: (bookingResult.properties as any)?.name || 'Unknown Property',
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