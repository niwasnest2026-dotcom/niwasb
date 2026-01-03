import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Set the auth token for this request
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Check if user is admin
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .maybeSingle();

    if (profileError || !profile || !profile.is_admin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Now get stats - try different approaches
    const results = await Promise.allSettled([
      // Try to get properties count
      supabase.from('properties').select('id', { count: 'exact', head: true }),
      // Try to get profiles count
      supabase.from('profiles').select('id', { count: 'exact', head: true }),
      // Try to get amenities count
      supabase.from('amenities').select('id', { count: 'exact', head: true }),
      // Try to get bookings count
      supabase.from('bookings').select('id', { count: 'exact', head: true }),
    ]);

    const [propertiesResult, profilesResult, amenitiesResult, bookingsResult] = results;

    return NextResponse.json({
      success: true,
      stats: {
        totalProperties: propertiesResult.status === 'fulfilled' ? (propertiesResult.value.count || 0) : 0,
        totalUsers: profilesResult.status === 'fulfilled' ? (profilesResult.value.count || 0) : 0,
        totalAmenities: amenitiesResult.status === 'fulfilled' ? (amenitiesResult.value.count || 0) : 0,
        totalBookings: bookingsResult.status === 'fulfilled' ? (bookingsResult.value.count || 0) : 0,
      },
      debug: {
        properties_error: propertiesResult.status === 'rejected' ? propertiesResult.reason?.message : null,
        profiles_error: profilesResult.status === 'rejected' ? profilesResult.reason?.message : null,
        amenities_error: amenitiesResult.status === 'rejected' ? amenitiesResult.reason?.message : null,
        bookings_error: bookingsResult.status === 'rejected' ? bookingsResult.reason?.message : null,
      }
    });

  } catch (error: any) {
    console.error('❌ Admin stats error:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}