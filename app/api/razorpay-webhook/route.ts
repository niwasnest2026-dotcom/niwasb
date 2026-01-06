import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('x-razorpay-signature');

    console.log('🔔 Webhook received from Razorpay');

    if (!signature) {
      console.log('❌ No signature found in webhook');
      return NextResponse.json({ error: 'No signature found' }, { status: 400 });
    }

    // Verify webhook signature
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET!)
      .update(body)
      .digest('hex');

    if (signature !== expectedSignature) {
      console.log('❌ Invalid webhook signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const event = JSON.parse(body);
    
    // Initialize Supabase admin client for webhook operations
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

    console.log('✅ Webhook verified:', event.event, 'Payment ID:', event.payload?.payment?.entity?.id || event.payload?.order?.entity?.id);

    // Handle different webhook events
    switch (event.event) {
      case 'payment.authorized':
        await handlePaymentAuthorized(event.payload.payment.entity, supabaseAdmin);
        break;
        
      case 'payment.captured':
        await handlePaymentCaptured(event.payload.payment.entity, supabaseAdmin);
        break;
        
      case 'payment.failed':
        await handlePaymentFailed(event.payload.payment.entity, supabaseAdmin);
        break;
        
      case 'order.paid':
        await handleOrderPaid(event.payload.order.entity, supabaseAdmin);
        break;
        
      default:
        console.log('ℹ️ Unhandled webhook event:', event.event);
    }

    return NextResponse.json({ 
      status: 'success',
      event: event.event,
      processed_at: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('❌ Webhook error:', error);
    return NextResponse.json({ 
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

async function handlePaymentAuthorized(payment: any, supabaseAdmin: any) {
  try {
    console.log('🔄 Processing payment authorized:', payment.id);
    
    // Find booking by payment ID
    const { data: booking, error: findError } = await supabaseAdmin
      .from('bookings')
      .select('id, user_id, property_id, guest_name')
      .eq('payment_id', payment.id)
      .single();

    if (findError || !booking) {
      console.log('⚠️ No booking found for payment:', payment.id);
      return;
    }

    // Update booking status to authorized
    const { error: updateError } = await supabaseAdmin
      .from('bookings')
      .update({
        payment_status: 'authorized',
        booking_status: 'confirmed',
        updated_at: new Date().toISOString(),
        notes: `Payment authorized via webhook at ${new Date().toISOString()}`
      })
      .eq('id', booking.id);

    if (updateError) {
      console.error('❌ Error updating payment status to authorized:', updateError);
    } else {
      console.log('✅ Payment authorized and booking updated:', booking.id);
    }
  } catch (error) {
    console.error('❌ Error in handlePaymentAuthorized:', error);
  }
}

async function handlePaymentCaptured(payment: any, supabaseAdmin: any) {
  try {
    console.log('🔄 Processing payment captured:', payment.id);
    
    // Find booking by payment ID
    const { data: booking, error: findError } = await supabaseAdmin
      .from('bookings')
      .select('id, user_id, property_id, guest_name')
      .eq('payment_id', payment.id)
      .single();

    if (findError || !booking) {
      console.log('⚠️ No booking found for payment:', payment.id);
      return;
    }

    // Update booking status to completed
    const { error: updateError } = await supabaseAdmin
      .from('bookings')
      .update({
        payment_status: 'completed',
        booking_status: 'confirmed',
        payment_date: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        notes: `Payment captured via webhook at ${new Date().toISOString()}`
      })
      .eq('id', booking.id);

    if (updateError) {
      console.error('❌ Error updating payment status to captured:', updateError);
    } else {
      console.log('✅ Payment captured and booking completed:', booking.id);
    }
  } catch (error) {
    console.error('❌ Error in handlePaymentCaptured:', error);
  }
}

async function handlePaymentFailed(payment: any, supabaseAdmin: any) {
  try {
    console.log('🔄 Processing payment failed:', payment.id);
    
    // Find booking by payment ID
    const { data: booking, error: fetchError } = await supabaseAdmin
      .from('bookings')
      .select('id, room_id, user_id, property_id, guest_name')
      .eq('payment_id', payment.id)
      .single();

    if (fetchError || !booking) {
      console.log('⚠️ No booking found for failed payment:', payment.id);
      return;
    }

    // Update booking status to failed
    const { error: updateError } = await supabaseAdmin
      .from('bookings')
      .update({
        payment_status: 'failed',
        booking_status: 'cancelled',
        updated_at: new Date().toISOString(),
        notes: `Payment failed via webhook at ${new Date().toISOString()}. Reason: ${payment.error_description || 'Unknown'}`
      })
      .eq('id', booking.id);

    if (updateError) {
      console.error('❌ Error updating payment status to failed:', updateError);
    }

    // Restore bed availability if room_id exists
    if (booking.room_id) {
      const { data: roomData, error: roomError } = await supabaseAdmin
        .from('property_rooms')
        .select('available_beds')
        .eq('id', booking.room_id)
        .single();

      if (!roomError && roomData) {
        const { error: restoreError } = await supabaseAdmin
          .from('property_rooms')
          .update({
            available_beds: roomData.available_beds + 1,
            updated_at: new Date().toISOString()
          })
          .eq('id', booking.room_id);

        if (restoreError) {
          console.error('❌ Error restoring bed availability:', restoreError);
        } else {
          console.log('✅ Bed availability restored for room:', booking.room_id);
        }
      }
    }

    console.log('✅ Payment failure processed for booking:', booking.id);
  } catch (error) {
    console.error('❌ Error in handlePaymentFailed:', error);
  }
}

async function handleOrderPaid(order: any, supabaseAdmin: any) {
  try {
    console.log('🔄 Processing order paid:', order.id);
    
    // Find all payments for this order
    const { data: bookings, error: findError } = await supabaseAdmin
      .from('bookings')
      .select('id, payment_id, user_id, property_id, guest_name')
      .like('notes', `%${order.id}%`);

    if (findError || !bookings || bookings.length === 0) {
      console.log('⚠️ No bookings found for order:', order.id);
      return;
    }

    // Update all related bookings
    for (const booking of bookings) {
      const { error: updateError } = await supabaseAdmin
        .from('bookings')
        .update({
          payment_status: 'completed',
          booking_status: 'confirmed',
          updated_at: new Date().toISOString(),
          notes: `${booking.notes || ''} | Order completed via webhook at ${new Date().toISOString()}`
        })
        .eq('id', booking.id);

      if (updateError) {
        console.error('❌ Error updating booking for order completion:', updateError);
      } else {
        console.log('✅ Booking updated for order completion:', booking.id);
      }
    }
  } catch (error) {
    console.error('❌ Error in handleOrderPaid:', error);
  }
}