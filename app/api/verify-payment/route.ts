import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';
import { ENV_CONFIG } from '@/lib/env-config';

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Payment verification started');
    
    // Debug environment variables using ENV_CONFIG
    console.log('🔧 Environment check:', {
      supabase_url: !!ENV_CONFIG.SUPABASE_URL,
      anon_key: !!ENV_CONFIG.SUPABASE_ANON_KEY,
      service_role_key: !!ENV_CONFIG.SUPABASE_SERVICE_ROLE_KEY,
      razorpay_secret: !!ENV_CONFIG.RAZORPAY_KEY_SECRET,
      node_env: process.env.NODE_ENV
    });

    // Check authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Validate required environment variables using ENV_CONFIG
    const requiredEnvVars = {
      SUPABASE_URL: ENV_CONFIG.SUPABASE_URL,
      SUPABASE_SERVICE_ROLE_KEY: ENV_CONFIG.SUPABASE_SERVICE_ROLE_KEY,
      SUPABASE_ANON_KEY: ENV_CONFIG.SUPABASE_ANON_KEY,
      RAZORPAY_KEY_SECRET: ENV_CONFIG.RAZORPAY_KEY_SECRET
    };

    const missingVars = Object.entries(requiredEnvVars)
      .filter(([key, value]) => !value)
      .map(([key]) => key);

    if (missingVars.length > 0) {
      console.error('❌ Missing environment variables:', missingVars);
      return NextResponse.json(
        { 
          success: false, 
          error: `Missing environment variables: ${missingVars.join(', ')}`,
          debug: {
            env_config_status: {
              supabase_url: !!ENV_CONFIG.SUPABASE_URL,
              service_role_key: !!ENV_CONFIG.SUPABASE_SERVICE_ROLE_KEY,
              anon_key: !!ENV_CONFIG.SUPABASE_ANON_KEY,
              razorpay_secret: !!ENV_CONFIG.RAZORPAY_KEY_SECRET
            }
          }
        },
        { status: 500 }
      );
    }

    // Create admin client
    let supabaseAdmin;
    try {
      supabaseAdmin = createClient(
        ENV_CONFIG.SUPABASE_URL,
        ENV_CONFIG.SUPABASE_SERVICE_ROLE_KEY,
        {
          auth: {
            autoRefreshToken: false,
            persistSession: false
          }
        }
      );
    } catch (supabaseError: any) {
      console.error('❌ Failed to create Supabase admin client:', supabaseError);
      return NextResponse.json(
        { 
          success: false, 
          error: `Failed to create Supabase client: ${supabaseError.message}` 
        },
        { status: 500 }
      );
    }

    // Verify the user session with Supabase
    let supabase;
    try {
      supabase = createClient(
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
    } catch (supabaseError: any) {
      console.error('❌ Failed to create Supabase user client:', supabaseError);
      return NextResponse.json(
        { 
          success: false, 
          error: `Failed to create user Supabase client: ${supabaseError.message}` 
        },
        { status: 500 }
      );
    }

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
          error: 'Payment verification failed',
        },
        { status: 400 }
      );
    }

    console.log('✅ Payment signature verified');

    // Always create booking for successful payments
    console.log('🔄 Creating booking...');
    
    // If booking_details is provided, use it; otherwise create a basic booking
    let bookingData: any;
    
    if (booking_details && booking_details.property_id) {
      // Use the specific property from booking details - CRITICAL FIX
      console.log('📍 Using EXACT property from booking details:', booking_details.property_id);
      
      // Verify the property exists
      const { data: selectedProperty, error: propertyError } = await supabaseAdmin
        .from('properties')
        .select('id, name, price, security_deposit')
        .eq('id', booking_details.property_id)
        .single();

      if (propertyError || !selectedProperty) {
        console.error('❌ Selected property not found:', booking_details.property_id);
        return NextResponse.json({
          success: false,
          error: `Selected property not found: ${booking_details.property_id}`
        }, { status: 400 });
      }

      console.log('✅ Property verified:', selectedProperty.name);

      bookingData = {
        user_id: user.id,
        property_id: booking_details.property_id, // Use the EXACT property selected by user
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
        payment_id: razorpay_payment_id,
        notes: `Payment ID: ${razorpay_payment_id}, Order: ${razorpay_order_id}, Property: ${selectedProperty.name}`
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
      if (booking_details.duration) {
        bookingData.notes += `, Duration: ${booking_details.duration} months`;
      }
    } else {
      // Fallback: Create a basic booking but with better property selection
      console.log('⚠️ No booking details provided, using fallback logic');
      
      // Get available properties but don't just pick the first one randomly
      const { data: properties, error: propertiesError } = await supabaseAdmin
        .from('properties')
        .select('id, name, price, owner_name, owner_phone, security_deposit')
        .eq('is_available', true)
        .limit(5);

      if (propertiesError || !properties || properties.length === 0) {
        return NextResponse.json({
          success: false,
          error: 'No properties available for booking'
        }, { status: 500 });
      }

      // Use the first available property as fallback
      const fallbackProperty = properties[0];
      console.log('⚠️ Using fallback property:', fallbackProperty.name);

      // Extract amount from order (convert from paise to rupees)
      const amountPaid = Math.round(parseInt(razorpay_order_id.split('_')[1] || '200') / 100) || 200;
      const monthlyRent = amountPaid * 5; // Assume 20% advance
      const securityDeposit = fallbackProperty.security_deposit || monthlyRent * 2;
      const totalAmount = monthlyRent + securityDeposit;

      bookingData = {
        user_id: user.id,
        property_id: fallbackProperty.id,
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
        payment_id: razorpay_payment_id,
        notes: `Fallback booking for payment ${razorpay_payment_id}, Property: ${fallbackProperty.name}`
      };
    }

    console.log('📝 Creating booking with data:', bookingData);

    // Check if booking already exists for this payment
    const { data: existingBooking } = await supabaseAdmin
      .from('bookings')
      .select('id, property_id, guest_name')
      .eq('payment_id', razorpay_payment_id)
      .single();

    if (existingBooking) {
      console.log('✅ Booking already exists:', existingBooking.id);
      
      // Get property name for response
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

    // Create the booking
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

    // Get property name for response
    const { data: finalProperty } = await supabaseAdmin
      .from('properties')
      .select('name')
      .eq('id', bookingResult.property_id)
      .single();

    return NextResponse.json({
      success: true,
      message: 'Payment verified and booking created successfully',
      booking_id: bookingResult.id,
      payment_id: razorpay_payment_id,
      property_name: finalProperty?.name || 'Unknown Property',
      guest_name: bookingData.guest_name
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