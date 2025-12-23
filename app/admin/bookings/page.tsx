'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FaArrowLeft, FaEye, FaEdit, FaTrash, FaCalendar, FaUser, FaHome, FaBed } from 'react-icons/fa';
import { supabase } from '@/lib/supabase';

interface BookingWithDetails {
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
  booking_date: string;
  payment_date: string | null;
  property: {
    name: string;
    city: string;
    area: string;
  };
  room: {
    room_number: string;
    room_type: string;
    available_beds: number;
    total_beds: number;
  };
}

export default function AdminBookings() {
  const [bookings, setBookings] = useState<BookingWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          property:properties(name, city, area),
          room:property_rooms(room_number, room_type, available_beds, total_beds)
        `)
        .order('booking_date', { ascending: false });

      if (error) throw error;
      setBookings(data as BookingWithDetails[]);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateBookingStatus = async (bookingId: string, newStatus: string) => {
    try {
      const { error } = await (supabase as any)
        .from('bookings')
        .update({ booking_status: newStatus })
        .eq('id', bookingId);

      if (error) throw error;
      
      // Refresh bookings
      fetchBookings();
      alert(`Booking status updated to ${newStatus}`);
    } catch (error) {
      console.error('Error updating booking:', error);
      alert('Failed to update booking status');
    }
  };

  const filteredBookings = bookings.filter(booking => {
    if (filter === 'all') return true;
    return booking.booking_status === filter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'partial': return 'bg-yellow-100 text-yellow-800';
      case 'pending': return 'bg-red-100 text-red-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link
              href="/admin"
              className="inline-flex items-center text-primary hover:underline"
            >
              <FaArrowLeft className="mr-2" />
              Back to Admin
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">Manage Bookings</h1>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { key: 'all', label: 'All Bookings', count: bookings.length },
                { key: 'confirmed', label: 'Confirmed', count: bookings.filter(b => b.booking_status === 'confirmed').length },
                { key: 'cancelled', label: 'Cancelled', count: bookings.filter(b => b.booking_status === 'cancelled').length },
                { key: 'completed', label: 'Completed', count: bookings.filter(b => b.booking_status === 'completed').length },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setFilter(tab.key)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    filter === tab.key
                      ? 'border-primary text-primary'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label} ({tab.count})
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Bookings List */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {filteredBookings.length === 0 ? (
            <div className="text-center py-12">
              <FaCalendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings found</h3>
              <p className="text-gray-500">
                {filter === 'all' ? 'No bookings have been made yet.' : `No ${filter} bookings found.`}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Guest Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Property & Room
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Booking Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Payment
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredBookings.map((booking) => (
                    <tr key={booking.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center">
                              <FaUser className="text-white text-sm" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{booking.guest_name}</div>
                            <div className="text-sm text-gray-500">{booking.guest_email}</div>
                            <div className="text-sm text-gray-500">{booking.guest_phone}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                              <FaHome className="text-blue-600 text-sm" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{booking.property.name}</div>
                            <div className="text-sm text-gray-500">
                              {booking.property.area}, {booking.property.city}
                            </div>
                            <div className="text-sm text-gray-500 flex items-center">
                              <FaBed className="mr-1" />
                              Room {booking.room.room_number} - {booking.sharing_type}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          <div>Booked: {new Date(booking.booking_date).toLocaleDateString()}</div>
                          <div className="text-gray-500">₹{booking.price_per_person.toLocaleString()}/person</div>
                          <div className="text-gray-500">Total: ₹{booking.total_amount.toLocaleString()}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          <div>Paid: ₹{booking.amount_paid.toLocaleString()}</div>
                          <div className="text-gray-500">Due: ₹{booking.amount_due.toLocaleString()}</div>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPaymentStatusColor(booking.payment_status)}`}>
                            {booking.payment_status}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(booking.booking_status)}`}>
                          {booking.booking_status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          {booking.booking_status === 'confirmed' && (
                            <>
                              <button
                                onClick={() => updateBookingStatus(booking.id, 'completed')}
                                className="text-green-600 hover:text-green-900"
                                title="Mark as Completed"
                              >
                                Complete
                              </button>
                              <button
                                onClick={() => updateBookingStatus(booking.id, 'cancelled')}
                                className="text-red-600 hover:text-red-900"
                                title="Cancel Booking"
                              >
                                Cancel
                              </button>
                            </>
                          )}
                          {booking.booking_status === 'cancelled' && (
                            <button
                              onClick={() => updateBookingStatus(booking.id, 'confirmed')}
                              className="text-green-600 hover:text-green-900"
                              title="Reconfirm Booking"
                            >
                              Reconfirm
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Summary Stats */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FaCalendar className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <div className="text-sm font-medium text-gray-500">Total Bookings</div>
                <div className="text-2xl font-bold text-gray-900">{bookings.length}</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FaUser className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <div className="text-sm font-medium text-gray-500">Confirmed</div>
                <div className="text-2xl font-bold text-gray-900">
                  {bookings.filter(b => b.booking_status === 'confirmed').length}
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 bg-yellow-100 rounded-full flex items-center justify-center">
                  <span className="text-yellow-600 font-bold">₹</span>
                </div>
              </div>
              <div className="ml-4">
                <div className="text-sm font-medium text-gray-500">Revenue (20%)</div>
                <div className="text-2xl font-bold text-gray-900">
                  ₹{bookings.reduce((sum, b) => sum + b.amount_paid, 0).toLocaleString()}
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center">
                  <span className="text-gray-600 font-bold">₹</span>
                </div>
              </div>
              <div className="ml-4">
                <div className="text-sm font-medium text-gray-500">Owner Due (80%)</div>
                <div className="text-2xl font-bold text-gray-900">
                  ₹{bookings.reduce((sum, b) => sum + b.amount_due, 0).toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}