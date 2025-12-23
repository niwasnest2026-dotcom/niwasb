'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function TestDatabase() {
  const [connectionStatus, setConnectionStatus] = useState<string>('Testing...');
  const [properties, setProperties] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    testDatabaseConnection();
  }, []);

  const testDatabaseConnection = async () => {
    try {
      setConnectionStatus('Connecting to Supabase...');
      
      // Test 1: Basic connection
      const { data: testData, error: testError } = await supabase
        .from('properties')
        .select('count')
        .limit(1);

      if (testError) {
        throw new Error(`Connection failed: ${testError.message}`);
      }

      setConnectionStatus('✅ Connected! Testing tables...');

      // Test 2: Properties table
      const { data: propertiesData, error: propertiesError } = await supabase
        .from('properties')
        .select('id, name, city, price')
        .limit(5);

      if (propertiesError) {
        throw new Error(`Properties table error: ${propertiesError.message}`);
      }

      setProperties(propertiesData || []);

      // Test 3: Rooms table
      const { data: roomsData, error: roomsError } = await supabase
        .from('property_rooms')
        .select('id, room_number, sharing_type, price_per_person, available_beds, total_beds')
        .limit(5);

      if (roomsError) {
        throw new Error(`Rooms table error: ${roomsError.message}`);
      }

      setRooms(roomsData || []);

      // Test 4: Bookings table
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('bookings')
        .select('id, guest_name, booking_status, payment_status, created_at')
        .limit(5);

      if (bookingsError) {
        throw new Error(`Bookings table error: ${bookingsError.message}`);
      }

      setBookings(bookingsData || []);

      setConnectionStatus('✅ All database tests passed!');

    } catch (err: any) {
      setError(err.message);
      setConnectionStatus('❌ Database connection failed');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Database Connection Test</h1>
          
          {/* Connection Status */}
          <div className="mb-8 p-4 rounded-lg bg-blue-50 border border-blue-200">
            <h2 className="text-xl font-semibold text-blue-800 mb-2">Connection Status</h2>
            <p className="text-blue-700">{connectionStatus}</p>
            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded">
                <p className="text-red-700 font-medium">Error:</p>
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}
          </div>

          {/* Database Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">Supabase URL</h3>
              <p className="text-sm text-gray-600 break-all">
                {process.env.NEXT_PUBLIC_SUPABASE_URL}
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">API Key Status</h3>
              <p className="text-sm text-gray-600">
                {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Configured' : '❌ Missing'}
              </p>
            </div>
          </div>

          {/* Properties Test */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Properties Table ({properties.length} records)</h2>
            {properties.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">ID</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Name</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">City</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {properties.map((property) => (
                      <tr key={property.id} className="border-t">
                        <td className="px-4 py-2 text-sm text-gray-600">{property.id.slice(0, 8)}...</td>
                        <td className="px-4 py-2 text-sm text-gray-900">{property.name}</td>
                        <td className="px-4 py-2 text-sm text-gray-600">{property.city}</td>
                        <td className="px-4 py-2 text-sm text-gray-600">₹{property.price?.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500">No properties found or table not accessible</p>
            )}
          </div>

          {/* Rooms Test */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Rooms Table ({rooms.length} records)</h2>
            {rooms.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Room</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Sharing</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Price/Person</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Availability</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rooms.map((room) => (
                      <tr key={room.id} className="border-t">
                        <td className="px-4 py-2 text-sm text-gray-900">{room.room_number}</td>
                        <td className="px-4 py-2 text-sm text-gray-600">{room.sharing_type}</td>
                        <td className="px-4 py-2 text-sm text-gray-600">₹{room.price_per_person?.toLocaleString()}</td>
                        <td className="px-4 py-2 text-sm text-gray-600">{room.available_beds}/{room.total_beds}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500">No rooms found or table not accessible</p>
            )}
          </div>

          {/* Bookings Test */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Bookings Table ({bookings.length} records)</h2>
            {bookings.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Guest</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Booking Status</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Payment Status</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map((booking) => (
                      <tr key={booking.id} className="border-t">
                        <td className="px-4 py-2 text-sm text-gray-900">{booking.guest_name}</td>
                        <td className="px-4 py-2 text-sm text-gray-600">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            booking.booking_status === 'confirmed' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {booking.booking_status}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-600">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            booking.payment_status === 'partial' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {booking.payment_status}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-600">
                          {new Date(booking.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500">No bookings found (this is normal for a new system)</p>
            )}
          </div>

          {/* Test Actions */}
          <div className="flex space-x-4">
            <button
              onClick={testDatabaseConnection}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Retest Connection
            </button>
            <a
              href="/"
              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Back to Home
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}