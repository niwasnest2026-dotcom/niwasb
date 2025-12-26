# Razorpay Integration Guide

## Overview
Razorpay payment integration has been implemented directly on the property details page. Users can now book properties with a seamless payment experience without leaving the property page.

## Features Implemented

### 1. **Integrated Payment Modal**
- Payment modal opens directly on the property page when "Book Now" is clicked
- No redirect to separate payment page
- Seamless user experience

### 2. **Enhanced Search Functionality**
- Duration selection (1-9 months, 12 months)
- Check-in and check-out date selection
- Automatic check-out date calculation based on duration
- Search parameters passed through the booking flow

### 3. **Razorpay Payment Integration**
- Multiple payment methods: Cards, UPI, Net Banking, Wallets
- 20% advance payment structure
- Secure payment verification
- Automatic booking creation after successful payment

### 4. **Booking Management**
- Automatic booking record creation in database
- Payment tracking with Razorpay payment ID
- Duration and date information stored
- Email confirmation (ready for implementation)

## Setup Instructions

### 1. **Razorpay Account Setup**
1. Create account at [Razorpay Dashboard](https://dashboard.razorpay.com/)
2. Get your API keys from the Keys section
3. Add the keys to your `.env` file:

```env
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_your_key_id
RAZORPAY_KEY_SECRET=your_secret_key
```

### 2. **Database Schema**
The booking table should include these fields:
- `duration_months` (integer, nullable)
- `check_in_date` (date, nullable)
- `check_out_date` (date, nullable)
- `payment_reference` (text for Razorpay payment ID)

### 3. **Testing**
1. Use Razorpay test keys for development
2. Test with different payment methods
3. Verify booking creation in database
4. Test the complete flow from search to payment

## User Flow

1. **Search**: User searches with location, duration, and dates
2. **Browse**: Search parameters displayed on listings page
3. **Property View**: Search criteria shown on property details
4. **Book**: Click "Book Now" opens payment modal
5. **Payment**: Complete payment through Razorpay
6. **Confirmation**: Booking confirmed and stored in database

## Payment Structure

- **20% Advance**: Paid through Razorpay during booking
- **80% Remaining**: To be paid directly to property owner
- **Security**: All payments secured by Razorpay's encryption

## Next Steps

1. **Email Notifications**: Implement booking confirmation emails
2. **SMS Notifications**: Send booking details via SMS
3. **Booking Management**: Admin panel for managing bookings
4. **Payment Tracking**: Dashboard for payment analytics
5. **Refund System**: Handle cancellations and refunds

## Files Modified

- `app/property/[id]/page.tsx` - Added payment modal and Razorpay integration
- `components/SearchForm.tsx` - Added duration and date selection
- `app/listings/ListingsContent.tsx` - Display search parameters
- `app/api/verify-payment/route.ts` - Updated for new booking flow
- `.env.example` - Added Razorpay environment variables

## Security Notes

- Razorpay Key ID is public and safe to expose
- Razorpay Key Secret must be kept private (server-side only)
- Payment verification uses HMAC signature validation
- All sensitive data encrypted in transit

The integration is now complete and ready for testing with Razorpay test credentials!