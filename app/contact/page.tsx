'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FaPhone, FaEnvelope, FaWhatsapp, FaMapMarkerAlt, FaClock, FaPaperPlane } from 'react-icons/fa';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setSubmitted(true);
    setIsSubmitting(false);
    setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
  };

  return (
    <div className="min-h-screen py-12 px-4" style={{ 
      background: 'linear-gradient(135deg, #DEF2F1 0%, #FEFFFF 50%, #DEF2F1 100%)',
      backgroundSize: '400% 400%',
      animation: 'gradientShift 20s ease infinite'
    }}>
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <Link href="/" className="hover:underline mb-4 inline-block" style={{ color: '#2B7A78' }}>
            ← Back to Home
          </Link>
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Contact Us</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We're here to help! Get in touch with us for any questions, support, or feedback.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Information */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-8 h-fit">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Get in Touch</h2>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(58, 175, 169, 0.1)' }}>
                    <FaPhone className="text-xl" style={{ color: '#3AAFA9' }} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Phone</h3>
                    <p className="text-gray-600">+91 63048 09598</p>
                    <p className="text-sm text-gray-500">Available 9 AM - 9 PM</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(43, 122, 120, 0.1)' }}>
                    <FaEnvelope className="text-xl" style={{ color: '#2B7A78' }} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Email</h3>
                    <p className="text-gray-600">niwasnest2026@gmail.com</p>
                    <p className="text-sm text-gray-500">We'll respond within 24 hours</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(58, 175, 169, 0.1)' }}>
                    <FaWhatsapp className="text-xl" style={{ color: '#3AAFA9' }} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">WhatsApp</h3>
                    <p className="text-gray-600">+91 63048 09598</p>
                    <p className="text-sm text-gray-500">Quick support & updates</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(43, 122, 120, 0.1)' }}>
                    <FaMapMarkerAlt className="text-xl" style={{ color: '#2B7A78' }} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Location</h3>
                    <p className="text-gray-600">Bangalore, Karnataka</p>
                    <p className="text-sm text-gray-500">India</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(58, 175, 169, 0.1)' }}>
                    <FaClock className="text-xl" style={{ color: '#3AAFA9' }} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Support Hours</h3>
                    <p className="text-gray-600">9:00 AM - 9:00 PM</p>
                    <p className="text-sm text-gray-500">All days of the week</p>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <a
                    href="tel:+916304809598"
                    className="flex items-center justify-center w-full px-4 py-3 text-white font-semibold rounded-lg transition-all hover:shadow-lg"
                    style={{ backgroundColor: '#3AAFA9' }}
                  >
                    <FaPhone className="mr-2" />
                    Call Now
                  </a>
                  <a
                    href="https://wa.me/916304809598"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center w-full px-4 py-3 text-white font-semibold rounded-lg transition-all hover:shadow-lg"
                    style={{ backgroundColor: '#2B7A78' }}
                  >
                    <FaWhatsapp className="mr-2" />
                    WhatsApp
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Send us a Message</h2>
              
              {submitted ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(58, 175, 169, 0.1)' }}>
                    <FaPaperPlane className="text-2xl" style={{ color: '#3AAFA9' }} />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Message Sent!</h3>
                  <p className="text-gray-600 mb-6">
                    Thank you for contacting us. We'll get back to you within 24 hours.
                  </p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="px-6 py-2 text-white font-semibold rounded-lg transition-all hover:shadow-lg"
                    style={{ backgroundColor: '#3AAFA9' }}
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                        placeholder="Enter your full name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                        placeholder="Enter your email"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                        placeholder="Enter your phone number"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Subject *
                      </label>
                      <select
                        name="subject"
                        value={formData.subject}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                      >
                        <option value="">Select a subject</option>
                        <option value="booking-inquiry">Booking Inquiry</option>
                        <option value="booking-support">Booking Support</option>
                        <option value="payment-issue">Payment Issue</option>
                        <option value="property-listing">Property Listing</option>
                        <option value="technical-support">Technical Support</option>
                        <option value="feedback">Feedback</option>
                        <option value="partnership">Partnership</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Message *
                    </label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      required
                      rows={6}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none"
                      placeholder="Tell us how we can help you..."
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-500">
                      * Required fields
                    </p>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-8 py-3 text-white font-semibold rounded-lg transition-all hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                      style={{ backgroundColor: '#3AAFA9' }}
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span>Sending...</span>
                        </>
                      ) : (
                        <>
                          <FaPaperPlane />
                          <span>Send Message</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-12">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Frequently Asked Questions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">How do I book a property?</h3>
                  <p className="text-gray-600 text-sm">
                    Simply search for properties in your preferred location, select a room type, 
                    and pay 20% advance to confirm your booking.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">What payment methods do you accept?</h3>
                  <p className="text-gray-600 text-sm">
                    We accept all major credit/debit cards, UPI, net banking, and digital wallets 
                    through our secure payment gateway.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Can I cancel my booking?</h3>
                  <p className="text-gray-600 text-sm">
                    Yes, you can cancel up to 24 hours before check-in for a full refund. 
                    Check our cancellation policy for details.
                  </p>
                </div>
              </div>
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Are all properties verified?</h3>
                  <p className="text-gray-600 text-sm">
                    Yes, every property on our platform is personally verified by our team 
                    to ensure quality and safety standards.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">How do I contact property owners?</h3>
                  <p className="text-gray-600 text-sm">
                    After booking confirmation, you'll receive the property owner's contact 
                    details to coordinate your check-in.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Do you charge any service fees?</h3>
                  <p className="text-gray-600 text-sm">
                    No, we don't charge any hidden service fees. The price you see is 
                    the price you pay.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}