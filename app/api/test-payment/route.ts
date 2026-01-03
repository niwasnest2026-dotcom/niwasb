import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Verify the user session with Supabase
    const supabaseAuth = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            Authorization: authHeader,
          },
        },
      }
    );

    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Invalid authentication' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { 
      propertyId, 
      roomId, 
      guestName = user.user_metadata?.full_name || user.user_metadata?.name || 'Test User',
      guestEmail = user.email || 'test@example.com',
      guestPhone = '+919876543210',
      amount = 2400, // Default test amount
      userId = user.id // Use authenticated user ID
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

    // Get the first available property and room
    const { data: properties } = await supabase
      .from('properties')
      .select('id')
      .limit(1);
    
    const anchoredPropertyId = properties && properties.length > 0 ? properties[0].id : null;
    
    if (!anchoredPropertyId) {
      throw new Error('No properties found in database. Please add properties first.');
    }

    // Get or create a room for this property
    let { data: rooms } = await supabase
      .from('property_rooms')
      .select('id')
      .eq('property_id', anchoredPropertyId)
      .limit(1);

    let selectedRoomId = rooms && rooms.length > 0 ? rooms[0].id : null;

    // If no room exists, create one
    if (!selectedRoomId) {
      const { data: newRoom, error: roomError } = await supabase
        .from('property_rooms')
        .insert([{
          property_id: anchoredPropertyId,
          room_number: 'Room 1',
          room_type: 'Standard',
          sharing_type: 'Single',
          price_per_person: amount * 4,
          security_deposit_per_person: amount,
          total_beds: 1,
          available_beds: 1,
          floor_number: 1,
          has_attached_bathroom: true,
          has_balcony: false,
          has_ac: false,
          room_size_sqft: 100,
          description: 'Standard room with basic amenities',
          is_available: true
        }])
        .select()
        .single();

      if (!roomError && newRoom) {
        selectedRoomId = newRoom.id;
      }
    }

    // Create test booking record with proper room ID
    const bookingData = {
      property_id: anchoredPropertyId,
      room_id: selectedRoomId || roomId || 1, // Use actual room ID or fallback
      user_id: userId, // Link to authenticated user
      guest_name: guestName,
      guest_email: guestEmail,
      guest_phone: guestPhone,
      sharing_type: 'Single',
      price_per_person: amount * 4, // Monthly rent
      security_deposit_per_person: amount, // Security deposit
      total_amount: amount * 5, // Total amount (monthly rent + security)
      amount_paid: amount, // 20% paid upfront
      amount_due: amount * 4, // Remaining 80%
      payment_method: 'razorpay',
      payment_status: 'partial', // 20% paid, 80% due
      booking_status: 'confirmed',
      payment_reference: testPaymentId,
      payment_date: new Date().toISOString(),
      check_in_date: new Date().toISOString().split('T')[0],
      check_out_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days later
      notes: `Test booking created for user ${userId}. Payment ID: ${testPaymentId}`,
    };

    console.log('🔧 Creating booking with data:', bookingData);

    // Insert test booking
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert(bookingData)
      .select()
      .single();

    if (bookingError) {
      console.error('❌ Test booking creation error:', bookingError);
      throw new Error('Failed to create booking: ' + bookingError.message);
    }

    console.log('✅ Booking created successfully:', booking.id);

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

    // Generate success page URL using actual booking ID
    const actualBookingId = booking?.id || testBookingId;
    const successUrl = new URL('/payment-success', request.nextUrl.origin);
    successUrl.searchParams.set('paymentId', testPaymentId);
    successUrl.searchParams.set('bookingId', actualBookingId.toString());
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
        bookingId: actualBookingId,
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
  try {
    // Check authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Verify the user session with Supabase
    const supabaseAuth = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            Authorization: authHeader,
          },
        },
      }
    );

    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Invalid authentication' },
        { status: 401 }
      );
    }

    // Get anchored property ID for quick test
    const { data: properties } = await supabaseAuth
      .from('properties')
      .select('id')
      .limit(1);

    const anchoredPropertyId = properties && properties.length > 0 ? properties[0].id : null;
    
    if (!anchoredPropertyId) {
      return NextResponse.json({
        success: false,
        error: 'No properties found in database. Please add properties first.'
      }, { status: 400 });
    }

    // Quick test payment with anchored property ID
    const testData = {
      propertyId: anchoredPropertyId,
      roomId: 1,
      guestName: user.user_metadata?.full_name || user.user_metadata?.name || 'Test User',
      guestEmail: user.email || 'test@example.com',
      guestPhone: '+919876543210',
      amount: 2400,
      userId: user.id
    };

    // Create a new request with POST method and auth header
    const testRequest = new NextRequest(request.url, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': authHeader
      },
      body: JSON.stringify(testData)
    });

    return POST(testRequest);
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to create quick test payment'
    }, { status: 500 });
  }
}