'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
// FIX 1: Switched back to react-icons to fix "Module not found"
import {
  FaHeart, FaRegHeart, FaStar, FaMapMarkerAlt, FaWifi, FaBolt,
  FaDumbbell, FaGamepad, FaSnowflake, FaCouch, FaChevronLeft, FaChevronRight,
  FaBath, FaUtensils, FaBroom, FaTshirt, FaParking, FaShieldAlt
} from 'react-icons/fa';
import { MdVerified, MdSecurity } from 'react-icons/md';
import type { PropertyWithDetails } from '@/types/database';

interface PropertyCardProps {
  property: PropertyWithDetails;
}

const amenityIcons: Record<string, any> = {
  wifi: FaWifi,
  power: FaBolt,
  gym: FaDumbbell,
  gaming: FaGamepad,
  ac: FaSnowflake,
  lounge: FaCouch,
  FaSnowflake: FaSnowflake,
  FaBath: FaBath,
  FaUtensils: FaUtensils,
  FaBroom: FaBroom,
  FaTshirt: FaTshirt,
  FaParking: FaParking,
  FaShieldAlt: FaShieldAlt,
};

export default function PropertyCard({ property }: PropertyCardProps) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // FIX 2: Safety Guard - Fixes "Cannot read properties of undefined"
  if (!property) {
    return null;
  }

  // Safely handle images array
  const images = property.images && property.images.length > 0
    ? property.images.sort((a, b) => (a.display_order || 0) - (b.display_order || 0))
    : [{ image_url: property.featured_image || '/placeholder.jpg' }];

  // FIX 3: Clean syntax for handlers to prevent "Unexpected token" errors
  const handlePrevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <div 
      className="group relative rounded-3xl overflow-hidden bg-white/30 backdrop-blur-xl border border-white/50 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-500"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* --- IMAGE SECTION --- */}
      <div className="relative h-52 sm:h-64 overflow-hidden rounded-t-3xl">
        <Image
          src={images[currentImageIndex]?.image_url || '/placeholder.jpg'}
          alt={property.name || 'Property Image'}
          fill
          className={`object-cover transition-transform duration-700 ${isHovered ? 'scale-110' : 'scale-100'}`}
        />
        
        {/* Dark Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-transparent pointer-events-none" />

        {/* Image Carousel Controls */}
        {images.length > 1 && (
          <>
             <div className={`absolute inset-0 flex items-center justify-between px-3 transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
              <button
                onClick={handlePrevImage}
                className="w-8 h-8 rounded-full bg-white/60 backdrop-blur-md flex items-center justify-center hover:bg-white transition-all text-gray-800"
              >
                <FaChevronLeft className="text-sm" />
              </button>
              <button
                onClick={handleNextImage}
                className="w-8 h-8 rounded-full bg-white/60 backdrop-blur-md flex items-center justify-center hover:bg-white transition-all text-gray-800"
              >
                 <FaChevronRight className="text-sm" />
              </button>
            </div>

            {/* Carousel Indicators */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex space-x-1.5 p-1.5 rounded-full bg-black/20 backdrop-blur-md">
              {images.map((_, index) => (
                <div
                  key={index}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    index === currentImageIndex 
                    ? 'w-4 bg-gradient-to-r from-rose-500 to-orange-500' 
                    : 'w-1.5 bg-white/60'
                  }`}
                />
              ))}
            </div>
          </>
        )}

        {/* Top Left Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
            {property.instant_book && (
            <div className="flex items-center space-x-1 px-3 py-1.5 rounded-full bg-amber-100/80 backdrop-blur-md text-amber-700 text-xs font-bold border border-amber-200/50 shadow-sm">
                <FaBolt className="text-xs" />
                <span className="hidden sm:inline">INSTANT BOOK</span>
                <span className="sm:hidden">INSTANT</span>
            </div>
            )}
             {property.property_type && (
            <div className="self-start px-3 py-1.5 rounded-full bg-gradient-to-r from-rose-500/80 to-orange-500/80 backdrop-blur-md text-white text-xs font-bold shadow-sm">
                {property.property_type}
            </div>
            )}
        </div>

        {/* Favorite Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            setIsFavorite(!isFavorite);
          }}
          className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/60 backdrop-blur-md flex items-center justify-center hover:bg-white hover:scale-110 transition-all"
        >
          {isFavorite ? (
            <FaHeart className="text-rose-500 text-lg" />
          ) : (
            <FaRegHeart className="text-gray-700 text-lg" />
          )}
        </button>

        {/* Rating Overlay on Photo */}
        {property.rating && property.rating > 0 && (
          <div className="absolute bottom-3 right-3 flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-black/60 backdrop-blur-md text-white shadow-lg">
            <FaStar className="text-amber-400 text-sm" />
            <span className="font-bold text-sm">{property.rating}</span>
            {property.review_count && property.review_count > 0 && (
              <span className="text-xs text-gray-300">({property.review_count})</span>
            )}
          </div>
        )}
      </div>

      {/* --- CONTENT SECTION --- */}
      <div className="p-5 relative">
        
        {/* Title & Location */}
        <div className="mb-4">
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 line-clamp-1 mb-1">
            {property.name}
            </h3>
            <div className="flex items-center text-gray-500 text-sm font-medium">
            <FaMapMarkerAlt className="mr-1.5 text-rose-500 flex-shrink-0" />
            <span className="line-clamp-1">
                {property.area && property.city ? `${property.area}, ${property.city}` : property.city || property.area || property.address}
            </span>
            </div>
        </div>

        {/* Verified/Secure Badges */}
        <div className="flex items-center flex-wrap gap-2 mb-5">
          {property.verified && (
            <div className="flex items-center space-x-1 px-2.5 py-1 rounded-full bg-emerald-50/50 backdrop-blur-md border border-emerald-200/50 text-emerald-700 text-xs font-semibold">
              <MdVerified className="text-sm" />
              <span>Verified</span>
            </div>
          )}
          {property.secure_booking && (
            <div className="flex items-center space-x-1 px-2.5 py-1 rounded-full bg-blue-50/50 backdrop-blur-md border border-blue-200/50 text-blue-700 text-xs font-semibold">
              <MdSecurity className="text-sm" />
              <span>Secure</span>
            </div>
          )}
        </div>

        {/* Amenities List */}
        {property.amenities && property.amenities.length > 0 && (
          <div className="flex items-center gap-3 mb-5 overflow-x-auto pb-1 scrollbar-hide">
            {property.amenities.slice(0, 4).map((amenity) => {
              const IconComponent = amenityIcons[amenity.icon_name] || FaWifi;
              return (
                <div key={amenity.id} className="flex flex-col items-center flex-shrink-0 p-2 rounded-xl bg-white/40 border border-white/50 backdrop-blur-sm" title={amenity.name}>
                  <IconComponent className="text-gray-600 text-lg mb-1" />
                  <span className="text-[10px] text-gray-500 font-medium">{amenity.name.split(' ')[0]}</span>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer: Price */}
        <div className="flex items-end justify-between pt-4 border-t border-white/30">
          <div>
            <div className="flex items-baseline">
              {(property as any).rooms && (property as any).rooms.length > 0 ? (
                <>
                  <span className="text-sm text-gray-600 mr-1">From</span>
                  <span className="text-2xl font-extrabold text-gray-900">
                    ₹{Math.min(...(property as any).rooms.map((room: any) => room.price_per_person)).toLocaleString()}
                  </span>
                  <span className="text-gray-500 text-sm font-medium ml-1">/person</span>
                </>
              ) : (
                <>
                  <span className="text-2xl font-extrabold text-gray-900">
                    ₹{property.price.toLocaleString()}
                  </span>
                  <span className="text-gray-500 text-sm font-medium ml-1">/mo</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Action Button - Safe Link */}
        <Link
          href={property.id ? `/property/${property.id}` : '#'}
          className="mt-5 relative w-full flex items-center justify-center px-6 py-3 rounded-xl font-bold text-sm text-white bg-primary hover:bg-primary-dark shadow-md hover:shadow-lg transition-all active:scale-[0.98]"
        >
          <span className="relative z-10">View Details</span>
        </Link>
      </div>
    </div>
  );
}