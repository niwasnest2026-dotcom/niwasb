'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

export default function DebugMyBookingsPage() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<any[]>([]);
  const [allBookings, setAllBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchBookings();
    }
  }, [user]);

  const fetchBookings = async () => {
    if (!user) return;

    try {
      // Fetch user's bookings
      const { data: userBookings, error: userError } = await supabase
        .from('bookings')
        .select('*')
        .or(`user_id.eq.${user.id},guest_email.eq.${user.email}`)
        .order('created_at', { ascending: false });

      if (userError) throw userError;
      setBookings(userBookings || []);

      // Fetch all recent bookings for debugging
      const { data: recentBookings, error: recentError } = await supabase
        .from('bookings')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (recentError) throw recentError;
      setAllBookings(recentBookings || []);

    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Please Login First</h1>
          <p>You need to be logged in to debug your bookings.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">🔍 Debug My Bookings</h1>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h2 className="font-semibold text-blue-800 mb-2">User Information:</h2>
            <div className="text-sm text-blue-700 space-y-1">
              <div><strong>User ID:</strong> {user.id}</div>
              <div><strong>Email:</strong> {user.email}</div>
              <div><strong>Full Name:</strong> {user.user_metadata?.full_name || 'Not set'}</div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* User's Bookings */}
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                Your Bookings ({bookings.length})
              </h2>
              
              {bookings.length === 0 ? (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-yellow-800">
                    No bookings found for your user ID ({user.id}) or email ({user.email})
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {bookings.map((booking) => (
                    <div key={booking.id} className="bg-gray-50 rounded-lg p-4 border">
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div><strong>ID:</strong> {booking.id}</div>
                        <div><strong>Status:</strong> <span className="font-mono bg-green-100 px-2 py-1 rounded">{booking.booking_status}</span></div>
                        <div><strong>Guest Name:</strong> {booking.guest_name}</div>
                        <div><strong>Guest Email:</strong> {booking.guest_email}</div>
                        <div><strong>User ID:</strong> {booking.user_id || 'NULL'}</div>
                        <div><strong>Property ID:</strong> {booking.property_id}</div>
                        <div><strong>Amount Paid:</strong> ₹{booking.amount_paid}</div>
                        <div><strong>Payment Status:</strong> {booking.payment_status}</div>
                        <div><strong>Razorpay Payment ID:</strong> {booking.razorpay_payment_id || 'NULL'}</div>
                        <div><strong>Created:</strong> {new Date(booking.created_at).toLocaleString()}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Bookings (All Users) */}
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                Recent Bookings (All Users) ({allBookings.length})
              </h2>
              
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {allBookings.map((booking) => (
                  <div 
                    key={booking.id} 
                    className={`rounded-lg p-4 border ${
                      booking.user_id === user.id || booking.guest_email === user.email 
                        ? 'bg-green-50 border-green-200' 
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div><strong>ID:</strong> {booking.id.substring(0, 8)}...</div>
                      <div><strong>Status:</strong> <span className="font-mono bg-blue-100 px-2 py-1 rounded">{booking.booking_status}</span></div>
                      <div><strong>Guest:</strong> {booking.guest_name}</div>
                      <div><strong>Email:</strong> {booking.guest_email}</div>
                      <div><strong>User ID:</strong> {booking.user_id ? booking.user_id.substring(0, 8) + '...' : 'NULL'}</div>
                      <div><strong>Amount:</strong> ₹{booking.amount_paid}</div>
                      <div><strong>Payment:</strong> {booking.payment_status}</div>
                      <div><strong>Created:</strong> {new Date(booking.created_at).toLocaleString()}</div>
                    </div>
                    {(booking.user_id === user.id || booking.guest_email === user.email) && (
                      <div className="mt-2 text-xs text-green-700 font-medium">
                        ✅ This booking belongs to you!
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-800 mb-2">Debugging Notes:</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Green highlighted bookings in the right column belong to you</li>
              <li>• Check if your recent payment created a booking with status 'booked'</li>
              <li>• Verify the user_id and guest_email match your account</li>
              <li>• If you see your booking in "Recent Bookings" but not in "Your Bookings", there's a query issue</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}