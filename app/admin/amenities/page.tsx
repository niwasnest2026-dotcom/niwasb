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
  created_at: string;
}

export default function AdminAmenities() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [amenities, setAmenities] = useState<Amenity[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', icon_name: '' });
  const [submitting, setSubmitting] = useState(false);
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
        await fetchAmenities();
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

  async function fetchAmenities() {
    try {
      const { data, error } = await supabase
        .from('amenities')
        .select('*')
        .order('name');

      if (error) throw error;
      setAmenities(data || []);
    } catch (error) {
      console.error('Error fetching amenities:', error);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    try {
      const { error } = await supabase
        .from('amenities')
        .insert([formData] as any);

      if (error) throw error;

      setFormData({ name: '', icon_name: '' });
      setShowAddForm(false);
      await fetchAmenities();
      alert('Amenity added successfully!');
    } catch (error) {
      console.error('Error adding amenity:', error);
      alert('Failed to add amenity');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(amenityId: string) {
    if (!confirm('Are you sure you want to delete this amenity?')) {
      return;
    }

    setDeleteLoading(amenityId);

    try {
      const { error } = await supabase
        .from('amenities')
        .delete()
        .eq('id', amenityId);

      if (error) throw error;

      setAmenities(amenities.filter(a => a.id !== amenityId));
      alert('Amenity deleted successfully!');
    } catch (error) {
      console.error('Error deleting amenity:', error);
      alert('Failed to delete amenity');
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
    <div className="min-h-screen py-8 px-4" style={{ 
      background: 'linear-gradient(135deg, #DEF2F1 0%, #FEFFFF 50%, #DEF2F1 100%)',
      backgroundSize: '400% 400%',
      animation: 'gradientShift 20s ease infinite'
    }}>
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 sm:mb-8 gap-4">
          <div>
            <Link href="/admin" className="hover:underline mb-2 inline-block" style={{ color: '#2B7A78' }}>
              ← Back to Dashboard
            </Link>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Manage Amenities</h1>
            <p className="text-gray-600 mt-2">Add or remove amenities for properties</p>
          </div>
          {!showAddForm && (
            <button
              onClick={() => setShowAddForm(true)}
              className="px-4 sm:px-6 py-3 text-white font-semibold rounded-lg transition-all hover:shadow-lg"
              style={{ backgroundColor: '#3AAFA9' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2B7A78'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#3AAFA9'}
            >
              + Add Amenity
            </button>
          )}
        </div>

        {showAddForm && (
          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 mb-6 sm:mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Amenity</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amenity Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="e.g., WiFi, Gym, AC"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Icon Name *
                </label>
                <input
                  type="text"
                  value={formData.icon_name}
                  onChange={(e) => setFormData({ ...formData, icon_name: e.target.value })}
                  required
                  placeholder="e.g., wifi, gym, ac, power"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Use: wifi, power, gym, gaming, ac, lounge
                </p>
              </div>
              <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false);
                    setFormData({ name: '', icon_name: '' });
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 text-center"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2 text-white font-semibold rounded-lg transition-all disabled:opacity-50"
                  style={{ backgroundColor: '#3AAFA9' }}
                  onMouseEnter={(e) => !submitting && (e.currentTarget.style.backgroundColor = '#2B7A78')}
                  onMouseLeave={(e) => !submitting && (e.currentTarget.style.backgroundColor = '#3AAFA9')}
                >
                  {submitting ? 'Adding...' : 'Add Amenity'}
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {amenities.length === 0 ? (
            <div className="p-8 sm:p-12 text-center">
              <div className="text-4xl sm:text-5xl mb-4">✨</div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2">No amenities yet</h3>
              <p className="text-gray-600">Add your first amenity to get started</p>
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden sm:block">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Icon Name
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {amenities.map((amenity) => (
                      <tr key={amenity.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{amenity.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 text-xs font-mono rounded" style={{ backgroundColor: 'rgba(58, 175, 169, 0.1)', color: '#2B7A78' }}>
                            {amenity.icon_name}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => handleDelete(amenity.id)}
                            disabled={deleteLoading === amenity.id}
                            className="text-red-600 hover:text-red-900 disabled:opacity-50 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
                          >
                            {deleteLoading === amenity.id ? 'Deleting...' : 'Delete'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="sm:hidden space-y-4 p-4">
                {amenities.map((amenity) => (
                  <div key={amenity.id} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-gray-900 truncate">{amenity.name}</h3>
                        <div className="mt-2">
                          <span className="px-2 py-1 text-xs font-mono rounded" style={{ backgroundColor: 'rgba(58, 175, 169, 0.1)', color: '#2B7A78' }}>
                            {amenity.icon_name}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDelete(amenity.id)}
                        disabled={deleteLoading === amenity.id}
                        className="ml-4 px-3 py-1.5 text-sm font-medium text-red-600 border-2 border-red-200 rounded-lg hover:bg-red-50 disabled:opacity-50 transition-all"
                      >
                        {deleteLoading === amenity.id ? 'Deleting...' : 'Delete'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
