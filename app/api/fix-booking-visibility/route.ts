import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { ENV_CONFIG } from '@/lib/env-config';

export async function POST(request: NextRequest) {
  try {
    console.log('🔧 Fixing booking visibility for all users...');

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

    // Get all users with their emails
    const { data: users, error: usersError } = await supabaseAdmin.auth.admin.listUsers();

    if (usersError) {
      console.error('❌ Error fetching users:', usersError);
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch users: ' + usersError.message
      }, { status: 500 });
    }

    console.log(`👥 Found ${users.users.length} users`);

    let totalUpdated = 0;
    const updateResults = [];

    // Process each user
    for (const user of users.users) {
      if (!user.email) continue;

      // Find bookings that belong to this user but don't have user_id set
      const { data: bookingsToUpdate, error: fetchError } = await supabaseAdmin
        .from('bookings')
        .select('id, guest_email, user_id')
        .eq('guest_email', user.email)
        .or(`user_id.is.null,user_id.neq.${user.id}`);

      if (fetchError) {
        console.error(`❌ Error fetching bookings for ${user.email}:`, fetchError);
        continue;
      }

      if (bookingsToUpdate && bookingsToUpdate.length > 0) {
        // Update bookings to set the correct user_id
        const bookingIds = bookingsToUpdate.map(b => b.id);
        
        const { data: updatedBookings, error: updateError } = await supabaseAdmin
          .from('bookings')
          .update({ 
            user_id: user.id,
            updated_at: new Date().toISOString()
          })
          .in('id', bookingIds)
          .select('id');

        if (updateError) {
          console.error(`❌ Error updating bookings for ${user.email}:`, updateError);
          continue;
        }

        const updatedCount = updatedBookings?.length || 0;
        totalUpdated += updatedCount;

        updateResults.push({
          user_email: user.email,
          user_id: user.id,
          updated_count: updatedCount,
          booking_ids: updatedBookings?.map(b => b.id) || []
        });

        console.log(`✅ Updated ${updatedCount} bookings for ${user.email}`);
      }
    }

    console.log(`🎉 Total bookings updated: ${totalUpdated}`);

    return NextResponse.json({
      success: true,
      message: `Successfully fixed booking visibility for ${totalUpdated} bookings across ${updateResults.length} users`,
      total_updated: totalUpdated,
      users_affected: updateResults.length,
      details: updateResults
    });

  } catch (error: any) {
    console.error('❌ Fix error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500 });
  }
}

// GET endpoint to check booking visibility issues
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Checking booking visibility issues...');

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

    // Get all bookings without user_id
    const { data: orphanedBookings, error: orphanedError } = await supabaseAdmin
      .from('bookings')
      .select('id, guest_email, guest_name, created_at')
      .is('user_id', null);

    if (orphanedError) {
      console.error('❌ Error fetching orphaned bookings:', orphanedError);
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch orphaned bookings: ' + orphanedError.message
      }, { status: 500 });
    }

    // Get all users
    const { data: users, error: usersError } = await supabaseAdmin.auth.admin.listUsers();

    if (usersError) {
      console.error('❌ Error fetching users:', usersError);
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch users: ' + usersError.message
      }, { status: 500 });
    }

    // Find potential matches
    const potentialMatches = [];
    const userEmails = new Set(users.users.map(u => u.email).filter(Boolean));

    for (const booking of orphanedBookings || []) {
      if (userEmails.has(booking.guest_email)) {
        const matchingUser = users.users.find(u => u.email === booking.guest_email);
        potentialMatches.push({
          booking_id: booking.id,
          guest_email: booking.guest_email,
          guest_name: booking.guest_name,
          created_at: booking.created_at,
          matching_user_id: matchingUser?.id
        });
      }
    }

    return NextResponse.json({
      success: true,
      orphaned_bookings_count: orphanedBookings?.length || 0,
      potential_matches_count: potentialMatches.length,
      total_users: users.users.length,
      orphaned_bookings: orphanedBookings || [],
      potential_matches: potentialMatches
    });

  } catch (error: any) {
    console.error('❌ Check error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500 });
  }
}