'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

interface Amenity {
  id: string;
  name: string;
  icon_name: string;
}

export default function AddProperty() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [amenities, setAmenities] = useState<Amenity[]>([]);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    city: '',
    area: '',
    price: '',
    security_deposit: '',
    available_months: '',
    property_type: 'PG',
    gender_preference: 'Co-living',
    featured_image: '',
    rating: '',
    google_maps_url: '',
    latitude: '',
    longitude: '',
    owner_name: '',
    owner_phone: '',
    payment_instructions: '',
    verified: false,
    instant_book: false,
    secure_booking: false,
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

        const { data: amenitiesData } = await supabase
          .from('amenities')
          .select('*')
          .order('name');

        setAmenities(amenitiesData || []);
      } catch (error) {
        console.error('Error:', error);
        router.push('/');
      } finally {
        setLoading(false);
      }
    }

    if (!authLoading) {
      checkAdminAndFetch();
    }
  }, [user, authLoading, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleAmenityToggle = (amenityId: string) => {
    setSelectedAmenities(prev =>
      prev.includes(amenityId)
        ? prev.filter(id => id !== amenityId)
        : [...prev, amenityId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Prepare property data with automatic anchoring
      const propertyData = {
        name: formData.name,
        description: formData.description,
        address: formData.address,
        city: formData.city,
        area: formData.area,
        price: parseFloat(formData.price),
        security_deposit: formData.security_deposit ? parseFloat(formData.security_deposit) : parseFloat(formData.price) * 2, // Auto-anchor: 2x rent if not specified
        available_months: formData.available_months ? parseInt(formData.available_months) : 12, // Auto-anchor: 12 months default
        property_type: formData.property_type,
        gender_preference: formData.gender_preference,
        featured_image: formData.featured_image || null,
        rating: formData.rating ? parseFloat(formData.rating) : 4.0, // Auto-anchor: 4.0 default rating
        google_maps_url: formData.google_maps_url || null,
        latitude: formData.latitude ? parseFloat(formData.latitude) : null,
        longitude: formData.longitude ? parseFloat(formData.longitude) : null,
        // Auto-anchor owner details - ensure they're always provided
        owner_name: formData.owner_name.trim() || 'Property Owner',
        owner_phone: formData.owner_phone.trim() || '+91 9876543210',
        payment_instructions: formData.payment_instructions.trim() || 'Please contact the owner for payment details of the remaining amount.',
        // Auto-anchor property features
        verified: formData.verified,
        instant_book: formData.instant_book,
        secure_booking: formData.secure_booking,
        is_available: true, // Auto-anchor: Always available when created
        // Auto-anchor timestamps
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data: property, error: propertyError } = await supabase
        .from('properties')
        .insert([propertyData] as any)
        .select()
        .single();

      if (propertyError) throw propertyError;

      // Auto-anchor amenities if selected
      if (selectedAmenities.length > 0 && property) {
        const amenityInserts = selectedAmenities.map(amenityId => ({
          property_id: (property as any).id,
          amenity_id: amenityId,
        }));

        const { error: amenitiesError } = await supabase
          .from('property_amenities')
          .insert(amenityInserts as any);

        if (amenitiesError) throw amenitiesError;
      }

      // Auto-anchor: Create default room if none exist
      const { error: roomError } = await supabase
        .from('property_rooms')
        .insert([{
          property_id: (property as any).id,
          room_number: 'Room 1',
          room_type: 'Standard',
          sharing_type: 'Single',
          price_per_person: parseFloat(formData.price),
          security_deposit_per_person: propertyData.security_deposit,
          total_beds: 1,
          available_beds: 1,
          floor_number: 1,
          has_attached_bathroom: true,
          has_balcony: false,
          has_ac: false,
          room_size_sqft: 100,
          description: 'Standard room with basic amenities',
          is_available: true
        }] as any);

      if (roomError) {
        console.warn('Failed to create default room:', roomError);
        // Don't fail the entire operation for room creation
      }

      alert('Property added successfully with automatic anchoring!');
      router.push('/admin/properties');
    } catch (error) {
      console.error('Error adding property:', error);
      alert('Failed to add property');
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
    <div className="min-h-screen py-8 px-4" style={{ 
      background: 'linear-gradient(135deg, #DEF2F1 0%, #FEFFFF 50%, #DEF2F1 100%)',
      backgroundSize: '400% 400%',
      animation: 'gradientShift 20s ease infinite'
    }}>
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 sm:mb-8">
          <Link href="/admin/properties" className="hover:underline mb-2 inline-block" style={{ color: '#2B7A78' }}>
            ← Back to Properties
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Add New Property</h1>
          <p className="text-gray-600 mt-2">Fill in the details to add a new property</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-4 sm:p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Property Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Property Type *
              </label>
              <select
                name="property_type"
                value={formData.property_type}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="PG">PG</option>
                <option value="Hostel">Hostel</option>
                <option value="Flat">Flat</option>
                <option value="Room">Room</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Gender Preference *
              </label>
              <select
                name="gender_preference"
                value={formData.gender_preference}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="Co-living">Co-living (Mixed)</option>
                <option value="Male">Male Only</option>
                <option value="Female">Female Only</option>
              </select>
            </div>
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                City *
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Area
              </label>
              <input
                type="text"
                name="area"
                value={formData.area}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Address *
            </label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          {/* Google Maps Location Section */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Google Maps Location (Optional)
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Add precise location information to help guests find the property easily. You can get these details from Google Maps.
            </p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Google Maps URL
                </label>
                <input
                  type="url"
                  name="google_maps_url"
                  value={formData.google_maps_url}
                  onChange={handleChange}
                  placeholder="https://maps.google.com/maps?q=12.9716,77.5946 or https://goo.gl/maps/..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Copy the Google Maps URL for this property location
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Latitude
                  </label>
                  <input
                    type="number"
                    name="latitude"
                    value={formData.latitude}
                    onChange={handleChange}
                    step="any"
                    min="-90"
                    max="90"
                    placeholder="e.g., 12.9716"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Longitude
                  </label>
                  <input
                    type="number"
                    name="longitude"
                    value={formData.longitude}
                    onChange={handleChange}
                    step="any"
                    min="-180"
                    max="180"
                    placeholder="e.g., 77.5946"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">How to get location details:</h4>
                <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
                  <li>Go to <a href="https://maps.google.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Google Maps</a></li>
                  <li>Search for your property address</li>
                  <li>Right-click on the exact location pin</li>
                  <li>Copy the coordinates (latitude, longitude) from the popup</li>
                  <li>Copy the URL from the address bar for the Maps URL</li>
                </ol>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price per Month (₹) *
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                required
                min="0"
                step="1"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Security Deposit (₹)
              </label>
              <input
                type="number"
                name="security_deposit"
                value={formData.security_deposit}
                onChange={handleChange}
                min="0"
                step="1"
                placeholder="Auto-anchored to 2x monthly rent"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                🔗 Auto-anchored: Defaults to 2x monthly rent (₹{formData.price ? (parseFloat(formData.price) * 2).toLocaleString() : '0'}) if not specified
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Available Months
              </label>
              <input
                type="number"
                name="available_months"
                value={formData.available_months}
                onChange={handleChange}
                min="1"
                max="60"
                step="1"
                placeholder="Auto-anchored to 12 months"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                🔗 Auto-anchored: Defaults to 12 months if not specified
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rating (0-5)
              </label>
              <input
                type="number"
                name="rating"
                value={formData.rating}
                onChange={handleChange}
                min="0"
                max="5"
                step="0.1"
                placeholder="Auto-anchored to 4.0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                🔗 Auto-anchored: Defaults to 4.0 rating if not specified
              </p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Featured Image URL
            </label>
            <input
              type="url"
              name="featured_image"
              value={formData.featured_image}
              onChange={handleChange}
              placeholder="https://example.com/image.jpg"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          {/* Owner Details Section */}
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Owner Details (Shared After Booking Confirmation)
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              These details will only be shared with users after successful payment confirmation. They will not be visible on the website publicly.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Owner Full Name *
                </label>
                <input
                  type="text"
                  name="owner_name"
                  value={formData.owner_name}
                  onChange={handleChange}
                  required
                  placeholder="Auto-anchored to 'Property Owner' if empty"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  🔗 Auto-anchored: Defaults to 'Property Owner' if not provided
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Owner Phone Number *
                </label>
                <input
                  type="tel"
                  name="owner_phone"
                  value={formData.owner_phone}
                  onChange={handleChange}
                  required
                  placeholder="Auto-anchored to default number if empty"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  🔗 Auto-anchored: Defaults to '+91 9876543210' if not provided
                </p>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Instructions for Remaining Amount
                </label>
                <textarea
                  name="payment_instructions"
                  value={formData.payment_instructions}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Auto-anchored to default instructions if empty"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  🔗 Auto-anchored: Defaults to generic payment instructions if not provided
                </p>
              </div>
            </div>

            <div className="mt-4 p-4 bg-white border border-orange-200 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">🔗 Auto-Anchoring Features:</h4>
              <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                <li>All properties are automatically anchored with default values</li>
                <li>Owner details are auto-filled if not provided</li>
                <li>Default room is created automatically</li>
                <li>Property is marked as available by default</li>
                <li>Timestamps are automatically managed</li>
              </ul>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Amenities
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {amenities.map((amenity) => (
                <label
                  key={amenity.id}
                  className={`flex items-center space-x-2 p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedAmenities.includes(amenity.id)
                      ? 'border-primary bg-primary/5'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedAmenities.includes(amenity.id)}
                    onChange={() => handleAmenityToggle(amenity.id)}
                    className="rounded text-primary focus:ring-primary"
                  />
                  <span className="text-sm font-medium text-gray-700">{amenity.name}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                name="is_available"
                checked={formData.is_available}
                onChange={handleChange}
                className="rounded text-primary focus:ring-primary"
              />
              <span className="text-sm font-medium text-gray-700">Property Available for Booking</span>
            </label>

            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                name="verified"
                checked={formData.verified}
                onChange={handleChange}
                className="rounded text-primary focus:ring-primary"
              />
              <span className="text-sm font-medium text-gray-700">Verified Property</span>
            </label>

            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                name="instant_book"
                checked={formData.instant_book}
                onChange={handleChange}
                className="rounded text-primary focus:ring-primary"
              />
              <span className="text-sm font-medium text-gray-700">Instant Book Available</span>
            </label>

            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                name="secure_booking"
                checked={formData.secure_booking}
                onChange={handleChange}
                className="rounded text-primary focus:ring-primary"
              />
              <span className="text-sm font-medium text-gray-700">Secure Booking</span>
            </label>
          </div>

          <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4 pt-6 border-t">
            <Link
              href="/admin/properties"
              className="px-6 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 text-center"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2 text-white font-semibold rounded-lg transition-all hover:shadow-lg disabled:opacity-50"
              style={{ backgroundColor: '#3AAFA9' }}
            >
              {submitting ? 'Adding...' : 'Add Property'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
