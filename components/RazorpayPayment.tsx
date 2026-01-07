'use client';

import { useState, useEffect } from 'react';
import Script from 'next/script';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { preValidatePayment } from '@/lib/payment-validation';

interface RazorpayPaymentProps {
  amount: number;
  propertyId: string;
  propertyName: string;
  userDetails: {
    name: string;
    email: string;
    phone: string;
    sharing_type?: string;
    price_per_person?: number;
    security_deposit_per_person?: number;
    total_amount?: number;
    amount_paid?: number;
    amount_due?: number;
    room_id?: string;
    check_in?: string;
    check_out?: string;
  };
  onSuccess: (paymentId: string, bookingId: string) => void;
  onError: (error: string) => void;
  // Legacy props for backward compatibility (DEPRECATED)
  bookingId?: string;
  guestName?: string;
  guestEmail?: string;
  guestPhone?: string;
  roomNumber?: string;
  bookingDetails?: any;
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
  userDetails: propUserDetails,
  onSuccess,
  onError,
  // Legacy props for backward compatibility
  bookingId,
  guestName,
  guestEmail,
  guestPhone,
  roomNumber,
  bookingDetails,
}: RazorpayPaymentProps) {
  const [loading, setLoading] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const { user } = useAuth();

  // 1️⃣ DEFINE DEFAULT STATE (MANDATORY) - Safe initialization
  const [userDetails, setUserDetails] = useState({
    name: "",
    email: "",
    phone: "",
    sharing_type: "",
    price_per_person: 0,
    security_deposit_per_person: 0,
    total_amount: 0,
    amount_paid: 0,
    amount_due: 0,
    room_id: "",
    check_in: "",
    check_out: "",
  });

  // 2️⃣ INITIALIZE STATE FROM PROPS (onPageLoad logic)
  useEffect(() => {
    console.log('🔄 Initializing userDetails from props...', { propUserDetails, guestName, guestEmail, guestPhone });
    
    let normalizedUserDetails;
    
    // Handle new interface (preferred)
    if (propUserDetails && propUserDetails.name && propUserDetails.email && propUserDetails.phone) {
      console.log('✅ Using new userDetails interface');
      normalizedUserDetails = {
        name: propUserDetails.name || "",
        email: propUserDetails.email || "",
        phone: propUserDetails.phone || "",
        sharing_type: propUserDetails.sharing_type || "",
        price_per_person: propUserDetails.price_per_person || 0,
        security_deposit_per_person: propUserDetails.security_deposit_per_person || 0,
        total_amount: propUserDetails.total_amount || 0,
        amount_paid: propUserDetails.amount_paid || 0,
        amount_due: propUserDetails.amount_due || 0,
        room_id: propUserDetails.room_id || "",
        check_in: propUserDetails.check_in || "",
        check_out: propUserDetails.check_out || "",
      };
    }
    // Handle legacy interface (backward compatibility)
    else if (guestName && guestEmail && guestPhone) {
      console.log('⚠️ Using legacy props for backward compatibility');
      normalizedUserDetails = {
        name: guestName || "",
        email: guestEmail || "",
        phone: guestPhone || "",
        sharing_type: bookingDetails?.sharing_type || "",
        price_per_person: bookingDetails?.price_per_person || 0,
        security_deposit_per_person: bookingDetails?.security_deposit_per_person || 0,
        total_amount: bookingDetails?.total_amount || 0,
        amount_paid: bookingDetails?.amount_paid || 0,
        amount_due: bookingDetails?.amount_due || 0,
        room_id: bookingDetails?.room_id || "",
        check_in: bookingDetails?.check_in || "",
        check_out: bookingDetails?.check_out || "",
      };
    }
    // Fallback to user data if available
    else if (user) {
      console.log('⚠️ Using fallback user data');
      normalizedUserDetails = {
        name: user.user_metadata?.full_name || user.email?.split('@')[0] || "",
        email: user.email || "",
        phone: user.user_metadata?.phone || "",
        sharing_type: "",
        price_per_person: 0,
        security_deposit_per_person: 0,
        total_amount: 0,
        amount_paid: 0,
        amount_due: 0,
        room_id: "",
        check_in: "",
        check_out: "",
      };
    }
    // Final fallback - empty but safe defaults
    else {
      console.log('⚠️ Using empty defaults - user must fill details');
      normalizedUserDetails = {
        name: "",
        email: "",
        phone: "",
        sharing_type: "",
        price_per_person: 0,
        security_deposit_per_person: 0,
        total_amount: 0,
        amount_paid: 0,
        amount_due: 0,
        room_id: "",
        check_in: "",
        check_out: "",
      };
    }

    console.log('✅ UserDetails normalized:', {
      name: normalizedUserDetails.name,
      email: normalizedUserDetails.email,
      phone: normalizedUserDetails.phone,
      hasAllRequired: !!(normalizedUserDetails.name && normalizedUserDetails.email && normalizedUserDetails.phone)
    });

    setUserDetails(normalizedUserDetails);
  }, [propUserDetails, guestName, guestEmail, guestPhone, bookingDetails, user]);

  const handlePayment = async () => {
    if (!scriptLoaded) {
      onError('Payment system is loading. Please try again.');
      return;
    }

    if (!user) {
      onError('You must be logged in to make a payment.');
      return;
    }

    // 3️⃣ ADD HARD GUARD BEFORE PAYMENT (REQUIRED)
    console.log('🔍 Pre-validating payment data...', { userDetails });
    
    // 4️⃣ PROTECT PAY BUTTON HANDLER (CRITICAL) - Safe destructuring
    const { name, email, phone } = userDetails || {};
    
    if (!name || !email || !phone) {
      console.log('❌ Missing user details:', { name: !!name, email: !!email, phone: !!phone, userDetails });
      onError('Please fill all details before payment');
      return;
    }

    const paymentInput = {
      propertyId,
      amount,
      userDetails: {
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim()
      }
    };

    const validationError = preValidatePayment(paymentInput);
    if (validationError) {
      onError(validationError);
      return;
    }

    console.log('✅ Pre-validation passed');
    setLoading(true);

    try {
      // Step 2: Get authentication session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        onError('Authentication session expired. Please login again.');
        setLoading(false);
        return;
      }

      console.log('🔄 Creating order for property:', propertyId);

      // Step 3: SEND PAYLOAD EXPLICITLY (CRITICAL)
      // 5️⃣ FIX INVALID URL ERROR - Ensure valid URL
      const orderPayload = {
        propertyId: propertyId,
        amount: amount,
        userDetails: {
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim()
        }
      };

      console.log('📤 Sending standardized payload:', {
        propertyId: orderPayload.propertyId,
        amount: orderPayload.amount,
        userDetails: {
          name: orderPayload.userDetails.name,
          email: orderPayload.userDetails.email,
          phone: orderPayload.userDetails.phone
        }
      });

      const orderResponse = await fetch('/api/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(orderPayload),
      });

      const orderData = await orderResponse.json();

      if (!orderData.success) {
        // UX FIX: Generic error message (no internal field names or backend validation messages)
        onError('Unable to start payment. Please try again or contact support.');
        setLoading(false);
        return;
      }

      console.log('✅ Order created:', orderData.order_id);

      // Step 4: Initialize Razorpay payment
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'NiwasNest',
        description: `Booking for ${propertyName}`,
        order_id: orderData.order_id,
        prefill: {
          name: name,
          email: email,
          contact: phone,
        },
        theme: {
          color: '#FF6711', // Orange theme
        },
        method: {
          netbanking: true,
          card: true,
          upi: true,
          wallet: true,
        },
        handler: async function (response: any) {
          try {
            console.log('🔄 Payment successful, verifying...');

            // Show generic processing message
            setLoading(true);

            // Step 5: Verify payment and create booking (server-side only)
            const verifyPayload = {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              propertyId,
              userDetails: {
                name: name,
                email: email,
                phone: phone,
                sharing_type: userDetails?.sharing_type || '',
                price_per_person: userDetails?.price_per_person || 0,
                security_deposit_per_person: userDetails?.security_deposit_per_person || 0,
                total_amount: userDetails?.total_amount || 0,
                amount_paid: userDetails?.amount_paid || 0,
                amount_due: userDetails?.amount_due || 0,
                room_id: userDetails?.room_id || '',
                check_in: userDetails?.check_in || '',
                check_out: userDetails?.check_out || '',
              }
            };

            const verifyResponse = await fetch('/api/verify-payment', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.access_token}`,
              },
              body: JSON.stringify(verifyPayload),
            });

            const verifyData = await verifyResponse.json();
            console.log('✅ Payment verification response:', verifyData);

            if (verifyData.success) {
              // Payment verified and booking created on server
              console.log('✅ Booking created:', verifyData.booking_id);
              onSuccess(response.razorpay_payment_id, verifyData.booking_id);
            } else {
              // Show generic error message (no raw backend errors)
              if (verifyData.support_needed) {
                onError('Payment received. Booking confirmation in progress. Support will contact you shortly.');
              } else {
                onError('Payment verification failed. Please contact support if payment was deducted.');
              }
            }
          } catch (error: any) {
            console.error('❌ Payment verification error:', error);
            // Generic error message - no raw error details
            onError('Payment processing failed. Please contact support if payment was deducted.');
          } finally {
            setLoading(false);
          }
        },
        modal: {
          ondismiss: function () {
            console.log('Payment modal dismissed');
            setLoading(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      
      rzp.on('payment.failed', function (response: any) {
        console.error('❌ Payment failed:', response.error);
        // UX FIX: Generic error message (no popup error with raw backend messages)
        onError('Unable to start payment. Please try again or contact support.');
        setLoading(false);
      });

      rzp.open();
    } catch (error: any) {
      console.error('❌ Payment initiation error:', error);
      // UX FIX: Generic error message
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
          disabled={loading || !scriptLoaded || !userDetails?.name || !userDetails?.email || !userDetails?.phone}
          className="w-full bg-primary hover:bg-primary-dark text-white font-semibold py-4 px-6 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span>Processing Payment...</span>
            </>
          ) : !scriptLoaded ? (
            <span>Loading Payment System...</span>
          ) : !userDetails?.name || !userDetails?.email || !userDetails?.phone ? (
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
          <p className="text-xs text-gray-400 mt-1">
            Payment received. Booking confirmation in progress.
          </p>
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-2 p-2 bg-gray-100 rounded text-xs text-left">
              <strong>Debug Info:</strong>
              <br />Name: {userDetails?.name || 'Missing'}
              <br />Email: {userDetails?.email || 'Missing'}
              <br />Phone: {userDetails?.phone || 'Missing'}
              <br />Valid: {!!(userDetails?.name && userDetails?.email && userDetails?.phone) ? 'Yes' : 'No'}
            </div>
          )}
        </div>
      </div>
    </>
  );
}