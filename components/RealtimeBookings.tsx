'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { FaBell, FaCheckCircle, FaRupeeSign, FaUser, FaHome, FaClock } from 'react-icons/fa';

interface Booking {
  id: string;
  guest_name: string;
  amount_paid: number;
  payment_reference: string;
  created_at: string;
  properties: {
    name: string;
  };
}

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  data: any;
  is_read: boolean;
  created_at: string;
}

export default function RealtimeBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecentBookings();
    fetchNotifications();
    setupRealtimeSubscription();
  }, []);

  const fetchRecentBookings = async () => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          id,
          guest_name,
          amount_paid,
          payment_reference,
          created_at,
          properties!inner(name)
        `)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setBookings(data || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    }
  };

  const fetchNotifications = async () => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      setNotifications(data || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeSubscription = () => {
    // Subscribe to new bookings
    const bookingsChannel = supabase
      .channel('realtime-bookings')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'bookings'
        },
        (payload) => {
          console.log('🔔 New booking received:', payload.new);
          fetchRecentBookings(); // Refresh bookings list
          
          // Show browser notification if supported
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('New Booking Received!', {
              body: `New booking from ${payload.new.guest_name}`,
              icon: '/favicon.ico'
            });
          }
        }
      )
      .subscribe();

    // Subscribe to notifications
    const notificationsChannel = supabase
      .channel('realtime-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications'
        },
        (payload) => {
          console.log('🔔 New notification:', payload.new);
          setNotifications(prev => [payload.new as Notification, ...prev.slice(0, 4)]);
        }
      )
      .subscribe();

    // Cleanup function
    return () => {
      bookingsChannel.unsubscribe();
      notificationsChannel.unsubscribe();
    };
  };

  const markNotificationAsRead = async (notificationId: string) => {
    try {
      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      setNotifications(prev =>
        prev.map(notif =>
          notif.id === notificationId ? { ...notif, is_read: true } : notif
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const requestNotificationPermission = () => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Notifications Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <FaBell className="mr-2 text-orange-500" />
            Real-time Notifications
          </h3>
          <button
            onClick={requestNotificationPermission}
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            Enable Browser Notifications
          </button>
        </div>

        {notifications.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No notifications yet</p>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 rounded-lg border ${
                  notification.is_read
                    ? 'bg-gray-50 border-gray-200'
                    : 'bg-blue-50 border-blue-200'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{notification.title}</h4>
                    <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                    <p className="text-xs text-gray-400 mt-2">
                      <FaClock className="inline mr-1" />
                      {new Date(notification.created_at).toLocaleString()}
                    </p>
                  </div>
                  {!notification.is_read && (
                    <button
                      onClick={() => markNotificationAsRead(notification.id)}
                      className="text-blue-600 hover:text-blue-700 text-sm"
                    >
                      Mark as read
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Bookings Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <FaCheckCircle className="mr-2 text-green-500" />
          Recent Bookings (Real-time)
        </h3>

        {bookings.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No bookings yet</p>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <div
                key={booking.id}
                className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                    <FaUser className="text-white" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{booking.guest_name}</h4>
                    <p className="text-sm text-gray-600 flex items-center">
                      <FaHome className="mr-1" />
                      {booking.properties.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      Payment ID: {booking.payment_reference}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-600 flex items-center">
                    <FaRupeeSign className="mr-1" />
                    {booking.amount_paid.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(booking.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Real-time Status */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse mr-3"></div>
          <p className="text-green-800 font-medium">Real-time updates active</p>
        </div>
        <p className="text-green-700 text-sm mt-1">
          New bookings and notifications will appear automatically
        </p>
      </div>
    </div>
  );
}