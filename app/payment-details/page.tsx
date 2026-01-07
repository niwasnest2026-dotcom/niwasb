'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaArrowLeft, FaLock } from 'react-icons/fa';
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

export default function PaymentDetailsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const propertyId = searchParams.get('propertyId');
  const roomId = searchParams.get('roomId');
  const sharingType = searchParams.get('sharingType');
  const propertyType = searchParams.get('propertyType');
  const fullName = searchParams.get('fullName');
  const email = searchParams.get('email');
  const phone = searchParams.get('phone');
  
  const [property, setProperty] = useState<Property | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Get search parameters for duration and dates
  const duration = searchParams.get('duration') || '';
  const checkIn = searchParams.get('checkIn') || '';
  const checkOut = searchParams.get('checkOut') || '';

  useEffect(() => {
    if (!propertyId || !fullName || !email || !phone) {
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
  }, [propertyId, roomId, sharingType, propertyType, fullName, email, phone, router]);

  const handlePaymentSuccess = async (paymentId: string) => {
    try {
      console.log('🎉 Payment successful, payment ID:', paymentId);
      
      // Calculate amounts
      const securityDeposit = selectedRoom.security_deposit_per_person || selectedRoom.price_per_person * 2;
      const totalAmount = selectedRoom.price_per_person + securityDeposit;
      const amountPaid = Math.round(selectedRoom.price_per_person * 0.2); // 20% of one month rent only
      const amountDue = totalAmount - amountPaid; // Remaining amount

      console.log('💰 Payment amounts calculated:', {
        monthlyRent: selectedRoom.price_per_person,
        securityDeposit,
        totalAmount,
        amountPaid,
        amountDue
      });

      // Show success message immediately
      alert(`🎉 Payment Successful! 
      
Payment ID: ${paymentId}
Amount Paid: ₹${amountPaid.toLocaleString()}

Your booking is being processed. You will be redirected to the confirmation page.`);

      // Redirect to payment success page with booking details
      // The booking should already be created by the verify-payment API
      const successUrl = `/payment-success?paymentId=${paymentId}&amount=${amountPaid}&propertyName=${encodeURIComponent(property!.name)}&guestName=${encodeURIComponent(fullName!)}`;
      
      console.log('🔄 Redirecting to success page:', successUrl);
      router.push(successUrl);

    } catch (error: any) {
      console.error('❌ Payment success handling error:', error);
      alert('Payment was successful but there was an issue processing your booking. Please contact support with payment ID: ' + paymentId);
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
      background: 'linear-gradient(135deg, #DEF2F1 0%, #FEFFFF 50%, #DEF2F1 100%)',
      backgroundSize: '400% 400%',
      animation: 'gradientShift 20s ease infinite'
    }}>
      <div className="max-w-2xl mx-auto">
        <Link
          href={`/payment?propertyId=${propertyId}&roomId=${roomId}&sharingType=${sharingType}&propertyType=${propertyType}&duration=${duration}&checkIn=${checkIn}&checkOut=${checkOut}`}
          className="inline-flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 transition-colors mb-6"
          style={{ color: '#2B7A78' }}
          title="Back to booking details"
        >
          <FaArrowLeft className="text-lg" />
        </Link>

        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="text-center mb-6">
            <div className="flex items-center justify-center mb-4">
              <FaLock className="text-2xl mr-2" style={{ color: '#3AAFA9' }} />
              <h1 className="text-2xl font-bold text-gray-900">Secure Payment</h1>
            </div>
            <p className="text-gray-600">Complete your payment to confirm booking</p>
          </div>

          {/* Booking Summary */}
          <div className="border rounded-xl p-4 mb-6">
            <div className="flex items-start space-x-4">
              {property.featured_image && (
                <img
                  src={property.featured_image}
                  alt={property.name}
                  className="w-16 h-16 rounded-lg object-cover"
                />
              )}
              <div className="flex-1">
                <h3 className="font-bold text-lg text-gray-900">{property.name}</h3>
                <p className="text-gray-600 text-sm">
                  {property.area && property.city
                    ? `${property.area}, ${property.city}`
                    : property.city || property.area}
                </p>
                <p className="text-sm font-medium text-gray-700 mt-1">
                  {propertyType === 'Room' ? 'Private Room' : selectedRoom.sharing_type}
                </p>
              </div>
            </div>
          </div>

          {/* Guest Details */}
          <div className="border rounded-xl p-4 mb-6">
            <h4 className="font-semibold text-gray-900 mb-3">Guest Details</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Name:</span>
                <span className="font-medium">{fullName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Email:</span>
                <span className="font-medium">{email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Phone:</span>
                <span className="font-medium">{phone}</span>
              </div>
            </div>
          </div>

          {/* Payment Amount */}
          <div className="border rounded-xl p-4 mb-6">
            <h4 className="font-semibold text-gray-900 mb-3">Payment Amount</h4>
            <div className="text-center">
              <div className="text-3xl font-bold mb-2" style={{ color: '#3AAFA9' }}>
                ₹{Math.round(selectedRoom.price_per_person * 0.2).toLocaleString()}
              </div>
              <p className="text-gray-600 text-sm">20% of monthly rent to secure booking</p>
            </div>
          </div>

          {/* Razorpay Payment Component */}
          <RazorpayPayment
            amount={Math.round(selectedRoom.price_per_person * 0.2)}
            propertyId={property.id}
            propertyName={property.name}
            userDetails={{
              name: fullName!,
              email: email!,
              phone: phone!,
              sharing_type: selectedRoom.sharing_type,
              price_per_person: selectedRoom.price_per_person,
              security_deposit_per_person: selectedRoom.security_deposit_per_person || selectedRoom.price_per_person * 2,
              total_amount: selectedRoom.price_per_person + (selectedRoom.security_deposit_per_person || selectedRoom.price_per_person * 2),
              amount_paid: Math.round(selectedRoom.price_per_person * 0.2),
              amount_due: (selectedRoom.price_per_person + (selectedRoom.security_deposit_per_person || selectedRoom.price_per_person * 2)) - Math.round(selectedRoom.price_per_person * 0.2),
              room_id: (propertyType !== 'Room' && selectedRoom.id && !selectedRoom.id.startsWith('property_')) ? selectedRoom.id : undefined,
              check_in: checkIn,
              check_out: checkOut
            }}
            onSuccess={handlePaymentSuccess}
            onError={handlePaymentError}
            // Legacy props for backward compatibility (will be ignored)
            bookingId={`${property.id}_${Date.now()}`}
            guestName={fullName!}
            guestEmail={email!}
            guestPhone={phone!}
            roomNumber={selectedRoom.room_number || selectedRoom.sharing_type}
            bookingDetails={{
              property_id: property.id,
              room_id: (propertyType !== 'Room' && selectedRoom.id && !selectedRoom.id.startsWith('property_')) ? selectedRoom.id : undefined,
              sharing_type: selectedRoom.sharing_type,
              price_per_person: selectedRoom.price_per_person,
              security_deposit_per_person: selectedRoom.security_deposit_per_person || selectedRoom.price_per_person * 2,
              total_amount: selectedRoom.price_per_person + (selectedRoom.security_deposit_per_person || selectedRoom.price_per_person * 2),
              amount_paid: Math.round(selectedRoom.price_per_person * 0.2),
              amount_due: (selectedRoom.price_per_person + (selectedRoom.security_deposit_per_person || selectedRoom.price_per_person * 2)) - Math.round(selectedRoom.price_per_person * 0.2),
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