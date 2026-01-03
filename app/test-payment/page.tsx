'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaArrowLeft, FaCreditCard, FaCheckCircle, FaSpinner, FaUser, FaSignInAlt } from 'react-icons/fa';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

export default function TestPaymentPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [formData, setFormData] = useState({
    propertyId: '1',
    roomId: '1',
    guestName: '',
    guestEmail: '',
    guestPhone: '+919876543210',
    amount: '2400'
  });

  useEffect(() => {
    if (!authLoading && user) {
      // Auto-populate form with user data
      setFormData(prev => ({
        ...prev,
        guestName: user.user_metadata?.full_name || user.user_metadata?.name || 'Test User',
        guestEmail: user.email || 'test@example.com'
      }));
    }
  }, [user, authLoading]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const createTestPayment = async () => {
    if (!user) {
      alert('Please login first to test payment');
      router.push('/login');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      // Get the session token properly from Supabase
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      if (!token) {
        alert('Authentication token not found. Please login again.');
        router.push('/login');
        return;
      }

      const response = await fetch('/api/test-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          propertyId: parseInt(formData.propertyId),
          roomId: parseInt(formData.roomId),
          guestName: formData.guestName,
          guestEmail: formData.guestEmail,
          guestPhone: formData.guestPhone,
          amount: parseInt(formData.amount),
          userId: user.id // Link to authenticated user
        }),
      });

      const data = await response.json();
      setResult(data);

      if (data.success) {
        // Auto-redirect to success page after 2 seconds
        setTimeout(() => {
          window.open(data.data.successUrl, '_blank');
        }, 2000);
      }
    } catch (error: any) {
      setResult({
        success: false,
        error: error.message || 'Failed to create test payment'
      });
    } finally {
      setLoading(false);
    }
  };

  const quickTestPayment = async () => {
    if (!user) {
      alert('Please login first to test payment');
      router.push('/login');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      // Get the session token properly from Supabase
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      if (!token) {
        alert('Authentication token not found. Please login again.');
        router.push('/login');
        return;
      }

      const response = await fetch('/api/test-payment', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });

      const data = await response.json();
      setResult(data);

      if (data.success) {
        // Auto-redirect to success page after 2 seconds
        setTimeout(() => {
          window.open(data.data.successUrl, '_blank');
        }, 2000);
      }
    } catch (error: any) {
      setResult({
        success: false,
        error: error.message || 'Failed to create test payment'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-8 px-4" style={{ 
      background: 'linear-gradient(135deg, #FF6711 0%, #FFD082 50%, #FF6711 100%)',
      backgroundSize: '400% 400%',
      animation: 'gradientShift 20s ease infinite'
    }}>
      <div className="max-w-4xl mx-auto">
        <Link
          href="/"
          className="inline-flex items-center hover:underline mb-6"
          style={{ color: '#FFF4EC' }}
        >
          <FaArrowLeft className="mr-2" />
          Back to Home
        </Link>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="text-center mb-8">
            <FaCreditCard className="text-4xl text-orange-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Test Payment System</h1>
            <p className="text-gray-600">Create test successful payments for development and testing</p>
          </div>

          {/* Authentication Check */}
          {authLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Checking authentication...</p>
            </div>
          ) : !user ? (
            <div className="text-center py-8">
              <FaUser className="text-4xl text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-gray-900 mb-4">Login Required</h2>
              <p className="text-gray-600 mb-6">
                You need to be logged in to test payments and see the complete post-payment experience.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/login"
                  className="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-6 rounded-lg transition-all flex items-center justify-center"
                >
                  <FaSignInAlt className="mr-2" />
                  Login to Continue
                </Link>
                <Link
                  href="/signup"
                  className="border-2 border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white font-semibold py-3 px-6 rounded-lg transition-all flex items-center justify-center"
                >
                  Create Account
                </Link>
              </div>
            </div>
          ) : (
            <>
              {/* User Info */}
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="font-semibold text-blue-800 mb-2">Logged in as:</h3>
                <p className="text-blue-700">
                  <FaUser className="inline mr-2" />
                  {user.user_metadata?.full_name || user.user_metadata?.name || 'User'} ({user.email})
                </p>
                <p className="text-sm text-blue-600 mt-1">
                  Test payments will be linked to your profile so you can see the complete post-payment experience.
                </p>
              </div>

          {/* Quick Test Button */}
          <div className="mb-8 p-6 bg-green-50 border border-green-200 rounded-xl">
            <h2 className="text-xl font-bold text-green-800 mb-4">Quick Test Payment</h2>
            <p className="text-green-700 mb-4">
              Create a test payment with default values instantly
            </p>
            <button
              onClick={quickTestPayment}
              disabled={loading}
              className="bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {loading ? (
                <>
                  <FaSpinner className="animate-spin" />
                  <span>Creating Test Payment...</span>
                </>
              ) : (
                <>
                  <FaCheckCircle />
                  <span>Create Quick Test Payment</span>
                </>
              )}
            </button>
          </div>

          {/* Custom Test Form */}
          <div className="mb-8 p-6 bg-blue-50 border border-blue-200 rounded-xl">
            <h2 className="text-xl font-bold text-blue-800 mb-4">Custom Test Payment</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Property ID
                </label>
                <input
                  type="number"
                  name="propertyId"
                  value={formData.propertyId}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Room ID
                </label>
                <input
                  type="number"
                  name="roomId"
                  value={formData.roomId}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Guest Name
                </label>
                <input
                  type="text"
                  name="guestName"
                  value={formData.guestName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Guest Email
                </label>
                <input
                  type="email"
                  name="guestEmail"
                  value={formData.guestEmail}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="john.doe@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Guest Phone
                </label>
                <input
                  type="tel"
                  name="guestPhone"
                  value={formData.guestPhone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="+919876543210"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount (₹)
                </label>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="2400"
                />
              </div>
            </div>

            <button
              onClick={createTestPayment}
              disabled={loading}
              className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {loading ? (
                <>
                  <FaSpinner className="animate-spin" />
                  <span>Creating Test Payment...</span>
                </>
              ) : (
                <>
                  <FaCreditCard />
                  <span>Create Custom Test Payment</span>
                </>
              )}
            </button>
          </div>

          {/* Result Display */}
          {result && (
            <div className={`p-6 rounded-xl ${result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
              <h3 className={`text-lg font-bold mb-4 ${result.success ? 'text-green-800' : 'text-red-800'}`}>
                {result.success ? '✅ Test Payment Created Successfully!' : '❌ Test Payment Failed'}
              </h3>
              
              {result.success ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-green-700">Payment ID:</span>
                      <span className="ml-2 text-green-600">{result.data.paymentId}</span>
                    </div>
                    <div>
                      <span className="font-medium text-green-700">Booking ID:</span>
                      <span className="ml-2 text-green-600">{result.data.bookingId}</span>
                    </div>
                    <div>
                      <span className="font-medium text-green-700">Amount:</span>
                      <span className="ml-2 text-green-600">₹{result.data.amount.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="font-medium text-green-700">Property:</span>
                      <span className="ml-2 text-green-600">{result.data.propertyName}</span>
                    </div>
                  </div>
                  
                  <div className="mt-4 p-4 bg-green-100 rounded-lg">
                    <p className="text-green-800 font-medium mb-2">🎉 Success Page will open automatically!</p>
                    <p className="text-green-700 text-sm">
                      Or click here: 
                      <a 
                        href={result.data.successUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="ml-2 underline hover:no-underline"
                      >
                        View Payment Success Page
                      </a>
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-red-700">{result.error}</p>
              )}
            </div>
          )}

          {/* Information */}
          <div className="mt-8 p-6 bg-gray-50 border border-gray-200 rounded-xl">
            <h3 className="text-lg font-bold text-gray-800 mb-4">ℹ️ What This Does</h3>
            <ul className="text-gray-700 space-y-2 text-sm">
              <li>• Creates a test booking record in the database</li>
              <li>• Generates realistic payment and booking IDs</li>
              <li>• Simulates successful payment completion</li>
              <li>• Triggers WhatsApp notification system (if configured)</li>
              <li>• Redirects to payment success page with all details</li>
              <li>• Perfect for testing the complete payment flow</li>
            </ul>
          </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}