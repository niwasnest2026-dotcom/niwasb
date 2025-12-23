'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

export default function AddRoom() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const propertyId = params.id as string;
  
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [property, setProperty] = useState<any>(null);

  const [formData, setFormData] = useState({
    room_number: '',
    room_type: 'Standard',
    sharing_type: '2 Sharing',
    price_per_person: '',
    total_beds: '',
    available_beds: '',
    floor_number: '',
    has_attached_bathroom: true,
    has_balcony: false,
    has_ac: true,
    room_size_sqft: '',
    description: '',
    is_available: true,
  });

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

        // Fetch property details
        const { data: propertyData, error: propertyError } = await supabase
          .from('properties')
          .select('id, name, city, area')
          .eq('id', propertyId)
          .single();

        if (propertyError) throw propertyError;
        setProperty(propertyData);
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const roomData = {
        property_id: propertyId,
        room_number: formData.room_number,
        room_type: formData.room_type,
        sharing_type: formData.sharing_type,
        price_per_person: parseInt(formData.price_per_person),
        total_beds: parseInt(formData.total_beds),
        available_beds: parseInt(formData.available_beds),
        floor_number: formData.floor_number ? parseInt(formData.floor_number) : null,
        has_attached_bathroom: formData.has_attached_bathroom,
        has_balcony: formData.has_balcony,
        has_ac: formData.has_ac,
        room_size_sqft: formData.room_size_sqft ? parseInt(formData.room_size_sqft) : null,
        description: formData.description || null,
        is_available: formData.is_available,
      };

      const { error } = await (supabase as any)
        .from('property_rooms')
        .insert(roomData);

      if (error) throw error;

      alert('Room added successfully!');
      router.push(`/admin/properties/${propertyId}/rooms`);
    } catch (error) {
      console.error('Error adding room:', error);
      alert('Failed to add room');
    } finally {
      setSubmitting(false);
    }
  };

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
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link href={`/admin/properties/${propertyId}/rooms`} className="text-primary hover:underline mb-2 inline-block">
            ← Back to Rooms
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Add New Room</h1>
          {property && (
            <p className="text-gray-600 mt-2">
              {property.name} - {property.area && property.city ? `${property.area}, ${property.city}` : property.city}
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Room Number *
              </label>
              <input
                type="text"
                name="room_number"
                value={formData.room_number}
                onChange={handleChange}
                required
                placeholder="e.g., 101, A1, 2B"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Room Type
              </label>
              <select
                name="room_type"
                value={formData.room_type}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="Economy">Economy</option>
                <option value="Standard">Standard</option>
                <option value="Premium">Premium</option>
                <option value="Deluxe">Deluxe</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sharing Type *
              </label>
              <select
                name="sharing_type"
                value={formData.sharing_type}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="Single">Single</option>
                <option value="2 Sharing">2 Sharing</option>
                <option value="3 Sharing">3 Sharing</option>
                <option value="4 Sharing">4 Sharing</option>
                <option value="5 Sharing">5 Sharing</option>
                <option value="6 Sharing">6 Sharing</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price per Person (₹) *
              </label>
              <input
                type="number"
                name="price_per_person"
                value={formData.price_per_person}
                onChange={handleChange}
                required
                min="1000"
                step="100"
                placeholder="e.g., 8500"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Total Beds *
              </label>
              <input
                type="number"
                name="total_beds"
                value={formData.total_beds}
                onChange={handleChange}
                required
                min="1"
                max="10"
                placeholder="e.g., 2"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Available Beds *
              </label>
              <input
                type="number"
                name="available_beds"
                value={formData.available_beds}
                onChange={handleChange}
                required
                min="0"
                max="10"
                placeholder="e.g., 2"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Floor Number
              </label>
              <input
                type="number"
                name="floor_number"
                value={formData.floor_number}
                onChange={handleChange}
                min="0"
                max="20"
                placeholder="e.g., 2"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Room Size (sq ft)
            </label>
            <input
              type="number"
              name="room_size_sqft"
              value={formData.room_size_sqft}
              onChange={handleChange}
              min="50"
              max="1000"
              placeholder="e.g., 180"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              placeholder="Describe the room features, amenities, and any special notes..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-900">Room Features</h3>
            
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                name="has_attached_bathroom"
                checked={formData.has_attached_bathroom}
                onChange={handleChange}
                className="rounded text-primary focus:ring-primary"
              />
              <span className="text-sm font-medium text-gray-700">Attached Bathroom</span>
            </label>

            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                name="has_balcony"
                checked={formData.has_balcony}
                onChange={handleChange}
                className="rounded text-primary focus:ring-primary"
              />
              <span className="text-sm font-medium text-gray-700">Balcony</span>
            </label>

            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                name="has_ac"
                checked={formData.has_ac}
                onChange={handleChange}
                className="rounded text-primary focus:ring-primary"
              />
              <span className="text-sm font-medium text-gray-700">Air Conditioning</span>
            </label>

            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                name="is_available"
                checked={formData.is_available}
                onChange={handleChange}
                className="rounded text-primary focus:ring-primary"
              />
              <span className="text-sm font-medium text-gray-700">Room is Available for Booking</span>
            </label>
          </div>

          <div className="flex justify-end space-x-4 pt-6 border-t">
            <Link
              href={`/admin/properties/${propertyId}/rooms`}
              className="px-6 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2 bg-primary hover:bg-primary-dark text-white font-semibold rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
            >
              {submitting ? 'Adding...' : 'Add Room'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}