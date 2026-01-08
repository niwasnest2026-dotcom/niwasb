'use client';

import { useState } from 'react';
import Script from 'next/script';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { supabase } from '@/lib/supabase';

interface RazorpayPaymentProps {
  amount: number;
  propertyId: string;
  propertyName: string;
  userDetails: {
    name: string;
    email: string;
    phone: string;
  };
  onError: (error: string) => void;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function RazorpayPayment({
  amount,
  propertyId,
  propertyName,
  userDetails,
  onError,
}: RazorpayPaymentProps) {
  const [loading, setLoading] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();

  const handlePayment = async () => {
    if (!scriptLoaded) {
      onError('Payment system is loading. Please try again.');
      return;
    }

    if (!user) {
      onError('You must be logged in to make a payment.');
      return;
    }

    // Validate user details
    if (!userDetails.name || !userDetails.email || !userDetails.phone) {
      onError('Please fill all details before payment');
      return;
    }

    setLoading(true);

    try {
      // Get authentication session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        onError('Authentication session expired. Please login again.');
        setLoading(false);
        return;
      }

      // Create Razorpay order
      const orderResponse = await fetch('/api/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          propertyId,
          amount,
          userDetails: {
            name: userDetails.name.trim(),
            email: userDetails.email.trim(),
            phone: userDetails.phone.trim()
          }
        }),
      });

      const orderData = await orderResponse.json();

      if (!orderData.success) {
        onError('Unable to start payment. Please try again or contact support.');
        setLoading(false);
        return;
      }

      // Initialize Razorpay payment
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'NiwasNest',
        description: `Booking for ${propertyName}`,
        order_id: orderData.order_id,
        prefill: {
          name: userDetails.name,
          email: userDetails.email,
          contact: userDetails.phone,
        },
        theme: {
          color: '#FF6711',
        },
        handler: async function (response: any) {
          try {
            // Verify payment and create booking
            const verifyResponse = await fetch('/api/verify-payment', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.access_token}`,
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                propertyId,
                userDetails
              }),
            });

            const verifyData = await verifyResponse.json();

            if (verifyData.success) {
              // Show success notification
              showSuccess(
                'Payment Successful! 🎉',
                `Your booking for ${propertyName} has been confirmed. Redirecting to booking details...`
              );
              
              // Small delay to show notification before redirect
              setTimeout(() => {
                const successUrl = `/payment-success?` + new URLSearchParams({
                  paymentId: response.razorpay_payment_id,
                  bookingId: verifyData.booking_id,
                  amount: amount.toString(),
                  propertyName: propertyName,
                  guestName: userDetails.name,
                  propertyId: propertyId
                }).toString();
                
                window.location.href = successUrl;
              }, 2000);
            } else {
              showError('Payment Verification Failed', verifyData.message || 'Please contact support if payment was deducted.');
              onError('Payment successful! Your booking is confirmed. Our team will contact you shortly.');
            }
          } catch (error) {
            showError('Payment Processing Failed', 'Please contact support if payment was deducted.');
            onError('Payment processing failed. Please contact support if payment was deducted.');
          } finally {
            setLoading(false);
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
        showError('Payment Failed', 'Please try again or use a different payment method.');
        onError('Payment failed. Please try again.');
        setLoading(false);
      });

      rzp.open();
    } catch (error) {
      showError('Payment System Error', 'Unable to start payment. Please try again or contact support.');
      onError('Unable to start payment. Please try again or contact support.');
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
          disabled={loading || !scriptLoaded || !userDetails.name || !userDetails.email || !userDetails.phone}
          className="w-full bg-primary hover:bg-primary-dark text-white font-semibold py-4 px-6 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span>Processing Payment...</span>
            </>
          ) : !scriptLoaded ? (
            <span>Loading Payment System...</span>
          ) : !userDetails.name || !userDetails.email || !userDetails.phone ? (
            <span>Please fill all details to continue</span>
          ) : (
            <>
              <span>💳</span>
              <span>Pay ₹{amount.toLocaleString()} Securely</span>
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