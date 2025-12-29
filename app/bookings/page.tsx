'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaArrowLeft, FaCalendarAlt, FaMapMarkerAlt, FaEye } from 'react-icons/fa';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import type { Booking } from '@/types/database';

interface BookingWithProperty extends Booking {
  property?: {
    id: string;
    name: string;
    address: string;
    city: string;
    featured_image: string | null;
  };
}

export default function BookingsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [bookings, setBookings] = useState<BookingWithProperty[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    if (user) {
      fetchBookings();
    }
  }, [user, authLoading, router]);

  const fetchBookings = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          property:properties(
            id,
            name,
            address,
            city,
            featured_image
          )
        `)
        .eq('guest_email', user.email || '')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setBookings(data || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
        return '#10B981';
      case 'pending':
        return '#F59E0B';
      case 'cancelled':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'paid':
        return '#10B981';
      case 'partial':
        return '#F59E0B';
      case 'pending':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: '#3AAFA9' }}></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen py-8 px-4" style={{ 
      background: 'linear-gradient(135deg, #63B3ED 0%, #90CDF4 50%, #63B3ED 100%)',
      backgroundSize: '400% 400%',
      animation: 'gradientShift 20s ease infinite'
    }}>
      <div className="max-w-6xl mx-auto">
        <Link
          href="/profile"
          className="inline-flex items-center hover:underline mb-6"
          style={{ color: '#FF6711' }}
        >
          <FaArrowLeft className="mr-2" />
          Back to Profile
        </Link>

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="px-4 sm:px-8 py-6" style={{ backgroundColor: '#FF6711' }}>
            <h1 className="text-xl sm:text-2xl font-bold text-white">My Bookings</h1>
            <p className="text-white/80 text-sm sm:text-base">View and manage your property bookings</p>
          </div>

          <div className="p-4 sm:p-8">
            {bookings.length === 0 ? (
              <div className="text-center py-12">
                <FaCalendarAlt className="mx-auto text-6xl text-gray-300 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Bookings Yet</h3>
                <p className="text-gray-600 mb-6">You haven't made any bookings yet. Start exploring properties!</p>
                <Link
                  href="/listings"
                  className="inline-flex items-center justify-center px-6 py-3 text-white font-semibold rounded-lg transition-all hover:shadow-lg min-h-[48px]"
                  style={{ backgroundColor: '#FF6711' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#E55A0F'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#FF6711'}
                >
                  Browse Properties
                </Link>
              </div>
            ) : (
              <div className="space-y-6">
                {bookings.map((booking) => (
                  <div key={booking.id} className="border border-gray-200 rounded-xl p-4 sm:p-6 hover:shadow-lg transition-shadow">
                    <div className="flex flex-col gap-4">
                      <div className="flex items-start space-x-3 sm:space-x-4">
                        {booking.property?.featured_image && (
                          <img
                            src={booking.property.featured_image}
                            alt={booking.property.name}
                            className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg object-cover flex-shrink-0"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1 truncate">
                            {booking.property?.name || 'Property'}
                          </h3>
                          <div className="flex items-center text-gray-600 mb-2">
                            <FaMapMarkerAlt className="mr-1 flex-shrink-0 text-xs sm:text-sm" />
                            <span className="text-xs sm:text-sm truncate">
                              {booking.property?.address}, {booking.property?.city}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-1 sm:gap-2 text-xs sm:text-sm">
                            <span className="px-2 py-1 rounded-full text-white font-medium" style={{ backgroundColor: getStatusColor(booking.booking_status || 'pending') }}>
                              {booking.booking_status || 'Pending'}
                            </span>
                            <span className="px-2 py-1 rounded-full text-white font-medium" style={{ backgroundColor: getPaymentStatusColor(booking.payment_status || 'pending') }}>
                              Payment: {booking.payment_status || 'Pending'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="text-left sm:text-right">
                          <div className="text-base sm:text-lg font-bold" style={{ color: '#3AAFA9' }}>
                            ₹{booking.amount_paid.toLocaleString()} paid
                          </div>
                          <div className="text-xs sm:text-sm text-gray-600">
                            ₹{booking.amount_due.toLocaleString()} due to owner
                          </div>
                        </div>
                        
                        <div className="flex">
                          <Link
                            href={`/property/${booking.property_id}`}
                            className="flex items-center justify-center space-x-1 px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors min-h-[40px] w-full sm:w-auto"
                          >
                            <FaEye />
                            <span>View Property</span>
                          </Link>
                        </div>
                      </div>
                    </div>

                    {/* Booking Details */}
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 text-xs sm:text-sm">
                        <div>
                          <span className="text-gray-600">Booking ID:</span>
                          <div className="font-medium">{booking.id.slice(0, 8)}...</div>
                        </div>
                        <div>
                          <span className="text-gray-600">Sharing Type:</span>
                          <div className="font-medium">{booking.sharing_type}</div>
                        </div>
                        <div>
                          <span className="text-gray-600">Booking Date:</span>
                          <div className="font-medium">
                            {booking.created_at 
                              ? new Date(booking.created_at).toLocaleDateString()
                              : 'N/A'
                            }
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-600">Total Amount:</span>
                          <div className="font-medium">₹{booking.total_amount.toLocaleString()}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}