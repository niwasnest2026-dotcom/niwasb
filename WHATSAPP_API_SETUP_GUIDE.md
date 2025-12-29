# 📱 WhatsApp API Setup Guide

## 🎯 Automatic WhatsApp Messaging System

The system is now configured to automatically send WhatsApp messages to both the guest and property owner when a booking is completed.

## 🔧 Current Implementation

### What's Working Now:
- ✅ **Message Templates**: Professional messages for guest and owner
- ✅ **API Structure**: Complete notification system ready
- ✅ **Error Handling**: Proper error tracking and logging
- ✅ **Status Display**: Shows notification success/failure on success page
- ✅ **Fallback Options**: Manual WhatsApp buttons as backup

### Message Flow:
1. **Payment Completed** → Triggers notification API
2. **Guest Message**: Booking confirmation with all details
3. **Owner Message**: New booking alert with guest contact info
4. **Status Tracking**: Shows which messages were sent successfully

## 🚀 WhatsApp API Integration Options

To enable actual WhatsApp message sending, choose one of these options:

### Option 1: WhatsApp Business API (Official) 🏢
**Best for**: Large businesses, official integration
**Cost**: Free for first 1000 messages/month, then paid
**Setup Time**: 2-3 weeks (requires business verification)

```javascript
// Add to .env
WHATSAPP_ACCESS_TOKEN=your_access_token
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id

// Uncomment in send-booking-notifications/route.ts
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
```

### Option 2: Twilio WhatsApp API 📞
**Best for**: Quick setup, reliable service
**Cost**: $0.005 per message
**Setup Time**: 30 minutes

```bash
npm install twilio
```

```javascript
// Add to .env
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token

// Uncomment in send-booking-notifications/route.ts
const client = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

const twilioMessage = await client.messages.create({
  body: message,
  from: 'whatsapp:+14155238886', // Twilio Sandbox number
  to: `whatsapp:${phoneNumber}`
});
```

### Option 3: Third-Party WhatsApp APIs 🔌
**Best for**: Budget-friendly, quick implementation
**Cost**: $10-50/month for unlimited messages
**Setup Time**: 15 minutes

Popular services:
- **Ultramsg**: https://ultramsg.com
- **ChatAPI**: https://chat-api.com
- **WhatsApp-Web.js**: Self-hosted solution

```javascript
// Example with Ultramsg
// Add to .env
ULTRAMSG_TOKEN=your_token
ULTRAMSG_INSTANCE_ID=your_instance_id

// Uncomment in send-booking-notifications/route.ts
const response = await fetch(`https://api.ultramsg.com/${process.env.ULTRAMSG_INSTANCE_ID}/messages/chat`, {
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
```

## 📋 Setup Steps (Choose One Option)

### For Twilio (Recommended for Quick Setup):

1. **Create Twilio Account**: https://www.twilio.com/try-twilio
2. **Get WhatsApp Sandbox**: Console → Messaging → Try WhatsApp
3. **Add Environment Variables**:
   ```
   TWILIO_ACCOUNT_SID=your_account_sid
   TWILIO_AUTH_TOKEN=your_auth_token
   ```
4. **Install Twilio**: `npm install twilio`
5. **Uncomment Twilio code** in `send-booking-notifications/route.ts`
6. **Test with sandbox number** first
7. **Apply for production** WhatsApp number

### For Ultramsg (Budget Option):

1. **Create Account**: https://ultramsg.com
2. **Connect WhatsApp**: Scan QR code with your WhatsApp
3. **Get API Token**: Dashboard → API
4. **Add Environment Variables**:
   ```
   ULTRAMSG_TOKEN=your_token
   ULTRAMSG_INSTANCE_ID=your_instance_id
   ```
5. **Uncomment Ultramsg code** in `send-booking-notifications/route.ts`
6. **Test immediately** - works right away

## 🎯 Current Message Templates

### Guest Confirmation Message:
```
🎉 Booking Confirmed - Niwas Nest

Dear [Guest Name],

Your PG booking has been successfully confirmed! 🏠

📋 Booking Details:
• Property: [Property Name]
• Location: [Property Location]
• Booking ID: [Booking ID]
• Payment ID: [Payment ID]
• Amount Paid: ₹[Amount]
• Remaining Amount: ₹[Amount Due]
• Check-in Date: [Date]
• Duration: [Duration] months

✅ What's Next:
• Property owner will contact you within 24 hours
• Remaining amount to be paid directly to property owner
• Keep this booking ID for your records
• Prepare required documents (ID proof, photos)

📞 Need Help?
Contact us: +91 63048 09598
Email: niwasnest2026@gmail.com

🏠 Welcome to Niwas Nest family!
```

### Owner Alert Message:
```
🔔 New Booking Alert - Niwas Nest

You have received a new booking! 🎉

👤 Guest Details:
• Name: [Guest Name]
• WhatsApp: [Guest WhatsApp]
• Property: [Property Name]
• Location: [Property Location]

💰 Payment Details:
• Booking ID: [Booking ID]
• Payment ID: [Payment ID]
• Advance Received: ₹[Amount Paid]
• Remaining Amount: ₹[Amount Due]
• Check-in Date: [Date]
• Duration: [Duration] months

📞 URGENT ACTION REQUIRED:
1. Contact guest within 24 hours: [Guest WhatsApp]
2. Confirm booking and arrange remaining payment
3. Share property rules and check-in details
4. Prepare room for guest arrival

💡 Tips for smooth onboarding:
• Welcome the guest warmly
• Explain house rules clearly
• Collect remaining payment before check-in
• Take ID proof copy for records

Guest Contact: [Guest WhatsApp]

Niwas Nest Team
📞 Support: +91 63048 09598
```

## 🔍 Testing

### Current Status:
- **Simulation Mode**: Messages are logged but not sent
- **Status Tracking**: Success page shows notification status
- **Fallback Buttons**: Manual WhatsApp options available

### To Test:
1. Complete a booking payment
2. Check browser console for message logs
3. Verify success page shows notification status
4. Use manual WhatsApp buttons as backup

## 🚀 Production Deployment

1. **Choose WhatsApp API provider**
2. **Add environment variables** to your hosting platform
3. **Uncomment appropriate code** in the API
4. **Test with real phone numbers**
5. **Monitor message delivery** and success rates

## 📊 Benefits

### For Guests:
- ✅ Instant booking confirmation
- ✅ All details in one message
- ✅ Clear next steps
- ✅ Contact information readily available

### For Property Owners:
- ✅ Immediate booking alerts
- ✅ Guest contact information
- ✅ Payment details
- ✅ Actionable instructions

### For Business:
- ✅ Automated communication
- ✅ Reduced manual work
- ✅ Professional image
- ✅ Better customer experience

**The WhatsApp notification system is ready - just choose your preferred API provider and enable it!** 📱✨