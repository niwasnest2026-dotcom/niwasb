'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { FaTrash, FaPlus, FaArrowUp, FaArrowDown } from 'react-icons/fa';

interface Amenity {
  id: string;
  name: string;
  icon_name: string;
}

interface PropertyImage {
  id: string;
  image_url: string;
  display_order: number;
}

export default function EditProperty() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const propertyId = params.id as string;
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [amenities, setAmenities] = useState<Amenity[]>([]);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [propertyImages, setPropertyImages] = useState<PropertyImage[]>([]);
  const [newImageUrl, setNewImageUrl] = useState('');

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
    featured_image: '',
    rating: '',
    verified: false,
    instant_book: false,
    secure_booking: false,
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

        const [amenitiesResult, propertyResult, imagesResult] = await Promise.all([
          supabase.from('amenities').select('*').order('name'),
          supabase
            .from('properties')
            .select(`
              *,
              property_amenities(amenity_id)
            `)
            .eq('id', propertyId)
            .single(),
          supabase
            .from('property_images')
            .select('*')
            .eq('property_id', propertyId)
            .order('display_order')
        ]);

        if (amenitiesResult.data) {
          setAmenities(amenitiesResult.data);
        }

        if ((propertyResult as any).data) {
          const property = (propertyResult as any).data;
          setFormData({
            name: property.name || '',
            description: property.description || '',
            address: property.address || '',
            city: property.city || '',
            area: property.area || '',
            price: property.price?.toString() || '',
            security_deposit: property.security_deposit?.toString() || '',
            available_months: property.available_months?.toString() || '',
            property_type: property.property_type || 'PG',
            featured_image: property.featured_image || '',
            rating: property.rating?.toString() || '',
            verified: property.verified || false,
            instant_book: property.instant_book || false,
            secure_booking: property.secure_booking || false,
          });

          const propertyAmenities = property.property_amenities?.map((pa: any) => pa.amenity_id) || [];
          setSelectedAmenities(propertyAmenities);
        }

        if (imagesResult.data) {
          setPropertyImages(imagesResult.data);
        }
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

  const handleAddImage = async () => {
    if (!newImageUrl.trim()) return;

    try {
      const maxOrder = propertyImages.length > 0
        ? Math.max(...propertyImages.map(img => img.display_order || 0))
        : -1;

      const { data, error } = await (supabase as any)
        .from('property_images')
        .insert({
          property_id: propertyId,
          image_url: newImageUrl.trim(),
          display_order: maxOrder + 1
        })
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setPropertyImages(prev => [...prev, data as PropertyImage]);
        setNewImageUrl('');
      }
    } catch (error) {
      console.error('Error adding image:', error);
      alert('Failed to add image');
    }
  };

  const handleDeleteImage = async (imageId: string) => {
    if (!confirm('Are you sure you want to delete this image?')) return;

    try {
      const { error } = await (supabase as any)
        .from('property_images')
        .delete()
        .eq('id', imageId);

      if (error) throw error;

      setPropertyImages(prev => prev.filter(img => img.id !== imageId));
    } catch (error) {
      console.error('Error deleting image:', error);
      alert('Failed to delete image');
    }
  };

  const handleMoveImage = async (imageId: string, direction: 'up' | 'down') => {
    const currentIndex = propertyImages.findIndex(img => img.id === imageId);
    if (currentIndex === -1) return;
    if (direction === 'up' && currentIndex === 0) return;
    if (direction === 'down' && currentIndex === propertyImages.length - 1) return;

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    const newImages = [...propertyImages];
    [newImages[currentIndex], newImages[newIndex]] = [newImages[newIndex], newImages[currentIndex]];

    try {
      const updates = newImages.map((img, index) => ({
        id: img.id,
        display_order: index
      }));

      for (const update of updates) {
        const { error } = await (supabase as any)
          .from('property_images')
          .update({ display_order: update.display_order })
          .eq('id', update.id);

        if (error) throw error;
      }

      setPropertyImages(newImages.map((img, index) => ({
        ...img,
        display_order: index
      })));
    } catch (error) {
      console.error('Error reordering images:', error);
      alert('Failed to reorder images');
    }
  };

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
      const { error: propertyError } = await (supabase as any)
        .from('properties')
        .update({
          name: formData.name,
          description: formData.description,
          address: formData.address,
          city: formData.city,
          area: formData.area,
          price: parseFloat(formData.price),
          security_deposit: formData.security_deposit ? parseFloat(formData.security_deposit) : null,
          available_months: formData.available_months ? parseInt(formData.available_months) : null,
          property_type: formData.property_type,
          featured_image: formData.featured_image || null,
          rating: formData.rating ? parseFloat(formData.rating) : null,
          verified: formData.verified,
          instant_book: formData.instant_book,
          secure_booking: formData.secure_booking,
          updated_at: new Date().toISOString(),
        })
        .eq('id', propertyId);

      if (propertyError) throw propertyError;

      await (supabase as any)
        .from('property_amenities')
        .delete()
        .eq('property_id', propertyId);

      if (selectedAmenities.length > 0) {
        const amenityInserts = selectedAmenities.map(amenityId => ({
          property_id: propertyId,
          amenity_id: amenityId,
        }));

        const { error: amenitiesError } = await (supabase as any)
          .from('property_amenities')
          .insert(amenityInserts);

        if (amenitiesError) throw amenitiesError;
      }

      alert('Property updated successfully!');
      router.push('/admin/properties');
    } catch (error) {
      console.error('Error updating property:', error);
      alert('Failed to update property');
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
          <Link href="/admin/properties" className="text-primary hover:underline mb-2 inline-block">
            ← Back to Properties
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Edit Property</h1>
          <p className="text-gray-600 mt-2">Update property details</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
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
                placeholder="Leave empty for 2x monthly rent"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                If not specified, defaults to 2x monthly rent (₹{formData.price ? (parseFloat(formData.price) * 2).toLocaleString() : '0'})
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
                placeholder="e.g., 12 for 1 year"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                How many months is this property available for booking?
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
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

          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Property Images</h3>

            <div className="mb-4 flex gap-2">
              <input
                type="url"
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
                placeholder="Enter image URL"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <button
                type="button"
                onClick={handleAddImage}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
              >
                <FaPlus /> Add Image
              </button>
            </div>

            {propertyImages.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {propertyImages.map((image, index) => (
                  <div
                    key={image.id}
                    className="relative bg-gray-50 border border-gray-200 rounded-lg p-3"
                  >
                    <div className="relative h-40 mb-2 rounded overflow-hidden">
                      <Image
                        src={image.image_url}
                        alt={`Property image ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex gap-1">
                        <button
                          type="button"
                          onClick={() => handleMoveImage(image.id, 'up')}
                          disabled={index === 0}
                          className="p-2 text-gray-600 hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed"
                          title="Move up"
                        >
                          <FaArrowUp />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveImage(image.id, 'down')}
                          disabled={index === propertyImages.length - 1}
                          className="p-2 text-gray-600 hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed"
                          title="Move down"
                        >
                          <FaArrowDown />
                        </button>
                      </div>
                      <span className="text-sm text-gray-500">Order: {index + 1}</span>
                      <button
                        type="button"
                        onClick={() => handleDeleteImage(image.id)}
                        className="p-2 text-red-600 hover:text-red-700"
                        title="Delete image"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No images added yet</p>
            )}
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

          <div className="flex justify-end space-x-4 pt-6 border-t">
            <Link
              href="/admin/properties"
              className="px-6 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2 bg-accent hover:bg-accent-dark text-white font-semibold rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
            >
              {submitting ? 'Updating...' : 'Update Property'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
