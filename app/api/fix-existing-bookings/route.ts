import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { ENV_CONFIG } from '@/lib/env-config';

export async function POST(request: NextRequest) {
  try {
    console.log('🔧 Starting fix for existing bookings...');

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

    // 1. Find bookings with missing user_id
    console.log('🔍 Finding bookings with missing user_id...');
    const { data: bookingsWithoutUser, error: bookingsError } = await supabaseAdmin
      .from('bookings')
      .select('id, guest_email, user_id, guest_name, payment_id')
      .is('user_id', null)
      .not('guest_email', 'is', null);

    if (bookingsError) {
      errors.push(`Error fetching bookings: ${bookingsError.message}`);
    } else if (bookingsWithoutUser && bookingsWithoutUser.length > 0) {
      console.log(`📋 Found ${bookingsWithoutUser.length} bookings without user_id`);

      // For each booking, try to find the user by email
      for (const booking of bookingsWithoutUser) {
        try {
          // Find user by email
          const { data: user, error: userError } = await supabaseAdmin
            .auth
            .admin
            .listUsers();

          if (!userError && user.users) {
            const matchingUser = user.users.find(u => u.email === booking.guest_email);
            
            if (matchingUser) {
              // Update booking with user_id
              const { error: updateError } = await supabaseAdmin
                .from('bookings')
                .update({ user_id: matchingUser.id })
                .eq('id', booking.id);

              if (updateError) {
                errors.push(`Failed to update booking ${booking.id}: ${updateError.message}`);
              } else {
                fixes.push(`Updated booking ${booking.id} with user_id for ${booking.guest_email}`);
                console.log(`✅ Updated booking ${booking.id} with user_id`);
              }
            } else {
              console.log(`⚠️ No user found for email: ${booking.guest_email}`);
            }
          }
        } catch (error: any) {
          errors.push(`Error processing booking ${booking.id}: ${error.message}`);
        }
      }
    } else {
      fixes.push('All bookings already have user_id assigned');
    }

    // 2. Find bookings with missing room_id
    console.log('🔍 Finding bookings with missing room_id...');
    const { data: bookingsWithoutRoom, error: roomBookingsError } = await supabaseAdmin
      .from('bookings')
      .select('id, property_id, sharing_type, guest_name')
      .is('room_id', null);

    if (roomBookingsError) {
      errors.push(`Error fetching bookings without room: ${roomBookingsError.message}`);
    } else if (bookingsWithoutRoom && bookingsWithoutRoom.length > 0) {
      console.log(`📋 Found ${bookingsWithoutRoom.length} bookings without room_id`);

      for (const booking of bookingsWithoutRoom) {
        try {
          // Find a room for this property
          const { data: availableRoom, error: roomError } = await supabaseAdmin
            .from('property_rooms')
            .select('id, room_number')
            .eq('property_id', booking.property_id)
            .gt('available_beds', 0)
            .limit(1)
            .single();

          if (!roomError && availableRoom) {
            // Update booking with room_id
            const { error: updateError } = await supabaseAdmin
              .from('bookings')
              .update({ room_id: availableRoom.id })
              .eq('id', booking.id);

            if (updateError) {
              errors.push(`Failed to update booking ${booking.id} with room: ${updateError.message}`);
            } else {
              fixes.push(`Updated booking ${booking.id} with room ${availableRoom.room_number}`);
              console.log(`✅ Updated booking ${booking.id} with room_id`);
            }
          } else {
            // Create a room for this property if none exists
            const fallbackRoom = {
              property_id: booking.property_id,
              room_number: 'R001',
              room_type: 'Standard',
              sharing_type: booking.sharing_type || 'Single',
              price_per_person: 8000,
              security_deposit_per_person: 16000,
              total_beds: 1,
              available_beds: 1,
              floor_number: 1,
              has_attached_bathroom: true,
              has_balcony: false,
              has_ac: true,
              room_size_sqft: 120,
              description: 'Auto-generated room for existing booking',
              is_available: true
            };

            const { data: newRoom, error: createRoomError } = await supabaseAdmin
              .from('property_rooms')
              .insert(fallbackRoom)
              .select()
              .single();

            if (createRoomError) {
              errors.push(`Failed to create room for booking ${booking.id}: ${createRoomError.message}`);
            } else {
              // Update booking with new room_id
              const { error: updateError } = await supabaseAdmin
                .from('bookings')
                .update({ room_id: newRoom.id })
                .eq('id', booking.id);

              if (updateError) {
                errors.push(`Failed to update booking ${booking.id} with new room: ${updateError.message}`);
              } else {
                fixes.push(`Created room ${newRoom.room_number} and updated booking ${booking.id}`);
                console.log(`✅ Created room and updated booking ${booking.id}`);
              }
            }
          }
        } catch (error: any) {
          errors.push(`Error processing room for booking ${booking.id}: ${error.message}`);
        }
      }
    } else {
      fixes.push('All bookings already have room_id assigned');
    }

    // 3. Ensure all bookings have proper payment_id format
    console.log('🔍 Checking payment_id formats...');
    const { data: bookingsWithPayment, error: paymentError } = await supabaseAdmin
      .from('bookings')
      .select('id, notes')
      .not('notes', 'is', null);

    if (!paymentError && bookingsWithPayment) {
      for (const booking of bookingsWithPayment) {
        // Check if booking already has payment_id
        const { data: currentBooking, error: currentError } = await supabaseAdmin
          .from('bookings')
          .select('payment_id')
          .eq('id', booking.id)
          .single();

        if (!currentError && currentBooking && !currentBooking.payment_id && booking.notes) {
          // Try to extract payment_id from notes
          const paymentIdMatch = booking.notes.match(/Payment ID: ([^,\s]+)/);
          if (paymentIdMatch) {
            const extractedPaymentId = paymentIdMatch[1];
            
            const { error: updateError } = await supabaseAdmin
              .from('bookings')
              .update({ payment_id: extractedPaymentId })
              .eq('id', booking.id);

            if (updateError) {
              errors.push(`Failed to update payment_id for booking ${booking.id}: ${updateError.message}`);
            } else {
              fixes.push(`Extracted and updated payment_id for booking ${booking.id}`);
              console.log(`✅ Updated payment_id for booking ${booking.id}`);
            }
          }
        }
      }
    }

    // 4. Get final count of fixed bookings
    const { data: finalBookings, error: finalError } = await supabaseAdmin
      .from('bookings')
      .select('id, user_id, room_id, payment_id, guest_name, guest_email')
      .order('created_at', { ascending: false })
      .limit(10);

    const summary = {
      success: errors.length === 0,
      fixes_applied: fixes.length,
      errors_found: errors.length,
      fixes: fixes,
      errors: errors,
      final_bookings_sample: finalBookings || [],
      total_bookings_after_fix: finalBookings?.length || 0
    };

    console.log('✅ Existing bookings fix completed');
    
    return NextResponse.json(summary);

  } catch (error: any) {
    console.error('❌ Fix existing bookings error:', error);
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