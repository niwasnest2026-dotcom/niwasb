import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { ENV_CONFIG } from '@/lib/env-config';

export async function POST(request: NextRequest) {
  try {
    const { bookingId, paymentId } = await request.json();

    if (!bookingId && !paymentId) {
      return NextResponse.json(
        { success: false, error: 'Booking ID or Payment ID required' },
        { status: 400 }
      );
    }

    // Create admin client
    const supabaseAdmin = createClient(
      ENV_CONFIG.SUPABASE_URL,
      ENV_CONFIG.SUPABASE_SERVICE_ROLE_KEY
    );

    // Get booking details
    let query = supabaseAdmin
      .from('bookings')
      .select(`
        *,
        properties (
          name,
          owner_name,
          owner_phone
        )
      `);

    if (bookingId) {
      query = query.eq('id', bookingId);
    } else {
      query = query.eq('payment_id', paymentId); // Use payment_id instead of razorpay_payment_id
    }

    const { data: booking, error } = await query.single();

    if (error || !booking) {
      return NextResponse.json(
        { success: false, error: 'Booking not found' },
        { status: 404 }
      );
    }

    const notifications = {
      guestEmailSent: false,
      guestWhatsAppSent: false,
      ownerWhatsAppSent: false,
      adminEmailSent: false,
      errors: []
    };

    // Simulate email sending (you can integrate with actual email service)
    try {
      // Guest confirmation email
      console.log('📧 Sending confirmation email to:', booking.guest_email);
      notifications.guestEmailSent = true;
      
      // Admin notification email
      console.log('📧 Sending admin notification for booking:', booking.id);
      notifications.adminEmailSent = true;
    } catch (emailError) {
      notifications.errors.push('Email sending failed');
    }

    // Generate WhatsApp messages
    const guestMessage = `🎉 Booking Confirmed - Niwas Nest

Hi ${booking.guest_name}!

Your booking has been confirmed:
🏠 Property: ${booking.properties.name}
📋 Booking ID: ${booking.id}
💳 Payment ID: ${booking.payment_id}
💰 Amount Paid: ₹${booking.amount_paid.toLocaleString()}
💰 Remaining: ₹${booking.amount_due.toLocaleString()}

📞 Property owner will contact you within 24 hours.

Thank you for choosing Niwas Nest! 🏠`;

    const ownerMessage = `🔔 New Booking Alert - Niwas Nest

Property: ${booking.properties.name}
Guest: ${booking.guest_name}
Phone: ${booking.guest_phone}
Email: ${booking.guest_email}

Booking ID: ${booking.id}
Amount Received: ₹${booking.amount_paid.toLocaleString()}
Remaining: ₹${booking.amount_due.toLocaleString()}

Please contact the guest within 24 hours to confirm check-in details.`;

    // Store notification data for frontend
    const notificationData = {
      guestMessage,
      ownerMessage,
      guestPhone: booking.guest_phone,
      ownerPhone: booking.properties.owner_phone || '916304809598',
      ...notifications
    };

    return NextResponse.json({
      success: true,
      notifications: notificationData
    });

  } catch (error: any) {
    console.error('Error sending notifications:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to send notifications'
      },
      { status: 500 }
    );
  }
}