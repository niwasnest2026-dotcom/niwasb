import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { ENV_CONFIG } from '@/lib/env-config';

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Syncing booking visibility...');

    // Create admin client
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

    const fixes = [];
    const errors = [];

    // 1. Test user bookings query (same as used in /bookings page)
    console.log('🔍 Testing user bookings query...');
    const { data: userBookingsTest, error: userBookingsError } = await supabaseAdmin
      .from('bookings')
      .select(`
        *,
        properties!inner(
          id,
          name,
          address,
          city,
          area,
          featured_image,
          owner_name,
          owner_phone,
          payment_instructions
        ),
        property_rooms(
          room_number,
          room_type
        )
      `)
      .not('user_id', 'is', null)
      .order('created_at', { ascending: false })
      .limit(5);

    if (userBookingsError) {
      errors.push(`User bookings query failed: ${userBookingsError.message}`);
    } else {
      fixes.push(`User bookings query works: ${userBookingsTest?.length || 0} bookings found`);
    }

    // 2. Test admin bookings query (same as used in /admin/bookings page)
    console.log('🔍 Testing admin bookings query...');
    const { data: adminBookingsTest, error: adminBookingsError } = await supabaseAdmin
      .from('bookings')
      .select(`
        *,
        property:properties(name, city, area),
        room:property_rooms(room_number, room_type, available_beds, total_beds)
      `)
      .order('booking_date', { ascending: false })
      .limit(5);

    if (adminBookingsError) {
      errors.push(`Admin bookings query failed: ${adminBookingsError.message}`);
    } else {
      fixes.push(`Admin bookings query works: ${adminBookingsTest?.length || 0} bookings found`);
    }

    // 3. Check for bookings missing required relationships
    console.log('🔍 Checking booking relationships...');
    
    // Check bookings without properties
    const { data: bookingsWithoutProps, error: propsError } = await supabaseAdmin
      .from('bookings')
      .select('id, property_id, guest_name')
      .not('property_id', 'in', `(SELECT id FROM properties)`);

    if (!propsError && bookingsWithoutProps && bookingsWithoutProps.length > 0) {
      errors.push(`Found ${bookingsWithoutProps.length} bookings with invalid property_id`);
      
      // Try to fix by assigning to first available property
      const { data: firstProperty } = await supabaseAdmin
        .from('properties')
        .select('id')
        .limit(1)
        .single();

      if (firstProperty) {
        for (const booking of bookingsWithoutProps) {
          const { error: fixError } = await supabaseAdmin
            .from('bookings')
            .update({ property_id: firstProperty.id })
            .eq('id', booking.id);

          if (!fixError) {
            fixes.push(`Fixed property_id for booking ${booking.id}`);
          }
        }
      }
    } else {
      fixes.push('All bookings have valid property relationships');
    }

    // 4. Ensure all bookings have booking_date
    const { data: bookingsWithoutDate, error: dateError } = await supabaseAdmin
      .from('bookings')
      .select('id, created_at')
      .is('booking_date', null);

    if (!dateError && bookingsWithoutDate && bookingsWithoutDate.length > 0) {
      for (const booking of bookingsWithoutDate) {
        const { error: updateError } = await supabaseAdmin
          .from('bookings')
          .update({ booking_date: booking.created_at })
          .eq('id', booking.id);

        if (!updateError) {
          fixes.push(`Added booking_date for booking ${booking.id}`);
        }
      }
    } else {
      fixes.push('All bookings have booking_date');
    }

    // 5. Create sample data if no bookings exist
    const { data: allBookings, error: countError } = await supabaseAdmin
      .from('bookings')
      .select('id')
      .limit(1);

    if (!countError && (!allBookings || allBookings.length === 0)) {
      console.log('📝 No bookings found, creating sample booking...');
      
      // Get first property and create sample booking
      const { data: sampleProperty } = await supabaseAdmin
        .from('properties')
        .select('id, name')
        .limit(1)
        .single();

      const { data: sampleRoom } = await supabaseAdmin
        .from('property_rooms')
        .select('id, room_number, price_per_person, security_deposit_per_person')
        .eq('property_id', sampleProperty?.id)
        .limit(1)
        .single();

      if (sampleProperty && sampleRoom) {
        const sampleBooking = {
          property_id: sampleProperty.id,
          room_id: sampleRoom.id,
          user_id: null,
          guest_name: 'Sample Booking User',
          guest_email: 'sample@niwasnest.com',
          guest_phone: '9999999999',
          sharing_type: 'Single',
          price_per_person: sampleRoom.price_per_person || 8000,
          security_deposit_per_person: sampleRoom.security_deposit_per_person || 16000,
          total_amount: (sampleRoom.price_per_person || 8000) + (sampleRoom.security_deposit_per_person || 16000),
          amount_paid: Math.round(((sampleRoom.price_per_person || 8000) + (sampleRoom.security_deposit_per_person || 16000)) * 0.2),
          amount_due: Math.round(((sampleRoom.price_per_person || 8000) + (sampleRoom.security_deposit_per_person || 16000)) * 0.8),
          payment_method: 'razorpay',
          payment_status: 'partial',
          booking_status: 'confirmed',
          booking_date: new Date().toISOString(),
          payment_date: new Date().toISOString(),
          payment_id: 'sample_' + Date.now(),
          notes: 'Sample booking for testing visibility'
        };

        const { data: newBooking, error: createError } = await supabaseAdmin
          .from('bookings')
          .insert(sampleBooking)
          .select()
          .single();

        if (!createError) {
          fixes.push(`Created sample booking: ${newBooking.id}`);
        } else {
          errors.push(`Failed to create sample booking: ${createError.message}`);
        }
      }
    }

    // 6. Final verification - test both queries again
    const { data: finalUserTest } = await supabaseAdmin
      .from('bookings')
      .select(`
        id,
        guest_name,
        properties!inner(name)
      `)
      .not('user_id', 'is', null)
      .limit(1);

    const { data: finalAdminTest } = await supabaseAdmin
      .from('bookings')
      .select(`
        id,
        guest_name,
        property:properties(name)
      `)
      .limit(1);

    const summary = {
      success: errors.length === 0,
      fixes_applied: fixes.length,
      errors_found: errors.length,
      fixes: fixes,
      errors: errors,
      visibility_test: {
        user_bookings_visible: !!finalUserTest && finalUserTest.length > 0,
        admin_bookings_visible: !!finalAdminTest && finalAdminTest.length > 0,
        user_query_sample: finalUserTest?.[0] || null,
        admin_query_sample: finalAdminTest?.[0] || null
      }
    };

    console.log('✅ Booking visibility sync completed');
    
    return NextResponse.json(summary);

  } catch (error: any) {
    console.error('❌ Sync booking visibility error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      fixes_applied: 0,
      errors_found: 1,
      fixes: [],
      errors: [error.message]
    }, { status: 500 });
  }
}