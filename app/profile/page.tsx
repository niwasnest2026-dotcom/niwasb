'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaArrowLeft, FaUser, FaEnvelope, FaPhone, FaLock } from 'react-icons/fa';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import type { Profile } from '@/types/database';

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    phone_number: ''
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    if (user) {
      fetchProfile();
    }
  }, [user, authLoading, router]);

  const fetchProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setProfile(data);
        setFormData({
          full_name: (data as any).full_name || '',
          phone: (data as any).phone || '',
          phone_number: (data as any).phone_number || ''
        });
      } else {
        // Create profile if it doesn't exist
        const newProfile = {
          id: user.id,
          email: user.email || '',
          full_name: user.user_metadata?.full_name || '',
          phone: user.user_metadata?.phone || '',
          phone_number: user.user_metadata?.phone_number || '',
          avatar_url: user.user_metadata?.avatar_url || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        const { data: createdProfile, error: createError } = await (supabase as any)
          .from('profiles')
          .insert(newProfile)
          .select()
          .single();

        if (createError) throw createError;

        setProfile(createdProfile);
        setFormData({
          full_name: (createdProfile as any).full_name || '',
          phone: (createdProfile as any).phone || '',
          phone_number: (createdProfile as any).phone_number || ''
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!user || !profile) return;

    setSaving(true);
    try {
      const updateData = {
        full_name: formData.full_name.trim() || null,
        phone: formData.phone.trim() || null,
        phone_number: formData.phone_number.trim() || null,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await (supabase as any)
        .from('profiles')
        .update(updateData)
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;

      setProfile(data);
      setEditing(false);
      
      // Show success message
      alert('Profile updated successfully!');
    } catch (error: any) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile: ' + (error.message || 'Unknown error'));
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        phone: profile.phone || '',
        phone_number: profile.phone_number || ''
      });
    }
    setEditing(false);
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: '#3AAFA9' }}></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen py-8 px-4" style={{ 
      background: 'linear-gradient(135deg, #63B3ED 0%, #90CDF4 50%, #63B3ED 100%)',
      backgroundSize: '400% 400%',
      animation: 'gradientShift 20s ease infinite'
    }}>
      <div className="max-w-4xl mx-auto">
        <Link
          href="/"
          className="inline-flex items-center hover:underline mb-6"
          style={{ color: '#FF6711' }}
        >
          <FaArrowLeft className="mr-2" />
          Back to Home
        </Link>

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="px-4 sm:px-8 py-6" style={{ backgroundColor: '#FF6711' }}>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center text-white text-xl sm:text-2xl font-bold" style={{ backgroundColor: '#E55A0F' }}>
                  {profile?.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt="Profile"
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <FaUser />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h1 className="text-xl sm:text-2xl font-bold text-white truncate">
                    {profile?.full_name || 'User Profile'}
                  </h1>
                  <p className="text-white/80 text-sm sm:text-base truncate">{user.email}</p>
                </div>
              </div>
              
              {!editing ? (
                <button
                  onClick={() => setEditing(true)}
                  className="px-4 py-2 bg-white font-semibold rounded-lg hover:bg-gray-50 transition-colors shadow-lg"
                  style={{ color: '#FF6711' }}
                >
                  Edit Profile
                </button>
              ) : null}
            </div>
          </div>

          {/* Profile Information */}
          <div className="p-4 sm:p-8">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">Personal Information</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                {editing ? (
                  <input
                    type="text"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent focus:ring-teal-500"
                    placeholder="Enter your full name"
                  />
                ) : (
                  <div className="flex items-center space-x-3 px-4 py-3 bg-gray-50 rounded-lg">
                    <FaUser style={{ color: '#FF6711' }} />
                    <span className="text-gray-900">
                      {profile?.full_name || 'Not provided'}
                    </span>
                  </div>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="flex items-center justify-between px-4 py-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <FaEnvelope style={{ color: '#63B3ED' }} />
                    <span className="text-gray-900">{user.email}</span>
                  </div>
                  <div className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded-full">
                    <FaLock className="text-xs" />
                  </div>
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                {editing ? (
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent focus:ring-teal-500"
                    placeholder="Enter your phone number"
                  />
                ) : (
                  <div className="flex items-center space-x-3 px-4 py-3 bg-gray-50 rounded-lg">
                    <FaPhone style={{ color: '#2B7A78' }} />
                    <span className="text-gray-900">
                      {profile?.phone || 'Not provided'}
                    </span>
                  </div>
                )}
              </div>

              {/* Alternative Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Alternative Phone
                </label>
                {editing ? (
                  <input
                    type="tel"
                    name="phone_number"
                    value={formData.phone_number}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent focus:ring-teal-500"
                    placeholder="Enter alternative phone number"
                  />
                ) : (
                  <div className="flex items-center space-x-3 px-4 py-3 bg-gray-50 rounded-lg">
                    <FaPhone style={{ color: '#2B7A78' }} />
                    <span className="text-gray-900">
                      {profile?.phone_number || 'Not provided'}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Account Information */}
            <div className="mt-8 pt-8 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Member Since
                  </label>
                  <div className="px-4 py-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-900">
                      {profile?.created_at 
                        ? new Date(profile.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })
                        : 'Unknown'
                      }
                    </span>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Updated
                  </label>
                  <div className="px-4 py-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-900">
                      {profile?.updated_at 
                        ? new Date(profile.updated_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })
                        : 'Never'
                      }
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Save/Cancel Buttons - Only show when editing */}
            {editing && (
              <div className="mt-8 pt-8 border-t border-gray-200">
                <div className="flex justify-center gap-4">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-6 py-3 text-white font-semibold rounded-lg transition-all hover:shadow-lg disabled:opacity-50 min-w-[120px]"
                    style={{ backgroundColor: '#FF6711' }}
                    onMouseEnter={(e) => !saving && (e.currentTarget.style.backgroundColor = '#E55A0F')}
                    onMouseLeave={(e) => !saving && (e.currentTarget.style.backgroundColor = '#FF6711')}
                  >
                    {saving ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Saving...
                      </div>
                    ) : (
                      'Save Changes'
                    )}
                  </button>
                  <button
                    onClick={handleCancel}
                    disabled={saving}
                    className="px-6 py-3 border-2 font-semibold rounded-lg transition-all hover:shadow-lg disabled:opacity-50 min-w-[120px]"
                    style={{ borderColor: '#63B3ED', color: '#63B3ED' }}
                    onMouseEnter={(e) => {
                      if (!saving) {
                        e.currentTarget.style.backgroundColor = '#63B3ED';
                        e.currentTarget.style.color = 'white';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!saving) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.color = '#63B3ED';
                      }
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="mt-8 pt-8 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/bookings"
                  className="flex items-center justify-center px-6 py-3 text-white font-semibold rounded-lg transition-all hover:shadow-lg min-h-[48px]"
                  style={{ backgroundColor: '#FF6711' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#E55A0F'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#FF6711'}
                >
                  View My Bookings
                </Link>
                <Link
                  href="/favorites"
                  className="flex items-center justify-center px-6 py-3 border-2 font-semibold rounded-lg transition-all hover:shadow-lg min-h-[48px]"
                  style={{ borderColor: '#63B3ED', color: '#63B3ED' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#63B3ED';
                    e.currentTarget.style.color = 'white';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = '#63B3ED';
                  }}
                >
                  My Favorites
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}