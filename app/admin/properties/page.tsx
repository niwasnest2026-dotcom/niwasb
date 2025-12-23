'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import type { PropertyWithDetails } from '@/types/database';

export default function AdminProperties() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [properties, setProperties] = useState<PropertyWithDetails[]>([]);
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
        await fetchProperties();
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

  async function fetchProperties() {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select(`
          *,
          amenities:property_amenities(
            amenity:amenities(*)
          ),
          images:property_images(*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedProperties = data?.map((property: any) => ({
        ...property,
        amenities: property.amenities?.map((pa: any) => pa.amenity).filter(Boolean) || [],
        images: property.images || [],
      })) || [];

      setProperties(formattedProperties);
    } catch (error) {
      console.error('Error fetching properties:', error);
    }
  }

  async function handleDelete(propertyId: string) {
    if (!confirm('Are you sure you want to delete this property? This action cannot be undone.')) {
      return;
    }

    setDeleteLoading(propertyId);

    try {
      const { error } = await supabase
        .from('properties')
        .delete()
        .eq('id', propertyId);

      if (error) throw error;

      setProperties(properties.filter(p => p.id !== propertyId));
      alert('Property deleted successfully!');
    } catch (error) {
      console.error('Error deleting property:', error);
      alert('Failed to delete property');
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
            <Link href="/admin" className="text-primary hover:underline mb-2 inline-block">
              ← Back to Dashboard
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">Manage Properties</h1>
            <p className="text-gray-600 mt-2">Add, edit, or remove properties</p>
          </div>
          <Link
            href="/admin/properties/add"
            className="px-6 py-3 bg-accent hover:bg-accent-dark text-white font-semibold rounded-lg hover:shadow-lg transition-all"
          >
            + Add New Property
          </Link>
        </div>

        {properties.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="text-5xl mb-4">🏠</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">No properties yet</h3>
            <p className="text-gray-600 mb-6">Start by adding your first property</p>
            <Link
              href="/admin/properties/add"
              className="inline-block px-6 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90"
            >
              Add Property
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Property
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price & Deposit
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type & Availability
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {properties.map((property) => (
                  <tr key={property.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0 relative">
                          {property.featured_image ? (
                            <Image
                              className="rounded object-cover"
                              src={property.featured_image}
                              alt={property.name}
                              fill
                            />
                          ) : (
                            <div className="h-10 w-10 rounded bg-gray-200 flex items-center justify-center">
                              🏠
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{property.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{property.city}</div>
                      <div className="text-sm text-gray-500">{property.area}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">
                        ₹{property.price.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-500">per month</div>
                      <div className="text-xs text-gray-600 mt-1">
                        Deposit: ₹{((property as any).security_deposit || property.price * 2).toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {property.property_type}
                      </span>
                      {(property as any).available_months && (
                        <div className="text-xs text-gray-500 mt-1">
                          {(property as any).available_months} month{(property as any).available_months > 1 ? 's' : ''} available
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link
                        href={`/admin/properties/edit/${property.id}`}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        Edit
                      </Link>
                      <Link
                        href={`/admin/properties/${property.id}/rooms`}
                        className="text-green-600 hover:text-green-900 mr-4"
                      >
                        Rooms
                      </Link>
                      <button
                        onClick={() => handleDelete(property.id)}
                        disabled={deleteLoading === property.id}
                        className="text-red-600 hover:text-red-900 disabled:opacity-50"
                      >
                        {deleteLoading === property.id ? 'Deleting...' : 'Delete'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
