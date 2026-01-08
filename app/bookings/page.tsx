'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { FaCalendarAlt, FaMapMarkerAlt, FaPhone, FaEnvelope, FaRupeeSign } from 'react-icons/fa';

interface Booking {
  id: string;
  property_id: string;
  guest_name: string;
  guest_email: string;
  guest_phone: string;
  sharing_type: string;
  price_per_person: number;
  total_amount: number;
  amount_paid: number;
  amount_due: number;
  payment_status: string;
  booking_status: string;
  booking_date: string;
  payment_date: string;
  payment_id: string;
  properties: {
    id: string;
    name: string;
    address: string;
    city: string;
    featured_image: string;
    owner_name: string;
    owner_phone: string;
  };
}

export default function BookingsPage() {
  const { user, loading: authLoading } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    
    if (!user) {
      setError('Please login to view your bookings');
      setLoading(false);
      return;
    }

    fetchBookings();
  }, [user, authLoading]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔍 Fetching bookings for user:', user?.id);

      const { data, error: fetchError } = await supabase
        .from('bookings')
        .select(`
          *,
          properties (
            id,
            name,
            address,
            city,
            featured_image,
            owner_name,
            owner_phone
          )
        `)
        .eq('user_id', user?.id) // Use only user_id for proper filtering
        .eq('booking_status', 'booked') // Filter for booked status
        .order('created_at', { ascending: false });

      if (fetchError) {
        console.error('❌ Error fetching bookings:', fetchError);
        throw fetchError;
      }

      console.log('✅ Bookings fetched:', data?.length || 0);
      setBookings(data || []);
    } catch (err: any) {
      console.error('Error fetching bookings:', err);
      setError('Failed to load bookings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Login Required</h1>
          <p className="text-gray-600 mb-6">Please login to view your bookings</p>
          <Link
            href="/login"
            className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary-dark transition-colors"
          >
            Login Now
          </Link>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={fetchBookings}
            className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary-dark transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Bookings</h1>
          <p className="text-gray-600">View and manage your property bookings</p>
        </div>

        {bookings.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
              <FaCalendarAlt className="text-3xl text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">No Bookings Yet</h2>
            <p className="text-gray-600 mb-6">You haven't made any bookings yet. Start exploring properties!</p>
            <Link
              href="/listings"
              className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary-dark transition-colors inline-block"
            >
              Browse Properties
            </Link>
          </div>
        ) : (
          <div className="grid gap-6">
            {bookings.map((booking) => (
              <div key={booking.id} className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                <div className="md:flex">
                  {/* Property Image */}
                  <div className="md:w-1/3">
                    <img
                      src={booking.properties.featured_image || '/placeholder-property.jpg'}
                      alt={booking.properties.name}
                      className="w-full h-48 md:h-full object-cover"
                    />
                  </div>

                  {/* Booking Details */}
                  <div className="md:w-2/3 p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                          {booking.properties.name}
                        </h3>
                        <div className="flex items-center text-gray-600 mb-2">
                          <FaMapMarkerAlt className="mr-2" />
                          <span>{booking.properties.address}, {booking.properties.city}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          booking.booking_status === 'booked' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {booking.booking_status === 'booked' ? 'Confirmed' : booking.booking_status}
                        </span>
                      </div>
                    </div>

                    {/* Guest Details */}
                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Guest Details</h4>
                        <div className="space-y-1 text-sm text-gray-600">
                          <div className="flex items-center">
                            <FaEnvelope className="mr-2" />
                            <span>{booking.guest_email}</span>
                          </div>
                          <div className="flex items-center">
                            <FaPhone className="mr-2" />
                            <span>{booking.guest_phone}</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Owner Contact</h4>
                        <div className="space-y-1 text-sm text-gray-600">
                          <div>Name: {booking.properties.owner_name || 'Not provided'}</div>
                          <div className="flex items-center">
                            <FaPhone className="mr-2" />
                            <span>{booking.properties.owner_phone || 'Not provided'}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Payment Details */}
                    <div className="border-t pt-4">
                      <div className="grid md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Amount Paid:</span>
                          <div className="font-semibold text-green-600 flex items-center">
                            <FaRupeeSign className="mr-1" />
                            {booking.amount_paid.toLocaleString()}
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-600">Amount Due:</span>
                          <div className="font-semibold text-orange-600 flex items-center">
                            <FaRupeeSign className="mr-1" />
                            {booking.amount_due.toLocaleString()}
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-600">Booking Date:</span>
                          <div className="font-semibold text-gray-900">
                            {new Date(booking.booking_date).toLocaleDateString()}
                          </div>
                        </div>
                      </div>

                      {booking.payment_id && (
                        <div className="mt-2 text-xs text-gray-500">
                          Payment ID: {booking.payment_id}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}