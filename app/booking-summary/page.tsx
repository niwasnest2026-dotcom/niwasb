'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import RazorpayPayment from '@/components/RazorpayPayment';
import { FaMapMarkerAlt, FaRupeeSign, FaUser, FaEnvelope, FaPhone } from 'react-icons/fa';

interface Property {
  id: string;
  name: string;
  address: string;
  city: string;
  price: number;
  security_deposit: number;
  featured_image: string;
  owner_name: string;
  owner_phone: string;
}

export default function BookingSummaryPage() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const propertyId = searchParams.get('propertyId');

  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [userDetails, setUserDetails] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [bookingId, setBookingId] = useState<string | null>(null);

  useEffect(() => {
    if (!propertyId) {
      router.push('/listings');
      return;
    }

    if (!user) {
      router.push('/login');
      return;
    }

    // Initialize user details
    setUserDetails({
      name: user.user_metadata?.full_name || user.email?.split('@')[0] || '',
      email: user.email || '',
      phone: user.user_metadata?.phone || ''
    });

    fetchProperty();
  }, [propertyId, user, router]);

  const fetchProperty = async () => {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('id', propertyId)
        .single();

      if (error) throw error;
      setProperty(data);
    } catch (error) {
      console.error('Error fetching property:', error);
      router.push('/listings');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = (paymentId: string, newBookingId: string) => {
    setPaymentSuccess(true);
    setBookingId(newBookingId);
  };

  const handlePaymentError = (error: string) => {
    alert(error);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Property Not Found</h1>
          <button
            onClick={() => router.push('/listings')}
            className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary-dark transition-colors"
          >
            Back to Listings
          </button>
        </div>
      </div>
    );
  }

  if (paymentSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="max-w-md mx-auto text-center p-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Booking Confirmed! 🎉</h1>
          <p className="text-gray-600 mb-6">
            Your booking has been confirmed. Our team will contact you with property details shortly.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => router.push('/bookings')}
              className="w-full bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary-dark transition-colors"
            >
              View My Bookings
            </button>
            <button
              onClick={() => router.push('/listings')}
              className="w-full bg-gray-200 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Browse More Properties
            </button>
          </div>
        </div>
      </div>
    );
  }

  const advanceAmount = Math.round(property.price * 0.2); // 20% advance

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Booking Summary</h1>
          <p className="text-gray-600">Review your booking details and complete payment</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Property Details */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            <img
              src={property.featured_image || '/placeholder-property.jpg'}
              alt={property.name}
              className="w-full h-48 object-cover"
            />
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{property.name}</h2>
              
              <div className="space-y-3 mb-6">
                <div className="flex items-center text-gray-600">
                  <FaMapMarkerAlt className="mr-3" />
                  <span>{property.address}, {property.city}</span>
                </div>
                
                <div className="flex items-center text-gray-600">
                  <FaRupeeSign className="mr-3" />
                  <span>Monthly Rent: ₹{property.price.toLocaleString()}</span>
                </div>
                
                {property.security_deposit > 0 && (
                  <div className="flex items-center text-gray-600">
                    <FaRupeeSign className="mr-3" />
                    <span>Security Deposit: ₹{property.security_deposit.toLocaleString()}</span>
                  </div>
                )}
              </div>

              {/* Owner Contact */}
              {(property.owner_name || property.owner_phone) && (
                <div className="border-t pt-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Owner Contact</h3>
                  <div className="space-y-1 text-sm text-gray-600">
                    {property.owner_name && <div>Name: {property.owner_name}</div>}
                    {property.owner_phone && (
                      <div className="flex items-center">
                        <FaPhone className="mr-2" />
                        <span>{property.owner_phone}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Booking Form & Payment */}
          <div className="space-y-6">
            {/* User Details Form */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Your Details</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FaUser className="inline mr-2" />
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={userDetails.name}
                    onChange={(e) => setUserDetails(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Enter your full name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FaEnvelope className="inline mr-2" />
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={userDetails.email}
                    onChange={(e) => setUserDetails(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Enter your email"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FaPhone className="inline mr-2" />
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={userDetails.phone}
                    onChange={(e) => setUserDetails(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Enter your phone number"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Payment Section */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Payment Details</h3>
              
              <div className="mb-6">
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
                  <h4 className="font-semibold text-orange-800 mb-2">Advance Payment (20%)</h4>
                  <p className="text-sm text-orange-700">
                    Pay 20% advance now. Remaining 80% to be paid directly to property owner.
                  </p>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Monthly Rent:</span>
                    <span>₹{property.price.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-lg border-t pt-2">
                    <span>Advance Payment (20%):</span>
                    <span className="text-primary">₹{advanceAmount.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <RazorpayPayment
                amount={advanceAmount}
                propertyId={property.id}
                propertyName={property.name}
                userDetails={userDetails}
                onSuccess={handlePaymentSuccess}
                onError={handlePaymentError}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}