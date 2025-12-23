'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

export default function AdminDashboard() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalProperties: 0,
    totalUsers: 0,
    totalAmenities: 0,
  });

  useEffect(() => {
    async function checkAdmin() {
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

        const [propertiesResult, usersResult, amenitiesResult] = await Promise.all([
          supabase.from('properties').select('id', { count: 'exact', head: true }),
          supabase.from('profiles').select('id', { count: 'exact', head: true }),
          supabase.from('amenities').select('id', { count: 'exact', head: true }),
        ]);

        setStats({
          totalProperties: propertiesResult.count || 0,
          totalUsers: usersResult.count || 0,
          totalAmenities: amenitiesResult.count || 0,
        });
      } catch (error) {
        console.error('Error checking admin status:', error);
        router.push('/');
      } finally {
        setLoading(false);
      }
    }

    if (!authLoading) {
      checkAdmin();
    }
  }, [user, authLoading, router]);

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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage your properties and platform</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Total Properties</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalProperties}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">🏠</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Total Users</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalUsers}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">👥</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Amenities</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalAmenities}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">⭐</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link
            href="/admin/properties"
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-r from-rose-500 to-orange-500 rounded-lg flex items-center justify-center">
                <span className="text-3xl">🏢</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Manage Properties</h3>
                <p className="text-gray-600">Add, edit, or remove properties</p>
              </div>
            </div>
          </Link>

          <Link
            href="/admin/amenities"
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                <span className="text-3xl">✨</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Manage Amenities</h3>
                <p className="text-gray-600">Add or remove amenities</p>
              </div>
            </div>
          </Link>

          <Link
            href="/admin/bookings"
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <span className="text-3xl">📅</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Manage Bookings</h3>
                <p className="text-gray-600">View and manage room bookings</p>
              </div>
            </div>
          </Link>

          <Link
            href="/admin/settings"
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center">
                <span className="text-3xl">⚙️</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Site Settings</h3>
                <p className="text-gray-600">Manage contact info and settings</p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
