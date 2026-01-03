import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    console.log('🔍 Simple user count check...');

    // Try to get profiles without RLS restrictions
    const { data: profilesData, error: profilesError, count: profilesCount } = await supabase
      .from('profiles')
      .select('*', { count: 'exact' });

    console.log('Profiles result:', { profilesCount, profilesError, dataLength: profilesData?.length });

    // Try to get properties
    const { data: propertiesData, error: propertiesError, count: propertiesCount } = await supabase
      .from('properties')
      .select('id', { count: 'exact' });

    console.log('Properties result:', { propertiesCount, propertiesError, dataLength: propertiesData?.length });

    // Try to get bookings
    const { data: bookingsData, error: bookingsError, count: bookingsCount } = await supabase
      .from('bookings')
      .select('id', { count: 'exact' });

    console.log('Bookings result:', { bookingsCount, bookingsError, dataLength: bookingsData?.length });

    return NextResponse.json({
      success: true,
      results: {
        profiles: {
          count: profilesCount,
          error: profilesError?.message,
          data_length: profilesData?.length || 0,
          sample: profilesData?.slice(0, 2) || []
        },
        properties: {
          count: propertiesCount,
          error: propertiesError?.message,
          data_length: propertiesData?.length || 0
        },
        bookings: {
          count: bookingsCount,
          error: bookingsError?.message,
          data_length: bookingsData?.length || 0
        }
      }
    });

  } catch (error: any) {
    console.error('❌ Simple user count error:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}