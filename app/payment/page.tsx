'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaArrowLeft, FaCheckCircle } from 'react-icons/fa';
import { supabase } from '@/lib/supabase';
import RazorpayPayment from '@/components/RazorpayPayment';

interface Property {
  id: string;
  name: string;
  price: number;
  area?: string;
  city?: string;
  featured_image?: string;
  security_deposit?: number;
  available_months?: number;
}

export default function PaymentPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const propertyId = searchParams.get('propertyId');
  const roomId = searchParams.get('roomId');
  const sharingType = searchParams.get('sharingType');
  
  const [property, setProperty] = useState<Property | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<any>(null);
  const [availableRooms, setAvailableRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
  });

  useEffect(() => {
    if (!propertyId) {
      router.push('/');
      return;
    }

    async function fetchProperty() {
      try {
        const { data, error } = await supabase
          .from('properties')
          .select('id, name, price, area, city, featured_image, security_deposit, available_months')
          .eq('id', propertyId!)
          .single();

        if (error) throw error;
        setProperty(data);

        // If roomId is provided, fetch room details
        if (roomId) {
          const { data: roomData, error: roomError } = await supabase
            .from('property_rooms')
            .select('*')
            .eq('id', roomId)
            .single();

          if (roomError) throw roomError;
          setSelectedRoom(roomData);
        } else if (sharingType) {
          // If sharingType is provided, fetch available rooms of that type
          const { data: roomsData, error: roomsError } = await supabase
            .from('property_rooms')
            .select('*')
            .eq('property_id', propertyId!)
            .eq('sharing_type', sharingType!)
            .gt('available_beds', 0);

          if (roomsError) throw roomsError;
          
          if (roomsData && roomsData.length > 0) {
            setAvailableRooms(roomsData);
            setSelectedRoom(roomsData[0]);
          } else {
            router.push(`/property/${propertyId}`);
            return;
          }
        } else {
          router.push(`/property/${propertyId}`);
          return;
        }
      } catch (error) {
        console.error('Error fetching property:', error);
        router.push('/');
      } finally {
        setLoading(false);
      }
    }

    fetchProperty();
  }, [propertyId, roomId, sharingType, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const createBooking = async () => {
    if (!selectedRoom || !property) {
      alert('Please select a room to continue');
      return null;
    }

    // Validate form data
    if (!formData.fullName || !formData.email || !formData.phone) {
      alert('Please fill in all required fields');
      return null;
    }

    try {
      // Calculate amounts
      const securityDeposit = selectedRoom.security_deposit_per_person || selectedRoom.price_per_person * 2;
      const totalAmount = selectedRoom.price_per_person + securityDeposit;
      const amountPaid = Math.round(totalAmount * 0.2); // 20% upfront
      const amountDue = totalAmount - amountPaid; // 80% remaining

      // Create the booking record
      const { data: bookingData, error: bookingError } = await supabase
        .from('bookings')
        .insert({
          property_id: propertyId,
          room_id: selectedRoom.id,
          guest_name: formData.fullName,
          guest_email: formData.email,
          guest_phone: formData.phone,
          sharing_type: selectedRoom.sharing_type,
          price_per_person: selectedRoom.price_per_person,
          security_deposit_per_person: securityDeposit,
          total_amount: totalAmount,
          amount_paid: amountPaid,
          amount_due: amountDue,
          payment_method: 'razorpay',
          payment_status: 'pending',
          booking_status: 'confirmed',
        })
        .select()
        .single();

      if (bookingError) throw bookingError;
      
      return bookingData;
    } catch (error) {
      console.error('Error creating booking:', error);
      alert('Failed to create booking. Please try again.');
      return null;
    }
  };

  const handlePaymentSuccess = (paymentId: string) => {
    setPaymentSuccess(true);
    // You can add additional success handling here
    setTimeout(() => {
      router.push('/');
    }, 3000);
  };

  const handlePaymentError = (error: string) => {
    alert(`Payment failed: ${error}`);
    setProcessing(false);
  };

  const initiatePayment = async () => {
    setProcessing(true);
    
    const booking = await createBooking();
    if (booking) {
      setBookingId(booking.id);
    } else {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!property || !selectedRoom) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Property not found</h1>
          <Link href="/" className="text-primary hover:underline">
            Go back to home
          </Link>
        </div>
      </div>
    );
  }

  if (paymentSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-green-50">
        <div className="text-center p-8">
          <FaCheckCircle className="text-6xl text-green-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-green-800 mb-2">Payment Successful!</h1>
          <p className="text-green-600 mb-4">Your booking has been confirmed.</p>
          <p className="text-sm text-gray-600">Redirecting to home page...</p>
        </div>
      </div>
    );
  }

  // Calculate amounts
  const securityDeposit = selectedRoom.security_deposit_per_person || selectedRoom.price_per_person * 2;
  const totalAmount = selectedRoom.price_per_person + securityDeposit;
  const amountPaid = Math.round(totalAmount * 0.2); // 20% upfront
  const amountDue = totalAmount - amountPaid; // 80% remaining

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link href={`/property/${propertyId}`} className="inline-flex items-center text-primary hover:underline mb-4">
            <FaArrowLeft className="mr-2" />
            Back to Property
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Complete Your Booking</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Property Details */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Booking Details</h2>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                {property.featured_image && (
                  <img 
                    src={property.featured_image} 
                    alt={property.name}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                )}
                <div>
                  <h3 className="font-semibold text-gray-900">{property.name}</h3>
                  <p className="text-gray-600">{property.area && property.city ? `${property.area}, ${property.city}` : property.city}</p>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Room:</span>
                  <span className="font-medium">{selectedRoom.room_number} ({selectedRoom.sharing_type})</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Monthly Rent:</span>
                  <span className="font-medium">₹{selectedRoom.price_per_person.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Security Deposit:</span>
                  <span className="font-medium">₹{securityDeposit.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center mb-4 text-lg font-bold border-t pt-2">
                  <span>Total Amount:</span>
                  <span>₹{totalAmount.toLocaleString()}</span>
                </div>
                
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-800 mb-2">Payment Breakdown:</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-blue-700">Pay now (20%):</span>
                      <span className="font-medium text-blue-800">₹{amountPaid.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-700">Pay to owner (80%):</span>
                      <span className="font-medium text-blue-800">₹{amountDue.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Form */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Guest Information</h2>
            
            {!bookingId ? (
              <form onSubmit={(e) => { e.preventDefault(); initiatePayment(); }} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Enter your email"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Enter your phone number"
                  />
                </div>

                <button
                  type="submit"
                  disabled={processing}
                  className="w-full bg-primary hover:bg-primary-dark text-white font-semibold py-4 px-6 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {processing ? 'Creating Booking...' : 'Proceed to Payment'}
                </button>
              </form>
            ) : (
              <div>
                <div className="mb-6">
                  <div className="flex items-center space-x-2 text-green-600 mb-2">
                    <FaCheckCircle />
                    <span className="font-medium">Booking Created Successfully!</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Complete your payment to confirm the booking.
                  </p>
                </div>

                <RazorpayPayment
                  amount={amountPaid}
                  bookingId={bookingId}
                  guestName={formData.fullName}
                  guestEmail={formData.email}
                  guestPhone={formData.phone}
                  propertyName={property.name}
                  roomNumber={selectedRoom.room_number}
                  onSuccess={handlePaymentSuccess}
                  onError={handlePaymentError}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}