import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const {
      guestName,
      guestWhatsapp,
      propertyName,
      paymentId,
      bookingId,
      amountPaid,
      amountDue
    } = await request.json();

    // In a real implementation, you would integrate with WhatsApp Business API
    // For now, we'll create the message templates that can be sent manually or via API

    const guestMessage = `🎉 Booking Confirmed - Niwas Nest

Dear ${guestName},

Your booking has been successfully confirmed!

📋 Booking Details:
• Property: ${propertyName}
• Booking ID: ${bookingId}
• Payment ID: ${paymentId}
• Amount Paid: ₹${amountPaid.toLocaleString()}
• Remaining Amount: ₹${amountDue.toLocaleString()}

✅ What's Next:
• Property owner will contact you within 24 hours
• Remaining amount to be paid directly to property owner
• Keep this booking ID for your records

📞 Need Help?
Contact us: +91 63048 09598

Thank you for choosing Niwas Nest!`;

    const ownerMessage = `🔔 New Booking Alert - Niwas Nest

You have received a new booking!

👤 Guest Details:
• Name: ${guestName}
• WhatsApp: ${guestWhatsapp}
• Property: ${propertyName}

💰 Payment Details:
• Booking ID: ${bookingId}
• Payment ID: ${paymentId}
• Advance Received: ₹${amountPaid.toLocaleString()}
• Remaining Amount: ₹${amountDue.toLocaleString()}

📞 Action Required:
Please contact the guest within 24 hours to confirm their booking and arrange the remaining payment.

Guest WhatsApp: ${guestWhatsapp}

Niwas Nest Team`;

    // Log the messages (in production, you would send them via WhatsApp API)
    console.log('Guest Message:', guestMessage);
    console.log('Owner Message:', ownerMessage);

    // For now, return the messages so they can be used by the frontend
    return NextResponse.json({
      success: true,
      messages: {
        guest: guestMessage,
        owner: ownerMessage
      },
      guestWhatsapp,
      ownerWhatsapp: '+916304809598' // Your business WhatsApp number
    });

  } catch (error: any) {
    console.error('Notification sending error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}