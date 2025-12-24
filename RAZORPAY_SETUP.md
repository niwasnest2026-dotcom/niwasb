# 🚀 Razorpay Integration Setup Guide

## Step 1: Get Razorpay Credentials

1. **Sign up for Razorpay**: Go to https://razorpay.com/
2. **Create an account** and complete verification
3. **Go to Dashboard** → **Settings** → **API Keys**
4. **Generate API Keys**:
   - **Key ID** (starts with `rzp_test_` for test mode)
   - **Key Secret** (keep this secret!)

## Step 2: Update Environment Variables

Replace the placeholder values in your `.env` file:

```env
# Razorpay Configuration
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_your_actual_key_id
RAZORPAY_KEY_SECRET=your_actual_key_secret
```

## Step 3: Test Payment Integration

1. **Restart your development server**:
   ```bash
   npm run dev
   ```

2. **Test the payment flow**:
   - Go to any property page
   - Click "Book Now" on a room
   - Fill in guest details
   - Click "Proceed to Payment"
   - Test with Razorpay's test cards

## Step 4: Razorpay Test Cards

Use these test cards for testing:

### Credit/Debit Cards:
- **Card Number**: `4111 1111 1111 1111`
- **Expiry**: Any future date
- **CVV**: Any 3 digits
- **Name**: Any name

### UPI Testing:
- **UPI ID**: `success@razorpay`
- **UPI ID**: `failure@razorpay` (for testing failures)

### Net Banking:
- Select any bank and use test credentials provided by Razorpay

## Step 5: Payment Methods Available

Your integration supports:
- ✅ **Credit/Debit Cards** (Visa, Mastercard, RuPay, etc.)
- ✅ **UPI** (GPay, PhonePe, Paytm, BHIM, etc.)
- ✅ **Net Banking** (All major banks)
- ✅ **Digital Wallets** (Paytm, Mobikwik, etc.)

## Step 6: Production Setup

When ready for production:

1. **Switch to Live Mode** in Razorpay Dashboard
2. **Generate Live API Keys**
3. **Update environment variables** with live keys
4. **Complete KYC verification** in Razorpay
5. **Test with real payments** (small amounts)

## Features Implemented:

### ✅ Payment Flow:
1. User fills booking details
2. Booking is created in database
3. Razorpay payment gateway opens
4. User pays 20% advance
5. Payment is verified
6. Booking status is updated
7. Success confirmation shown

### ✅ Security:
- Payment signature verification
- Secure API routes
- Database transaction safety
- Error handling

### ✅ User Experience:
- Multiple payment methods
- Real-time payment status
- Clear payment breakdown
- Mobile-responsive design

## Troubleshooting:

### Common Issues:
1. **"Payment failed"**: Check API keys are correct
2. **"Order creation failed"**: Verify Razorpay credentials
3. **"Verification failed"**: Check webhook signature
4. **"Database error"**: Ensure booking tables exist

### Debug Steps:
1. Check browser console for errors
2. Verify environment variables are loaded
3. Test with Razorpay test credentials first
4. Check network tab for API call failures

## Support:
- **Razorpay Docs**: https://razorpay.com/docs/
- **Test Cards**: https://razorpay.com/docs/payments/payments/test-card-upi-details/
- **Integration Guide**: https://razorpay.com/docs/payments/payment-gateway/web-integration/

Your Razorpay integration is now ready! 🎉