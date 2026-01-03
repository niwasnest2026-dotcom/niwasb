'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaArrowLeft, FaHome, FaCalendarAlt, FaBed, FaRupeeSign, FaUser, FaPhone, FaMapMarkerAlt, FaClock, FaReceipt } from 'react-icons/fa';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import OwnerDetailsModal from '@/components/OwnerDetailsModal';

interface BookingWithProperty {
  id: string;
  guest_name: string;
  guest_email: string;
  guest_phone: string;
  sharing_type: string;
  price_per_person: number;
  security_deposit_per_person: number;
  total_amount: number;
  amount_paid: number;
  amount_due: number;
  payment_method: string;
  payment_status: string;
  booking_status: string;
  payment_id: string;
  payment_date: string;
  check_in_date: string;
  check_out_date: string;
  notes: string;
  created_at: string;
  properties: {
    id: string;
    name: string;
    address: string;
    city: string;
    area: string;
    featured_image: string;
    owner_name: string;
    owner_phone: string;
    payment_instructions: string;
  };
  property_rooms?: {
    room_number: string;
    room_type: string;
  };
}

export default function MyBookingsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [bookings, setBookings] = useState<BookingWithProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
  const [showOwnerModal, setShowOwnerModal] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    if (user) {
      fetchUserBookings();
    }
  }, [user, authLoading, router]);

  const fetchUserBookings = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          properties!inner(
            id,
            name,
            address,
            city,
            area,
            featured_image,
            owner_name,
            owner_phone,
            payment_instructions
          ),
          property_rooms(
            room_number,
            room_type
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBookings(data as BookingWithProperty[] || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      case 'completed': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'partial': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'pending': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleViewOwnerDetails = (bookingId: string) => {
    setSelectedBookingId(bookingId);
    setShowOwnerModal(true);
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: '#FF6711' }}></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen py-8 px-4" style={{ 
      background: 'linear-gradient(135deg, #FF6711 0%, #FFD082 50%, #FF6711 100%)',
      backgroundSize: '400% 400%',
      animation: 'gradientShift 20s ease infinite'
    }}>
      <div className="max-w-6xl mx-auto">
        <Link
          href="/profile"
          className="inline-flex items-center hover:underline mb-6"
          style={{ color: '#FFF4EC' }}
        >
          <FaArrowLeft className="mr-2" />
          Back to Profile
        </Link>

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="px-4 sm:px-8 py-6" style={{ backgroundColor: '#FF6711' }}>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white">My Bookings</h1>
                <p className="text-white/80 mt-1">View and manage your property bookings</p>
              </div>
              <div className="text-white text-right">
                <div className="text-2xl font-bold">{bookings.length}</div>
                <div className="text-sm opacity-80">Total Bookings</div>
              </div>
            </div>
          </div>

          {/* Bookings List */}
          <div className="p-4 sm:p-8">
            {bookings.length === 0 ? (
              <div className="text-center py-12">
                <FaHome className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                <h3 className="text-xl font-medium text-gray-900 mb-2">No bookings yet</h3>
                <p className="text-gray-500 mb-6">
                  You haven't made any bookings yet. Start exploring properties to make your first booking.
                </p>
                <Link
                  href="/listings"
                  className="inline-flex items-center px-6 py-3 text-white font-semibold rounded-lg transition-all hover:shadow-lg"
                  style={{ backgroundColor: '#FF6711' }}
                >
                  <FaHome className="mr-2" />
                  Browse Properties
                </Link>
              </div>
            ) : (
              <div className="space-y-6">
                {bookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden"
                  >
                    <div className="md:flex">
                      {/* Property Image */}
                      <div className="md:w-1/3">
                        <div className="h-48 md:h-full">
                          {booking.properties.featured_image ? (
                            <img
                              src={booking.properties.featured_image}
                              alt={booking.properties.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                              <FaHome className="text-4xl text-gray-400" />
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Booking Details */}
                      <div className="md:w-2/3 p-6">
                        <div className="flex flex-col h-full">
                          {/* Header */}
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4">
                            <div className="flex-1">
                              <h3 className="text-xl font-bold text-gray-900 mb-1">
                                {booking.properties.name}
                              </h3>
                              <div className="flex items-center text-gray-600 text-sm mb-2">
                                <FaMapMarkerAlt className="mr-1" />
                                {booking.properties.area && booking.properties.city
                                  ? `${booking.properties.area}, ${booking.properties.city}`
                                  : booking.properties.city || booking.properties.area}
                              </div>
                              <div className="flex items-center space-x-4 text-sm">
                                <span className={`px-3 py-1 rounded-full border font-medium ${getStatusColor(booking.booking_status)}`}>
                                  {booking.booking_status}
                                </span>
                                <span className={`px-3 py-1 rounded-full border font-medium ${getPaymentStatusColor(booking.payment_status)}`}>
                                  {booking.payment_status} payment
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Booking Info Grid */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                            <div className="flex items-center text-sm">
                              <FaBed className="mr-2 text-orange-600" />
                              <span className="text-gray-600">Room:</span>
                              <span className="ml-1 font-medium">
                                {booking.property_rooms?.room_number || booking.sharing_type}
                              </span>
                            </div>
                            <div className="flex items-center text-sm">
                              <FaCalendarAlt className="mr-2 text-blue-600" />
                              <span className="text-gray-600">Check-in:</span>
                              <span className="ml-1 font-medium">
                                {booking.check_in_date ? new Date(booking.check_in_date).toLocaleDateString() : 'TBD'}
                              </span>
                            </div>
                            <div className="flex items-center text-sm">
                              <FaReceipt className="mr-2 text-green-600" />
                              <span className="text-gray-600">Payment ID:</span>
                              <span className="ml-1 font-medium text-xs">
                                {booking.payment_id || 'N/A'}
                              </span>
                            </div>
                          </div>

                          {/* Payment Details */}
                          <div className="bg-gray-50 rounded-lg p-4 mb-4">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                              <div>
                                <span className="text-gray-600">Amount Paid:</span>
                                <div className="font-bold text-green-600 flex items-center">
                                  <FaRupeeSign className="mr-1" />
                                  {booking.amount_paid.toLocaleString()}
                                </div>
                              </div>
                              <div>
                                <span className="text-gray-600">Amount Due:</span>
                                <div className="font-bold text-orange-600 flex items-center">
                                  <FaRupeeSign className="mr-1" />
                                  {booking.amount_due.toLocaleString()}
                                </div>
                              </div>
                              <div>
                                <span className="text-gray-600">Total Amount:</span>
                                <div className="font-bold text-gray-900 flex items-center">
                                  <FaRupeeSign className="mr-1" />
                                  {booking.total_amount.toLocaleString()}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex flex-col sm:flex-row gap-3 mt-auto">
                            <button
                              onClick={() => handleViewOwnerDetails(booking.id)}
                              className="flex items-center justify-center px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-lg transition-colors"
                            >
                              <FaUser className="mr-2" />
                              View Owner Details
                            </button>
                            
                            {booking.properties.owner_phone && (
                              <button
                                onClick={() => {
                                  const message = `Hi, regarding my booking at ${booking.properties.name}
                                  
Booking ID: ${booking.id}
Payment ID: ${booking.payment_id}
Amount Due: ₹${booking.amount_due.toLocaleString()}

Please provide payment details and check-in instructions.`;
                                  
                                  const whatsappUrl = `https://wa.me/${booking.properties.owner_phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`;
                                  window.open(whatsappUrl, '_blank');
                                }}
                                className="flex items-center justify-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
                              >
                                <FaPhone className="mr-2" />
                                Contact Owner
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Owner Details Modal */}
        {selectedBookingId && (
          <OwnerDetailsModal
            isOpen={showOwnerModal}
            onClose={() => {
              setShowOwnerModal(false);
              setSelectedBookingId(null);
            }}
            bookingId={selectedBookingId}
          />
        )}
      </div>
    </div>
  );
}