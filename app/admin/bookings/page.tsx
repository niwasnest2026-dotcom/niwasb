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
  payment_id: string | null;
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
      // Get the booking details first to know which room to update
      const { data: bookingData, error: bookingError } = await supabase
        .from('bookings')
        .select('room_id, booking_status')
        .eq('id', bookingId)
        .single();

      if (bookingError) throw bookingError;

      const oldStatus = (bookingData as any).booking_status;
      
      // Update booking status
      const { error } = await (supabase as any)
        .from('bookings')
        .update({ booking_status: newStatus })
        .eq('id', bookingId);

      if (error) throw error;

      // Update available beds based on status change
      if (oldStatus !== newStatus) {
        const { data: roomData, error: roomError } = await supabase
          .from('property_rooms')
          .select('available_beds')
          .eq('id', (bookingData as any).room_id)
          .single();

        if (!roomError && roomData) {
          let newAvailableBeds = (roomData as any).available_beds;

          // If changing from booked to cancelled/completed, increase available beds
          if (oldStatus === 'booked' && (newStatus === 'cancelled' || newStatus === 'completed')) {
            newAvailableBeds = (roomData as any).available_beds + 1;
          }
          // If changing from cancelled to booked, decrease available beds
          else if (oldStatus === 'cancelled' && newStatus === 'booked') {
            newAvailableBeds = Math.max(0, (roomData as any).available_beds - 1);
          }

          // Update the room's available beds if there was a change
          if (newAvailableBeds !== (roomData as any).available_beds) {
            await (supabase as any)
              .from('property_rooms')
              .update({
                available_beds: newAvailableBeds,
                updated_at: new Date().toISOString()
              })
              .eq('id', (bookingData as any).room_id);
          }
        }
      }
      
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
      case 'booked': return 'bg-green-100 text-green-800';
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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8 space-y-4 sm:space-y-0">
          <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-2 sm:space-y-0">
            <Link
              href="/admin"
              className="inline-flex items-center text-primary hover:underline text-sm sm:text-base"
            >
              <FaArrowLeft className="mr-2" />
              Back to Admin
            </Link>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Manage Bookings</h1>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex flex-wrap px-4 sm:px-6">
              {[
                { key: 'all', label: 'All Bookings', count: bookings.length },
                { key: 'booked', label: 'Booked', count: bookings.filter(b => b.booking_status === 'booked').length },
                { key: 'cancelled', label: 'Cancelled', count: bookings.filter(b => b.booking_status === 'cancelled').length },
                { key: 'completed', label: 'Completed', count: bookings.filter(b => b.booking_status === 'completed').length },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setFilter(tab.key)}
                  className={`py-3 px-2 sm:px-4 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap ${
                    filter === tab.key
                      ? 'border-primary text-primary'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden">
                    {tab.key === 'all' ? 'All' : tab.key === 'booked' ? 'Booked' : tab.key === 'cancelled' ? 'Cancelled' : 'Complete'}
                  </span>
                  <span className="ml-1">({tab.count})</span>
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
            <>
              {/* Desktop Table View */}
              <div className="hidden lg:block overflow-x-auto">
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
                        Payment ID
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
                          <div className="text-sm text-gray-900">
                            {booking.payment_id ? (
                              <div className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                                {booking.payment_id}
                              </div>
                            ) : (
                              <span className="text-gray-400">No Payment ID</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(booking.booking_status)}`}>
                            {booking.booking_status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            {booking.booking_status === 'booked' && (
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
                                onClick={() => updateBookingStatus(booking.id, 'booked')}
                                className="text-green-600 hover:text-green-900"
                                title="Rebook"
                              >
                                Rebook
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="lg:hidden divide-y divide-gray-200">
                {filteredBookings.map((booking) => (
                  <div key={booking.id} className="p-4 hover:bg-gray-50">
                    {/* Guest Info */}
                    <div className="flex items-start space-x-3 mb-3">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center">
                          <FaUser className="text-white text-sm" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 truncate">{booking.guest_name}</div>
                        <div className="text-xs text-gray-500 truncate">{booking.guest_email}</div>
                        <div className="text-xs text-gray-500">{booking.guest_phone}</div>
                      </div>
                      <div className="flex-shrink-0">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(booking.booking_status)}`}>
                          {booking.booking_status}
                        </span>
                      </div>
                    </div>

                    {/* Property Info */}
                    <div className="flex items-start space-x-3 mb-3">
                      <div className="flex-shrink-0 h-8 w-8">
                        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                          <FaHome className="text-blue-600 text-xs" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 truncate">{booking.property.name}</div>
                        <div className="text-xs text-gray-500 truncate">
                          {booking.property.area}, {booking.property.city}
                        </div>
                        <div className="text-xs text-gray-500 flex items-center">
                          <FaBed className="mr-1" />
                          Room {booking.room.room_number} - {booking.sharing_type}
                        </div>
                      </div>
                    </div>

                    {/* Booking & Payment Details */}
                    <div className="grid grid-cols-2 gap-4 mb-3">
                      <div>
                        <div className="text-xs font-medium text-gray-500 mb-1">Booking Details</div>
                        <div className="text-xs text-gray-900">
                          <div>Date: {new Date(booking.booking_date).toLocaleDateString()}</div>
                          <div>Rate: ₹{booking.price_per_person.toLocaleString()}/person</div>
                          <div>Total: ₹{booking.total_amount.toLocaleString()}</div>
                        </div>
                      </div>
                      <div>
                        <div className="text-xs font-medium text-gray-500 mb-1">Payment</div>
                        <div className="text-xs text-gray-900">
                          <div>Paid: ₹{booking.amount_paid.toLocaleString()}</div>
                          <div>Due: ₹{booking.amount_due.toLocaleString()}</div>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPaymentStatusColor(booking.payment_status)}`}>
                            {booking.payment_status}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap gap-2">
                      {booking.booking_status === 'booked' && (
                        <>
                          <button
                            onClick={() => updateBookingStatus(booking.id, 'completed')}
                            className="px-3 py-1 text-xs font-medium text-green-600 bg-green-50 rounded-md hover:bg-green-100"
                          >
                            Complete
                          </button>
                          <button
                            onClick={() => updateBookingStatus(booking.id, 'cancelled')}
                            className="px-3 py-1 text-xs font-medium text-red-600 bg-red-50 rounded-md hover:bg-red-100"
                          >
                            Cancel
                          </button>
                        </>
                      )}
                      {booking.booking_status === 'cancelled' && (
                        <button
                          onClick={() => updateBookingStatus(booking.id, 'booked')}
                          className="px-3 py-1 text-xs font-medium text-green-600 bg-green-50 rounded-md hover:bg-green-100"
                        >
                          Rebook
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Summary Stats */}
        <div className="mt-6 sm:mt-8 grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FaCalendar className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
              </div>
              <div className="ml-3 sm:ml-4">
                <div className="text-xs sm:text-sm font-medium text-gray-500">Total Bookings</div>
                <div className="text-lg sm:text-2xl font-bold text-gray-900">{bookings.length}</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FaUser className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
              </div>
              <div className="ml-3 sm:ml-4">
                <div className="text-xs sm:text-sm font-medium text-gray-500">Booked</div>
                <div className="text-lg sm:text-2xl font-bold text-gray-900">
                  {bookings.filter(b => b.booking_status === 'booked').length}
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-6 w-6 sm:h-8 sm:w-8 bg-yellow-100 rounded-full flex items-center justify-center">
                  <span className="text-yellow-600 font-bold text-sm sm:text-base">₹</span>
                </div>
              </div>
              <div className="ml-3 sm:ml-4">
                <div className="text-xs sm:text-sm font-medium text-gray-500">Revenue (20%)</div>
                <div className="text-sm sm:text-2xl font-bold text-gray-900">
                  ₹{bookings.reduce((sum, b) => sum + b.amount_paid, 0).toLocaleString()}
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-6 w-6 sm:h-8 sm:w-8 bg-gray-100 rounded-full flex items-center justify-center">
                  <span className="text-gray-600 font-bold text-sm sm:text-base">₹</span>
                </div>
              </div>
              <div className="ml-3 sm:ml-4">
                <div className="text-xs sm:text-sm font-medium text-gray-500">Owner Due (80%)</div>
                <div className="text-sm sm:text-2xl font-bold text-gray-900">
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