import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('x-razorpay-signature');

    if (!signature) {
      return NextResponse.json({ error: 'No signature found' }, { status: 400 });
    }

    // Verify webhook signature
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET!)
      .update(body)
      .digest('hex');

    if (signature !== expectedSignature) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const event = JSON.parse(body);
    
    // Initialize Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    console.log('Webhook received:', event.event, event.payload);

    // Handle different webhook events
    switch (event.event) {
      case 'payment.authorized':
        // Payment was authorized
        await handlePaymentAuthorized(event.payload.payment.entity, supabase);
        break;
        
      case 'payment.captured':
        // Payment was captured (successful)
        await handlePaymentCaptured(event.payload.payment.entity, supabase);
        break;
        
      case 'payment.failed':
        // Payment failed
        await handlePaymentFailed(event.payload.payment.entity, supabase);
        break;
        
      case 'order.paid':
        // Order was fully paid
        await handleOrderPaid(event.payload.order.entity, supabase);
        break;
        
      default:
        console.log('Unhandled webhook event:', event.event);
    }

    return NextResponse.json({ status: 'success' });
  } catch (error: any) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

async function handlePaymentAuthorized(payment: any, supabase: any) {
  try {
    // Update booking status to authorized
    const { error } = await supabase
      .from('bookings')
      .update({
        payment_status: 'authorized',
        updated_at: new Date().toISOString()
      })
      .eq('payment_reference', payment.id);

    if (error) {
      console.error('Error updating payment status to authorized:', error);
    }
  } catch (error) {
    console.error('Error in handlePaymentAuthorized:', error);
  }
}

async function handlePaymentCaptured(payment: any, supabase: any) {
  try {
    // Update booking status to captured/completed
    const { error } = await supabase
      .from('bookings')
      .update({
        payment_status: 'completed',
        booking_status: 'confirmed',
        updated_at: new Date().toISOString()
      })
      .eq('payment_reference', payment.id);

    if (error) {
      console.error('Error updating payment status to captured:', error);
    }
  } catch (error) {
    console.error('Error in handlePaymentCaptured:', error);
  }
}

async function handlePaymentFailed(payment: any, supabase: any) {
  try {
    // Update booking status to failed and restore bed availability
    const { data: booking, error: fetchError } = await supabase
      .from('bookings')
      .select('room_id')
      .eq('payment_reference', payment.id)
      .single();

    if (!fetchError && booking) {
      // Update booking status
      await supabase
        .from('bookings')
        .update({
          payment_status: 'failed',
          booking_status: 'cancelled',
          updated_at: new Date().toISOString()
        })
        .eq('payment_reference', payment.id);

      // Restore bed availability if room_id exists
      if (booking.room_id) {
        const { data: roomData } = await supabase
          .from('property_rooms')
          .select('available_beds')
          .eq('id', booking.room_id)
          .single();

        if (roomData) {
          await supabase
            .from('property_rooms')
            .update({
              available_beds: roomData.available_beds + 1,
              updated_at: new Date().toISOString()
            })
            .eq('id', booking.room_id);
        }
      }
    }
  } catch (error) {
    console.error('Error in handlePaymentFailed:', error);
  }
}

async function handleOrderPaid(order: any, supabase: any) {
  try {
    // Handle order completion
    console.log('Order paid:', order.id);
    // Add any additional logic for completed orders
  } catch (error) {
    console.error('Error in handleOrderPaid:', error);
  }
}