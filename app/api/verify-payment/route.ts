import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';
import { ENV_CONFIG } from '@/lib/env-config';
import { safeBookingInsert, checkExistingBooking } from '@/lib/schema-safe-insert';

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Payment verification started (SCHEMA-SAFE MODE)');

    // Step 1: Validate authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Step 2: Verify user session
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
      console.log('❌ Authentication failed:', authError?.message);
      return NextResponse.json(
        { success: false, error: 'Invalid authentication' },
        { status: 401 }
      );
    }

    console.log('✅ User authenticated:', user.id);

    // Step 3: Extract payment data from request
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      propertyId,
      userDetails
    } = await request.json();

    console.log('📋 Payment data received:', {
      order_id: razorpay_order_id,
      payment_id: razorpay_payment_id,
      property_id: propertyId,
      has_user_details: !!userDetails
    });

    // Step 4: Validate required fields
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !propertyId || !userDetails) {
      return NextResponse.json(
        { success: false, error: 'Missing required payment verification data' },
        { status: 400 }
      );
    }

    // Step 5: Verify Razorpay signature (CRITICAL - never trust frontend)
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', ENV_CONFIG.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    const isAuthentic = expectedSignature === razorpay_signature;

    if (!isAuthentic) {
      console.log('❌ Payment signature verification FAILED');
      return NextResponse.json(
        { success: false, error: 'Payment verification failed - invalid signature' },
        { status: 400 }
      );
    }

    console.log('✅ Payment signature verified successfully');

    // Step 6: Create admin client for database operations
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

    // Step 7: Validate property exists
    const { data: property, error: propertyError } = await supabaseAdmin
      .from('properties')
      .select('id, name, price, security_deposit')
      .eq('id', propertyId)
      .single();

    if (propertyError || !property) {
      console.log('❌ Property not found:', propertyId);
      return NextResponse.json(
        { success: false, error: 'Property not found' },
        { status: 404 }
      );
    }

    console.log('✅ Property validated:', property.name);

    // Step 8: Check if booking already exists (using schema-safe method)
    const existingBooking = await checkExistingBooking(razorpay_payment_id);

    if (existingBooking) {
      console.log('✅ Booking already exists for this payment:', existingBooking.id);
      return NextResponse.json({
        success: true,
        message: 'Payment already processed',
        booking_id: existingBooking.id,
        property_name: property.name,
        guest_name: existingBooking.guest_name
      });
    }

    // Step 9: Build booking payload (NO payment_id - using Razorpay fields only)
    console.log('🔄 Creating booking after successful payment verification...');
    
    const bookingPayload = {
      // Core fields
      property_id: propertyId,
      user_id: user.id,
      guest_name: userDetails.name,
      guest_email: userDetails.email || user.email,
      guest_phone: userDetails.phone,
      
      // Razorpay fields (SAFE - no payment_id)
      razorpay_payment_id: razorpay_payment_id,
      razorpay_order_id: razorpay_order_id,
      razorpay_signature: razorpay_signature,
      payment_status: 'paid',
      payment_method: 'razorpay',
      
      // Booking details
      sharing_type: userDetails.sharing_type || 'Single Room',
      price_per_person: userDetails.price_per_person || property.price,
      security_deposit_per_person: userDetails.security_deposit_per_person || property.security_deposit || 0,
      total_amount: userDetails.total_amount || property.price,
      amount_paid: userDetails.amount_paid || Math.round(property.price * 0.2), // 20% advance
      amount_due: userDetails.amount_due || Math.round(property.price * 0.8), // 80% remaining
      booking_status: 'confirmed',
      payment_date: new Date().toISOString(),
      notes: `Verified payment: ${razorpay_payment_id} | Order: ${razorpay_order_id} | Property: ${property.name}`,
      
      // Optional fields
      room_id: userDetails.room_id,
      check_in_date: userDetails.check_in,
      check_out_date: userDetails.check_out,
    };

    console.log('📝 Booking payload prepared (schema-safe):', {
      property_id: bookingPayload.property_id,
      guest_name: bookingPayload.guest_name,
      razorpay_payment_id: bookingPayload.razorpay_payment_id,
      amount_paid: bookingPayload.amount_paid
    });

    // Step 10: Insert booking using schema-safe method
    try {
      const insertResult = await safeBookingInsert(bookingPayload);
      
      if (!insertResult.success) {
        throw new Error('Schema-safe insert returned failure');
      }

      const bookingResult = insertResult.booking;
      console.log('✅ Booking created successfully:', bookingResult.id);

      // Step 11: Update room availability if room_id provided (defensive)
      if (userDetails.room_id) {
        try {
          const { data: roomData } = await supabaseAdmin
            .from('property_rooms')
            .select('available_beds')
            .eq('id', userDetails.room_id)
            .single();

          if (roomData && roomData.available_beds > 0) {
            await supabaseAdmin
              .from('property_rooms')
              .update({
                available_beds: roomData.available_beds - 1
              })
              .eq('id', userDetails.room_id);
            
            console.log('✅ Room availability updated');
          }
        } catch (roomError) {
          console.log('⚠️ Room update failed (non-critical):', roomError);
          // Don't fail the entire booking for room update issues
        }
      }

      // Step 12: Return success response
      return NextResponse.json({
        success: true,
        message: 'Payment verified and booking created successfully',
        booking_id: bookingResult.id,
        razorpay_payment_id: razorpay_payment_id,
        property_name: property.name,
        guest_name: bookingPayload.guest_name,
        amount_paid: bookingPayload.amount_paid,
        amount_due: bookingPayload.amount_due
      });

    } catch (bookingError: any) {
      // FAIL-SAFE: Payment verified but booking failed
      console.error('❌ Booking creation failed after payment verification:', bookingError);
      
      // Log payment details for manual recovery
      console.log('💰 PAYMENT VERIFIED BUT BOOKING FAILED:', {
        razorpay_payment_id,
        razorpay_order_id,
        property_id: propertyId,
        user_id: user.id,
        guest_name: userDetails.name,
        guest_email: userDetails.email,
        amount_paid: bookingPayload.amount_paid,
        timestamp: new Date().toISOString()
      });

      // Return fail-safe response (don't lose paid users)
      return NextResponse.json({
        success: false,
        message: 'Payment received but booking pending. Support will contact you.',
        razorpay_payment_id: razorpay_payment_id,
        support_needed: true,
        error_details: bookingError.message
      }, { status: 500 });
    }

  } catch (error: any) {
    console.error('❌ Payment verification error:', error);
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