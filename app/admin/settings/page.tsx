'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { FaSave } from 'react-icons/fa';

interface Setting {
  id: string;
  key: string;
  value: string;
  description: string | null;
}

export default function AdminSettings() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<Setting[]>([]);
  const [formData, setFormData] = useState({
    contact_phone: '',
    contact_email: ''
  });

  useEffect(() => {
    async function checkAdminAndFetch() {
      if (!user) {
        router.push('/');
        return;
      }

      try {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', user.id)
          .maybeSingle();

        if (profileError) throw profileError;

        if (!profileData || !(profileData as any).is_admin) {
          router.push('/');
          return;
        }

        setIsAdmin(true);

        const { data: settingsData, error: settingsError } = await supabase
          .from('site_settings')
          .select('*')
          .in('key', ['contact_phone', 'contact_email']);

        if (settingsError) throw settingsError;

        if (settingsData) {
          setSettings(settingsData);
          const settingsMap = (settingsData as any[]).reduce((acc, item) => {
            acc[item.key] = item.value;
            return acc;
          }, {} as any);

          setFormData({
            contact_phone: settingsMap.contact_phone || '',
            contact_email: settingsMap.contact_email || ''
          });
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    }

    if (!authLoading) {
      checkAdminAndFetch();
    }
  }, [user, authLoading, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const updates = [
        {
          key: 'contact_phone',
          value: formData.contact_phone,
          description: 'Primary contact phone number'
        },
        {
          key: 'contact_email',
          value: formData.contact_email,
          description: 'Primary contact email address'
        }
      ];

      for (const update of updates) {
        const { error } = await (supabase as any)
          .from('site_settings')
          .update({ value: update.value, updated_at: new Date().toISOString() })
          .eq('key', update.key);

        if (error) throw error;
      }

      alert('Settings updated successfully!');
    } catch (error) {
      console.error('Error updating settings:', error);
      alert('Failed to update settings');
    } finally {
      setSaving(false);
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
          <Link href="/admin" className="text-primary hover:underline mb-2 inline-block">
            ← Back to Admin
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Site Settings</h1>
          <p className="text-gray-600 mt-2">Manage contact information and site configuration</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Contact Information</h2>
            <p className="text-gray-600 mb-6">
              These contact details will be displayed on property detail pages and throughout the site.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Phone Number
                </label>
                <input
                  type="tel"
                  name="contact_phone"
                  value={formData.contact_phone}
                  onChange={handleChange}
                  required
                  placeholder="+91 00000 00000"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
                <p className="text-sm text-gray-500 mt-1">
                  This phone number will be shown to users for contacting your property business.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Email Address
                </label>
                <input
                  type="email"
                  name="contact_email"
                  value={formData.contact_email}
                  onChange={handleChange}
                  required
                  placeholder="info@example.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
                <p className="text-sm text-gray-500 mt-1">
                  This email address will be shown to users for email inquiries.
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-6 border-t">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-gradient-to-r from-rose-500 to-orange-500 text-white font-semibold rounded-lg hover:shadow-lg transition-all disabled:opacity-50 flex items-center gap-2"
            >
              <FaSave />
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
