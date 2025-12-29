'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaCheckCircle, FaHome, FaReceipt, FaWhatsapp } from 'react-icons/fa';

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [bookingDetails, setBookingDetails] = useState<any>(null);
  const [guestMessage, setGuestMessage] = useState<string>('');
  const [guestWhatsappUrl, setGuestWhatsappUrl] = useState<string>('');

  const paymentId = searchParams.get('paymentId');
  const bookingId = searchParams.get('bookingId');
  const amount = searchParams.get('amount');
  const propertyName = searchParams.get('propertyName');
  const guestName = searchParams.get('guestName');

  useEffect(() => {
    if (!paymentId) {
      router.push('/');
      return;
    }

    // Set booking details from URL parameters
    setBookingDetails({
      paymentId,
      bookingId,
      amount: amount ? parseInt(amount) : 0,
      propertyName,
      guestName
    });

    // Get stored messages from localStorage
    const storedGuestMessage = localStorage.getItem('guestMessage');
    const storedGuestWhatsapp = localStorage.getItem('guestWhatsapp');
    
    if (storedGuestMessage) {
      setGuestMessage(storedGuestMessage);
      localStorage.removeItem('guestMessage'); // Clean up
    }
    
    if (storedGuestWhatsapp) {
      setGuestWhatsappUrl(storedGuestWhatsapp);
      localStorage.removeItem('guestWhatsapp'); // Clean up
    }
  }, [paymentId, bookingId, amount, propertyName, guestName, router]);

  if (!bookingDetails) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4" style={{ 
      background: 'linear-gradient(135deg, #63B3ED 0%, #90CDF4 50%, #63B3ED 100%)',
      backgroundSize: '400% 400%',
      animation: 'gradientShift 20s ease infinite'
    }}>
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
          {/* Success Icon */}
          <div className="mb-6">
            <FaCheckCircle className="text-6xl text-green-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
            <p className="text-gray-600">Your booking has been confirmed</p>
          </div>

          {/* Booking Details */}
          <div className="bg-gray-50 rounded-xl p-6 mb-6 text-left">
            <h2 className="text-xl font-bold text-gray-900 mb-4 text-center">Booking Details</h2>
            
            <div className="space-y-3">
              {bookingDetails.bookingId && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Booking ID:</span>
                  <span className="font-semibold text-gray-900">{bookingDetails.bookingId}</span>
                </div>
              )}
              
              <div className="flex justify-between">
                <span className="text-gray-600">Payment ID:</span>
                <span className="font-semibold text-gray-900">{bookingDetails.paymentId}</span>
              </div>
              
              {bookingDetails.propertyName && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Property:</span>
                  <span className="font-semibold text-gray-900">{bookingDetails.propertyName}</span>
                </div>
              )}
              
              {bookingDetails.guestName && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Guest Name:</span>
                  <span className="font-semibold text-gray-900">{bookingDetails.guestName}</span>
                </div>
              )}
              
              <div className="flex justify-between">
                <span className="text-gray-600">Amount Paid:</span>
                <span className="font-bold text-green-600">₹{bookingDetails.amount.toLocaleString()}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Payment Status:</span>
                <span className="font-semibold text-green-600">Confirmed</span>
              </div>
            </div>
          </div>

          {/* Important Information */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6 text-left">
            <h3 className="text-lg font-bold text-blue-800 mb-3">Important Information</h3>
            <ul className="text-blue-700 space-y-2 text-sm">
              <li>• This is a 20% advance payment to secure your booking</li>
              <li>• Remaining amount to be paid directly to property owner</li>
              <li>• You will receive a confirmation email shortly</li>
              <li>• Property owner will contact you within 24 hours</li>
              <li>• Keep this payment ID for your records</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="space-y-4">
            {/* Send Guest Confirmation Message */}
            {guestWhatsappUrl && (
              <button
                onClick={() => window.open(guestWhatsappUrl, '_blank')}
                className="w-full flex items-center justify-center px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-xl transition-all mb-4"
              >
                <FaWhatsapp className="mr-2" />
                Send Confirmation to Your WhatsApp
              </button>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link
                href="/"
                className="flex items-center justify-center px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl transition-all"
              >
                <FaHome className="mr-2" />
                Back to Home
              </Link>
              
              <Link
                href="/bookings"
                className="flex items-center justify-center px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-xl transition-all"
              >
                <FaReceipt className="mr-2" />
                My Bookings
              </Link>
            </div>
            
            <button
              onClick={() => {
                const message = `Hi! I have successfully made a booking payment.\n\nBooking Details:\nPayment ID: ${bookingDetails.paymentId}\nProperty: ${bookingDetails.propertyName || 'N/A'}\nAmount Paid: ₹${bookingDetails.amount.toLocaleString()}\n\nPlease confirm my booking and provide further details.`;
                const whatsappUrl = `https://wa.me/916304809598?text=${encodeURIComponent(message)}`;
                window.open(whatsappUrl, '_blank');
              }}
              className="w-full flex items-center justify-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all"
            >
              <FaWhatsapp className="mr-2" />
              Contact Property Owner
            </button>
          </div>

          {/* Footer Note */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              Thank you for choosing Niwas Nest! We're here to help make your stay comfortable.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}