import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Creating real booking for payment pay_RzMDWPSs34L2tw');

    // Get the first available property with owner details
    const { data: property, error: propertyError } = await supabase
      .from('properties')
      .select('*')
      .not('owner_name', 'is', null)
      .limit(1)
      .single();

    if (propertyError || !property) {
      return NextResponse.json({
        success: false,
        error: 'No properties with owner details available'
      }, { status: 404 });
    }

    console.log('🏠 Using property:', property.name);

    // Get or create room for this property
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
          sharing_type: 'Single',
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

    // Create a guest user profile for the real payment
    const guestEmail = 'realpayment@niwasnest.com';
    const guestName = 'Real Payment Customer';
    const guestPhone = '+91-9876543210';

    // Try to find existing guest profile
    let { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', guestEmail)
      .single();

    let userId = existingProfile?.id;

    if (!userId) {
      // Generate a UUID for the new profile
      const newUserId = crypto.randomUUID();
      
      // Create guest profile
      const { data: newProfile, error: profileError } = await supabase
        .from('profiles')
        .insert([{
          id: newUserId,
          email: guestEmail,
          full_name: guestName,
          phone: guestPhone,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (!profileError && newProfile) {
        userId = newProfile.id;
        console.log('👤 Created guest profile:', userId);
      } else {
        console.error('❌ Profile creation error:', profileError);
        // Continue without user ID if profile creation fails
        userId = null;
      }
    }

    // Calculate amounts (20% paid, 80% due)
    const totalAmount = property.price + (property.security_deposit || property.price * 2);
    const amountPaid = Math.round(totalAmount * 0.2); // 20% paid
    const amountDue = totalAmount - amountPaid; // 80% due

    // Create booking record
    const bookingData = {
      property_id: property.id,
      room_id: room?.id || null,
      user_id: userId,
      guest_name: guestName,
      guest_email: guestEmail,
      guest_phone: guestPhone,
      sharing_type: 'Single',
      price_per_person: property.price,
      security_deposit_per_person: property.security_deposit || property.price * 2,
      total_amount: totalAmount,
      amount_paid: amountPaid,
      amount_due: amountDue,
      payment_method: 'razorpay',
      payment_status: 'partial',
      booking_status: 'confirmed',
      payment_reference: 'pay_RzMDWPSs34L2tw',
      payment_date: new Date().toISOString(),
      check_in_date: new Date().toISOString().split('T')[0],
      check_out_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      duration_months: 1,
      notes: `Real booking created for payment pay_RzMDWPSs34L2tw`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    console.log('📝 Creating booking with data:', {
      property: property.name,
      guest: guestName,
      amount_paid: amountPaid,
      amount_due: amountDue,
      payment_reference: 'pay_RzMDWPSs34L2tw'
    });

    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert(bookingData)
      .select()
      .single();

    if (bookingError) {
      console.error('❌ Booking creation error:', bookingError);
      throw new Error('Failed to create booking: ' + bookingError.message);
    }

    console.log('✅ Booking created successfully:', booking.id);

    // Update room availability if room exists
    if (room && room.available_beds > 0) {
      await supabase
        .from('property_rooms')
        .update({
          available_beds: room.available_beds - 1,
          updated_at: new Date().toISOString()
        })
        .eq('id', room.id);
    }

    return NextResponse.json({
      success: true,
      message: 'Real booking created successfully',
      data: {
        booking_id: booking.id,
        payment_id: 'pay_RzMDWPSs34L2tw',
        property_name: property.name,
        guest_name: guestName,
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
    console.error('❌ Real booking creation error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}