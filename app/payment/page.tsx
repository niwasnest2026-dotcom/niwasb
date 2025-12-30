'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaArrowLeft, FaCheckCircle, FaLock } from 'react-icons/fa';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

interface Property {
  id: string;
  name: string;
  price: number;
  area?: string;
  city?: string;
  featured_image?: string;
  security_deposit?: number;
  available_months?: number;
}

export default function PaymentPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const propertyId = searchParams.get('propertyId');
  const roomId = searchParams.get('roomId');
  const sharingType = searchParams.get('sharingType');
  const propertyType = searchParams.get('propertyType');
  
  const [property, setProperty] = useState<Property | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<any>(null);
  const [availableRooms, setAvailableRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    whatsappNumber: ''
  });

  // Get search parameters for duration and dates
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

  // Check authentication
  useEffect(() => {
    if (!authLoading && !user) {
      // Store the current URL to redirect back after login
      const currentUrl = window.location.href;
      localStorage.setItem('redirectAfterLogin', currentUrl);
      
      // Redirect to login page
      window.location.href = '/login';
      return;
    }
  }, [user, authLoading]);

  useEffect(() => {
    if (!propertyId || authLoading) {
      if (!authLoading && !propertyId) {
        // Redirect to home if no property ID
        router.push('/');
      }
      return;
    }

    // Pre-fill form with user data if available
    if (user) {
      setFormData(prev => ({
        ...prev,
        fullName: user.user_metadata?.full_name || user.user_metadata?.name || '',
        email: user.email || '',
      }));
    }

    async function fetchProperty() {
      try {
        const { data, error } = await supabase
          .from('properties')
          .select('id, name, price, area, city, featured_image, security_deposit, available_months')
          .eq('id', propertyId!)
          .single();

        if (error) throw error;
        setProperty(data);

        // If roomId is provided, fetch room details
        if (roomId) {
          const { data: roomData, error: roomError } = await supabase
            .from('property_rooms')
            .select('*')
            .eq('id', roomId)
            .single();

          if (roomError) throw roomError;
          setSelectedRoom(roomData);
        } else if (sharingType) {
          // If sharingType is provided, fetch available rooms of that type
          const { data: roomsData, error: roomsError } = await supabase
            .from('property_rooms')
            .select('*')
            .eq('property_id', propertyId!)
            .eq('sharing_type', sharingType!)
            .gt('available_beds', 0);

          if (roomsError) throw roomsError;
          
          if (roomsData && roomsData.length > 0) {
            setAvailableRooms(roomsData);
            // Use the first available room for pricing calculation
            setSelectedRoom(roomsData[0]);
          } else {
            // No available rooms of this type
            router.push(`/property/${propertyId}`);
            return;
          }
        } else if (propertyType === 'Room') {
          // For Room type properties, use property pricing directly
          // Create a mock room object using property data
          const mockRoom = {
            id: `property_${propertyId}`,
            property_id: propertyId,
            room_number: 'Room',
            sharing_type: 'Private Room',
            price_per_person: (data as any).price,
            security_deposit_per_person: (data as any).security_deposit || (data as any).price * 2,
            available_beds: 1,
            room_type: 'Room'
          };
          setSelectedRoom(mockRoom);
        } else {
          // If no room, sharing type, or Room property type is selected, redirect to property page
          router.push(`/property/${propertyId}`);
          return;
        }
      } catch (error) {
        console.error('Error fetching property:', error);
        router.push('/');
      } finally {
        setLoading(false);
      }
    }

    fetchProperty();
  }, [propertyId, roomId, sharingType, propertyType, router, user, authLoading]);

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Show login required message if not authenticated
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="mb-6">
            <FaLock className="text-6xl text-orange-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Login Required</h1>
            <p className="text-gray-600">
              You need to be logged in to make a booking and payment.
            </p>
          </div>
          
          <div className="space-y-4">
            <button
              onClick={() => {
                const currentUrl = window.location.href;
                localStorage.setItem('redirectAfterLogin', currentUrl);
                window.location.href = '/login';
              }}
              className="w-full px-6 py-3 text-white font-bold text-lg rounded-xl transition-all shadow-lg hover:shadow-xl"
              style={{ backgroundColor: '#FF6711' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#E55A0F'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#FF6711'}
            >
              Login to Continue
            </button>
            
            <Link
              href="/"
              className="block w-full px-6 py-3 text-gray-600 font-medium text-lg rounded-xl border border-gray-300 hover:bg-gray-50 transition-all"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedRoom || !property) {
      alert('Please select a room to continue');
      return;
    }

    // Validate form data
    if (!formData.fullName || !formData.email || !formData.phone || !formData.whatsappNumber) {
      alert('Please fill in all required fields');
      return;
    }

    // Redirect to payment details page with all necessary parameters
    const params = new URLSearchParams({
      propertyId: property.id,
      fullName: formData.fullName,
      email: formData.email,
      phone: formData.phone,
      whatsappNumber: formData.whatsappNumber,
    });

    // Add room/sharing type parameters
    if (roomId) params.append('roomId', roomId);
    if (sharingType) params.append('sharingType', sharingType);
    if (propertyType) params.append('propertyType', propertyType);
    
    // Add duration and date parameters if available
    if (duration) params.append('duration', duration);
    if (checkIn) params.append('checkIn', checkIn);
    if (checkOut) params.append('checkOut', checkOut);

    router.push(`/booking-summary?${params.toString()}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500"></div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Property not found</h1>
          <Link href="/" className="text-rose-500 hover:underline">
            Go back home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4" style={{ 
      background: 'linear-gradient(135deg, #63B3ED 0%, #90CDF4 50%, #63B3ED 100%)',
      backgroundSize: '400% 400%',
      animation: 'gradientShift 20s ease infinite'
    }}>
      <div className="max-w-4xl mx-auto">
        <Link
          href={`/property/${propertyId}`}
          className="inline-flex items-center hover:underline mb-6"
          style={{ color: '#FF6711' }}
        >
          <FaArrowLeft className="mr-2" />
          Back to property
        </Link>

        {/* Search Criteria Display */}
        {(duration || (checkIn && checkOut)) && (
          <div className="mb-6 p-4 rounded-xl" style={{ backgroundColor: 'rgba(247, 250, 252, 0.8)' }}>
            <div className="flex items-center flex-wrap gap-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-semibold" style={{ color: '#2D3748' }}>Your Booking:</span>
              </div>
              
              {duration && (
                <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg" style={{ backgroundColor: 'rgba(255, 103, 17, 0.1)' }}>
                  <span className="text-sm font-medium" style={{ color: '#2D3748' }}>
                    {duration} month{parseInt(duration) > 1 ? 's' : ''}
                  </span>
                </div>
              )}
              
              {checkIn && checkOut && (
                <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg" style={{ backgroundColor: 'rgba(99, 179, 237, 0.1)' }}>
                  <span className="text-sm font-medium" style={{ color: '#2D3748' }}>
                    {formatDate(checkIn)} - {formatDate(checkOut)}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Property Summary */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Guest Information</h2>
            
            <div className="border rounded-xl p-4 mb-6">
              <div className="flex items-start space-x-4">
                {property.featured_image && (
                  <img
                    src={property.featured_image}
                    alt={property.name}
                    className="w-20 h-20 rounded-lg object-cover"
                  />
                )}
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-gray-900">{property.name}</h3>
                  <p className="text-gray-600">
                    {property.area && property.city
                      ? `${property.area}, ${property.city}`
                      : property.city || property.area}
                  </p>
                  {selectedRoom && (
                    <div className="mt-2">
                      {propertyType === 'Room' ? (
                        <div>
                          <p className="text-sm font-medium text-gray-700">
                            Private Room
                          </p>
                          <p className="text-xs text-gray-500">
                            Entire room booking
                          </p>
                        </div>
                      ) : sharingType ? (
                        <div>
                          <p className="text-sm font-medium text-gray-700">
                            {selectedRoom.sharing_type}
                          </p>
                          <p className="text-xs text-gray-500">
                            {availableRooms.length} room{availableRooms.length > 1 ? 's' : ''} available
                          </p>
                        </div>
                      ) : (
                        <div>
                          <p className="text-sm font-medium text-gray-700">
                            Room {selectedRoom.room_number} - {selectedRoom.sharing_type}
                          </p>
                          {selectedRoom.room_type && (
                            <p className="text-xs text-gray-500">{selectedRoom.room_type}</p>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="border border-orange-200 rounded-lg p-4">
                <h4 className="font-semibold mb-2" style={{ color: '#FF6711' }}>What's Next?</h4>
                <ul className="text-sm space-y-1" style={{ color: '#2D3748' }}>
                  <li>• Review your booking details</li>
                  <li>• Complete secure payment</li>
                  <li>• Get instant booking confirmation</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Guest Information Form */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            {!selectedRoom ? (
              <div className="text-center py-8">
                <p className="text-gray-600">Please select a room to proceed with booking.</p>
                <Link
                  href={`/property/${propertyId}`}
                  className="mt-4 inline-block px-6 py-2 bg-primary hover:bg-primary-dark text-white font-semibold rounded-lg transition-all"
                >
                  Select Room
                </Link>
              </div>
            ) : (
              <form onSubmit={handleFormSubmit} className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Guest Information</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      readOnly
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
                      placeholder="Enter your email"
                      title="Email cannot be changed as you are logged in"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="Enter your phone number"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      WhatsApp Number *
                    </label>
                    <input
                      type="tel"
                      name="whatsappNumber"
                      value={formData.whatsappNumber}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="Enter your WhatsApp number"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Property owner will contact you on this number
                    </p>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full px-6 py-3 text-white font-bold text-lg rounded-xl transition-all shadow-lg hover:shadow-xl"
                  style={{ backgroundColor: '#FF6711' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#E55A0F'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#FF6711'}
                >
                  Continue to Booking Summary
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}