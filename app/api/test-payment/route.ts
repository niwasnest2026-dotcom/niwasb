import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      propertyId, 
      roomId, 
      guestName = 'Test User',
      guestEmail = 'test@example.com',
      guestPhone = '+919876543210',
      amount = 2400 // Default test amount
    } = body;

    console.log('🧪 Creating test successful payment...');

    // Generate test IDs
    const testPaymentId = `pay_test_${Date.now()}`;
    const testOrderId = `order_test_${Date.now()}`;
    const testBookingId = `booking_test_${Date.now()}`;

    // Get property details for the test
    let propertyName = 'Test Property';
    let roomNumber = 'Test Room';

    if (propertyId) {
      const { data: property } = await supabase
        .from('properties')
        .select('name')
        .eq('id', propertyId)
        .single();
      
      if (property) {
        propertyName = property.name;
      }
    }

    if (roomId) {
      const { data: room } = await supabase
        .from('property_rooms')
        .select('room_number')
        .eq('id', roomId)
        .single();
      
      if (room) {
        roomNumber = room.room_number;
      }
    }

    // Create test booking record
    const bookingData = {
      id: testBookingId,
      property_id: propertyId || 1,
      room_id: roomId || 1,
      guest_name: guestName,
      guest_email: guestEmail,
      guest_phone: guestPhone,
      check_in_date: new Date().toISOString().split('T')[0],
      check_out_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days later
      total_amount: amount * 5, // Total amount (20% paid upfront)
      paid_amount: amount,
      payment_status: 'completed',
      booking_status: 'confirmed',
      payment_id: testPaymentId,
      razorpay_order_id: testOrderId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Insert test booking
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert(bookingData)
      .select()
      .single();

    if (bookingError) {
      console.error('❌ Test booking creation error:', bookingError);
      // Continue anyway for testing
    }

    // Simulate sending WhatsApp notifications
    const notificationStatus = {
      guestMessageSent: true,
      ownerMessageSent: true,
      errors: []
    };

    // Try to send actual notifications (optional)
    try {
      const notificationResponse = await fetch(`${request.nextUrl.origin}/api/send-booking-notifications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bookingId: testBookingId,
          guestName,
          guestPhone,
          propertyName,
          roomNumber,
          amount,
          paymentId: testPaymentId
        }),
      });

      if (!notificationResponse.ok) {
        console.warn('⚠️ Test notification sending failed');
        notificationStatus.guestMessageSent = false;
        notificationStatus.ownerMessageSent = false;
      }
    } catch (notificationError) {
      console.warn('⚠️ Test notification error:', notificationError);
      notificationStatus.guestMessageSent = false;
      notificationStatus.ownerMessageSent = false;
    }

    // Generate success page URL
    const successUrl = new URL('/payment-success', request.nextUrl.origin);
    successUrl.searchParams.set('paymentId', testPaymentId);
    successUrl.searchParams.set('bookingId', testBookingId);
    successUrl.searchParams.set('amount', amount.toString());
    successUrl.searchParams.set('propertyName', propertyName);
    successUrl.searchParams.set('guestName', guestName);

    console.log('✅ Test payment created successfully');

    return NextResponse.json({
      success: true,
      message: 'Test payment created successfully',
      data: {
        paymentId: testPaymentId,
        orderId: testOrderId,
        bookingId: testBookingId,
        amount,
        propertyName,
        roomNumber,
        guestName,
        guestEmail,
        guestPhone,
        successUrl: successUrl.toString(),
        notificationStatus,
        booking: booking || bookingData
      }
    });

  } catch (error: any) {
    console.error('❌ Test payment creation error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to create test payment'
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  // Quick test payment with default values
  const testData = {
    propertyId: 1,
    roomId: 1,
    guestName: 'John Doe',
    guestEmail: 'john.doe@example.com',
    guestPhone: '+919876543210',
    amount: 2400
  };

  // Create a new request with POST method
  const testRequest = new NextRequest(request.url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(testData)
  });

  return POST(testRequest);
}