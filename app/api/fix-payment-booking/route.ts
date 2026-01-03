import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { paymentId, guestName, propertyName } = await request.json();
    
    console.log('🔄 Creating booking for payment:', paymentId);

    // Get the property (Kushal from the URL)
    let { data: property, error: propertyError } = await supabase
      .from('properties')
      .select('*')
      .ilike('name', '%kushal%')
      .single();

    if (propertyError || !property) {
      // Fallback to any property with owner details
      const { data: fallbackProperty } = await supabase
        .from('properties')
        .select('*')
        .not('owner_name', 'is', null)
        .limit(1)
        .single();
      
      if (!fallbackProperty) {
        throw new Error('No properties with owner details found');
      }
      property = fallbackProperty;
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

    // Create or get user profile
    const guestEmail = 'testone@niwasnest.com';
    const guestPhone = '+91-9876543210';

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
          full_name: guestName || 'Test User',
          phone: guestPhone,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (!profileError && newProfile) {
        userId = newProfile.id;
        console.log('👤 Created guest profile:', userId);
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
      guest_name: guestName || 'Test User',
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
      payment_date: new Date().toISOString(),
      check_in_date: new Date().toISOString().split('T')[0],
      check_out_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      notes: `Booking created for payment ${paymentId} - Property: ${property.name}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    console.log('📝 Creating booking with data:', {
      property: property.name,
      guest: guestName,
      amount_paid: amountPaid,
      amount_due: amountDue,
      user_id: userId,
      payment_id: paymentId
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
      message: 'Booking created successfully',
      data: {
        booking_id: booking.id,
        payment_id: paymentId,
        property_name: property.name,
        guest_name: guestName,
        user_id: userId,
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
    console.error('❌ Fix payment booking error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}