'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaArrowLeft, FaHeart, FaMapMarkerAlt, FaStar, FaTrash } from 'react-icons/fa';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import type { Favorite } from '@/types/database';

interface FavoriteWithProperty extends Favorite {
  property?: {
    id: string;
    name: string;
    address: string;
    city: string;
    area: string | null;
    price: number;
    property_type: string;
    rating: number | null;
    featured_image: string | null;
  };
}

export default function FavoritesPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [favorites, setFavorites] = useState<FavoriteWithProperty[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    if (user) {
      fetchFavorites();
    }
  }, [user, authLoading, router]);

  const fetchFavorites = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('favorites')
        .select(`
          *,
          property:properties(
            id,
            name,
            address,
            city,
            area,
            price,
            property_type,
            rating,
            featured_image
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setFavorites(data || []);
    } catch (error) {
      console.error('Error fetching favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeFavorite = async (favoriteId: string) => {
    try {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('id', favoriteId);

      if (error) throw error;

      setFavorites(prev => prev.filter(fav => fav.id !== favoriteId));
    } catch (error) {
      console.error('Error removing favorite:', error);
      alert('Failed to remove from favorites');
    }
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
      <div className="max-w-6xl mx-auto">
        <Link
          href="/profile"
          className="inline-flex items-center hover:underline mb-6"
          style={{ color: '#FF6711' }}
        >
          <FaArrowLeft className="mr-2" />
          Back to Profile
        </Link>

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="px-4 sm:px-8 py-6" style={{ backgroundColor: '#63B3ED' }}>
            <h1 className="text-xl sm:text-2xl font-bold text-white">My Favorites</h1>
            <p className="text-white/80 text-sm sm:text-base">Properties you've saved for later</p>
          </div>

          <div className="p-4 sm:p-8">
            {favorites.length === 0 ? (
              <div className="text-center py-12">
                <FaHeart className="mx-auto text-6xl text-gray-300 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Favorites Yet</h3>
                <p className="text-gray-600 mb-6">Start exploring and save properties you like!</p>
                <Link
                  href="/listings"
                  className="inline-flex items-center justify-center px-6 py-3 text-white font-semibold rounded-lg transition-all hover:shadow-lg min-h-[48px]"
                  style={{ backgroundColor: '#FF6711' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#E55A0F'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#FF6711'}
                >
                  Browse Properties
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {favorites.map((favorite) => (
                  <div key={favorite.id} className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="relative">
                      {favorite.property?.featured_image ? (
                        <img
                          src={favorite.property.featured_image}
                          alt={favorite.property.name}
                          className="w-full h-48 object-cover"
                        />
                      ) : (
                        <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                          <span className="text-gray-400">No Image</span>
                        </div>
                      )}
                      
                      <button
                        onClick={() => removeFavorite(favorite.id)}
                        className="absolute top-3 right-3 p-3 bg-white/90 rounded-full hover:bg-white transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                        title="Remove from favorites"
                      >
                        <FaTrash className="text-red-500" />
                      </button>

                      {favorite.property?.property_type && (
                        <div className="absolute top-3 left-3">
                          <span className="px-2 py-1 text-xs font-bold text-white rounded-full" style={{ backgroundColor: '#2B7A78' }}>
                            {favorite.property.property_type}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="p-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {favorite.property?.name}
                      </h3>
                      
                      <div className="flex items-center text-gray-600 mb-3">
                        <FaMapMarkerAlt className="mr-1 flex-shrink-0" />
                        <span className="text-sm truncate">
                          {favorite.property?.area && favorite.property?.city
                            ? `${favorite.property.area}, ${favorite.property.city}`
                            : favorite.property?.city || favorite.property?.address
                          }
                        </span>
                      </div>

                      {favorite.property?.rating && (
                        <div className="flex items-center mb-3">
                          <FaStar style={{ color: '#3AAFA9' }} />
                          <span className="ml-1 text-sm font-medium">{favorite.property.rating}</span>
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-2xl font-bold" style={{ color: '#3AAFA9' }}>
                            ₹{favorite.property?.price.toLocaleString()}
                          </span>
                          <span className="text-gray-600 text-sm">/month</span>
                        </div>
                        
                        <Link
                          href={`/property/${favorite.property_id}`}
                          className="flex items-center justify-center px-4 py-2 text-white font-semibold rounded-lg transition-all hover:shadow-lg min-h-[40px]"
                          style={{ backgroundColor: '#3AAFA9' }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2B7A78'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#3AAFA9'}
                        >
                          View Details
                        </Link>
                      </div>

                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <span className="text-xs text-gray-500">
                          Added {favorite.created_at 
                            ? new Date(favorite.created_at).toLocaleDateString()
                            : 'recently'
                          }
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}