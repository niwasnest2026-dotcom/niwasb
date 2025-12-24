# 🚀 Razorpay Quick Setup Guide

## ✅ What's Already Done:
- Razorpay integration is complete
- Payment components are ready
- API routes are configured
- Database is set up for payments

## 🔧 What You Need to Do:

### Step 1: Get Razorpay Credentials
1. **Sign up**: Go to https://razorpay.com/
2. **Complete verification** (business details, bank account)
3. **Go to Dashboard** → **Settings** → **API Keys**
4. **Generate Test Keys**:
   - Key ID (starts with `rzp_test_`)
   - Key Secret

### Step 2: Update Environment Variables
Replace these in your `.env` file:
```env
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_your_actual_key_id
RAZORPAY_KEY_SECRET=your_actual_key_secret
```

### Step 3: Test Payment Flow
1. **Go to**: http://localhost:3001
2. **Select a property** and click on a room
3. **Click "Book Now"**
4. **Fill guest details** and proceed to payment
5. **Test with Razorpay test cards**

## 🧪 Test Cards for Razorpay:

### Credit/Debit Cards:
- **Card Number**: `4111 1111 1111 1111`
- **Expiry**: Any future date (e.g., 12/25)
- **CVV**: Any 3 digits (e.g., 123)
- **Name**: Any name

### UPI Testing:
- **UPI ID**: `success@razorpay` (for successful payments)
- **UPI ID**: `failure@razorpay` (for testing failures)

### Net Banking:
- Select any bank and use test credentials

## 💳 Payment Methods Available:
- ✅ Credit/Debit Cards (Visa, Mastercard, RuPay)
- ✅ UPI (GPay, PhonePe, Paytm, BHIM)
- ✅ Net Banking (All major banks)
- ✅ Digital Wallets (Paytm, Mobikwik)

## 🔄 Payment Flow:
1. User fills booking details
2. Booking created in database (status: pending)
3. Razorpay payment gateway opens
4. User pays 20% advance amount
5. Payment verified with signature
6. Booking status updated to completed
7. Success confirmation shown

## 🛡️ Security Features:
- Payment signature verification
- Secure API routes
- Database transaction safety
- Encrypted payment data

## 📱 Mobile Responsive:
- Works on all devices
- Touch-friendly payment interface
- Optimized for mobile payments

## 🚀 Ready to Use:
Your Razorpay integration is production-ready! Just add your real API keys when you're ready to go live.

## 📞 Support:
- **Razorpay Docs**: https://razorpay.com/docs/
- **Test Cards**: https://razorpay.com/docs/payments/payments/test-card-upi-details/
- **Integration Help**: https://razorpay.com/docs/payments/payment-gateway/web-integration/

Your payment system is ready! 🎉