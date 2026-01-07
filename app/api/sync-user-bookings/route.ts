import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { ENV_CONFIG } from '@/lib/env-config';

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Syncing user bookings...');

    // Check authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Create clients
    const supabaseAdmin = createClient(
      ENV_CONFIG.SUPABASE_URL,
      ENV_CONFIG.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: { autoRefreshToken: false, persistSession: false }
      }
    );

    const supabase = createClient(
      ENV_CONFIG.SUPABASE_URL,
      ENV_CONFIG.SUPABASE_ANON_KEY,
      {
        global: { headers: { Authorization: authHeader } }
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

    console.log('✅ User authenticated:', user.id, user.email);

    // Find bookings that belong to this user but don't have user_id set
    const { data: bookingsToUpdate, error: fetchError } = await supabaseAdmin
      .from('bookings')
      .select('id, guest_email, user_id')
      .eq('guest_email', user.email)
      .or(`user_id.is.null,user_id.neq.${user.id}`);

    if (fetchError) {
      console.error('❌ Error fetching bookings:', fetchError);
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch bookings: ' + fetchError.message
      }, { status: 500 });
    }

    console.log(`📋 Found ${bookingsToUpdate?.length || 0} bookings to update`);

    if (!bookingsToUpdate || bookingsToUpdate.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No bookings need updating',
        updated_count: 0
      });
    }

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
      console.error('❌ Error updating bookings:', updateError);
      return NextResponse.json({
        success: false,
        error: 'Failed to update bookings: ' + updateError.message
      }, { status: 500 });
    }

    console.log(`✅ Successfully updated ${updatedBookings?.length || 0} bookings`);

    return NextResponse.json({
      success: true,
      message: `Successfully synced ${updatedBookings?.length || 0} bookings`,
      updated_count: updatedBookings?.length || 0,
      updated_booking_ids: updatedBookings?.map(b => b.id) || []
    });

  } catch (error: any) {
    console.error('❌ Sync error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500 });
  }
}