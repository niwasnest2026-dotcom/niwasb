import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { ENV_CONFIG } from '@/lib/env-config';

export async function GET() {
  try {
    console.log('🔍 Debugging bookings table structure...');

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

    // Try to get table info from information_schema
    const { data: tableInfo, error: tableError } = await supabaseAdmin
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable')
      .eq('table_name', 'bookings')
      .eq('table_schema', 'public');

    // Try to count total bookings
    const { count: bookingsCount, error: countError } = await supabaseAdmin
      .from('bookings')
      .select('*', { count: 'exact', head: true });

    // Try to get a sample booking
    const { data: sampleBooking, error: sampleError } = await supabaseAdmin
      .from('bookings')
      .select('*')
      .limit(1)
      .single();

    // Try to describe the table structure using a raw query
    let rawTableInfo = null;
    try {
      const { data: rawInfo, error: rawError } = await supabaseAdmin
        .rpc('get_table_columns', { table_name: 'bookings' });
      
      if (!rawError) {
        rawTableInfo = rawInfo;
      }
    } catch (e) {
      console.log('Raw query not available');
    }

    return NextResponse.json({
      success: true,
      debug_info: {
        table_exists: !tableError,
        table_columns: tableInfo || [],
        table_error: tableError?.message || null,
        bookings_count: bookingsCount || 0,
        count_error: countError?.message || null,
        sample_booking: sampleBooking || null,
        sample_error: sampleError?.message || null,
        raw_table_info: rawTableInfo
      }
    });

  } catch (error: any) {
    console.error('❌ Debug bookings table error:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}