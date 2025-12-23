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
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <Link href="/admin" className="text-primary hover:underline mb-2 inline-block">
              ← Back to Dashboard
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">Manage Amenities</h1>
            <p className="text-gray-600 mt-2">Add or remove amenities for properties</p>
          </div>
          {!showAddForm && (
            <button
              onClick={() => setShowAddForm(true)}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold rounded-lg hover:shadow-lg transition-all"
            >
              + Add Amenity
            </button>
          )}
        </div>

        {showAddForm && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
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
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false);
                    setFormData({ name: '', icon_name: '' });
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 disabled:opacity-50"
                >
                  {submitting ? 'Adding...' : 'Add Amenity'}
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-white rounded-lg shadow overflow-hidden">
          {amenities.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-5xl mb-4">✨</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">No amenities yet</h3>
              <p className="text-gray-600">Add your first amenity to get started</p>
            </div>
          ) : (
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
                      <span className="px-2 py-1 text-xs font-mono bg-gray-100 text-gray-700 rounded">
                        {amenity.icon_name}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleDelete(amenity.id)}
                        disabled={deleteLoading === amenity.id}
                        className="text-red-600 hover:text-red-900 disabled:opacity-50"
                      >
                        {deleteLoading === amenity.id ? 'Deleting...' : 'Delete'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
