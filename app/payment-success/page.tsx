'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  FaCheckCircle, 
  FaHome, 
  FaReceipt, 
  FaWhatsapp, 
  FaPhone, 
  FaEnvelope,
  FaMapMarkerAlt,
  FaRupeeSign,
  FaClock,
  FaUser,
  FaBuilding,
  FaShare
} from 'react-icons/fa';

interface BookingDetails {
  id: string;
  guest_name: string;
  guest_email: string;
  guest_phone: string;
  payment_id: string;
  amount_paid: number;
  amount_due: number;
  total_amount: number;
  remaining_amount: number;
  booking_status: string;
  payment_status: string;
  booking_date: string;
  payment_date: string;
  property: {
    id: string;
    name: string;
    address: string;
    city: string;
    featured_image: string;
    owner_name: string;
    owner_phone: string;
    monthly_rent: number;
    security_deposit: number;
  };
}

interface NotificationData {
  guestMessage: string;
  ownerMessage: string;
  guestPhone: string;
  ownerPhone: string;
  guestEmailSent: boolean;
  guestWhatsAppSent: boolean;
  ownerWhatsAppSent: boolean;
  adminEmailSent: boolean;
  errors: string[];
}

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [bookingDetails, setBookingDetails] = useState<BookingDetails | null>(null);
  const [notifications, setNotifications] = useState<NotificationData | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [showCelebration, setShowCelebration] = useState(true);

  const paymentId = searchParams.get('paymentId');
  const bookingId = searchParams.get('bookingId');

  // Success steps timeline
  const successSteps = [
    { title: 'Payment Verified', icon: FaCheckCircle, completed: true },
    { title: 'Booking Created', icon: FaReceipt, completed: true },
    { title: 'Notifications Sent', icon: FaWhatsapp, completed: false },
    { title: 'Owner Contacted', icon: FaPhone, completed: false }
  ];

  useEffect(() => {
    if (!paymentId && !bookingId) {
      router.push('/');
      return;
    }

    fetchBookingDetails();
    sendNotifications();
    
    // Hide celebration after 3 seconds
    setTimeout(() => setShowCelebration(false), 3000);
    
    // Animate steps
    const stepInterval = setInterval(() => {
      setCurrentStep(prev => {
        if (prev < successSteps.length - 1) {
          return prev + 1;
        } else {
          clearInterval(stepInterval);
          return prev;
        }
      });
    }, 1000);

    return () => clearInterval(stepInterval);
  }, [paymentId, bookingId, router]);

  const fetchBookingDetails = async () => {
    try {
      const params = new URLSearchParams();
      if (bookingId) params.append('bookingId', bookingId);
      if (paymentId) params.append('paymentId', paymentId);

      const response = await fetch(`/api/booking-details?${params}`);
      const data = await response.json();

      if (data.success) {
        setBookingDetails(data.booking);
      } else {
        console.error('Failed to fetch booking details:', data.error);
      }
    } catch (error) {
      console.error('Error fetching booking details:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendNotifications = async () => {
    try {
      const response = await fetch('/api/send-notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId, paymentId })
      });

      const data = await response.json();
      if (data.success) {
        setNotifications(data.notifications);
      }
    } catch (error) {
      console.error('Error sending notifications:', error);
    }
  };

  const openWhatsApp = (phone: string, message: string) => {
    const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const shareBooking = () => {
    if (navigator.share && bookingDetails) {
      navigator.share({
        title: 'My Booking Confirmed - Niwas Nest',
        text: `I just booked ${bookingDetails.property.name} through Niwas Nest!`,
        url: window.location.href
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-white border-t-transparent mx-auto mb-4"></div>
          <p className="text-white text-lg font-semibold">Loading your booking details...</p>
        </div>
      </div>
    );
  }

  if (!bookingDetails) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Booking Not Found</h1>
          <Link href="/" className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary-dark transition-colors">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600 animate-gradient-shift">
      {/* Celebration Overlay */}
      {showCelebration && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="text-center">
            <div className="text-8xl mb-4 animate-bounce">🎉</div>
            <h1 className="text-4xl font-bold text-white mb-2">Payment Successful!</h1>
            <p className="text-xl text-white">Your booking is confirmed</p>
          </div>
        </div>
      )}

      <div className="py-8 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Success Header */}
          <div className="text-center mb-8">
            <FaCheckCircle className="text-6xl text-green-500 mx-auto mb-4" />
            <h1 className="text-4xl font-bold text-white mb-2">Booking Confirmed!</h1>
            <p className="text-xl text-white opacity-90">Welcome to your new home away from home</p>
          </div>

          {/* Progress Steps */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">Booking Process</h2>
            <div className="flex justify-between items-center">
              {successSteps.map((step, index) => (
                <div key={index} className="flex flex-col items-center flex-1">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-all duration-500 ${
                    index <= currentStep ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-400'
                  }`}>
                    <step.icon className="text-lg" />
                  </div>
                  <p className={`text-sm font-medium text-center ${
                    index <= currentStep ? 'text-green-600' : 'text-gray-400'
                  }`}>
                    {step.title}
                  </p>
                  {index < successSteps.length - 1 && (
                    <div className={`h-1 w-full mt-2 transition-all duration-500 ${
                      index < currentStep ? 'bg-green-500' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Property Details Card */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <img
                src={bookingDetails.property.featured_image || '/placeholder-property.jpg'}
                alt={bookingDetails.property.name}
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{bookingDetails.property.name}</h3>
                
                <div className="space-y-3 mb-6">
                  <div className="flex items-center text-gray-600">
                    <FaMapMarkerAlt className="mr-3 text-orange-500" />
                    <span>{bookingDetails.property.address}, {bookingDetails.property.city}</span>
                  </div>
                  
                  <div className="flex items-center text-gray-600">
                    <FaRupeeSign className="mr-3 text-green-500" />
                    <span>Monthly Rent: ₹{bookingDetails.property.monthly_rent.toLocaleString()}</span>
                  </div>
                  
                  {bookingDetails.property.security_deposit > 0 && (
                    <div className="flex items-center text-gray-600">
                      <FaBuilding className="mr-3 text-blue-500" />
                      <span>Security Deposit: ₹{bookingDetails.property.security_deposit.toLocaleString()}</span>
                    </div>
                  )}
                </div>

                {/* Owner Contact */}
                <div className="border-t pt-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Property Owner</h4>
                  <div className="space-y-2">
                    <div className="flex items-center text-gray-600">
                      <FaUser className="mr-3 text-purple-500" />
                      <span>{bookingDetails.property.owner_name || 'Contact via support'}</span>
                    </div>
                    {bookingDetails.property.owner_phone && (
                      <div className="flex items-center text-gray-600">
                        <FaPhone className="mr-3 text-green-500" />
                        <span>{bookingDetails.property.owner_phone}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Booking Summary Card */}
            <div className="space-y-6">
              {/* Booking Details */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Booking Summary</h3>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Booking ID:</span>
                    <span className="font-semibold text-gray-900">{bookingDetails.id}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment ID:</span>
                    <span className="font-semibold text-gray-900">{bookingDetails.payment_id}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Guest Name:</span>
                    <span className="font-semibold text-gray-900">{bookingDetails.guest_name}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Booking Date:</span>
                    <span className="font-semibold text-gray-900">
                      {new Date(bookingDetails.booking_date).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                      Confirmed
                    </span>
                  </div>
                </div>
              </div>

              {/* Payment Summary */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Payment Summary</h3>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Amount:</span>
                    <span className="font-semibold text-gray-900 flex items-center">
                      <FaRupeeSign className="mr-1" />
                      {bookingDetails.total_amount.toLocaleString()}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Amount Paid (20%):</span>
                    <span className="font-bold text-green-600 flex items-center">
                      <FaRupeeSign className="mr-1" />
                      {bookingDetails.amount_paid.toLocaleString()}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Remaining (80%):</span>
                    <span className="font-bold text-orange-600 flex items-center">
                      <FaRupeeSign className="mr-1" />
                      {bookingDetails.amount_due.toLocaleString()}
                    </span>
                  </div>
                  
                  <div className="border-t pt-3">
                    <p className="text-sm text-gray-500">
                      Remaining amount to be paid directly to property owner
                    </p>
                  </div>
                </div>
              </div>

              {/* Next Steps */}
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
                <h3 className="text-lg font-bold text-blue-800 mb-4 flex items-center">
                  <FaClock className="mr-2" />
                  What Happens Next?
                </h3>
                <div className="space-y-3 text-blue-700">
                  <div className="flex items-start">
                    <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3 mt-0.5">1</div>
                    <p>Property owner will contact you within 24 hours</p>
                  </div>
                  <div className="flex items-start">
                    <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3 mt-0.5">2</div>
                    <p>Coordinate check-in date and time</p>
                  </div>
                  <div className="flex items-start">
                    <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3 mt-0.5">3</div>
                    <p>Pay remaining amount directly to owner</p>
                  </div>
                  <div className="flex items-start">
                    <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3 mt-0.5">4</div>
                    <p>Move in and enjoy your new home!</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 space-y-4">
            {/* WhatsApp Buttons */}
            {notifications && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={() => openWhatsApp(notifications.guestPhone, notifications.guestMessage)}
                  className="flex items-center justify-center px-6 py-4 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-xl transition-all shadow-lg"
                >
                  <FaWhatsapp className="mr-3 text-xl" />
                  <div className="text-left">
                    <div>Send to My WhatsApp</div>
                    <div className="text-sm opacity-90">Share booking details</div>
                  </div>
                </button>
                
                <button
                  onClick={() => openWhatsApp(notifications.ownerPhone, notifications.ownerMessage)}
                  className="flex items-center justify-center px-6 py-4 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-xl transition-all shadow-lg"
                >
                  <FaPhone className="mr-3 text-xl" />
                  <div className="text-left">
                    <div>Contact Owner</div>
                    <div className="text-sm opacity-90">Follow up on booking</div>
                  </div>
                </button>
              </div>
            )}
            
            {/* Navigation Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link
                href="/bookings"
                className="flex items-center justify-center px-6 py-4 bg-white text-gray-900 font-semibold rounded-xl transition-all shadow-lg hover:shadow-xl"
              >
                <FaReceipt className="mr-3 text-xl text-orange-500" />
                <div className="text-left">
                  <div>My Bookings</div>
                  <div className="text-sm text-gray-600">View all bookings</div>
                </div>
              </Link>
              
              <button
                onClick={shareBooking}
                className="flex items-center justify-center px-6 py-4 bg-white text-gray-900 font-semibold rounded-xl transition-all shadow-lg hover:shadow-xl"
              >
                <FaShare className="mr-3 text-xl text-blue-500" />
                <div className="text-left">
                  <div>Share Booking</div>
                  <div className="text-sm text-gray-600">Tell your friends</div>
                </div>
              </button>
              
              <Link
                href="/"
                className="flex items-center justify-center px-6 py-4 bg-white text-gray-900 font-semibold rounded-xl transition-all shadow-lg hover:shadow-xl"
              >
                <FaHome className="mr-3 text-xl text-green-500" />
                <div className="text-left">
                  <div>Back to Home</div>
                  <div className="text-sm text-gray-600">Explore more</div>
                </div>
              </Link>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center">
            <div className="bg-white bg-opacity-20 rounded-2xl p-6">
              <h3 className="text-xl font-bold text-white mb-2">Thank You for Choosing Niwas Nest!</h3>
              <p className="text-white opacity-90">
                We're here to make your stay comfortable. Contact us anytime for support.
              </p>
              <div className="mt-4 flex justify-center space-x-4">
                <a href="tel:+916304809598" className="text-white hover:text-orange-200 transition-colors">
                  <FaPhone className="text-xl" />
                </a>
                <a href="mailto:niwasnest2026@gmail.com" className="text-white hover:text-orange-200 transition-colors">
                  <FaEnvelope className="text-xl" />
                </a>
                <a href="https://wa.me/916304809598" className="text-white hover:text-orange-200 transition-colors">
                  <FaWhatsapp className="text-xl" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}