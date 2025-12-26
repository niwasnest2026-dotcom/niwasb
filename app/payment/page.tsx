'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaArrowLeft, FaCreditCard, FaLock, FaCheckCircle } from 'react-icons/fa';
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
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: ''
  });
  const [showRazorpay, setShowRazorpay] = useState(false);

  // Get search parameters for duration and dates
  const duration = searchParams.get('duration') || '';
  const checkIn = searchParams.get('checkIn') || '';
  const checkOut = searchParams.get('checkOut') || '';

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short',
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

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
            // Use the first available room for pricing calculation
            setSelectedRoom(roomsData[0]);
          } else {
            // No available rooms of this type
            router.push(`/property/${propertyId}`);
            return;
          }
        } else {
          // If no room or sharing type is selected, redirect to property page
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

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedRoom || !property) {
      alert('Please select a room to continue');
      return;
    }

    // Validate form data
    if (!formData.fullName || !formData.email || !formData.phone) {
      alert('Please fill in all required fields');
      return;
    }

    // Show Razorpay payment component
    setShowRazorpay(true);
  };

  const handlePaymentSuccess = async (paymentId: string) => {
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
          property_id: property!.id,
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
          payment_status: 'partial', // 20% paid
          booking_status: 'confirmed',
          payment_reference: paymentId,
          payment_date: new Date().toISOString(),
          duration_months: duration ? parseInt(duration) : null,
          check_in_date: checkIn || null,
          check_out_date: checkOut || null,
          notes: `Booking made through Razorpay. Payment ID: ${paymentId}. ${duration ? `Duration: ${duration} months.` : ''} ${sharingType ? `Selected sharing type: ${sharingType}` : `Specific room: ${selectedRoom.room_number}`}`
        } as any)
        .select()
        .single();

      if (bookingError) {
        throw bookingError;
      }

      // Show success message and redirect
      alert(`🎉 Booking Confirmed! 
      
Booking ID: ${(bookingData as any)?.id || 'Generated'}
Payment ID: ${paymentId}
Amount Paid: ₹${amountPaid.toLocaleString()}
Remaining Amount: ₹${amountDue.toLocaleString()} (to be paid to property owner)

You will receive a confirmation email shortly.`);

      // Redirect to home page
      router.push('/');

    } catch (error: any) {
      console.error('Booking creation error:', error);
      alert('Booking creation failed: ' + (error.message || 'Unknown error'));
    }
  };

  const handlePaymentError = (error: string) => {
    alert('Payment failed: ' + error);
    setShowRazorpay(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500"></div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Property not found</h1>
          <Link href="/" className="text-rose-500 hover:underline">
            Go back home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4" style={{ 
      background: 'linear-gradient(135deg, #DEF2F1 0%, #FEFFFF 50%, #DEF2F1 100%)',
      backgroundSize: '400% 400%',
      animation: 'gradientShift 20s ease infinite'
    }}>
      <div className="max-w-4xl mx-auto">
        <Link
          href={`/property/${propertyId}`}
          className="inline-flex items-center hover:underline mb-6"
          style={{ color: '#2B7A78' }}
        >
          <FaArrowLeft className="mr-2" />
          Back to property
        </Link>

        {/* Search Criteria Display */}
        {(duration || (checkIn && checkOut)) && (
          <div className="mb-6 p-4 rounded-xl" style={{ backgroundColor: 'rgba(222, 242, 241, 0.5)' }}>
            <div className="flex items-center flex-wrap gap-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-semibold" style={{ color: '#17252A' }}>Your Booking:</span>
              </div>
              
              {duration && (
                <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg" style={{ backgroundColor: 'rgba(58, 175, 169, 0.1)' }}>
                  <span className="text-sm font-medium" style={{ color: '#17252A' }}>
                    {duration} month{parseInt(duration) > 1 ? 's' : ''}
                  </span>
                </div>
              )}
              
              {checkIn && checkOut && (
                <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg" style={{ backgroundColor: 'rgba(43, 122, 120, 0.1)' }}>
                  <span className="text-sm font-medium" style={{ color: '#17252A' }}>
                    {formatDate(checkIn)} - {formatDate(checkOut)}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Property Summary */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Booking Summary</h2>
            
            <div className="border rounded-xl p-4 mb-6">
              <div className="flex items-start space-x-4">
                {property.featured_image && (
                  <img
                    src={property.featured_image}
                    alt={property.name}
                    className="w-20 h-20 rounded-lg object-cover"
                  />
                )}
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-gray-900">{property.name}</h3>
                  <p className="text-gray-600">
                    {property.area && property.city
                      ? `${property.area}, ${property.city}`
                      : property.city || property.area}
                  </p>
                  {selectedRoom && (
                    <div className="mt-2">
                      {sharingType ? (
                        <div>
                          <p className="text-sm font-medium text-gray-700">
                            {selectedRoom.sharing_type}
                          </p>
                          <p className="text-xs text-gray-500">
                            {availableRooms.length} room{availableRooms.length > 1 ? 's' : ''} available
                          </p>
                        </div>
                      ) : (
                        <div>
                          <p className="text-sm font-medium text-gray-700">
                            Room {selectedRoom.room_number} - {selectedRoom.sharing_type}
                          </p>
                          {selectedRoom.room_type && (
                            <p className="text-xs text-gray-500">{selectedRoom.room_type}</p>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              {selectedRoom ? (
                <>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Monthly rent (per person)</span>
                    <span className="font-semibold">₹{selectedRoom.price_per_person.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Security deposit (per person)</span>
                    <span className="font-semibold">
                      ₹{(selectedRoom.security_deposit_per_person || selectedRoom.price_per_person * 2).toLocaleString()}
                    </span>
                  </div>
                  {property.available_months && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Available for</span>
                      <span className="font-semibold">{property.available_months} month{property.available_months > 1 ? 's' : ''}</span>
                    </div>
                  )}
                  <hr />
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total booking amount</span>
                    <span className="font-semibold">
                      ₹{(selectedRoom.price_per_person + (selectedRoom.security_deposit_per_person || selectedRoom.price_per_person * 2)).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-primary">
                    <span className="font-medium">Pay now (20%)</span>
                    <span className="font-bold">
                      ₹{Math.round((selectedRoom.price_per_person + (selectedRoom.security_deposit_per_person || selectedRoom.price_per_person * 2)) * 0.2).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-500 text-sm">
                    <span>Pay to owner (80%)</span>
                    <span>
                      ₹{Math.round((selectedRoom.price_per_person + (selectedRoom.security_deposit_per_person || selectedRoom.price_per_person * 2)) * 0.8).toLocaleString()}
                    </span>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-600">Please select a room to proceed with booking.</p>
                  <Link
                    href={`/property/${propertyId}`}
                    className="mt-4 inline-block px-6 py-2 bg-primary hover:bg-primary-dark text-white font-semibold rounded-lg transition-all"
                  >
                    Select Room
                  </Link>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-800 mb-2">Payment Structure</h4>
                <ul className="text-blue-700 text-sm space-y-1">
                  <li>• Pay 20% now to secure your booking</li>
                  <li>• Remaining 80% to be paid directly to property owner</li>
                  <li>• Get instant booking confirmation</li>
                </ul>
              </div>
              
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center">
                  <FaCheckCircle className="text-green-500 mr-2" />
                  <span className="text-green-800 font-medium">Secure payment protected</span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Form */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Payment Details</h2>

            {!showRazorpay ? (
              <form onSubmit={handleFormSubmit} className="space-y-6">
                {/* Personal Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
                  <div className="space-y-4">
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
                        Email *
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
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={processing || !selectedRoom}
                  className={`w-full font-bold py-4 px-6 rounded-xl transition-all flex items-center justify-center space-x-2 ${
                    processing || !selectedRoom
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-primary to-secondary hover:shadow-lg'
                  } text-white`}
                >
                  {processing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <FaLock className="text-sm" />
                      <span>
                        {selectedRoom 
                          ? `Proceed to Pay ₹${Math.round((selectedRoom.price_per_person + (selectedRoom.security_deposit_per_person || selectedRoom.price_per_person * 2)) * 0.2).toLocaleString()}`
                          : 'Select Room to Continue'
                        }
                      </span>
                    </>
                  )}
                </button>

                <p className="text-xs text-gray-500 text-center">
                  Your payment information is secure and encrypted.
                </p>
              </form>
            ) : (
              <div className="space-y-6">
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Complete Your Payment</h3>
                  <p className="text-gray-600">You're booking for {formData.fullName}</p>
                </div>

                {selectedRoom && (
                  <RazorpayPayment
                    amount={Math.round((selectedRoom.price_per_person + (selectedRoom.security_deposit_per_person || selectedRoom.price_per_person * 2)) * 0.2)}
                    bookingId={`${property!.id}_${Date.now()}`}
                    guestName={formData.fullName}
                    guestEmail={formData.email}
                    guestPhone={formData.phone}
                    propertyName={property!.name}
                    roomNumber={selectedRoom.room_number || selectedRoom.sharing_type}
                    onSuccess={handlePaymentSuccess}
                    onError={handlePaymentError}
                  />
                )}

                <button
                  onClick={() => setShowRazorpay(false)}
                  className="w-full px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  ← Back to Details
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}