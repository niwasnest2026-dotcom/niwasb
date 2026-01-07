'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaArrowLeft, FaCheckCircle, FaLock } from 'react-icons/fa';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
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

export default function BookingSummaryPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const propertyId = searchParams.get('propertyId');
  const roomId = searchParams.get('roomId');
  const sharingType = searchParams.get('sharingType');
  const propertyType = searchParams.get('propertyType');
  const fullName = searchParams.get('fullName');
  const email = searchParams.get('email');
  const phone = searchParams.get('phone');
  const whatsappNumber = searchParams.get('whatsappNumber');
  
  const [property, setProperty] = useState<Property | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<any>(null);
  const [availableRooms, setAvailableRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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

  // Check authentication
  useEffect(() => {
    if (!authLoading && !user) {
      // Store the current URL to redirect back after login
      const currentUrl = window.location.href;
      localStorage.setItem('redirectAfterLogin', currentUrl);
      
      // Redirect to login page
      window.location.href = '/auth/login';
      return;
    }
  }, [user, authLoading]);

  useEffect(() => {
    if (!propertyId || !fullName || !email || !phone || !whatsappNumber || authLoading) {
      if (!authLoading && (!propertyId || !fullName || !email || !phone || !whatsappNumber)) {
        router.push('/');
      }
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
        } else if (propertyType === 'Room') {
          // For Room type properties, use property pricing directly
          const mockRoom = {
            id: `property_${propertyId}`,
            property_id: propertyId,
            room_number: 'Room',
            sharing_type: 'Private Room',
            price_per_person: (data as any).price,
            security_deposit_per_person: (data as any).security_deposit || (data as any).price * 2,
            available_beds: 1,
            room_type: 'Room'
          };
          setSelectedRoom(mockRoom);
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
  }, [propertyId, roomId, sharingType, propertyType, fullName, email, phone, whatsappNumber, router, user, authLoading]);

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Show login required message if not authenticated
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="mb-6">
            <FaLock className="text-6xl text-orange-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Login Required</h1>
            <p className="text-gray-600">
              You need to be logged in to complete your booking and payment.
            </p>
          </div>
          
          <div className="space-y-4">
            <button
              onClick={() => {
                const currentUrl = window.location.href;
                localStorage.setItem('redirectAfterLogin', currentUrl);
                window.location.href = '/auth/login';
              }}
              className="w-full px-6 py-3 text-white font-bold text-lg rounded-xl transition-all shadow-lg hover:shadow-xl"
              style={{ backgroundColor: '#FF6711' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#E55A0F'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#FF6711'}
            >
              Login to Continue
            </button>
            
            <Link
              href="/"
              className="block w-full px-6 py-3 text-gray-600 font-medium text-lg rounded-xl border border-gray-300 hover:bg-gray-50 transition-all"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleConfirmBooking = () => {
    if (!selectedRoom || !property) {
      alert('Invalid booking details');
      return;
    }

    // Redirect to payment details page with all necessary parameters
    const params = new URLSearchParams({
      propertyId: property.id,
      fullName: fullName!,
      email: email!,
      phone: phone!,
    });

    // Add room/sharing type parameters
    if (roomId) params.append('roomId', roomId);
    if (sharingType) params.append('sharingType', sharingType);
    if (propertyType) params.append('propertyType', propertyType);
    
    // Add duration and date parameters if available
    if (duration) params.append('duration', duration);
    if (checkIn) params.append('checkIn', checkIn);
    if (checkOut) params.append('checkOut', checkOut);

    router.push(`/payment-details?${params.toString()}`);
  };

  const handlePaymentSuccess = async (paymentId: string) => {
    try {
      // Calculate amounts
      const securityDeposit = selectedRoom.security_deposit_per_person || selectedRoom.price_per_person * 2;
      const totalAmount = selectedRoom.price_per_person + securityDeposit;
      const amountPaid = Math.round(selectedRoom.price_per_person * 0.2); // 20% of one month rent only
      const amountDue = totalAmount - amountPaid; // Remaining amount

      // For Room type properties, create or find a default room
      let finalRoomId = null;
      if (propertyType === 'Room') {
        // For Room type properties, try to find or create a default room
        try {
          const { data: existingRoom, error: roomError } = await supabase
            .from('property_rooms')
            .select('id')
            .eq('property_id', property!.id)
            .eq('room_number', 'Main Room')
            .single();

          if (existingRoom) {
            finalRoomId = (existingRoom as any).id;
          } else {
            // Create a default room for this Room type property
            const { data: newRoom, error: createError } = await supabase
              .from('property_rooms')
              .insert({
                property_id: property!.id,
                room_number: 'Main Room',
                sharing_type: 'Private Room',
                price_per_person: selectedRoom.price_per_person,
                security_deposit_per_person: selectedRoom.security_deposit_per_person || selectedRoom.price_per_person * 2,
                total_beds: 1,
                available_beds: 1,
                room_type: 'Private',
                is_available: true
              } as any)
              .select('id')
              .single();

            if (newRoom) {
              finalRoomId = (newRoom as any).id;
            }
          }
        } catch (error) {
          console.warn('Could not create/find room for Room type property:', error);
        }
      } else if (selectedRoom.id && !selectedRoom.id.startsWith('property_')) {
        finalRoomId = selectedRoom.id;
      }

      // Create the booking record with all available fields from schema
      const bookingData: any = {
        property_id: property!.id,
        guest_name: fullName,
        guest_email: user.email, // Always use authenticated user's email
        guest_phone: phone,
        sharing_type: selectedRoom.sharing_type,
        price_per_person: selectedRoom.price_per_person,
        security_deposit_per_person: securityDeposit,
        total_amount: totalAmount,
        amount_paid: amountPaid,
        amount_due: amountDue,
        payment_method: 'razorpay',
        payment_status: 'partial', // 20% paid
        booking_status: 'confirmed', // Automatically confirmed upon payment
        payment_reference: paymentId,
        payment_date: new Date().toISOString(),
        booking_date: new Date().toISOString(),
        notes: `Booking confirmed automatically upon payment. Payment ID: ${paymentId}. WhatsApp: ${whatsappNumber}. ${duration ? `Duration: ${duration} months. ` : ''}${sharingType ? `Selected sharing type: ${sharingType}. ` : propertyType === 'Room' ? 'Room type property booking. ' : `Specific room: ${selectedRoom.room_number}. `}Property: ${property!.name}.`
      };

      // Add room_id if available
      if (finalRoomId) {
        bookingData.room_id = finalRoomId;
      }

      // Add check-in and check-out dates if provided
      if (checkIn) {
        bookingData.check_in_date = checkIn;
      }
      
      if (checkOut) {
        bookingData.check_out_date = checkOut;
      }

      // Add user_id if user is available
      if (user) {
        bookingData.user_id = user.id;
      }

      let bookingId = 'TEMP_' + Date.now();

      try {
        const { data: bookingResult, error: bookingError } = await supabase
          .from('bookings')
          .insert(bookingData)
          .select()
          .single();

        if (!bookingError && bookingResult) {
          bookingId = (bookingResult as any).id;
          
          // Update available beds count - decrease by 1 (only if room_id exists)
          if (finalRoomId) {
            try {
              const { data: roomData, error: roomError } = await supabase
                .from('property_rooms')
                .select('available_beds')
                .eq('id', finalRoomId)
                .single();

              if (!roomError && roomData && (roomData as any).available_beds > 0) {
                // Decrease available beds by 1
                const { error: updateError } = await supabase
                  .from('property_rooms')
                  .update({
                    available_beds: (roomData as any).available_beds - 1,
                    updated_at: new Date().toISOString()
                  } as any)
                  .eq('id', finalRoomId);

                if (updateError) {
                  console.error('Failed to update available beds:', updateError);
                } else {
                  console.log('Successfully updated available beds count');
                }
              } else {
                console.error('Room not found or no available beds:', roomError);
              }
            } catch (bedUpdateError) {
              console.error('Error updating bed availability:', bedUpdateError);
            }
          }
        } else {
          console.warn('Booking creation failed, but payment was successful:', bookingError);
        }
      } catch (dbError) {
        console.warn('Database error, but payment was successful:', dbError);
      }

      // Send WhatsApp notifications
      try {
        const notificationResponse = await fetch('/api/send-booking-notifications', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            guestName: fullName,
            guestWhatsapp: whatsappNumber,
            propertyName: property!.name,
            propertyLocation: property!.area && property!.city 
              ? `${property!.area}, ${property!.city}` 
              : property!.city || property!.area,
            paymentId,
            bookingId,
            amountPaid,
            amountDue,
            checkInDate: checkIn,
            duration: duration
          }),
        });

        const notificationData = await notificationResponse.json();
        
        if (notificationData.success) {
          console.log('WhatsApp notifications sent successfully:', notificationData.results);
          
          // Show success message to user
          if (notificationData.results.guestMessageSent) {
            console.log('✅ Confirmation message sent to guest WhatsApp');
          }
          if (notificationData.results.ownerMessageSent) {
            console.log('✅ Booking alert sent to property owner');
          }
          
          // Store notification status for success page
          localStorage.setItem('notificationsSent', JSON.stringify(notificationData.results));
        } else {
          console.warn('WhatsApp notifications failed:', notificationData.error);
        }
      } catch (notificationError) {
        console.warn('Notification sending failed:', notificationError);
      }

      // Redirect to success page with booking details
      const successParams = new URLSearchParams({
        paymentId,
        bookingId,
        amount: amountPaid.toString(),
        propertyName: property!.name,
        guestName: fullName!
      });

      router.push(`/payment-success?${successParams.toString()}`);

    } catch (error: any) {
      console.error('Payment success handling error:', error);
      // Even if there's an error, redirect to success page since payment was successful
      const successParams = new URLSearchParams({
        paymentId,
        bookingId: 'TEMP_' + Date.now(),
        amount: Math.round(selectedRoom.price_per_person * 0.2).toString(),
        propertyName: property!.name,
        guestName: fullName!
      });

      router.push(`/payment-success?${successParams.toString()}`);
    }
  };

  const handlePaymentError = (error: string) => {
    alert('Payment failed: ' + error);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500"></div>
      </div>
    );
  }

  if (!property || !selectedRoom) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Invalid booking details</h1>
          <Link href="/" className="text-rose-500 hover:underline">
            Go back home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4" style={{ 
      background: 'linear-gradient(135deg, #63B3ED 0%, #90CDF4 50%, #63B3ED 100%)',
      backgroundSize: '400% 400%',
      animation: 'gradientShift 20s ease infinite'
    }}>
      <div className="max-w-4xl mx-auto">
        <Link
          href={`/payment?propertyId=${propertyId}&roomId=${roomId}&sharingType=${sharingType}&propertyType=${propertyType}&duration=${duration}&checkIn=${checkIn}&checkOut=${checkOut}`}
          className="inline-flex items-center justify-center w-10 h-10 rounded-full hover:bg-white/20 transition-colors mb-6"
          style={{ color: '#2D3748' }}
          title="Back to guest information"
        >
          <FaArrowLeft className="text-lg" />
        </Link>

        {/* Search Criteria Display */}
        {(duration || (checkIn && checkOut)) && (
          <div className="mb-6 p-4 rounded-xl" style={{ backgroundColor: 'rgba(247, 250, 252, 0.8)' }}>
            <div className="flex items-center flex-wrap gap-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-semibold" style={{ color: '#2D3748' }}>Your Booking:</span>
              </div>
              
              {duration && (
                <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg" style={{ backgroundColor: 'rgba(255, 103, 17, 0.1)' }}>
                  <span className="text-sm font-medium" style={{ color: '#2D3748' }}>
                    {duration} month{parseInt(duration) > 1 ? 's' : ''}
                  </span>
                </div>
              )}
              
              {checkIn && checkOut && (
                <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg" style={{ backgroundColor: 'rgba(99, 179, 237, 0.1)' }}>
                  <span className="text-sm font-medium" style={{ color: '#2D3748' }}>
                    {formatDate(checkIn)} - {formatDate(checkOut)}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Booking Summary</h1>
            <p className="text-gray-600">Review your booking details before proceeding to payment</p>
          </div>

          {/* Property Details */}
          <div className="border rounded-xl p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Property Details</h2>
            <div className="flex items-start space-x-4">
              {property.featured_image && (
                <img
                  src={property.featured_image}
                  alt={property.name}
                  className="w-24 h-24 rounded-lg object-cover"
                />
              )}
              <div className="flex-1">
                <h3 className="font-bold text-xl text-gray-900">{property.name}</h3>
                <p className="text-gray-600 mb-2">
                  {property.area && property.city
                    ? `${property.area}, ${property.city}`
                    : property.city || property.area}
                </p>
                <div className="mt-2">
                  {propertyType === 'Room' ? (
                    <div>
                      <p className="text-lg font-medium text-gray-700">
                        Private Room
                      </p>
                      <p className="text-sm text-gray-500">
                        Entire room booking
                      </p>
                    </div>
                  ) : sharingType ? (
                    <div>
                      <p className="text-lg font-medium text-gray-700">
                        {selectedRoom.sharing_type}
                      </p>
                      <p className="text-sm text-gray-500">
                        {availableRooms.length} room{availableRooms.length > 1 ? 's' : ''} available
                      </p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-lg font-medium text-gray-700">
                        Room {selectedRoom.room_number} - {selectedRoom.sharing_type}
                      </p>
                      {selectedRoom.room_type && (
                        <p className="text-sm text-gray-500">{selectedRoom.room_type}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Guest Details */}
          <div className="border rounded-xl p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Guest Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Full Name</p>
                <p className="font-semibold text-gray-900">{fullName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-semibold text-gray-900">{email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Phone</p>
                <p className="font-semibold text-gray-900">{phone}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">WhatsApp</p>
                <p className="font-semibold text-gray-900">{whatsappNumber}</p>
              </div>
            </div>
          </div>

          {/* Booking Details */}
          <div className="border rounded-xl p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Booking Details</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">
                  {propertyType === 'Room' ? 'Monthly rent' : 'Monthly rent (per person)'}
                </span>
                <span className="font-semibold">₹{selectedRoom.price_per_person.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">
                  {propertyType === 'Room' ? 'Security deposit' : 'Security deposit (per person)'}
                </span>
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
              <div className="flex justify-between text-lg">
                <span className="font-medium text-gray-900">Total booking amount</span>
                <span className="font-bold text-gray-900">
                  ₹{(selectedRoom.price_per_person + (selectedRoom.security_deposit_per_person || selectedRoom.price_per_person * 2)).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Payment Structure Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
            <h3 className="text-lg font-bold text-blue-800 mb-3">Payment Structure</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-blue-700">Pay now (20% of monthly rent)</span>
                <span className="font-bold text-blue-800">
                  ₹{Math.round(selectedRoom.price_per_person * 0.2).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-blue-700">Pay to owner (remaining amount)</span>
                <span className="font-bold text-blue-800">
                  ₹{Math.round((selectedRoom.price_per_person + (selectedRoom.security_deposit_per_person || selectedRoom.price_per_person * 2)) - (selectedRoom.price_per_person * 0.2)).toLocaleString()}
                </span>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-blue-200">
              <div className="flex items-center">
                <FaCheckCircle className="text-blue-600 mr-2" />
                <span className="text-blue-700 text-sm">Secure booking with instant confirmation</span>
              </div>
            </div>
          </div>

          {/* Razorpay Payment Component */}
          <RazorpayPayment
            amount={Math.round(selectedRoom.price_per_person * 0.2)}
            bookingId={`${property.id}_${Date.now()}`}
            guestName={fullName!}
            guestEmail={email!}
            guestPhone={phone!}
            propertyName={property.name}
            roomNumber={selectedRoom.room_number || selectedRoom.sharing_type}
            onSuccess={handlePaymentSuccess}
            onError={handlePaymentError}
            bookingDetails={{
              property_id: property.id,
              room_id: selectedRoom.id && !selectedRoom.id.startsWith('property_') ? selectedRoom.id : undefined,
              sharing_type: selectedRoom.sharing_type,
              price_per_person: selectedRoom.price_per_person,
              security_deposit_per_person: selectedRoom.security_deposit_per_person || selectedRoom.price_per_person * 2,
              total_amount: selectedRoom.price_per_person + (selectedRoom.security_deposit_per_person || selectedRoom.price_per_person * 2),
              amount_paid: Math.round(selectedRoom.price_per_person * 0.2),
              amount_due: Math.round((selectedRoom.price_per_person + (selectedRoom.security_deposit_per_person || selectedRoom.price_per_person * 2)) - (selectedRoom.price_per_person * 0.2)),
              duration: duration,
              check_in: checkIn,
              check_out: checkOut
            }}
          />
        </div>
      </div>
    </div>
  );
}