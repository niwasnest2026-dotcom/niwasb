'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  FaStar, FaChevronLeft, FaChevronRight, FaMapMarkerAlt,
  FaSnowflake, FaCouch, FaDumbbell, FaParking, FaUtensils, 
  FaTshirt, FaFingerprint, FaVideo, FaTint, FaPlus,
  FaWifi, FaBolt, FaShieldAlt, FaBroom, FaGamepad
} from 'react-icons/fa';
import { MdVerified, MdSecurity } from 'react-icons/md';
import type { PropertyWithDetails } from '@/types/database';

interface PropertyCardProps {
  property: PropertyWithDetails;
}


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
      className="group relative rounded-xl sm:rounded-2xl overflow-hidden modern-card shadow-lg hover:shadow-2xl hover:-translate-y-1 sm:hover:-translate-y-2 transition-all duration-500"
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
            <div className="absolute bottom-12 sm:bottom-14 left-1/2 -translate-x-1/2 flex space-x-1.5 sm:space-x-2 p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-neutral/20 backdrop-blur-md">
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

        {/* Top Left - Gender Preference */}
        {(property as any).gender_preference && (
          <div className="absolute top-2 sm:top-3 left-2 sm:left-3">
            <div className="px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-md backdrop-blur-sm text-white text-xs font-semibold shadow-sm" style={{ 
              backgroundColor: (property as any).gender_preference === 'Male' 
                ? 'rgba(255, 103, 17, 0.8)' 
                : (property as any).gender_preference === 'Female'
                ? 'rgba(255, 208, 130, 0.8)'
                : 'rgba(99, 179, 237, 0.8)' // Co-living
            }}>
              {(property as any).gender_preference === 'Male' 
                ? 'MALE PG' 
                : (property as any).gender_preference === 'Female'
                ? 'FEMALE PG'
                : 'CO-LIVING'}
            </div>
          </div>
        )}

        {/* Top Right - Rating */}
        {property.rating && property.rating > 0 && (
          <div className="absolute top-2 sm:top-3 right-2 sm:right-3 flex items-center space-x-1 sm:space-x-1.5 px-2 sm:px-3 py-0.5 sm:py-1 rounded-md backdrop-blur-sm text-white shadow-sm" style={{ backgroundColor: 'rgba(45, 55, 72, 0.8)' }}>
            <FaStar className="text-xs sm:text-sm" style={{ color: '#FFD082' }} />
            <span className="font-semibold text-xs sm:text-sm">{property.rating}</span>
          </div>
        )}

        {/* Bottom Left - Zero Brokerage */}
        <div className="absolute bottom-2 sm:bottom-3 left-2 sm:left-3">
          <div className="px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-md backdrop-blur-sm text-white text-xs font-semibold shadow-sm" style={{ backgroundColor: 'rgba(99, 179, 237, 0.8)' }}>
            Zero Brokerage
          </div>
        </div>

        {/* Bottom Right - Refundable Deposit */}
        <div className="absolute bottom-2 sm:bottom-3 right-2 sm:right-3">
          <div className="px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-md backdrop-blur-sm text-white text-xs font-semibold shadow-sm" style={{ backgroundColor: 'rgba(255, 208, 130, 0.8)' }}>
            Refundable Deposit
          </div>
        </div>
      </div>

      {/* --- CONTENT SECTION --- */}
      <div className="p-4 sm:p-5 md:p-6 relative">
        
        {/* Verified/Secure Badges */}
        <div className="flex items-center flex-wrap gap-2 sm:gap-3 mb-2 sm:mb-3">
          {property.verified && (
            <div className="flex items-center space-x-1.5 sm:space-x-2 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs sm:text-sm font-semibold" style={{ backgroundColor: 'rgba(99, 179, 237, 0.15)', borderColor: 'rgba(99, 179, 237, 0.3)', border: '1px solid', color: '#2D3748' }}>
              <MdVerified className="text-sm sm:text-lg" style={{ color: '#63B3ED' }} />
              <span>Verified</span>
            </div>
          )}
          {property.secure_booking && (
            <div className="flex items-center space-x-1.5 sm:space-x-2 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs sm:text-sm font-semibold" style={{ backgroundColor: 'rgba(255, 208, 130, 0.15)', borderColor: 'rgba(255, 208, 130, 0.3)', border: '1px solid', color: '#2D3748' }}>
              <MdSecurity className="text-sm sm:text-lg" style={{ color: '#FFD082' }} />
              <span>Secure</span>
            </div>
          )}
        </div>
        
        {/* Property Name with Type */}
        <div className="flex items-center gap-2 mb-1.5 sm:mb-2">
          <h3 className="text-lg sm:text-xl md:text-2xl font-bold line-clamp-1" style={{ color: '#2D3748' }}>
            {property.name}
          </h3>
          {property.property_type && (
            <span className="px-2 py-1 text-white text-xs font-semibold rounded-lg flex-shrink-0" style={{ backgroundColor: '#FF6711' }}>
              {property.property_type}
            </span>
          )}
        </div>

        {/* Address - Single Line */}
        <div className="text-sm sm:text-base mb-2 sm:mb-3 line-clamp-1 flex items-center" style={{ color: 'rgba(45, 55, 72, 0.7)' }}>
          <FaMapMarkerAlt className="mr-1.5 flex-shrink-0" style={{ color: '#63B3ED' }} />
          {property.area && property.city ? `${property.area}, ${property.city}` : property.city || property.area || property.address}
        </div>

        {/* Amenities List - Compact design like reference */}
        {property.amenities && property.amenities.length > 0 && (
          <div className="mb-4 sm:mb-6">
            <h4 className="text-xs sm:text-sm font-bold text-gray-600 uppercase tracking-wide mb-2 sm:mb-3">Free Amenities</h4>
            <div className="flex items-center justify-between">
              <div className="flex space-x-3 sm:space-x-4">
                {property.amenities.slice(0, 3).map((amenity) => {
                  // Professional icon mapping with Font Awesome icons
                  const getAmenityIcon = (name: string) => {
                    const lowerName = name.toLowerCase();
                    if (lowerName.includes('wifi') || lowerName.includes('internet')) return <FaWifi className="text-lg sm:text-xl" style={{ color: '#FF6711' }} />;
                    if (lowerName.includes('ac') || lowerName.includes('air')) return <FaSnowflake className="text-lg sm:text-xl" style={{ color: '#FF6711' }} />;
                    if (lowerName.includes('gym') || lowerName.includes('fitness')) return <FaDumbbell className="text-lg sm:text-xl" style={{ color: '#FF6711' }} />;
                    if (lowerName.includes('parking')) return <FaParking className="text-lg sm:text-xl" style={{ color: '#FF6711' }} />;
                    if (lowerName.includes('security') || lowerName.includes('cctv')) return <FaVideo className="text-lg sm:text-xl" style={{ color: '#FF6711' }} />;
                    if (lowerName.includes('water')) return <FaTint className="text-lg sm:text-xl" style={{ color: '#FF6711' }} />;
                    if (lowerName.includes('power') || lowerName.includes('backup')) return <FaBolt className="text-lg sm:text-xl" style={{ color: '#FF6711' }} />;
                    if (lowerName.includes('laundry') || lowerName.includes('washing')) return <FaTshirt className="text-lg sm:text-xl" style={{ color: '#FF6711' }} />;
                    if (lowerName.includes('kitchen') || lowerName.includes('food') || lowerName.includes('dining')) return <FaUtensils className="text-lg sm:text-xl" style={{ color: '#FF6711' }} />;
                    if (lowerName.includes('cleaning') || lowerName.includes('housekeeping')) return <FaBroom className="text-lg sm:text-xl" style={{ color: '#FF6711' }} />;
                    if (lowerName.includes('lounge') || lowerName.includes('common')) return <FaCouch className="text-lg sm:text-xl" style={{ color: '#FF6711' }} />;
                    if (lowerName.includes('gaming') || lowerName.includes('game')) return <FaGamepad className="text-lg sm:text-xl" style={{ color: '#FF6711' }} />;
                    if (lowerName.includes('biometric') || lowerName.includes('fingerprint')) return <FaFingerprint className="text-lg sm:text-xl" style={{ color: '#FF6711' }} />;
                    return <FaShieldAlt className="text-lg sm:text-xl" style={{ color: '#FF6711' }} />; // Default icon
                  };

                  return (
                    <div key={amenity.id} className="flex flex-col items-center min-w-0">
                      <div className="mb-1 flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12">
                        {getAmenityIcon(amenity.name)}
                      </div>
                      <span className="text-[10px] sm:text-xs text-center truncate w-full max-w-[50px] sm:max-w-[60px]" style={{ color: '#2D3748' }}>
                        {amenity.name.split(' ')[0]}
                      </span>
                    </div>
                  );
                })}
              </div>
              {property.amenities.length > 3 && (
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center mb-1">
                    <FaPlus className="text-lg sm:text-xl" style={{ color: '#63B3ED' }} />
                  </div>
                  <span className="text-[10px] sm:text-xs" style={{ color: '#2D3748' }}>+{property.amenities.length - 3} More</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Room Types and Pricing */}
        <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
          {(property as any).rooms && (property as any).rooms.length > 0 ? (
            <>
              {/* Get unique sharing types with their prices and availability */}
              {Array.from(new Set((property as any).rooms.map((room: any) => room.sharing_type)))
                .slice(0, 4) // Show max 4 room types
                .map((sharingType) => {
                  const sharingTypeStr = sharingType as string;
                  const roomsOfType = (property as any).rooms.filter((room: any) => room.sharing_type === sharingTypeStr);
                  const price = Math.min(...roomsOfType.map((room: any) => room.price_per_person));
                  const totalAvailableBeds = roomsOfType.reduce((sum: number, room: any) => sum + (room.available_beds || 0), 0);
                  
                  return (
                    <div key={sharingTypeStr} className="flex justify-between items-center text-sm sm:text-base">
                      <div className="flex flex-col">
                        <span style={{ color: 'rgba(45, 55, 72, 0.7)' }}>{sharingTypeStr}</span>
                        <span className="text-xs" style={{ color: totalAvailableBeds > 0 ? '#63B3ED' : '#EF4444' }}>
                          {totalAvailableBeds > 0 ? `${totalAvailableBeds} bed${totalAvailableBeds > 1 ? 's' : ''} available` : 'No beds available'}
                        </span>
                      </div>
                      <span className="font-semibold" style={{ color: '#2D3748' }}>₹{price.toLocaleString()}</span>
                    </div>
                  );
                })}
              <div className="flex justify-between items-center text-sm sm:text-base">
                <span style={{ color: 'rgba(45, 55, 72, 0.7)' }}>Security Deposit</span>
                <span className="font-semibold" style={{ color: '#2D3748' }}>
                  ₹{Math.min(...(property as any).rooms.map((room: any) => room.security_deposit_per_person || room.price_per_person * 2)).toLocaleString()}
                </span>
              </div>
            </>
          ) : (
            <>
              <div className="flex justify-between items-center text-sm sm:text-base">
                <span style={{ color: 'rgba(45, 55, 72, 0.7)' }}>Monthly Rent</span>
                <span className="font-semibold" style={{ color: '#2D3748' }}>₹{property.price.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-sm sm:text-base">
                <span style={{ color: 'rgba(45, 55, 72, 0.7)' }}>Security Deposit</span>
                <span className="font-semibold" style={{ color: '#2D3748' }}>₹{((property as any).security_deposit || property.price * 2).toLocaleString()}</span>
              </div>
            </>
          )}
        </div>

        {/* Action Button */}
        <Link
          href={property.id ? `/property/${property.id}` : '#'}
          className="w-full flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-bold text-base sm:text-lg shadow-lg transition-all active:scale-[0.98] text-white"
          style={{ backgroundColor: '#FF6711' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#E55A0F';
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 8px 25px rgba(255, 103, 17, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#FF6711';
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