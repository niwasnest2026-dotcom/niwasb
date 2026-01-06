'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FaTimes, FaUser, FaPhone, FaHome, FaCalendarAlt, FaBed, FaRupeeSign } from 'react-icons/fa';
import { supabase } from '@/lib/supabase';

interface OwnerDetails {
  owner_name: string;
  owner_phone: string;
  payment_instructions: string;
  property_name: string;
  booking_id: string;
  amount_due: number;
  check_in_date: string;
  room_sharing: string;
}

interface OwnerDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingId: string;
}

export default function OwnerDetailsModal({ isOpen, onClose, bookingId }: OwnerDetailsModalProps) {
  const [ownerDetails, setOwnerDetails] = useState<OwnerDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && bookingId) {
      fetchOwnerDetails();
    }
  }, [isOpen, bookingId]);

  const fetchOwnerDetails = async () => {
    setLoading(true);
    setError(null);

    try {
      // Get the session token properly from Supabase
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      if (!token) {
        setError('Authentication required. Please login again.');
        return;
      }

      const response = await fetch('/api/get-owner-details', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ booking_id: bookingId }),
      });

      const data = await response.json();

      if (data.success) {
        setOwnerDetails(data.ownerDetails);
      } else {
        setError(data.error || 'Failed to fetch owner details');
      }
    } catch (err: any) {
      setError('Network error occurred');
      console.error('Error fetching owner details:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">🎉 Booking Confirmed!</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <FaTimes className="text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading owner details...</p>
            </div>
          )}

          {error && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-yellow-800 mb-2">Owner Details Temporarily Unavailable</h3>
                <p className="text-yellow-700 text-sm mb-4">
                  Your payment was successful and booking is confirmed! Owner details will be available in your profile shortly.
                </p>
                <div className="space-y-2">
                  <Link 
                    href="/profile"
                    className="inline-block bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    View in Profile
                  </Link>
                  <button
                    onClick={() => fetchOwnerDetails()}
                    className="ml-2 inline-block bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    Try Again
                  </button>
                </div>
                {error.includes('not found') && (
                  <div className="mt-3 pt-3 border-t border-yellow-200">
                    <p className="text-xs text-yellow-600">
                      If this issue persists, please contact support with your booking ID: {bookingId}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {ownerDetails && (
            <div className="space-y-6">
              {/* Success Message */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                <h3 className="text-lg font-bold text-green-800 mb-2">Payment Successful!</h3>
                <p className="text-green-700 text-sm">
                  Your booking has been confirmed. Here are the property owner details for the remaining payment.
                </p>
              </div>

              {/* Booking Summary */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3">Booking Summary</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center text-gray-600">
                      <FaHome className="mr-2" />
                      Property:
                    </span>
                    <span className="font-medium text-gray-900">{ownerDetails.property_name}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center text-gray-600">
                      <FaBed className="mr-2" />
                      Room Type:
                    </span>
                    <span className="font-medium text-gray-900">{ownerDetails.room_sharing}</span>
                  </div>
                  {ownerDetails.check_in_date && (
                    <div className="flex items-center justify-between">
                      <span className="flex items-center text-gray-600">
                        <FaCalendarAlt className="mr-2" />
                        Check-in:
                      </span>
                      <span className="font-medium text-gray-900">
                        {new Date(ownerDetails.check_in_date).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="flex items-center text-gray-600">
                      <FaRupeeSign className="mr-2" />
                      Remaining Amount:
                    </span>
                    <span className="font-bold text-orange-600">₹{ownerDetails.amount_due.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Owner Details */}
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <h4 className="font-semibold text-orange-800 mb-3">Property Owner Contact</h4>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <FaUser className="text-orange-600" />
                    <div>
                      <p className="text-sm text-gray-600">Owner Name</p>
                      <p className="font-medium text-gray-900">{ownerDetails.owner_name}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <FaPhone className="text-orange-600" />
                    <div>
                      <p className="text-sm text-gray-600">Phone Number</p>
                      <p className="font-medium text-gray-900">{ownerDetails.owner_phone}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Instructions */}
              {ownerDetails.payment_instructions && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-800 mb-2">Payment Instructions</h4>
                  <p className="text-blue-700 text-sm whitespace-pre-line">
                    {ownerDetails.payment_instructions}
                  </p>
                </div>
              )}

              {/* Important Notes */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-semibold text-yellow-800 mb-2">Important Notes</h4>
                <ul className="text-yellow-700 text-sm space-y-1 list-disc list-inside">
                  <li>Contact the owner within 24 hours to arrange remaining payment</li>
                  <li>Keep your booking ID: <strong>{ownerDetails.booking_id}</strong></li>
                  <li>Confirm your check-in date and time with the owner</li>
                  <li>These details are also saved in your profile for future reference</li>
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col space-y-3">
                <button
                  onClick={() => {
                    const message = `Hi, I have confirmed my booking for ${ownerDetails.property_name}. 

Booking ID: ${ownerDetails.booking_id}
Room Type: ${ownerDetails.room_sharing}
Remaining Amount: ₹${ownerDetails.amount_due.toLocaleString()}

Please let me know the payment details and check-in process.`;
                    
                    const whatsappUrl = `https://wa.me/${ownerDetails.owner_phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`;
                    window.open(whatsappUrl, '_blank');
                  }}
                  className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
                >
                  <FaPhone className="mr-2" />
                  Contact Owner on WhatsApp
                </button>
                
                <button
                  onClick={onClose}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
                >
                  Got it, Thanks!
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}