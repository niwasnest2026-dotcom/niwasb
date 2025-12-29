import { NextRequest, NextResponse } from 'next/server';

// Function to send WhatsApp message via API
async function sendWhatsAppMessage(phoneNumber: string, message: string) {
  try {
    // For demonstration, I'll show multiple WhatsApp API options
    // You can choose one based on your preference and budget
    
    // Option 1: Using WhatsApp Business API (Official)
    // Requires WhatsApp Business Account verification
    /*
    const response = await fetch('https://graph.facebook.com/v17.0/YOUR_PHONE_NUMBER_ID/messages', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: phoneNumber,
        type: 'text',
        text: { body: message }
      })
    });
    */

    // Option 2: Using Twilio WhatsApp API (Easier to set up)
    /*
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const client = require('twilio')(accountSid, authToken);
    
    const twilioMessage = await client.messages.create({
      body: message,
      from: 'whatsapp:+14155238886', // Twilio Sandbox number
      to: `whatsapp:${phoneNumber}`
    });
    */

    // Option 3: Using WhatsApp Web API (Third-party services)
    // Services like Ultramsg, ChatAPI, etc.
    /*
    const response = await fetch('https://api.ultramsg.com/instance_id/messages/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        token: process.env.ULTRAMSG_TOKEN,
        to: phoneNumber,
        body: message
      })
    });
    */

    // For now, we'll simulate sending and return success
    // In production, uncomment one of the above methods
    console.log(`Sending WhatsApp message to ${phoneNumber}:`, message);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return { success: true, messageId: `msg_${Date.now()}` };
    
  } catch (error) {
    console.error('WhatsApp sending error:', error);
    return { success: false, error: error };
  }
}

export async function POST(request: NextRequest) {
  try {
    const {
      guestName,
      guestWhatsapp,
      propertyName,
      paymentId,
      bookingId,
      amountPaid,
      amountDue,
      propertyLocation,
      checkInDate,
      duration
    } = await request.json();

    // Enhanced guest message with more details
    const guestMessage = `🎉 Booking Confirmed - Niwas Nest

Dear ${guestName},

Your PG booking has been successfully confirmed! 🏠

📋 Booking Details:
• Property: ${propertyName}
• Location: ${propertyLocation || 'As per property details'}
• Booking ID: ${bookingId}
• Payment ID: ${paymentId}
• Amount Paid: ₹${amountPaid.toLocaleString()}
• Remaining Amount: ₹${amountDue.toLocaleString()}
${checkInDate ? `• Check-in Date: ${checkInDate}` : ''}
${duration ? `• Duration: ${duration} months` : ''}

✅ What's Next:
• Property owner will contact you within 24 hours
• Remaining amount to be paid directly to property owner
• Keep this booking ID for your records
• Prepare required documents (ID proof, photos)

📞 Need Help?
Contact us: +91 63048 09598
Email: niwasnest2026@gmail.com

🏠 Welcome to Niwas Nest family!
Thank you for choosing us for your accommodation needs.`;

    // Enhanced owner message with actionable information
    const ownerMessage = `🔔 New Booking Alert - Niwas Nest

You have received a new booking! 🎉

👤 Guest Details:
• Name: ${guestName}
• WhatsApp: ${guestWhatsapp}
• Property: ${propertyName}
${propertyLocation ? `• Location: ${propertyLocation}` : ''}

💰 Payment Details:
• Booking ID: ${bookingId}
• Payment ID: ${paymentId}
• Advance Received: ₹${amountPaid.toLocaleString()}
• Remaining Amount: ₹${amountDue.toLocaleString()}
${checkInDate ? `• Check-in Date: ${checkInDate}` : ''}
${duration ? `• Duration: ${duration} months` : ''}

📞 URGENT ACTION REQUIRED:
1. Contact guest within 24 hours: ${guestWhatsapp}
2. Confirm booking and arrange remaining payment
3. Share property rules and check-in details
4. Prepare room for guest arrival

💡 Tips for smooth onboarding:
• Welcome the guest warmly
• Explain house rules clearly
• Collect remaining payment before check-in
• Take ID proof copy for records

Guest Contact: ${guestWhatsapp}

Niwas Nest Team
📞 Support: +91 63048 09598`;

    // Send WhatsApp messages
    const results = {
      guestMessageSent: false,
      ownerMessageSent: false,
      guestMessageId: null as string | null,
      ownerMessageId: null as string | null,
      errors: [] as string[]
    };

    // Send message to guest
    if (guestWhatsapp) {
      const guestResult = await sendWhatsAppMessage(guestWhatsapp, guestMessage);
      results.guestMessageSent = guestResult.success;
      results.guestMessageId = guestResult.messageId || null;
      if (!guestResult.success) {
        results.errors.push(`Guest message failed: ${guestResult.error}`);
      }
    }

    // Send message to owner/admin
    const ownerWhatsapp = '+916304809598'; // Your business WhatsApp number
    const ownerResult = await sendWhatsAppMessage(ownerWhatsapp, ownerMessage);
    results.ownerMessageSent = ownerResult.success;
    results.ownerMessageId = ownerResult.messageId || null;
    if (!ownerResult.success) {
      results.errors.push(`Owner message failed: ${ownerResult.error}`);
    }

    // Log the messages for debugging
    console.log('=== BOOKING NOTIFICATION SENT ===');
    console.log('Guest WhatsApp:', guestWhatsapp);
    console.log('Owner WhatsApp:', ownerWhatsapp);
    console.log('Guest Message Sent:', results.guestMessageSent);
    console.log('Owner Message Sent:', results.ownerMessageSent);
    console.log('Errors:', results.errors);

    return NextResponse.json({
      success: true,
      messages: {
        guest: guestMessage,
        owner: ownerMessage
      },
      results,
      guestWhatsapp,
      ownerWhatsapp
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