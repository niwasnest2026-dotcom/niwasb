'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  FaStar, FaMapMarkerAlt, FaArrowLeft, FaTimes,
  FaWifi, FaBolt, FaDumbbell, FaGamepad, FaSnowflake, FaCouch,
  FaBath, FaUtensils, FaBroom, FaTshirt, FaParking, FaShieldAlt, 
  FaClock, FaCalendarAlt, FaSearch, FaVideo, FaTint, FaFingerprint,
  FaUser, FaUserTie, FaHome, FaChevronDown
} from 'react-icons/fa';
import { MdVerified, MdSecurity } from 'react-icons/md';
import { supabase } from '@/lib/supabase';
import type { PropertyWithDetails } from '@/types/database';

interface SiteSettings {
  contact_phone: string;
  contact_email: string;
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

export default function PropertyDetails() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const propertyId = params.id as string;
  const [property, setProperty] = useState<PropertyWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showAllAmenities, setShowAllAmenities] = useState(false);
  const [selectedRoomType, setSelectedRoomType] = useState<string>('');
  const [showContactDropdown, setShowContactDropdown] = useState(false);
  const [settings, setSettings] = useState<SiteSettings>({
    contact_phone: '+91 63048 09598',
    contact_email: 'niwasnest2026@gmail.com'
  });

  // Get search parameters - both new and legacy
  const duration = searchParams.get('duration') || '';
  const checkIn = searchParams.get('checkIn') || '';
  const checkOut = searchParams.get('checkOut') || '';
  const location = searchParams.get('location') || '';
  const gender = searchParams.get('gender') || '';
  const moveIn = searchParams.get('moveIn') || '';

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short',
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  useEffect(() => {
    async function fetchData() {
      try {
        const [propertyResult, settingsResult] = await Promise.all([
          supabase
            .from('properties')
            .select(`
              *,
              amenities:property_amenities(
                amenity:amenities(*)
              ),
              images:property_images(*),
              rooms:property_rooms(
                *,
                images:room_images(*)
              )
            `)
            .eq('id', propertyId)
            .maybeSingle(),
          supabase
            .from('site_settings')
            .select('key, value')
            .in('key', ['contact_phone', 'contact_email'])
        ]);

        if (propertyResult.error) throw propertyResult.error;

        if (propertyResult.data) {
          const formattedProperty = {
            ...(propertyResult.data as any),
            amenities: (propertyResult.data as any).amenities?.map((pa: any) => pa.amenity).filter(Boolean) || [],
            images: (propertyResult.data as any).images || [],
            rooms: (propertyResult.data as any).rooms?.map((room: any) => ({
              ...room,
              images: room.images || []
            })) || [],
          };
          setProperty(formattedProperty as PropertyWithDetails);
        }

        if (settingsResult.data) {
          const settingsMap = (settingsResult.data as any[]).reduce((acc, item) => {
            acc[item.key] = item.value;
            return acc;
          }, {} as any);
          setSettings({
            contact_phone: settingsMap.contact_phone || '+91 63048 09598',
            contact_email: settingsMap.contact_email || 'niwasnest2026@gmail.com'
          });
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        router.push('/');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [propertyId, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Property not found</h1>
          <Link href="/" className="text-primary hover:underline">
            Go back home
          </Link>
        </div>
      </div>
    );
  }

  const images = property.images && property.images.length > 0
    ? property.images.sort((a, b) => (a.display_order || 0) - (b.display_order || 0))
    : [{ image_url: property.featured_image || '/placeholder.jpg', display_order: 0 }];

  return (
    <div className="min-h-screen py-8 px-4" style={{ 
      background: 'linear-gradient(135deg, #63B3ED 0%, #90CDF4 50%, #63B3ED 100%)',
      backgroundSize: '400% 400%',
      animation: 'gradientShift 20s ease infinite'
    }}>
      <div className="max-w-6xl mx-auto">
        <Link
          href="/"
          className="inline-flex items-center justify-center w-10 h-10 rounded-full hover:bg-white/20 transition-colors mb-6"
          style={{ color: '#2D3748' }}
          title="Back to listings"
        >
          <FaArrowLeft className="text-lg" />
        </Link>

        {/* Search Criteria Display */}
        {(duration || (checkIn && checkOut) || location || (gender && gender !== 'any') || moveIn) && (
          <div className="mb-6 p-4 rounded-xl" style={{ backgroundColor: 'rgba(247, 250, 252, 0.8)' }}>
            <div className="flex items-center flex-wrap gap-4">
              <div className="flex items-center space-x-2">
                <FaSearch style={{ color: '#FF6711' }} />
                <span className="text-sm font-semibold" style={{ color: '#2D3748' }}>Your Search:</span>
              </div>
              
              {location && (
                <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg" style={{ backgroundColor: 'rgba(255, 103, 17, 0.1)' }}>
                  <FaMapMarkerAlt style={{ color: '#FF6711' }} />
                  <span className="text-sm font-medium" style={{ color: '#2D3748' }}>
                    {location}
                  </span>
                </div>
              )}
              
              {gender && gender !== 'any' && (
                <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg" style={{ backgroundColor: 'rgba(99, 179, 237, 0.1)' }}>
                  <FaUser style={{ color: '#63B3ED' }} />
                  <span className="text-sm font-medium" style={{ color: '#2D3748' }}>
                    {gender === 'boys' ? 'Boys Only' : gender === 'girls' ? 'Girls Only' : gender}
                  </span>
                </div>
              )}
              
              {moveIn && (
                <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg" style={{ backgroundColor: 'rgba(255, 208, 130, 0.1)' }}>
                  <FaCalendarAlt style={{ color: '#FFD082' }} />
                  <span className="text-sm font-medium" style={{ color: '#2D3748' }}>
                    Moving: {formatDate(moveIn)}
                  </span>
                </div>
              )}
              
              {duration && (
                <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg" style={{ backgroundColor: 'rgba(255, 103, 17, 0.1)' }}>
                  <FaClock style={{ color: '#FF6711' }} />
                  <span className="text-sm font-medium" style={{ color: '#2D3748' }}>
                    {duration} month{parseInt(duration) > 1 ? 's' : ''}
                  </span>
                </div>
              )}
              
              {checkIn && checkOut && (
                <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg" style={{ backgroundColor: 'rgba(99, 179, 237, 0.1)' }}>
                  <FaCalendarAlt style={{ color: '#63B3ED' }} />
                  <span className="text-sm font-medium" style={{ color: '#2D3748' }}>
                    {formatDate(checkIn)} - {formatDate(checkOut)}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="relative h-96 bg-gray-200">
            {images[currentImageIndex] && (
              <Image
                src={images[currentImageIndex].image_url}
                alt={property.name}
                fill
                className="object-cover"
                priority
              />
            )}

            {/* Navigation Arrows for Multiple Images */}
            {images.length > 1 && (
              <>
                <button
                  onClick={() => setCurrentImageIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1))}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full backdrop-blur-sm transition-all"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={() => setCurrentImageIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0))}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full backdrop-blur-sm transition-all"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </>
            )}

            {/* Image Counter */}
            {images.length > 1 && (
              <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm">
                {currentImageIndex + 1} / {images.length}
              </div>
            )}

            {/* Top Left - Gender Preference */}
            {(property as any).gender_preference && (
              <div className="absolute top-3 left-3">
                <div className="px-2.5 py-1 rounded-md backdrop-blur-sm text-white text-xs font-semibold shadow-sm" style={{ 
                  backgroundColor: (property as any).gender_preference === 'boys' 
                    ? 'rgba(255, 103, 17, 0.8)' 
                    : (property as any).gender_preference === 'girls'
                    ? 'rgba(255, 208, 130, 0.8)'
                    : 'rgba(99, 179, 237, 0.8)' // Co-living
                }}>
                  {(property as any).gender_preference === 'boys' 
                    ? 'BOYS PG' 
                    : (property as any).gender_preference === 'girls'
                    ? 'GIRLS PG'
                    : 'CO-LIVING'}
                </div>
              </div>
            )}

            {/* Top Right - Rating */}
            {property.rating && property.rating > 0 && (
              <div className="absolute top-3 right-3 flex items-center space-x-1.5 px-3 py-1 rounded-md backdrop-blur-sm text-white shadow-sm" style={{ backgroundColor: 'rgba(45, 55, 72, 0.8)' }}>
                <FaStar className="text-sm" style={{ color: '#FFD082' }} />
                <span className="font-semibold text-sm">{property.rating}</span>
              </div>
            )}

            {/* Bottom Left - Zero Brokerage */}
            <div className="absolute bottom-3 left-3">
              <div className="px-2.5 py-1 rounded-md backdrop-blur-sm text-white text-xs font-semibold shadow-sm" style={{ backgroundColor: 'rgba(99, 179, 237, 0.8)' }}>
                Zero Brokerage
              </div>
            </div>

            {/* Bottom Right - Refundable Deposit */}
            <div className="absolute bottom-3 right-3">
              <div className="px-2.5 py-1 rounded-md backdrop-blur-sm text-white text-xs font-semibold shadow-sm" style={{ backgroundColor: 'rgba(255, 208, 130, 0.8)' }}>
                Refundable Deposit
              </div>
            </div>

            {/* Image Dots Navigation */}
            {images.length > 1 && (
              <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex space-x-2 bg-black/50 px-4 py-2 rounded-full">
                {images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`h-2 rounded-full transition-all ${
                      index === currentImageIndex
                        ? 'w-8 bg-white'
                        : 'w-2 bg-white/50 hover:bg-white/75'
                    }`}
                  />
                ))}
              </div>
            )}

            {/* Click to View Full Image */}
            <button
              onClick={() => setShowImageModal(true)}
              className="absolute inset-0 bg-transparent hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 hover:opacity-100"
            >
              <div className="bg-black/50 text-white px-4 py-2 rounded-lg backdrop-blur-sm">
                <span className="text-sm font-medium">Click to view full image</span>
              </div>
            </button>
          </div>

          <div className="p-8">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-6">
              <div className="flex-1">
                {/* Verified/Secure Badges - Above Property Name */}
                <div className="flex flex-wrap gap-3 mb-3">
                  {property.verified && (
                    <div className="flex items-center space-x-1 px-3 py-1.5 rounded-lg text-sm font-semibold" style={{ backgroundColor: 'rgba(99, 179, 237, 0.15)', borderColor: 'rgba(99, 179, 237, 0.3)', border: '1px solid', color: '#2D3748' }}>
                      <MdVerified className="text-lg" style={{ color: '#63B3ED' }} />
                      <span>Verified</span>
                    </div>
                  )}
                  {property.secure_booking && (
                    <div className="flex items-center space-x-1 px-3 py-1.5 rounded-lg text-sm font-semibold" style={{ backgroundColor: 'rgba(255, 208, 130, 0.15)', borderColor: 'rgba(255, 208, 130, 0.3)', border: '1px solid', color: '#2D3748' }}>
                      <MdSecurity className="text-lg" style={{ color: '#FFD082' }} />
                      <span>Secure Booking</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3 mb-3">
                  <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                    {property.name}
                  </h1>
                  {property.property_type && (
                    <span className="px-3 py-1.5 text-white text-sm font-bold rounded-lg" style={{ backgroundColor: '#FF6711' }}>
                      {property.property_type}
                    </span>
                  )}
                </div>
                <div className="flex items-center text-gray-600 mb-4">
                  <FaMapMarkerAlt className="mr-2" style={{ color: '#63B3ED' }} />
                  <span className="text-lg">
                    {property.area && property.city
                      ? `${property.area}, ${property.city}`
                      : property.city || property.area || property.address}
                  </span>
                </div>
              </div>

              <div className="md:ml-8 mt-6 md:mt-0">
                {property.property_type !== 'Room' && (property as any).rooms && (property as any).rooms.length > 0 && (
                  <button
                    onClick={() => {
                      const roomSection = document.getElementById('room-selection');
                      if (roomSection) {
                        roomSection.scrollIntoView({ behavior: 'smooth' });
                      }
                    }}
                    className="w-full px-8 py-4 text-white font-bold text-lg rounded-xl transition-all shadow-lg hover:shadow-xl mb-4 bg-blue-500 hover:bg-blue-600"
                  >
                    Choose Room Type
                  </button>
                )}
                {property.property_type === 'Room' && (
                  <Link
                    href={`/payment?propertyId=${property.id}&propertyType=Room${duration ? `&duration=${duration}` : ''}${checkIn ? `&checkIn=${checkIn}` : ''}${checkOut ? `&checkOut=${checkOut}` : ''}${location ? `&location=${encodeURIComponent(location)}` : ''}${gender && gender !== 'any' ? `&gender=${gender}` : ''}${moveIn ? `&moveIn=${moveIn}` : ''}`}
                    className="block w-full px-8 py-4 text-white font-bold text-lg rounded-xl transition-all shadow-lg hover:shadow-xl mb-4 text-center bg-blue-500 hover:bg-blue-600"
                  >
                    Book Now
                  </Link>
                )}
                
                {/* Contact Dropdown */}
                <div className="relative contact-dropdown">
                  <button
                    onClick={() => setShowContactDropdown(!showContactDropdown)}
                    className="w-full px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-all flex items-center justify-between"
                  >
                    <span>Get Details & Enquiry</span>
                    <FaChevronDown className={`transition-transform ${showContactDropdown ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {showContactDropdown && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-200 z-50 overflow-hidden">
                      {/* Send to Yourself */}
                      <a
                        href={`https://wa.me/${settings.contact_phone.replace(/[^0-9]/g, '')}?text=Hi! Please send me details of ${property.name} located at ${property.area}, ${property.city}. I'm interested in booking.`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block px-6 py-4 hover:bg-blue-50 transition-colors border-b border-gray-100"
                        onClick={() => setShowContactDropdown(false)}
                      >
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                            <FaUser className="text-blue-600" />
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">Send to Yourself</div>
                            <div className="text-sm text-gray-500">Get property details on your WhatsApp</div>
                          </div>
                        </div>
                      </a>
                      
                      {/* Contact Admin */}
                      <a
                        href={`https://wa.me/${settings.contact_phone.replace(/[^0-9]/g, '')}?text=Hi! I need assistance regarding ${property.name}. Please help me with booking details.`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block px-6 py-4 hover:bg-orange-50 transition-colors border-b border-gray-100"
                        onClick={() => setShowContactDropdown(false)}
                      >
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                            <FaUserTie className="text-orange-600" />
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">Contact Admin</div>
                            <div className="text-sm text-gray-500">Direct inquiry to Niwas Nest team</div>
                          </div>
                        </div>
                      </a>
                      
                      {/* Contact Owner */}
                      <a
                        href={`https://wa.me/${settings.contact_phone.replace(/[^0-9]/g, '')}?text=Hello! I'm interested in ${property.name} at ${property.area}, ${property.city}. Can we discuss the booking details?`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block px-6 py-4 hover:bg-green-50 transition-colors"
                        onClick={() => setShowContactDropdown(false)}
                      >
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                            <FaHome className="text-green-600" />
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">Contact Owner</div>
                            <div className="text-sm text-gray-500">Direct contact with property owner</div>
                          </div>
                        </div>
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {property.description && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Description</h2>
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {property.description}
                </p>
              </div>
            )}

            {property.amenities && property.amenities.length > 0 && (
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Free Amenities</h2>
                  {property.amenities.length > 3 && (
                    <button
                      onClick={() => setShowAllAmenities(!showAllAmenities)}
                      className="px-3 py-1.5 text-sm font-medium rounded-lg border-2 transition-all hover:shadow-lg"
                      style={{ borderColor: '#FF6711', color: '#FF6711' }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#FF6711';
                        e.currentTarget.style.color = 'white';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.color = '#FF6711';
                      }}
                    >
                      {showAllAmenities ? 'Show Less' : `+${property.amenities.length - 3} More`}
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4 sm:gap-6">
                  {(showAllAmenities ? property.amenities : property.amenities.slice(0, 3)).map((amenity) => {
                    // Professional Font Awesome icon mapping
                    const getAmenityIcon = (name: string) => {
                      const lowerName = name.toLowerCase();
                      if (lowerName.includes('wifi') || lowerName.includes('internet')) return <FaWifi className="text-2xl sm:text-3xl" style={{ color: '#FF6711' }} />;
                      if (lowerName.includes('ac') || lowerName.includes('air')) return <FaSnowflake className="text-2xl sm:text-3xl" style={{ color: '#FF6711' }} />;
                      if (lowerName.includes('gym') || lowerName.includes('fitness')) return <FaDumbbell className="text-2xl sm:text-3xl" style={{ color: '#FF6711' }} />;
                      if (lowerName.includes('parking')) return <FaParking className="text-2xl sm:text-3xl" style={{ color: '#FF6711' }} />;
                      if (lowerName.includes('security') || lowerName.includes('cctv')) return <FaVideo className="text-2xl sm:text-3xl" style={{ color: '#FF6711' }} />;
                      if (lowerName.includes('water')) return <FaTint className="text-2xl sm:text-3xl" style={{ color: '#FF6711' }} />;
                      if (lowerName.includes('power') || lowerName.includes('backup')) return <FaBolt className="text-2xl sm:text-3xl" style={{ color: '#FF6711' }} />;
                      if (lowerName.includes('laundry') || lowerName.includes('washing')) return <FaTshirt className="text-2xl sm:text-3xl" style={{ color: '#FF6711' }} />;
                      if (lowerName.includes('kitchen') || lowerName.includes('food') || lowerName.includes('dining')) return <FaUtensils className="text-2xl sm:text-3xl" style={{ color: '#FF6711' }} />;
                      if (lowerName.includes('cleaning') || lowerName.includes('housekeeping')) return <FaBroom className="text-2xl sm:text-3xl" style={{ color: '#FF6711' }} />;
                      if (lowerName.includes('lounge') || lowerName.includes('common')) return <FaCouch className="text-2xl sm:text-3xl" style={{ color: '#FF6711' }} />;
                      if (lowerName.includes('gaming') || lowerName.includes('game')) return <FaGamepad className="text-2xl sm:text-3xl" style={{ color: '#FF6711' }} />;
                      if (lowerName.includes('biometric') || lowerName.includes('fingerprint')) return <FaFingerprint className="text-2xl sm:text-3xl" style={{ color: '#FF6711' }} />;
                      return <FaShieldAlt className="text-2xl sm:text-3xl" style={{ color: '#FF6711' }} />; // Default icon
                    };

                    return (
                      <div
                        key={amenity.id}
                        className="flex flex-col items-center text-center p-3 sm:p-4 rounded-xl hover:bg-gray-50 transition-all duration-300"
                      >
                        <div className="mb-2 sm:mb-3 flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16">
                          {getAmenityIcon(amenity.name)}
                        </div>
                        <span className="text-xs sm:text-sm font-medium text-gray-700 leading-tight">
                          {amenity.name}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {property.property_type !== 'Room' && (property as any).rooms && (property as any).rooms.length > 0 && (
              <div id="room-selection" className="mb-8">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">Select Your Room</h2>
                </div>
                
                <div className="max-w-2xl mx-auto space-y-4">
                  {/* Get unique sharing types with their details */}
                  {(Array.from(new Set((property as any).rooms.map((room: any) => room.sharing_type))) as string[])
                    .map((sharingType: string) => {
                      const roomsOfType = (property as any).rooms.filter((room: any) => room.sharing_type === sharingType);
                      const lowestPrice = Math.min(...roomsOfType.map((room: any) => room.price_per_person));
                      const totalAvailableBeds = roomsOfType.reduce((sum: number, room: any) => sum + (room.available_beds || 0), 0);
                      const isSelected = selectedRoomType === sharingType;
                      const isAvailable = totalAvailableBeds > 0;
                      
                      // Get room description based on sharing type
                      const getRoomDescription = (type: string) => {
                        if (type.toLowerCase().includes('single') || type.toLowerCase().includes('1')) return 'Private space for one';
                        if (type.toLowerCase().includes('2') || type.toLowerCase().includes('double')) return 'Stay with a friend';
                        if (type.toLowerCase().includes('3') || type.toLowerCase().includes('triple')) return 'Economical shared stay';
                        if (type.toLowerCase().includes('4') || type.toLowerCase().includes('quad')) return 'Best value for group stays';
                        return 'Shared accommodation';
                      };

                      return (
                        <div
                          key={sharingType}
                          className={`relative bg-white rounded-2xl p-4 sm:p-6 transition-all duration-300 cursor-pointer ${
                            isSelected 
                              ? 'border-2 border-blue-500 shadow-lg' 
                              : isAvailable
                                ? 'border border-gray-200 hover:border-gray-300 hover:shadow-md'
                                : 'border border-gray-200 bg-gray-50 cursor-not-allowed opacity-60'
                          }`}
                          onClick={() => isAvailable && setSelectedRoomType(isSelected ? '' : sharingType)}
                        >
                          {/* Mobile Layout */}
                          <div className="block sm:hidden">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1 pr-2">
                                <h3 className="text-lg font-bold text-gray-900 mb-1">{sharingType}</h3>
                                <p className="text-gray-500 text-xs mb-2">{getRoomDescription(sharingType)}</p>
                              </div>
                              <div className="text-right flex-shrink-0">
                                <div className="text-xl font-bold text-blue-600">
                                  ₹{lowestPrice.toLocaleString()}
                                </div>
                                <div className="text-gray-500 text-xs whitespace-nowrap">per month</div>
                              </div>
                            </div>
                            
                            <div className="w-full">
                              {isSelected && (
                                <button
                                  className="w-full bg-blue-500 text-white px-4 py-2 rounded-lg font-semibold flex items-center justify-center space-x-2 text-sm"
                                >
                                  <span>SELECTED</span>
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                </button>
                              )}
                              
                              {!isSelected && isAvailable && (
                                <button className="w-full bg-blue-50 text-blue-600 px-4 py-2 rounded-lg font-semibold hover:bg-blue-100 transition-colors text-sm">
                                  SELECT ROOM
                                </button>
                              )}
                              
                              {!isAvailable && (
                                <button className="w-full bg-gray-200 text-gray-500 px-4 py-2 rounded-lg font-semibold cursor-not-allowed text-sm">
                                  FULLY BOOKED
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Desktop Layout */}
                          <div className="hidden sm:flex items-center justify-between">
                            <div className="flex-1">
                              <h3 className="text-xl font-bold text-gray-900 mb-1">{sharingType}</h3>
                              <p className="text-gray-500 text-sm mb-4">{getRoomDescription(sharingType)}</p>
                              
                              {isSelected && (
                                <button
                                  className="bg-blue-500 text-white px-6 py-2 rounded-lg font-semibold flex items-center space-x-2"
                                >
                                  <span>SELECTED</span>
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                </button>
                              )}
                              
                              {!isSelected && isAvailable && (
                                <button className="bg-blue-50 text-blue-600 px-6 py-2 rounded-lg font-semibold hover:bg-blue-100 transition-colors">
                                  SELECT ROOM
                                </button>
                              )}
                              
                              {!isAvailable && (
                                <button className="bg-gray-200 text-gray-500 px-6 py-2 rounded-lg font-semibold cursor-not-allowed">
                                  FULLY BOOKED
                                </button>
                              )}
                            </div>
                            
                            <div className="text-right ml-6">
                              <div className="text-2xl font-bold text-blue-600 mb-1">
                                ₹{lowestPrice.toLocaleString()}
                              </div>
                              <div className="text-gray-500 text-sm">per month</div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>

                {/* Security Token and Confirm Button */}
                {selectedRoomType && (
                  <div className="max-w-2xl mx-auto mt-8 bg-gray-50 rounded-2xl p-4 sm:p-6">
                    {/* Mobile Layout */}
                    <div className="block sm:hidden space-y-4">
                      <div className="text-center">
                        <div className="text-gray-600 text-sm mb-1">Secure Token:</div>
                        <div className="text-2xl font-bold text-gray-900">
                          ₹{Math.round(Math.min(...(property as any).rooms
                            .filter((room: any) => room.sharing_type === selectedRoomType)
                            .map((room: any) => room.price_per_person)) * 0.2).toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-500">20% advance payment</div>
                      </div>
                      
                      <Link
                        href={`/payment?propertyId=${property.id}&sharingType=${encodeURIComponent(selectedRoomType)}${duration ? `&duration=${duration}` : ''}${checkIn ? `&checkIn=${checkIn}` : ''}${checkOut ? `&checkOut=${checkOut}` : ''}${location ? `&location=${encodeURIComponent(location)}` : ''}${gender && gender !== 'any' ? `&gender=${gender}` : ''}${moveIn ? `&moveIn=${moveIn}` : ''}`}
                        className="block w-full bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-xl font-bold text-lg transition-all shadow-lg hover:shadow-xl text-center"
                      >
                        Confirm Stay
                      </Link>
                    </div>

                    {/* Desktop Layout */}
                    <div className="hidden sm:flex items-center justify-between">
                      <div>
                        <div className="text-gray-600 text-sm mb-1">Secure Token:</div>
                        <div className="text-2xl font-bold text-gray-900">
                          ₹{Math.round(Math.min(...(property as any).rooms
                            .filter((room: any) => room.sharing_type === selectedRoomType)
                            .map((room: any) => room.price_per_person)) * 0.2).toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-500">20% advance payment</div>
                      </div>
                      
                      <Link
                        href={`/payment?propertyId=${property.id}&sharingType=${encodeURIComponent(selectedRoomType)}${duration ? `&duration=${duration}` : ''}${checkIn ? `&checkIn=${checkIn}` : ''}${checkOut ? `&checkOut=${checkOut}` : ''}${location ? `&location=${encodeURIComponent(location)}` : ''}${gender && gender !== 'any' ? `&gender=${gender}` : ''}${moveIn ? `&moveIn=${moveIn}` : ''}`}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded-xl font-bold text-lg transition-all shadow-lg hover:shadow-xl"
                      >
                        Confirm Stay
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="border-t pt-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Location</h2>
              <div className="bg-gray-100 rounded-xl p-6">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div className="flex-1">
                    <p className="text-gray-800 font-medium mb-2">{property.address}</p>
                    <p className="text-gray-600">
                      {property.area && property.city
                        ? `${property.area}, ${property.city}`
                        : property.city || property.area}
                    </p>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-3">
                    <a
                      href={
                        (property as any).google_maps_url || 
                        `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                          `${property.address || ''} ${property.area || ''} ${property.city || ''}`.trim()
                        )}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center px-4 py-2 text-white font-semibold rounded-lg transition-all hover:shadow-lg"
                      style={{ backgroundColor: '#FF6711' }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#E55A0F'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#FF6711'}
                    >
                      <FaMapMarkerAlt className="mr-2" />
                      View on Maps
                    </a>
                  </div>
                </div>
                
                {/* Additional Location Info */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center space-x-2 text-gray-600">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span>
                        {(property as any).google_maps_url ? 'Precise location on Google Maps' : 'Location search on Google Maps'}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-600">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Real-time navigation available</span>
                    </div>
                  </div>
                  
                  {/* Show coordinates if available */}
                  {(property as any).latitude && (property as any).longitude && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <div className="flex items-center space-x-2 text-xs text-gray-500">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                        </svg>
                        <span>
                          Coordinates: {(property as any).latitude}, {(property as any).longitude}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showImageModal && images && images.length > 0 && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4">
          <button
            onClick={() => setShowImageModal(false)}
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors z-10"
          >
            <FaTimes className="text-3xl" />
          </button>

          <div className="relative w-full h-full max-w-6xl max-h-[90vh] flex flex-col">
            <div className="relative flex-1">
              <Image
                src={images[currentImageIndex].image_url}
                alt={`${property.name} - Photo ${currentImageIndex + 1}`}
                fill
                className="object-contain"
              />
            </div>

            {images.length > 1 && (
              <>
                <button
                  onClick={() => setCurrentImageIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1))}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white p-4 rounded-full backdrop-blur-sm transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={() => setCurrentImageIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0))}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white p-4 rounded-full backdrop-blur-sm transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>

                <div className="flex justify-center gap-2 mt-4">
                  {images.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`h-2 rounded-full transition-all ${
                        index === currentImageIndex ? 'w-8 bg-white' : 'w-2 bg-white/50'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}

            <div className="text-center mt-4 text-white">
              {currentImageIndex + 1} / {images.length}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
