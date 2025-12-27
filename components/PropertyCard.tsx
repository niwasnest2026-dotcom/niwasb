'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  FaStar, FaWifi, FaBolt, FaDumbbell, FaGamepad, FaSnowflake, 
  FaCouch, FaChevronLeft, FaChevronRight, FaBath, FaUtensils, 
  FaBroom, FaTshirt, FaParking, FaShieldAlt, FaMapMarkerAlt
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
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  if (!property) {
    return null;
  }

  const images = property.images && property.images.length > 0
    ? property.images.sort((a, b) => (a.display_order || 0) - (b.display_order || 0))
    : [{ image_url: property.featured_image || '/placeholder.jpg' }];

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
      className="group relative rounded-xl sm:rounded-2xl overflow-hidden saas-card border-gradient shadow-lg hover:shadow-2xl hover:-translate-y-1 sm:hover:-translate-y-2 transition-all duration-500"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* --- IMAGE SECTION --- */}
      <div className="relative h-48 sm:h-56 md:h-64 overflow-hidden">
        <Image
          src={images[currentImageIndex]?.image_url || '/placeholder.jpg'}
          alt={property.name || 'Property Image'}
          fill
          className={`object-cover transition-transform duration-700 ${isHovered ? 'scale-110' : 'scale-100'}`}
        />
        
        {/* Dark Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-neutral/20 via-transparent to-neutral/40 pointer-events-none" />

        {/* Image Carousel Controls */}
        {images.length > 1 && (
          <>
             <div className={`absolute inset-0 flex items-center justify-between px-3 sm:px-4 transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
              <button
                onClick={handlePrevImage}
                className="w-8 sm:w-10 h-8 sm:h-10 rounded-lg sm:rounded-xl bg-neutral-white/80 backdrop-blur-md flex items-center justify-center hover:bg-neutral-white transition-all text-neutral shadow-lg"
              >
                <FaChevronLeft className="text-sm sm:text-lg" />
              </button>
              <button
                onClick={handleNextImage}
                className="w-8 sm:w-10 h-8 sm:h-10 rounded-lg sm:rounded-xl bg-neutral-white/80 backdrop-blur-md flex items-center justify-center hover:bg-neutral-white transition-all text-neutral shadow-lg"
              >
                 <FaChevronRight className="text-sm sm:text-lg" />
              </button>
            </div>

            {/* Carousel Indicators */}
            <div className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 flex space-x-1.5 sm:space-x-2 p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-neutral/20 backdrop-blur-md">
              {images.map((_, index) => (
                <div
                  key={index}
                  className={`h-1.5 sm:h-2 rounded-full transition-all duration-300 ${
                    index === currentImageIndex 
                    ? 'w-4 sm:w-6 bg-gradient-to-r from-primary to-secondary' 
                    : 'w-1.5 sm:w-2 bg-neutral-white/60'
                  }`}
                />
              ))}
            </div>
          </>
        )}

        {/* Top Right - Rating */}
        {property.rating && property.rating > 0 && (
          <div className="absolute top-3 sm:top-4 right-3 sm:right-4 flex items-center space-x-1.5 sm:space-x-2 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl bg-neutral/80 backdrop-blur-md text-neutral-white shadow-lg">
            <FaStar className="text-primary text-sm sm:text-lg" />
            <span className="font-bold text-sm sm:text-lg">{property.rating}</span>
          </div>
        )}

        {/* Bottom Left - Zero Brokerage */}
        <div className="absolute bottom-3 sm:bottom-4 left-3 sm:left-4">
          <div className="px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg backdrop-blur-md text-white text-xs sm:text-sm font-bold shadow-lg" style={{ backgroundColor: 'rgba(58, 175, 169, 0.9)' }}>
            Zero Brokerage
          </div>
        </div>

        {/* Bottom Right - Refundable Deposit */}
        <div className="absolute bottom-3 sm:bottom-4 right-3 sm:right-4">
          <div className="px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg backdrop-blur-md text-white text-xs sm:text-sm font-bold shadow-lg" style={{ backgroundColor: 'rgba(43, 122, 120, 0.9)' }}>
            Refundable Deposit
          </div>
        </div>
      </div>

      {/* --- CONTENT SECTION --- */}
      <div className="p-4 sm:p-5 md:p-6 relative">
        
        {/* Verified/Secure Badges */}
        <div className="flex items-center flex-wrap gap-2 sm:gap-3 mb-2 sm:mb-3">
          {property.verified && (
            <div className="flex items-center space-x-1.5 sm:space-x-2 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-white text-xs sm:text-sm font-semibold" style={{ backgroundColor: 'rgba(58, 175, 169, 0.15)', borderColor: 'rgba(58, 175, 169, 0.3)', border: '1px solid' }}>
              <MdVerified className="text-sm sm:text-lg" style={{ color: '#3AAFA9' }} />
              <span style={{ color: '#2B7A78' }}>Verified</span>
            </div>
          )}
          {property.secure_booking && (
            <div className="flex items-center space-x-1.5 sm:space-x-2 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-white text-xs sm:text-sm font-semibold" style={{ backgroundColor: 'rgba(43, 122, 120, 0.15)', borderColor: 'rgba(43, 122, 120, 0.3)', border: '1px solid' }}>
              <MdSecurity className="text-sm sm:text-lg" style={{ color: '#2B7A78' }} />
              <span style={{ color: '#3AAFA9' }}>Secure</span>
            </div>
          )}
        </div>
        
        {/* Property Name with Type */}
        <div className="flex items-center gap-2 mb-1.5 sm:mb-2">
          <h3 className="font-merriweather text-lg sm:text-xl md:text-2xl font-bold text-neutral line-clamp-1">
            {property.name}
          </h3>
          {property.property_type && (
            <span className="px-2 py-1 text-white text-xs font-semibold rounded-lg flex-shrink-0" style={{ backgroundColor: 'rgba(43, 122, 120, 0.9)' }}>
              {property.property_type}
            </span>
          )}
        </div>

        {/* Address - Single Line */}
        <div className="text-neutral/70 text-sm sm:text-base mb-2 sm:mb-3 line-clamp-1 flex items-center">
          <FaMapMarkerAlt className="mr-1.5 text-secondary flex-shrink-0" />
          {property.area && property.city ? `${property.area}, ${property.city}` : property.city || property.area || property.address}
        </div>

        {/* Amenities List - Only 4 amenities with icons */}
        {property.amenities && property.amenities.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mb-4 sm:mb-6">
            {property.amenities.slice(0, 4).map((amenity) => {
              const IconComponent = amenityIcons[amenity.icon_name] || FaWifi;
              return (
                <div key={amenity.id} className="flex flex-col items-center p-2 sm:p-2.5 md:p-3 rounded-lg sm:rounded-xl backdrop-blur-sm hover:bg-primary/10 transition-all duration-300 min-w-0" title={amenity.name} style={{ backgroundColor: 'rgba(58, 175, 169, 0.08)', borderColor: 'rgba(58, 175, 169, 0.15)', border: '1px solid' }}>
                  <IconComponent className="text-base sm:text-lg md:text-xl mb-1 sm:mb-1.5 md:mb-2 flex-shrink-0" style={{ color: '#2B7A78' }} />
                  <span className="text-[10px] sm:text-xs font-semibold text-center truncate w-full" style={{ color: 'rgba(23, 37, 42, 0.7)' }}>{amenity.name.split(' ')[0]}</span>
                </div>
              );
            })}
          </div>
        )}

        {/* Room Types and Pricing */}
        <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
          {(property as any).rooms && (property as any).rooms.length > 0 ? (
            <>
              {/* Get unique sharing types with their prices */}
              {Array.from(new Set((property as any).rooms.map((room: any) => room.sharing_type)))
                .slice(0, 4) // Show max 4 room types
                .map((sharingType) => {
                  const sharingTypeStr = sharingType as string;
                  const roomsOfType = (property as any).rooms.filter((room: any) => room.sharing_type === sharingTypeStr);
                  const price = Math.min(...roomsOfType.map((room: any) => room.price_per_person));
                  
                  return (
                    <div key={sharingTypeStr} className="flex justify-between items-center text-sm sm:text-base">
                      <span className="text-neutral/70">{sharingTypeStr}</span>
                      <span className="font-semibold text-neutral">₹{price.toLocaleString()}</span>
                    </div>
                  );
                })}
              <div className="flex justify-between items-center text-sm sm:text-base">
                <span className="text-neutral/70">Security Deposit</span>
                <span className="font-semibold text-neutral">
                  ₹{Math.min(...(property as any).rooms.map((room: any) => room.security_deposit_per_person || room.price_per_person * 2)).toLocaleString()}
                </span>
              </div>
            </>
          ) : (
            <>
              <div className="flex justify-between items-center text-sm sm:text-base">
                <span className="text-neutral/70">Monthly Rent</span>
                <span className="font-semibold text-neutral">₹{property.price.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-sm sm:text-base">
                <span className="text-neutral/70">Security Deposit</span>
                <span className="font-semibold text-neutral">₹{((property as any).security_deposit || property.price * 2).toLocaleString()}</span>
              </div>
            </>
          )}
        </div>

        {/* Action Button */}
        <Link
          href={property.id ? `/property/${property.id}` : '#'}
          className="w-full flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 rounded-lg sm:rounded-xl font-bold text-base sm:text-lg shadow-lg transition-all active:scale-[0.98] text-white"
          style={{ backgroundColor: '#2B7A78' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#17252A';
            e.currentTarget.style.transform = 'translateY(-1px)';
            e.currentTarget.style.boxShadow = '0 8px 25px rgba(43, 122, 120, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#2B7A78';
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
          }}
        >
          <span className="relative z-10">View Details</span>
        </Link>
      </div>
    </div>
  );
}