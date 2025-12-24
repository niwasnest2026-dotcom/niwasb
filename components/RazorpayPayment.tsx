'use client';

import { useState } from 'react';
import Script from 'next/script';

interface RazorpayPaymentProps {
  amount: number;
  bookingId: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  propertyName: string;
  roomNumber: string;
  onSuccess: (paymentId: string) => void;
  onError: (error: string) => void;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function RazorpayPayment({
  amount,
  bookingId,
  guestName,
  guestEmail,
  guestPhone,
  propertyName,
  roomNumber,
  onSuccess,
  onError,
}: RazorpayPaymentProps) {
  const [loading, setLoading] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  const handlePayment = async () => {
    if (!scriptLoaded) {
      onError('Payment system is loading. Please try again.');
      return;
    }

    setLoading(true);

    try {
      // Create order
      const orderResponse = await fetch('/api/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          receipt: `booking_${bookingId}`,
          notes: {
            booking_id: bookingId,
            property_name: propertyName,
            room_number: roomNumber,
          },
        }),
      });

      const orderData = await orderResponse.json();

      if (!orderData.success) {
        throw new Error(orderData.error || 'Failed to create order');
      }

      // Initialize Razorpay
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.order.amount,
        currency: orderData.order.currency,
        name: 'NiwasNest',
        description: `Booking for ${propertyName} - Room ${roomNumber}`,
        order_id: orderData.order.id,
        prefill: {
          name: guestName,
          email: guestEmail,
          contact: guestPhone,
        },
        theme: {
          color: '#1e3a5f',
        },
        method: {
          netbanking: true,
          card: true,
          upi: true,
          wallet: true,
        },
        handler: async function (response: any) {
          try {
            // Verify payment
            const verifyResponse = await fetch('/api/verify-payment', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                booking_id: bookingId,
              }),
            });

            const verifyData = await verifyResponse.json();

            if (verifyData.success) {
              onSuccess(response.razorpay_payment_id);
            } else {
              onError('Payment verification failed');
            }
          } catch (error: any) {
            onError(error.message || 'Payment verification failed');
          }
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      
      rzp.on('payment.failed', function (response: any) {
        onError(response.error.description || 'Payment failed');
        setLoading(false);
      });

      rzp.open();
    } catch (error: any) {
      onError(error.message || 'Failed to initiate payment');
      setLoading(false);
    }
  };

  return (
    <>
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        onLoad={() => setScriptLoaded(true)}
        onError={() => onError('Failed to load payment system')}
      />
      
      <div className="space-y-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-800 mb-2">Payment Methods Available:</h3>
          <div className="grid grid-cols-2 gap-2 text-sm text-blue-700">
            <div className="flex items-center space-x-2">
              <span>💳</span>
              <span>Credit/Debit Cards</span>
            </div>
            <div className="flex items-center space-x-2">
              <span>📱</span>
              <span>UPI (GPay, PhonePe, Paytm)</span>
            </div>
            <div className="flex items-center space-x-2">
              <span>🏦</span>
              <span>Net Banking</span>
            </div>
            <div className="flex items-center space-x-2">
              <span>👛</span>
              <span>Digital Wallets</span>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="font-medium">Amount to Pay:</span>
            <span className="text-2xl font-bold text-primary">₹{amount.toLocaleString()}</span>
          </div>
          <p className="text-sm text-gray-600">
            This is 20% advance payment. Remaining 80% to be paid directly to property owner.
          </p>
        </div>

        <button
          onClick={handlePayment}
          disabled={loading || !scriptLoaded}
          className="w-full bg-primary hover:bg-primary-dark text-white font-semibold py-4 px-6 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span>Processing...</span>
            </>
          ) : !scriptLoaded ? (
            <span>Loading Payment System...</span>
          ) : (
            <>
              <span>💳</span>
              <span>Pay ₹{amount.toLocaleString()} with Razorpay</span>
            </>
          )}
        </button>

        <div className="text-center">
          <p className="text-xs text-gray-500">
            Secured by Razorpay • Your payment information is encrypted and secure
          </p>
        </div>
      </div>
    </>
  );
}