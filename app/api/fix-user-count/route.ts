import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    console.log('🔧 Fixing user count issue...');

    // Check current state
    const { data: profilesData, error: profilesError, count: profilesCount } = await supabase
      .from('profiles')
      .select('*', { count: 'exact' });

    console.log('Current profiles:', { profilesCount, profilesError });

    // Check if we can access auth users (this might fail without service role)
    let authUsersCount = 0;
    try {
      const { data: authData, error: authError } = await supabase.auth.admin.listUsers();
      authUsersCount = authData?.users?.length || 0;
      console.log('Auth users count:', authUsersCount, authError?.message);
    } catch (authErr) {
      console.log('Cannot access auth users:', authErr);
    }

    // Check bookings to see if there are users who made bookings
    const { data: bookingsData, error: bookingsError, count: bookingsCount } = await supabase
      .from('bookings')
      .select('user_id, guest_email, guest_name', { count: 'exact' });

    console.log('Bookings:', { bookingsCount, bookingsError });

    // Get unique emails from bookings
    const uniqueEmails = bookingsData ? 
      [...new Set(bookingsData.map(b => b.guest_email).filter(Boolean))] : [];

    return NextResponse.json({
      success: true,
      analysis: {
        profiles_table: {
          count: profilesCount || 0,
          error: profilesError?.message,
          accessible: !profilesError
        },
        auth_users: {
          count: authUsersCount,
          accessible: authUsersCount > 0
        },
        bookings_table: {
          count: bookingsCount || 0,
          error: bookingsError?.message,
          unique_emails: uniqueEmails.length,
          sample_emails: uniqueEmails.slice(0, 3)
        },
        diagnosis: {
          issue: profilesCount === 0 ? 'profiles_table_empty' : 'rls_blocking_access',
          recommendation: profilesCount === 0 ? 
            'Need to create profile records for existing users' : 
            'Need service role key to bypass RLS policies'
        }
      }
    });

  } catch (error: any) {
    console.error('❌ Fix user count error:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}