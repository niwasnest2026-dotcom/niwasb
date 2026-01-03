import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  try {
    console.log('🔍 Debugging user count with admin client...');

    // Create admin client if service role key is available
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!serviceKey) {
      return NextResponse.json({
        success: false,
        error: 'Service role key not configured. Cannot debug user count.'
      }, { status: 400 });
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Count total profiles using admin client
    const { data: profilesData, error: profilesError, count: profilesCount } = await supabaseAdmin
      .from('profiles')
      .select('id, email, full_name, created_at', { count: 'exact' });

    // Count total bookings using admin client
    const { data: bookingsData, error: bookingsError, count: bookingsCount } = await supabaseAdmin
      .from('bookings')
      .select('id, user_id, guest_name, guest_email', { count: 'exact' });

    // Count unique users with bookings
    const uniqueUserIds = bookingsData ? 
      bookingsData.map(b => b.user_id).filter(Boolean) : [];
    const uniqueBookingUsers = Array.from(new Set(uniqueUserIds)).length;

    // Get Supabase auth users count using admin client
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.listUsers();

    return NextResponse.json({
      success: true,
      debug: {
        profiles: {
          count: profilesCount,
          error: profilesError?.message,
          sample_data: profilesData?.slice(0, 5) || []
        },
        bookings: {
          count: bookingsCount,
          error: bookingsError?.message,
          unique_users_with_bookings: uniqueBookingUsers,
          sample_data: bookingsData?.slice(0, 5) || []
        },
        auth_users: {
          count: authData?.users?.length || 0,
          error: authError?.message,
          sample_data: authData?.users?.slice(0, 5).map(u => ({
            id: u.id,
            email: u.email,
            created_at: u.created_at
          })) || []
        },
        summary: {
          profiles_table_count: profilesCount,
          auth_users_count: authData?.users?.length || 0,
          bookings_count: bookingsCount,
          users_with_bookings: uniqueBookingUsers,
          note: "Using admin client with service role key"
        }
      }
    });

  } catch (error: any) {
    console.error('❌ Debug user count error:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}