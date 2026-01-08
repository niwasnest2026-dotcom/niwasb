'use client';

import { useState, memo, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FaStar, FaMapMarkerAlt } from 'react-icons/fa';
import type { PropertyWithDetails } from '@/types/database';

interface PropertyCardProps {
  property: PropertyWithDetails;
}

const PropertyCard = memo(function PropertyCard({ property }: PropertyCardProps) {
  const [imageError, setImageError] = useState(false);

  if (!property) {
    return null;
  }

  // Improved image handling - validate URL before using
  const getValidImageUrl = (url: string | null | undefined): string => {
    if (!url) return '/placeholder.jpg';
    
    // Check for invalid URLs that cause 400 errors
    if (url.includes('freepik.com') || 
        url.includes('drive.google.com') || 
        url.startsWith('data:image') ||
        url === '/placeholder.jpg') {
      return '/placeholder.jpg';
    }
    
    // Check if it's a valid HTTP/HTTPS URL
    try {
      new URL(url);
      return url;
    } catch {
      return '/placeholder.jpg';
    }
  };

  const imageUrl = getValidImageUrl(property.featured_image);

  const handleImageError = useCallback(() => {
    setImageError(true);
  }, []);

  return (
    <Link href={`/property/${property.id}`}>
      <div className="group relative rounded-xl overflow-hidden bg-white shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer">
        {/* --- OPTIMIZED IMAGE SECTION --- */}
        <div className="relative h-48 sm:h-56 overflow-hidden">
          <Image
            src={imageError ? '/placeholder.jpg' : imageUrl}
            alt={property.name || 'Property Image'}
            fill
            className="object-cover transition-transform duration-300"
            onError={handleImageError}
            priority={false}
            loading="lazy"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          
          {/* Simplified overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/20" />

          {/* Gender Preference Badge */}
          {(property as any).gender_preference && (
            <div className="absolute top-3 left-3">
              <div className="px-2 py-1 rounded-md text-white text-xs font-semibold shadow-sm" style={{ 
                backgroundColor: (property as any).gender_preference === 'Male' 
                  ? 'rgba(255, 103, 17, 0.9)' 
                  : (property as any).gender_preference === 'Female'
                  ? 'rgba(236, 72, 153, 0.9)'
                  : 'rgba(99, 179, 237, 0.9)'
              }}>
                {(property as any).gender_preference === 'Male' ? 'Male PG' : 
                 (property as any).gender_preference === 'Female' ? 'Female PG' : 'CO-LIVING'}
              </div>
            </div>
          )}

          {/* Available Beds Badge */}
          {(property as any).available_beds !== undefined && (
            <div className="absolute top-3 right-3">
              <div className="px-2 py-1 rounded-md bg-green-500/90 text-white text-xs font-semibold shadow-sm">
                {(property as any).available_beds} beds available
              </div>
            </div>
          )}
        </div>

        {/* --- CONTENT SECTION --- */}
        <div className="p-4">
          {/* Property Name and Type */}
          <div className="mb-2">
            <h3 className="font-bold text-lg text-gray-900 mb-1 line-clamp-1">
              {property.name}
            </h3>
            {property.property_type && (
              <span className="text-sm text-gray-600 font-medium">
                {property.property_type}
              </span>
            )}
          </div>

          {/* Location */}
          <div className="flex items-center text-gray-600 mb-3">
            <FaMapMarkerAlt className="mr-1 text-xs flex-shrink-0" />
            <span className="text-sm line-clamp-1">
              {property.area && property.city 
                ? `${property.area}, ${property.city}` 
                : property.city || property.area || 'Location not specified'}
            </span>
          </div>

          {/* Rating */}
          {property.rating && (
            <div className="flex items-center mb-3">
              <FaStar className="text-yellow-400 mr-1 text-sm" />
              <span className="text-sm font-medium text-gray-700">
                {property.rating.toFixed(1)}
              </span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-center justify-between">
            <div>
              <span className="text-2xl font-bold text-orange-600">
                ₹{property.price?.toLocaleString() || 'N/A'}
              </span>
              <span className="text-gray-600 text-sm ml-1">/month</span>
            </div>
            
            {/* View Details Button */}
            <div className="px-3 py-1.5 bg-orange-500 text-white text-sm font-medium rounded-lg hover:bg-orange-600 transition-colors">
              View Details
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
});

export default PropertyCard;