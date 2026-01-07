'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { FaEye, FaPhone, FaEnvelope, FaRupeeSign, FaCalendarAlt } from 'react-icons/fa';

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
  razorpay_payment_id: string;
  properties: {
    id: string;
    name: string;
    address: string;
    city: string;
  };
}

export default function AdminBookingsPage() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [stats, setStats] = useState({
    totalBookings: 0,
    totalRevenue: 0,
    bookedUsers: 0
  });

  useEffect(() => {
    if (user) {
      fetchBookings();
    }
  }, [user]);

  const fetchBookings = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          properties (
            id,
            name,
            address,
            city
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setBookings(data || []);

      // Calculate stats
      const totalBookings = data?.length || 0;
      const totalRevenue = data?.reduce((sum, booking) => sum + booking.amount_paid, 0) || 0;
      const bookedUsers = new Set(data?.map(booking => booking.guest_email)).size;

      setStats({
        totalBookings,
        totalRevenue,
        bookedUsers
      });

    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
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
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Booking Management</h1>
          <p className="text-gray-600">View and manage all property bookings</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalBookings}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <FaCalendarAlt className="text-blue-600 text-xl" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-3xl font-bold text-green-600 flex items-center">
                  <FaRupeeSign className="text-2xl mr-1" />
                  {stats.totalRevenue.toLocaleString()}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <FaRupeeSign className="text-green-600 text-xl" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Unique Users</p>
                <p className="text-3xl font-bold text-purple-600">{stats.bookedUsers}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <FaEnvelope className="text-purple-600 text-xl" />
              </div>
            </div>
          </div>
        </div>

        {/* Bookings Table */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">All Bookings</h2>
          </div>

          {bookings.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No bookings found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Guest
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Property
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {bookings.map((booking) => (
                    <tr key={booking.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {booking.guest_name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {booking.guest_email}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {booking.properties.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {booking.properties.city}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 flex items-center">
                          <FaRupeeSign className="mr-1" />
                          {booking.amount_paid.toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-500">
                          Due: ₹{booking.amount_due.toLocaleString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          booking.booking_status === 'booked'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {booking.booking_status === 'booked' ? 'Confirmed' : booking.booking_status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(booking.booking_date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => setSelectedBooking(booking)}
                          className="text-primary hover:text-primary-dark flex items-center"
                        >
                          <FaEye className="mr-1" />
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Booking Detail Modal */}
        {selectedBooking && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-900">Booking Details</h3>
                  <button
                    onClick={() => setSelectedBooking(null)}
                    className="text-gray-400 hover:text-gray-600 text-2xl"
                  >
                    ×
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Property Info */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">Property Information</h4>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="font-medium text-gray-900">{selectedBooking.properties.name}</p>
                      <p className="text-gray-600">{selectedBooking.properties.address}, {selectedBooking.properties.city}</p>
                    </div>
                  </div>

                  {/* Guest Info */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">Guest Information</h4>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                      <p><span className="font-medium">Name:</span> {selectedBooking.guest_name}</p>
                      <p className="flex items-center">
                        <FaEnvelope className="mr-2" />
                        <span className="font-medium">Email:</span> {selectedBooking.guest_email}
                      </p>
                      <p className="flex items-center">
                        <FaPhone className="mr-2" />
                        <span className="font-medium">Phone:</span> {selectedBooking.guest_phone}
                      </p>
                    </div>
                  </div>

                  {/* Payment Info */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">Payment Information</h4>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                      <div className="flex justify-between">
                        <span>Total Amount:</span>
                        <span className="font-medium flex items-center">
                          <FaRupeeSign className="mr-1" />
                          {selectedBooking.total_amount.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Amount Paid:</span>
                        <span className="font-medium text-green-600 flex items-center">
                          <FaRupeeSign className="mr-1" />
                          {selectedBooking.amount_paid.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Amount Due:</span>
                        <span className="font-medium text-orange-600 flex items-center">
                          <FaRupeeSign className="mr-1" />
                          {selectedBooking.amount_due.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Payment Status:</span>
                        <span className="font-medium text-green-600">{selectedBooking.payment_status}</span>
                      </div>
                      {selectedBooking.razorpay_payment_id && (
                        <div className="pt-2 border-t">
                          <p className="text-sm text-gray-600">
                            Payment ID: {selectedBooking.razorpay_payment_id}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Booking Info */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">Booking Information</h4>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                      <div className="flex justify-between">
                        <span>Booking Status:</span>
                        <span className={`px-2 py-1 rounded-full text-sm font-medium ${
                          selectedBooking.booking_status === 'booked'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {selectedBooking.booking_status === 'booked' ? 'Confirmed' : selectedBooking.booking_status}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Sharing Type:</span>
                        <span className="font-medium">{selectedBooking.sharing_type}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Booking Date:</span>
                        <span className="font-medium">
                          {new Date(selectedBooking.booking_date).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Payment Date:</span>
                        <span className="font-medium">
                          {new Date(selectedBooking.payment_date).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    onClick={() => setSelectedBooking(null)}
                    className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}