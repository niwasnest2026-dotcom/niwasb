import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { ENV_CONFIG } from '@/lib/env-config';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const email = searchParams.get('email');

    if (!userId && !email) {
      return NextResponse.json({
        success: false,
        error: 'userId or email parameter required'
      }, { status: 400 });
    }

    const supabase = createClient(
      ENV_CONFIG.SUPABASE_URL,
      ENV_CONFIG.SUPABASE_SERVICE_ROLE_KEY
    );

    // Get user's bookings
    let query = supabase
      .from('bookings')
      .select(`
        id,
        guest_name,
        guest_email,
        user_id,
        booking_status,
        payment_status,
        amount_paid,
        razorpay_payment_id,
        created_at,
        properties!inner(name, city, area)
      `)
      .order('created_at', { ascending: false });

    if (userId && email) {
      query = query.or(`user_id.eq.${userId},guest_email.eq.${email}`);
    } else if (userId) {
      query = query.eq('user_id', userId);
    } else if (email) {
      query = query.eq('guest_email', email);
    }

    const { data: userBookings, error: userError } = await query;

    if (userError) throw userError;

    // Get recent bookings for comparison
    const { data: recentBookings, error: recentError } = await supabase
      .from('bookings')
      .select(`
        id,
        guest_name,
        guest_email,
        user_id,
        booking_status,
        payment_status,
        amount_paid,
        razorpay_payment_id,
        created_at
      `)
      .order('created_at', { ascending: false })
      .limit(10);

    if (recentError) throw recentError;

    return NextResponse.json({
      success: true,
      data: {
        user_bookings: userBookings || [],
        recent_bookings: recentBookings || [],
        search_criteria: {
          userId,
          email,
          query_used: userId && email ? `user_id=${userId} OR guest_email=${email}` : userId ? `user_id=${userId}` : `guest_email=${email}`
        }
      }
    });

  } catch (error: any) {
    console.error('❌ Debug user bookings error:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, email } = await request.json();

    if (!userId && !email) {
      return NextResponse.json({
        success: false,
        error: 'userId or email required'
      }, { status: 400 });
    }

    const supabase = createClient(
      ENV_CONFIG.SUPABASE_URL,
      ENV_CONFIG.SUPABASE_SERVICE_ROLE_KEY
    );

    // Get detailed user bookings with property info
    let query = supabase
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
          owner_phone
        )
      `)
      .order('created_at', { ascending: false });

    if (userId && email) {
      query = query.or(`user_id.eq.${userId},guest_email.eq.${email}`);
    } else if (userId) {
      query = query.eq('user_id', userId);
    } else if (email) {
      query = query.eq('guest_email', email);
    }

    const { data: bookings, error } = await query;

    if (error) throw error;

    return NextResponse.json({
      success: true,
      bookings: bookings || [],
      count: bookings?.length || 0,
      search_criteria: { userId, email }
    });

  } catch (error: any) {
    console.error('❌ Debug user bookings POST error:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}