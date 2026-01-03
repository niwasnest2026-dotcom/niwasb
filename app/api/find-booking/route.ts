import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const paymentId = searchParams.get('paymentId');

    if (!paymentId) {
      return NextResponse.json({
        success: false,
        error: 'Payment ID is required'
      }, { status: 400 });
    }

    // Search for booking by payment reference
    const { data: bookings, error: bookingError } = await supabase
      .from('bookings')
      .select(`
        *,
        properties!inner(
          id,
          name,
          owner_name,
          owner_phone,
          payment_instructions
        )
      `)
      .eq('payment_reference', paymentId);

    if (bookingError) {
      return NextResponse.json({
        success: false,
        error: 'Database error: ' + bookingError.message
      }, { status: 500 });
    }

    // Also search by other payment fields
    const { data: bookingsByPaymentId } = await supabase
      .from('bookings')
      .select('*')
      .or(`payment_reference.eq.${paymentId},notes.ilike.%${paymentId}%`);

    return NextResponse.json({
      success: true,
      data: {
        payment_id: paymentId,
        bookings_by_reference: bookings || [],
        bookings_by_search: bookingsByPaymentId || [],
        total_bookings_found: (bookings?.length || 0) + (bookingsByPaymentId?.length || 0)
      }
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}