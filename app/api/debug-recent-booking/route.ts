import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  try {
    // Create admin client
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    const { searchParams } = new URL(request.url);
    const paymentId = searchParams.get('paymentId');

    // Get recent bookings with property info
    let query = supabaseAdmin
      .from('bookings')
      .select(`
        id,
        user_id,
        payment_id,
        payment_status,
        booking_status,
        guest_name,
        guest_email,
        amount_paid,
        amount_due,
        total_amount,
        created_at,
        properties!inner(
          id,
          name,
          owner_name,
          owner_phone
        )
      `)
      .order('created_at', { ascending: false });

    if (paymentId) {
      query = query.eq('payment_id', paymentId);
    } else {
      query = query.limit(10);
    }

    const { data: bookings, error } = await query;

    if (error) {
      return NextResponse.json({
        success: false,
        error: error.message
      }, { status: 500 });
    }

    // Also get user profiles to check user mapping
    const { data: profiles, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('id, email, full_name')
      .order('created_at', { ascending: false })
      .limit(5);

    return NextResponse.json({
      success: true,
      bookings: bookings,
      profiles: profiles,
      count: bookings?.length || 0,
      search_payment_id: paymentId,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}