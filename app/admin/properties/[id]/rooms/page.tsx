'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { FaPlus, FaEdit, FaTrash, FaBed, FaUsers } from 'react-icons/fa';

interface PropertyRoom {
  id: string;
  room_number: string;
  room_type: string | null;
  sharing_type: string;
  price_per_person: number;
  total_beds: number;
  available_beds: number;
  floor_number: number | null;
  has_attached_bathroom: boolean | null;
  has_balcony: boolean | null;
  has_ac: boolean | null;
  room_size_sqft: number | null;
  description: string | null;
  is_available: boolean | null;
}

export default function ManageRooms() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const propertyId = params.id as string;
  
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [property, setProperty] = useState<any>(null);
  const [rooms, setRooms] = useState<PropertyRoom[]>([]);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);

  useEffect(() => {
    async function checkAdminAndFetch() {
      if (!user) {
        router.push('/');
        return;
      }

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', user.id)
          .maybeSingle();

        if (error) throw error;

        if (!data || !(data as any).is_admin) {
          router.push('/');
          return;
        }

        setIsAdmin(true);
        await fetchData();
      } catch (error) {
        console.error('Error:', error);
        router.push('/admin/properties');
      } finally {
        setLoading(false);
      }
    }

    if (!authLoading) {
      checkAdminAndFetch();
    }
  }, [user, authLoading, router, propertyId]);

  async function fetchData() {
    try {
      // Fetch property details
      const { data: propertyData, error: propertyError } = await supabase
        .from('properties')
        .select('id, name, city, area')
        .eq('id', propertyId)
        .single();

      if (propertyError) throw propertyError;
      setProperty(propertyData);

      // Fetch rooms
      const { data: roomsData, error: roomsError } = await supabase
        .from('property_rooms')
        .select('*')
        .eq('property_id', propertyId)
        .order('room_number');

      if (roomsError) throw roomsError;
      setRooms(roomsData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }

  async function handleDeleteRoom(roomId: string) {
    if (!confirm('Are you sure you want to delete this room? This action cannot be undone.')) {
      return;
    }

    setDeleteLoading(roomId);

    try {
      const { error } = await supabase
        .from('property_rooms')
        .delete()
        .eq('id', roomId);

      if (error) throw error;

      setRooms(rooms.filter(room => room.id !== roomId));
      alert('Room deleted successfully!');
    } catch (error) {
      console.error('Error deleting room:', error);
      alert('Failed to delete room');
    } finally {
      setDeleteLoading(null);
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <Link href="/admin/properties" className="text-primary hover:underline mb-2 inline-block">
              ← Back to Properties
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">Manage Rooms</h1>
            {property && (
              <p className="text-gray-600 mt-2">
                {property.name} - {property.area && property.city ? `${property.area}, ${property.city}` : property.city}
              </p>
            )}
          </div>
          <Link
            href={`/admin/properties/${propertyId}/rooms/add`}
            className="px-6 py-3 bg-primary hover:bg-primary-dark text-white font-semibold rounded-lg hover:shadow-lg transition-all flex items-center gap-2"
          >
            <FaPlus />
            Add New Room
          </Link>
        </div>

        {rooms.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="text-5xl mb-4">🏠</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">No rooms yet</h3>
            <p className="text-gray-600 mb-6">Start by adding your first room</p>
            <Link
              href={`/admin/properties/${propertyId}/rooms/add`}
              className="inline-block px-6 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary-dark"
            >
              Add Room
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rooms.map((room) => (
              <div key={room.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">Room {room.room_number}</h3>
                      {room.room_type && (
                        <p className="text-sm text-gray-600">{room.room_type}</p>
                      )}
                    </div>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      room.is_available 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {room.is_available ? 'Available' : 'Unavailable'}
                    </span>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Sharing Type:</span>
                      <span className="font-medium">{room.sharing_type}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Price per person:</span>
                      <span className="font-bold text-primary">₹{room.price_per_person.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Beds:</span>
                      <span className="font-medium">{room.available_beds}/{room.total_beds}</span>
                    </div>
                    {room.floor_number && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Floor:</span>
                        <span className="font-medium">{room.floor_number}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-1 mb-4">
                    {room.has_attached_bathroom && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">Bathroom</span>
                    )}
                    {room.has_ac && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">AC</span>
                    )}
                    {room.has_balcony && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">Balcony</span>
                    )}
                  </div>

                  <div className="flex justify-between items-center pt-4 border-t">
                    <Link
                      href={`/admin/properties/${propertyId}/rooms/edit/${room.id}`}
                      className="text-blue-600 hover:text-blue-900 font-medium flex items-center gap-1"
                    >
                      <FaEdit />
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDeleteRoom(room.id)}
                      disabled={deleteLoading === room.id}
                      className="text-red-600 hover:text-red-900 font-medium flex items-center gap-1 disabled:opacity-50"
                    >
                      <FaTrash />
                      {deleteLoading === room.id ? 'Deleting...' : 'Delete'}
                    </button>
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