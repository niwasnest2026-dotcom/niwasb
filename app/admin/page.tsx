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

        try {
          // Try to use admin stats API with auth token
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.access_token) {
            const response = await fetch('/api/admin-stats', {
              headers: {
                'Authorization': `Bearer ${session.access_token}`
              }
            });

            if (response.ok) {
              const { stats } = await response.json();
              setStats({
                totalProperties: stats.totalProperties || 0,
                totalUsers: stats.totalUsers || 0,
                totalAmenities: stats.totalAmenities || 0,
              });
              return; // Success, exit early
            }
          }
        } catch (apiError) {
          console.log('Admin stats API failed, falling back to direct queries');
        }

        // Fallback to direct queries if API fails
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
    <div className="min-h-screen py-8 px-4" style={{ 
      background: 'linear-gradient(135deg, #DEF2F1 0%, #FEFFFF 50%, #DEF2F1 100%)',
      backgroundSize: '400% 400%',
      animation: 'gradientShift 20s ease infinite'
    }}>
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 sm:mb-8">
          <Link href="/" className="hover:underline mb-2 inline-block" style={{ color: '#2B7A78' }}>
            ← Back to Home
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage your properties and platform</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6" style={{ 
            background: 'linear-gradient(135deg, rgba(58, 175, 169, 0.05) 0%, rgba(255, 255, 255, 0.95) 100%)',
            border: '1px solid rgba(58, 175, 169, 0.1)'
          }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Properties</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-2">{stats.totalProperties}</p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(58, 175, 169, 0.1)' }}>
                <span className="text-xl sm:text-2xl">🏠</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6" style={{ 
            background: 'linear-gradient(135deg, rgba(43, 122, 120, 0.05) 0%, rgba(255, 255, 255, 0.95) 100%)',
            border: '1px solid rgba(43, 122, 120, 0.1)'
          }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Users</p>
                <div className="flex items-center space-x-2">
                  <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-2">{stats.totalUsers}</p>
                  {stats.totalUsers === 0 && (
                    <Link 
                      href="/admin/fix-users"
                      className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full hover:bg-red-200 transition-colors"
                    >
                      Fix Issue
                    </Link>
                  )}
                </div>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(43, 122, 120, 0.1)' }}>
                <span className="text-xl sm:text-2xl">👥</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6" style={{ 
            background: 'linear-gradient(135deg, rgba(222, 242, 241, 0.3) 0%, rgba(255, 255, 255, 0.95) 100%)',
            border: '1px solid rgba(222, 242, 241, 0.5)'
          }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Amenities</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-2">{stats.totalAmenities}</p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(58, 175, 169, 0.15)' }}>
                <span className="text-xl sm:text-2xl">⭐</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {/* Add Setup Card if no properties exist */}
          {stats.totalProperties === 0 && (
            <div className="md:col-span-2 mb-6">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-2xl">🚀</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-blue-900">Get Started</h3>
                    <p className="text-blue-700 text-sm">No properties found. Add sample properties to get started!</p>
                  </div>
                  <Link
                    href="/admin/setup"
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                  >
                    Setup Now
                  </Link>
                </div>
              </div>
            </div>
          )}

          <Link
            href="/admin/properties"
            className="bg-white rounded-xl shadow-lg p-4 sm:p-6 hover:shadow-xl transition-all duration-300 group"
            style={{ 
              background: 'linear-gradient(135deg, rgba(58, 175, 169, 0.05) 0%, rgba(255, 255, 255, 0.95) 100%)',
              border: '1px solid rgba(58, 175, 169, 0.1)'
            }}
          >
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform" style={{ backgroundColor: '#3AAFA9' }}>
                <span className="text-2xl sm:text-3xl">🏢</span>
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 truncate">Manage Properties</h3>
                <p className="text-sm sm:text-base text-gray-600 break-words">Add, edit, or remove properties</p>
              </div>
            </div>
          </Link>

          <Link
            href="/admin/blog"
            className="bg-white rounded-xl shadow-lg p-4 sm:p-6 hover:shadow-xl transition-all duration-300 group"
            style={{ 
              background: 'linear-gradient(135deg, rgba(43, 122, 120, 0.05) 0%, rgba(255, 255, 255, 0.95) 100%)',
              border: '1px solid rgba(43, 122, 120, 0.1)'
            }}
          >
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform" style={{ backgroundColor: '#2B7A78' }}>
                <span className="text-2xl sm:text-3xl">📝</span>
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 truncate">Manage Blog</h3>
                <p className="text-sm sm:text-base text-gray-600 break-words">Create and manage blog posts</p>
              </div>
            </div>
          </Link>

          <Link
            href="/admin/amenities"
            className="bg-white rounded-xl shadow-lg p-4 sm:p-6 hover:shadow-xl transition-all duration-300 group"
            style={{ 
              background: 'linear-gradient(135deg, rgba(58, 175, 169, 0.05) 0%, rgba(255, 255, 255, 0.95) 100%)',
              border: '1px solid rgba(58, 175, 169, 0.1)'
            }}
          >
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform" style={{ backgroundColor: '#3AAFA9' }}>
                <span className="text-2xl sm:text-3xl">✨</span>
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 truncate">Manage Amenities</h3>
                <p className="text-sm sm:text-base text-gray-600 break-words">Add or remove amenities</p>
              </div>
            </div>
          </Link>

          <Link
            href="/admin/bookings"
            className="bg-white rounded-xl shadow-lg p-4 sm:p-6 hover:shadow-xl transition-all duration-300 group"
            style={{ 
              background: 'linear-gradient(135deg, rgba(43, 122, 120, 0.05) 0%, rgba(255, 255, 255, 0.95) 100%)',
              border: '1px solid rgba(43, 122, 120, 0.1)'
            }}
          >
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform" style={{ backgroundColor: '#2B7A78' }}>
                <span className="text-2xl sm:text-3xl">📅</span>
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 truncate">Manage Bookings</h3>
                <p className="text-sm sm:text-base text-gray-600 break-words">View and manage room bookings</p>
              </div>
            </div>
          </Link>

          <Link
            href="/admin/settings"
            className="bg-white rounded-xl shadow-lg p-4 sm:p-6 hover:shadow-xl transition-all duration-300 group"
            style={{ 
              background: 'linear-gradient(135deg, rgba(222, 242, 241, 0.3) 0%, rgba(255, 255, 255, 0.95) 100%)',
              border: '1px solid rgba(222, 242, 241, 0.5)'
            }}
          >
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform" style={{ backgroundColor: '#3AAFA9' }}>
                <span className="text-2xl sm:text-3xl">⚙️</span>
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 truncate">Site Settings</h3>
                <p className="text-sm sm:text-base text-gray-600 break-words">Manage contact info and settings</p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
