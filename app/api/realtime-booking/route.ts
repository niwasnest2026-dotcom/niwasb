import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Real-time booking creation started');

    const {
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
      booking_details,
      user_id
    } = await request.json();

    // Validate required fields
    if (!razorpay_payment_id || !booking_details) {
      return NextResponse.json({
        success: false,
        error: 'Payment ID and booking details are required'
      }, { status: 400 });
    }

    console.log('💳 Processing payment:', razorpay_payment_id);

    // Get or create user profile
    let userId = user_id;
    if (!userId && booking_details.guest_email) {
      // Try to find user by email
      const { data: existingUser } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', booking_details.guest_email)
        .single();

      if (existingUser) {
        userId = existingUser.id;
      } else {
        // Create a new profile for guest user
        const { data: newProfile, error: profileError } = await supabase
          .from('profiles')
          .insert([{
            email: booking_details.guest_email,
            full_name: booking_details.guest_name,
            phone: booking_details.guest_phone,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }])
          .select()
          .single();

        if (!profileError && newProfile) {
          userId = newProfile.id;
          console.log('👤 Created new user profile:', userId);
        }
      }
    }

    // Get property details
    const { data: property, error: propertyError } = await supabase
      .from('properties')
      .select('*')
      .eq('id', booking_details.property_id)
      .single();

    if (propertyError || !property) {
      // Fallback to first available property
      const { data: firstProperty } = await supabase
        .from('properties')
        .select('*')
        .limit(1)
        .single();
      
      if (!firstProperty) {
        throw new Error('No properties available');
      }
      property = firstProperty;
    }

    // Get or create room
    let { data: rooms } = await supabase
      .from('property_rooms')
      .select('*')
      .eq('property_id', property.id)
      .eq('is_available', true)
      .limit(1);

    let room = rooms && rooms.length > 0 ? rooms[0] : null;

    if (!room) {
      // Create default room
      const { data: newRoom, error: roomError } = await supabase
        .from('property_rooms')
        .insert([{
          property_id: property.id,
          room_number: 'Room 1',
          room_type: 'Standard',
          sharing_type: booking_details.sharing_type || 'Single',
          price_per_person: property.price,
          security_deposit_per_person: property.security_deposit || property.price * 2,
          total_beds: 1,
          available_beds: 1,
          floor_number: 1,
          has_attached_bathroom: true,
          has_balcony: false,
          has_ac: false,
          room_size_sqft: 100,
          description: 'Standard room with basic amenities',
          is_available: true
        }])
        .select()
        .single();

      if (!roomError && newRoom) {
        room = newRoom;
        console.log('🏠 Created new room:', room.id);
      }
    }

    // Calculate amounts (20% paid, 80% due)
    const totalAmount = booking_details.total_amount || (property.price + (property.security_deposit || property.price * 2));
    const amountPaid = booking_details.amount_paid || Math.round(totalAmount * 0.2);
    const amountDue = totalAmount - amountPaid;

    // Create booking record
    const bookingData = {
      property_id: property.id,
      room_id: room?.id,
      user_id: userId,
      guest_name: booking_details.guest_name,
      guest_email: booking_details.guest_email,
      guest_phone: booking_details.guest_phone,
      sharing_type: booking_details.sharing_type || 'Single',
      price_per_person: property.price,
      security_deposit_per_person: property.security_deposit || property.price * 2,
      total_amount: totalAmount,
      amount_paid: amountPaid,
      amount_due: amountDue,
      payment_method: 'razorpay',
      payment_status: 'partial',
      booking_status: 'confirmed',
      payment_date: new Date().toISOString(),
      check_in_date: booking_details.check_in_date || new Date().toISOString().split('T')[0],
      check_out_date: booking_details.check_out_date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      notes: `Real-time booking for payment ${razorpay_payment_id}, Order: ${razorpay_order_id}`
    };

    console.log('📝 Creating booking with data:', {
      property: property.name,
      guest: booking_details.guest_name,
      amount_paid: amountPaid,
      amount_due: amountDue
    });

    const { data: booking, error: bookingError } = await supabaseAdmin
      .from('bookings')
      .insert(bookingData)
      .select()
      .single();

    if (bookingError) {
      console.error('❌ Booking creation error:', bookingError);
      throw new Error('Failed to create booking: ' + bookingError.message);
    }

    console.log('✅ Booking created successfully:', booking.id);

    // Update room availability
    if (room && room.available_beds > 0) {
      await supabaseAdmin
        .from('property_rooms')
        .update({
          available_beds: room.available_beds - 1
        })
        .eq('id', room.id);
    }

    // Create real-time notification for admin
    await supabase
      .from('notifications')
      .insert([{
        type: 'new_booking',
        title: 'New Booking Received',
        message: `New booking from ${booking_details.guest_name} for ${property.name}`,
        data: {
          booking_id: booking.id,
          payment_id: razorpay_payment_id,
          property_name: property.name,
          guest_name: booking_details.guest_name,
          amount_paid: amountPaid
        },
        is_read: false,
        created_at: new Date().toISOString()
      }])
      .select();

    // Send real-time update via Supabase realtime
    await supabase
      .channel('bookings')
      .send({
        type: 'broadcast',
        event: 'new_booking',
        payload: {
          booking_id: booking.id,
          property_name: property.name,
          guest_name: booking_details.guest_name,
          amount_paid: amountPaid,
          created_at: booking.created_at
        }
      });

    return NextResponse.json({
      success: true,
      message: 'Real-time booking created successfully',
      data: {
        booking_id: booking.id,
        payment_id: razorpay_payment_id,
        property_name: property.name,
        guest_name: booking_details.guest_name,
        amount_paid: amountPaid,
        amount_due: amountDue,
        owner_details: {
          owner_name: property.owner_name,
          owner_phone: property.owner_phone,
          payment_instructions: property.payment_instructions
        }
      }
    });

  } catch (error: any) {
    console.error('❌ Real-time booking error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}