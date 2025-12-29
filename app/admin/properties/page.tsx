'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
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
      if (authLoading) return; // Wait for auth to complete
      
      if (!user) {
        router.push('/');
        return;
      }

      try {
        // Check admin status with a simpler query
        const { data, error } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', user.id)
          .single();

        if (error || !(data as any)?.is_admin) {
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

    checkAdminAndFetch();
  }, [user, authLoading, router]); // Simplified dependencies

  const fetchProperties = useCallback(async () => {
    try {
      // Optimize query - only fetch essential data first
      const { data, error } = await supabase
        .from('properties')
        .select(`
          id,
          name,
          city,
          area,
          price,
          security_deposit,
          property_type,
          available_months,
          featured_image,
          created_at
        `)
        .order('created_at', { ascending: false })
        .limit(50); // Limit to 50 properties for better performance

      if (error) throw error;

      setProperties(data || []);
    } catch (error) {
      console.error('Error fetching properties:', error);
    }
  }, []);

  const handleDelete = useCallback(async (propertyId: string) => {
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

      setProperties(prev => prev.filter(p => p.id !== propertyId));
      alert('Property deleted successfully!');
    } catch (error) {
      console.error('Error deleting property:', error);
      alert('Failed to delete property');
    } finally {
      setDeleteLoading(null);
    }
  }, []);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ 
        background: 'linear-gradient(135deg, #DEF2F1 0%, #FEFFFF 50%, #DEF2F1 100%)'
      }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading properties...</p>
        </div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ 
        background: 'linear-gradient(135deg, #DEF2F1 0%, #FEFFFF 50%, #DEF2F1 100%)'
      }}>
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-4">You don't have permission to access this page.</p>
          <Link href="/" className="text-blue-600 hover:underline">Go to Home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4" style={{ 
      background: 'linear-gradient(135deg, #DEF2F1 0%, #FEFFFF 50%, #DEF2F1 100%)',
      backgroundSize: '400% 400%',
      animation: 'gradientShift 20s ease infinite'
    }}>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 sm:mb-8 gap-4">
          <div>
            <Link href="/admin" className="hover:underline mb-2 inline-block" style={{ color: '#2B7A78' }}>
              ← Back to Dashboard
            </Link>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Manage Properties</h1>
            <p className="text-gray-600 mt-2">Add, edit, or remove properties</p>
          </div>
          <Link
            href="/admin/properties/add"
            className="px-4 sm:px-6 py-3 text-white font-semibold rounded-lg transition-all hover:shadow-lg text-center"
            style={{ backgroundColor: '#3AAFA9' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2B7A78'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#3AAFA9'}
          >
            + Add New Property
          </Link>
        </div>

        {properties.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 sm:p-12 text-center">
            <div className="text-4xl sm:text-5xl mb-4">🏠</div>
            <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2">No properties yet</h3>
            <p className="text-gray-600 mb-6">Start by adding your first property</p>
            <Link
              href="/admin/properties/add"
              className="inline-block px-6 py-3 text-white font-semibold rounded-lg transition-all hover:shadow-lg"
              style={{ backgroundColor: '#3AAFA9' }}
            >
              Add Property
            </Link>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden lg:block bg-white rounded-lg shadow overflow-hidden">
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
                                sizes="40px"
                                priority={false}
                                loading="lazy"
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
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full text-white" style={{ backgroundColor: '#3AAFA9' }}>
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
                          className="mr-4 hover:underline"
                          style={{ color: '#3AAFA9' }}
                        >
                          Edit
                        </Link>
                        <Link
                          href={`/admin/properties/${property.id}/rooms`}
                          className="mr-4 hover:underline"
                          style={{ color: '#2B7A78' }}
                        >
                          Rooms
                        </Link>
                        <button
                          onClick={() => handleDelete(property.id)}
                          disabled={deleteLoading === property.id}
                          className="text-red-600 hover:text-red-900 disabled:opacity-50 hover:underline"
                        >
                          {deleteLoading === property.id ? 'Deleting...' : 'Delete'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="lg:hidden space-y-4">
              {properties.map((property) => (
                <div key={property.id} className="bg-white rounded-lg shadow p-4">
                  <div className="flex items-start space-x-4">
                    <div className="h-16 w-16 flex-shrink-0 relative">
                      {property.featured_image ? (
                        <Image
                          className="rounded-lg object-cover"
                          src={property.featured_image}
                          alt={property.name}
                          fill
                          sizes="64px"
                          priority={false}
                          loading="lazy"
                        />
                      ) : (
                        <div className="h-16 w-16 rounded-lg bg-gray-200 flex items-center justify-center text-2xl">
                          🏠
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 truncate">{property.name}</h3>
                      <p className="text-sm text-gray-600 mb-2">
                        {property.area && property.city ? `${property.area}, ${property.city}` : property.city}
                      </p>
                      
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        <span className="px-2 py-1 text-xs font-semibold rounded-full text-white" style={{ backgroundColor: '#3AAFA9' }}>
                          {property.property_type}
                        </span>
                        {(property as any).available_months && (
                          <span className="px-2 py-1 text-xs font-medium rounded-full" style={{ backgroundColor: 'rgba(43, 122, 120, 0.1)', color: '#2B7A78' }}>
                            {(property as any).available_months} month{(property as any).available_months > 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                        <div>
                          <span className="text-gray-500">Monthly Rent:</span>
                          <div className="font-semibold text-gray-900">₹{property.price.toLocaleString()}</div>
                        </div>
                        <div>
                          <span className="text-gray-500">Deposit:</span>
                          <div className="font-semibold text-gray-900">
                            ₹{((property as any).security_deposit || property.price * 2).toLocaleString()}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-2">
                        <Link
                          href={`/admin/properties/edit/${property.id}`}
                          className="px-3 py-1.5 text-sm font-medium text-white rounded-lg transition-all"
                          style={{ backgroundColor: '#3AAFA9' }}
                        >
                          Edit
                        </Link>
                        <Link
                          href={`/admin/properties/${property.id}/rooms`}
                          className="px-3 py-1.5 text-sm font-medium rounded-lg border-2 transition-all"
                          style={{ borderColor: '#2B7A78', color: '#2B7A78' }}
                        >
                          Rooms
                        </Link>
                        <button
                          onClick={() => handleDelete(property.id)}
                          disabled={deleteLoading === property.id}
                          className="px-3 py-1.5 text-sm font-medium text-red-600 border-2 border-red-200 rounded-lg hover:bg-red-50 disabled:opacity-50 transition-all"
                        >
                          {deleteLoading === property.id ? 'Deleting...' : 'Delete'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
