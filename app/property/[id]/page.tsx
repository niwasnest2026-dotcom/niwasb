'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  FaStar, FaMapMarkerAlt, FaArrowLeft, FaPhone, FaEnvelope, FaTimes,
  FaWifi, FaBolt, FaDumbbell, FaGamepad, FaSnowflake, FaCouch,
  FaBath, FaUtensils, FaBroom, FaTshirt, FaParking, FaShieldAlt, FaClock, FaCalendarAlt, FaSearch
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
  const [settings, setSettings] = useState<SiteSettings>({
    contact_phone: '+91 63048 09598',
    contact_email: 'niwasnest2026@gmail.com'
  });

  // Get search parameters
  const duration = searchParams.get('duration') || '';
  const checkIn = searchParams.get('checkIn') || '';
  const checkOut = searchParams.get('checkOut') || '';

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
      background: 'linear-gradient(135deg, #DEF2F1 0%, #FEFFFF 50%, #DEF2F1 100%)',
      backgroundSize: '400% 400%',
      animation: 'gradientShift 20s ease infinite'
    }}>
      <div className="max-w-6xl mx-auto">
        <Link
          href="/"
          className="inline-flex items-center hover:underline mb-6"
          style={{ color: '#2B7A78' }}
        >
          <FaArrowLeft className="mr-2" />
          Back to listings
        </Link>

        {/* Search Criteria Display */}
        {(duration || (checkIn && checkOut)) && (
          <div className="mb-6 p-4 rounded-xl" style={{ backgroundColor: 'rgba(222, 242, 241, 0.5)' }}>
            <div className="flex items-center flex-wrap gap-4">
              <div className="flex items-center space-x-2">
                <FaSearch style={{ color: '#2B7A78' }} />
                <span className="text-sm font-semibold" style={{ color: '#17252A' }}>Your Search:</span>
              </div>
              
              {duration && (
                <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg" style={{ backgroundColor: 'rgba(58, 175, 169, 0.1)' }}>
                  <FaClock style={{ color: '#2B7A78' }} />
                  <span className="text-sm font-medium" style={{ color: '#17252A' }}>
                    {duration} month{parseInt(duration) > 1 ? 's' : ''}
                  </span>
                </div>
              )}
              
              {checkIn && checkOut && (
                <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg" style={{ backgroundColor: 'rgba(43, 122, 120, 0.1)' }}>
                  <FaCalendarAlt style={{ color: '#2B7A78' }} />
                  <span className="text-sm font-medium" style={{ color: '#17252A' }}>
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

            {images.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2 bg-black/50 px-4 py-2 rounded-full">
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

            <div className="absolute top-4 left-4 flex flex-wrap gap-2">
              {property.instant_book && (
                <span className="px-3 py-1.5 text-white text-sm font-bold rounded-full" style={{ backgroundColor: '#3AAFA9' }}>
                  INSTANT BOOK
                </span>
              )}
            </div>
          </div>

          <div className="p-8">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                    {property.name}
                  </h1>
                  {property.property_type && (
                    <span className="px-3 py-1.5 text-white text-sm font-bold rounded-lg" style={{ backgroundColor: '#2B7A78' }}>
                      {property.property_type}
                    </span>
                  )}
                </div>
                <div className="flex items-center text-gray-600 mb-4">
                  <FaMapMarkerAlt className="mr-2" style={{ color: '#2B7A78' }} />
                  <span className="text-lg">
                    {property.area && property.city
                      ? `${property.area}, ${property.city}`
                      : property.city || property.area || property.address}
                  </span>
                </div>

                <div className="flex flex-wrap gap-3 mb-4">
                  {property.verified && (
                    <div className="flex items-center space-x-1 px-3 py-1.5 rounded-lg text-sm font-semibold" style={{ backgroundColor: 'rgba(58, 175, 169, 0.15)', borderColor: 'rgba(58, 175, 169, 0.3)', border: '1px solid', color: '#2B7A78' }}>
                      <MdVerified className="text-lg" style={{ color: '#3AAFA9' }} />
                      <span>Verified</span>
                    </div>
                  )}
                  {property.secure_booking && (
                    <div className="flex items-center space-x-1 px-3 py-1.5 rounded-lg text-sm font-semibold" style={{ backgroundColor: 'rgba(43, 122, 120, 0.15)', borderColor: 'rgba(43, 122, 120, 0.3)', border: '1px solid', color: '#3AAFA9' }}>
                      <MdSecurity className="text-lg" style={{ color: '#2B7A78' }} />
                      <span>Secure Booking</span>
                    </div>
                  )}
                  {property.rating && property.rating > 0 && (
                    <div className="flex items-center space-x-1 px-3 py-1.5 rounded-full border" style={{ backgroundColor: 'rgba(58, 175, 169, 0.1)', borderColor: 'rgba(58, 175, 169, 0.3)' }}>
                      <FaStar style={{ color: '#3AAFA9' }} />
                      <span className="font-bold text-gray-900">{property.rating}</span>
                      {property.review_count && property.review_count > 0 && (
                        <span className="text-gray-600 text-sm">({property.review_count} reviews)</span>
                      )}
                    </div>
                  )}
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
                    className="w-full px-8 py-4 text-white font-bold text-lg rounded-xl transition-all shadow-lg hover:shadow-xl mb-4"
                    style={{ backgroundColor: '#3AAFA9' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2B7A78'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#3AAFA9'}
                  >
                    Choose Room Type
                  </button>
                )}
                {property.property_type === 'Room' && (
                  <Link
                    href={`/payment?propertyId=${property.id}&propertyType=Room${duration ? `&duration=${duration}` : ''}${checkIn ? `&checkIn=${checkIn}` : ''}${checkOut ? `&checkOut=${checkOut}` : ''}`}
                    className="block w-full px-8 py-4 text-white font-bold text-lg rounded-xl transition-all shadow-lg hover:shadow-xl mb-4 text-center"
                    style={{ backgroundColor: '#3AAFA9' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2B7A78'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#3AAFA9'}
                  >
                    Book Now
                  </Link>
                )}
                <div className="mt-4 flex flex-col space-y-2">
                  <a
                    href={`tel:${settings.contact_phone}`}
                    className="flex items-center justify-center text-gray-700 hover:text-primary transition-colors"
                  >
                    <FaPhone className="mr-2" />
                    <span className="text-sm font-medium">Call us</span>
                  </a>
                  <a
                    href={`mailto:${settings.contact_email}`}
                    className="flex items-center justify-center text-gray-700 hover:text-primary transition-colors"
                  >
                    <FaEnvelope className="mr-2" />
                    <span className="text-sm font-medium">Email us</span>
                  </a>
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

            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Property Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="font-semibold text-gray-900 mb-3">Pricing</h3>
                  <div className="space-y-2">
                    {(property as any).rooms && (property as any).rooms.length > 0 ? (
                      <>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Starting from</span>
                          <span className="font-semibold">
                            ₹{Math.min(...(property as any).rooms.map((room: any) => room.price_per_person)).toLocaleString()}/person
                          </span>
                        </div>
                        <p className="text-xs text-gray-500">Prices vary by room type and sharing</p>
                      </>
                    ) : (
                      <>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Monthly rent</span>
                          <span className="font-semibold">₹{property.price.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Security deposit</span>
                          <span className="font-semibold">₹{((property as any).security_deposit || property.price * 2).toLocaleString()}</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
                
                {(property as any).available_months && (
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h3 className="font-semibold text-gray-900 mb-3">Availability</h3>
                    <div className="flex items-center space-x-2">
                      <FaClock style={{ color: '#2B7A78' }} />
                      <span className="text-gray-700">
                        Available for {(property as any).available_months} month{(property as any).available_months > 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {images && images.length > 0 && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Property Photos</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {images.map((image, index) => (
                    <div
                      key={(image as any).id || index}
                      className="relative h-40 rounded-xl overflow-hidden cursor-pointer group"
                      onClick={() => {
                        setCurrentImageIndex(index);
                        setShowImageModal(true);
                      }}
                    >
                      <Image
                        src={image.image_url}
                        alt={`${property.name} - Photo ${index + 1}`}
                        fill
                        className="object-cover transition-transform group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {property.amenities && property.amenities.length > 0 && (
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-gray-900">Amenities</h2>
                  {property.amenities.length > 8 && (
                    <button
                      onClick={() => setShowAllAmenities(!showAllAmenities)}
                      className="px-4 py-2 text-sm font-medium rounded-lg border-2 transition-all hover:shadow-lg"
                      style={{ borderColor: '#2B7A78', color: '#2B7A78' }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#2B7A78';
                        e.currentTarget.style.color = 'white';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.color = '#2B7A78';
                      }}
                    >
                      {showAllAmenities ? 'Show Less' : `Show More (${property.amenities.length - 8})`}
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {(showAllAmenities ? property.amenities : property.amenities.slice(0, 8)).map((amenity) => {
                    const IconComponent = amenityIcons[amenity.icon_name] || FaWifi;
                    return (
                      <div
                        key={amenity.id}
                        className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl border border-gray-200 min-w-0"
                      >
                        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm flex-shrink-0">
                          <IconComponent className="text-xl text-gray-700" />
                        </div>
                        <span className="font-medium text-gray-900 truncate min-w-0 flex-1">{amenity.name}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {property.property_type !== 'Room' && (property as any).rooms && (property as any).rooms.length > 0 && (
              <div id="room-selection" className="mb-8">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Choose Room Type</h2>
                  <p className="text-gray-600">Select a room below to book</p>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Get unique sharing types with their lowest price */}
                  {(Array.from(new Set((property as any).rooms.map((room: any) => room.sharing_type))) as string[])
                    .map((sharingType: string) => {
                      const roomsOfType = (property as any).rooms.filter((room: any) => room.sharing_type === sharingType);
                      const lowestPrice = Math.min(...roomsOfType.map((room: any) => room.price_per_person));
                      const availableRooms = roomsOfType.filter((room: any) => room.available_beds > 0);
                      
                      return (
                        <div
                          key={sharingType}
                          className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow"
                        >
                          <div className="text-center">
                            <h3 className="text-lg font-bold text-gray-900 mb-2">{sharingType}</h3>
                            <div className="text-2xl font-bold mb-1" style={{ color: '#3AAFA9' }}>
                              ₹{lowestPrice.toLocaleString()}
                            </div>
                            <div className="text-sm text-gray-600 mb-4">per person/month</div>
                            
                            {availableRooms.length > 0 ? (
                              <div className="mb-4">
                                <span className="text-sm font-medium" style={{ color: '#2B7A78' }}>
                                  {availableRooms.length} room{availableRooms.length > 1 ? 's' : ''} available
                                </span>
                              </div>
                            ) : (
                              <div className="mb-4">
                                <span className="text-sm text-red-600 font-medium">No rooms available</span>
                              </div>
                            )}

                            {availableRooms.length > 0 ? (
                              <Link
                                href={`/payment?propertyId=${property.id}&sharingType=${encodeURIComponent(sharingType)}${duration ? `&duration=${duration}` : ''}${checkIn ? `&checkIn=${checkIn}` : ''}${checkOut ? `&checkOut=${checkOut}` : ''}`}
                                className="block w-full px-4 py-2 text-white font-semibold rounded-lg transition-all"
                                style={{ backgroundColor: '#3AAFA9' }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2B7A78'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#3AAFA9'}
                              >
                                Book Now
                              </Link>
                            ) : (
                              <button
                                disabled
                                className="block w-full px-4 py-2 bg-gray-300 text-gray-600 font-semibold rounded-lg cursor-not-allowed"
                              >
                                Fully Booked
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                </div>
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
                      style={{ backgroundColor: '#3AAFA9' }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2B7A78'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#3AAFA9'}
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
