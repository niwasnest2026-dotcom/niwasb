import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST() {
  try {
    console.log('🔄 Creating sample bookings for existing users...');

    // Get all existing users who don't have bookings
    const { data: profiles, error: profilesError } = await supabaseAdmin
      .from('profiles')
      .select('id, email, full_name, phone');

    if (profilesError) {
      throw new Error('Failed to fetch profiles: ' + profilesError.message);
    }

    if (!profiles || profiles.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'No user profiles found'
      });
    }

    // Get properties with owner details
    const { data: properties, error: propertiesError } = await supabaseAdmin
      .from('properties')
      .select('*')
      .not('owner_name', 'is', null);

    if (propertiesError || !properties || properties.length === 0) {
      throw new Error('No properties with owner details found');
    }

    const sampleBookings = [];
    const createdBookings = [];

    // Create sample bookings for each user
    for (let i = 0; i < profiles.length; i++) {
      const profile = profiles[i];
      
      // Check if user already has bookings
      const { data: existingBookings } = await supabaseAdmin
        .from('bookings')
        .select('id')
        .eq('user_id', profile.id)
        .limit(1);

      if (existingBookings && existingBookings.length > 0) {
        console.log(`⏭️ User ${profile.email} already has bookings, skipping...`);
        continue;
      }

      // Select a random property for this user
      const property = properties[i % properties.length];
      
      // Get or create room for this property
      let { data: rooms } = await supabaseAdmin
        .from('property_rooms')
        .select('*')
        .eq('property_id', property.id)
        .eq('is_available', true)
        .limit(1);

      let room = rooms && rooms.length > 0 ? rooms[0] : null;

      if (!room) {
        // Create default room
        const { data: newRoom, error: roomError } = await supabaseAdmin
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
        }
      }

      // Calculate amounts (20% paid, 80% due)
      const totalAmount = property.price + (property.security_deposit || property.price * 2);
      const amountPaid = Math.round(totalAmount * 0.2);
      const amountDue = totalAmount - amountPaid;

      // Generate sample payment IDs
      const samplePaymentIds = [
        'pay_RzMDWPSs34L2tw',
        'pay_RzMfl1pXGP3Ux',
        'pay_SamplePayment1',
        'pay_SamplePayment2',
        'pay_SamplePayment3'
      ];

      const bookingData = {
        property_id: property.id,
        room_id: room?.id || null,
        user_id: profile.id,
        guest_name: profile.full_name || 'Sample User',
        guest_email: profile.email,
        guest_phone: profile.phone || '+91-9999999999',
        sharing_type: 'Single',
        price_per_person: property.price,
        security_deposit_per_person: property.security_deposit || property.price * 2,
        total_amount: totalAmount,
        amount_paid: amountPaid,
        amount_due: amountDue,
        payment_method: 'razorpay',
        payment_status: 'partial',
        booking_status: 'confirmed',
        payment_date: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(), // Random date within last 7 days
        check_in_date: new Date().toISOString().split('T')[0],
        check_out_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        notes: `Sample booking created for existing user. Payment ID: ${samplePaymentIds[i % samplePaymentIds.length]}. Property: ${property.name}`
      };

      sampleBookings.push(bookingData);
    }

    if (sampleBookings.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'All users already have bookings',
        created_count: 0
      });
    }

    // Insert all sample bookings
    const { data: insertedBookings, error: insertError } = await supabaseAdmin
      .from('bookings')
      .insert(sampleBookings)
      .select(`
        id,
        guest_name,
        guest_email,
        amount_paid,
        properties!inner(name)
      `);

    if (insertError) {
      throw new Error('Failed to create sample bookings: ' + insertError.message);
    }

    console.log(`✅ Created ${insertedBookings?.length || 0} sample bookings`);

    // Update room availability for rooms that were used
    for (const booking of sampleBookings) {
      if (booking.room_id) {
        const { data: roomData } = await supabaseAdmin
          .from('property_rooms')
          .select('available_beds')
          .eq('id', booking.room_id)
          .single();

        if (roomData && roomData.available_beds > 0) {
          await supabaseAdmin
            .from('property_rooms')
            .update({
              available_beds: roomData.available_beds - 1
            })
            .eq('id', booking.room_id);
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Successfully created ${insertedBookings?.length || 0} sample bookings`,
      created_count: insertedBookings?.length || 0,
      bookings: insertedBookings?.map(booking => ({
        id: booking.id,
        guest_name: booking.guest_name,
        guest_email: booking.guest_email,
        amount_paid: booking.amount_paid,
        property_name: (booking as any).properties.name
      }))
    });

  } catch (error: any) {
    console.error('❌ Sample bookings creation error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}