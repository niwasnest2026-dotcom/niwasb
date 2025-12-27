import Link from 'next/link';
import { FaHome, FaUsers, FaShieldAlt, FaHeart, FaStar, FaHandshake } from 'react-icons/fa';

export default function AboutUs() {
  return (
    <div className="min-h-screen py-12 px-4" style={{ 
      background: 'linear-gradient(135deg, #DEF2F1 0%, #FEFFFF 50%, #DEF2F1 100%)',
      backgroundSize: '400% 400%',
      animation: 'gradientShift 20s ease infinite'
    }}>
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="mb-8">
            <Link href="/" className="hover:underline mb-4 inline-block" style={{ color: '#2B7A78' }}>
              ← Back to Home
            </Link>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">About NiwasNest</h1>
            <p className="text-xl text-gray-600">Your trusted partner in finding the perfect home away from home</p>
          </div>

          <div className="prose max-w-none">
            {/* Hero Section */}
            <section className="mb-12">
              <div className="text-center mb-8">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center" style={{ backgroundColor: '#3AAFA9' }}>
                  <FaHome className="text-3xl text-white" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Welcome to NiwasNest</h2>
                <p className="text-lg text-gray-700 max-w-3xl mx-auto">
                  We're revolutionizing the way people find and book accommodations. Whether you're a student, 
                  working professional, or someone looking for a temporary home, NiwasNest connects you with 
                  verified properties and trusted hosts across India.
                </p>
              </div>
            </section>

            {/* Our Story */}
            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">Our Story</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                <div className="space-y-4 text-gray-700">
                  <p>
                    Founded in 2024, NiwasNest was born from a simple yet powerful idea: everyone deserves 
                    a safe, comfortable, and affordable place to call home, no matter where life takes them.
                  </p>
                  <p>
                    Our founders experienced firsthand the challenges of finding quality accommodation in 
                    new cities - from endless property visits to dealing with unreliable landlords and 
                    hidden costs. This inspired us to create a platform that prioritizes transparency, 
                    trust, and user experience.
                  </p>
                  <p>
                    Today, we're proud to serve thousands of users across India, helping them find their 
                    perfect nest with just a few clicks.
                  </p>
                </div>
                <div className="rounded-xl p-8" style={{ backgroundColor: 'rgba(222, 242, 241, 0.5)' }}>
                  <div className="text-center">
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <div className="text-3xl font-bold" style={{ color: '#3AAFA9' }}>1000+</div>
                        <div className="text-sm text-gray-600">Properties Listed</div>
                      </div>
                      <div>
                        <div className="text-3xl font-bold" style={{ color: '#2B7A78' }}>5000+</div>
                        <div className="text-sm text-gray-600">Happy Guests</div>
                      </div>
                      <div>
                        <div className="text-3xl font-bold" style={{ color: '#3AAFA9' }}>50+</div>
                        <div className="text-sm text-gray-600">Cities Covered</div>
                      </div>
                      <div>
                        <div className="text-3xl font-bold" style={{ color: '#2B7A78' }}>4.8★</div>
                        <div className="text-sm text-gray-600">Average Rating</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Our Mission */}
            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">Our Mission</h2>
              <div className="rounded-xl p-8" style={{ backgroundColor: 'rgba(58, 175, 169, 0.1)' }}>
                <p className="text-lg text-gray-700 text-center italic">
                  "To make quality accommodation accessible, affordable, and hassle-free for everyone, 
                  while building a community of trust between guests and property owners."
                </p>
              </div>
            </section>

            {/* Our Values */}
            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">Our Values</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="text-center p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(58, 175, 169, 0.1)' }}>
                    <FaShieldAlt className="text-2xl" style={{ color: '#3AAFA9' }} />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Trust & Safety</h3>
                  <p className="text-gray-600 text-sm">
                    Every property and user is verified to ensure a safe and secure experience for everyone.
                  </p>
                </div>

                <div className="text-center p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(43, 122, 120, 0.1)' }}>
                    <FaHeart className="text-2xl" style={{ color: '#2B7A78' }} />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Customer First</h3>
                  <p className="text-gray-600 text-sm">
                    Your satisfaction is our priority. We're here to support you every step of the way.
                  </p>
                </div>

                <div className="text-center p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(58, 175, 169, 0.1)' }}>
                    <FaStar className="text-2xl" style={{ color: '#3AAFA9' }} />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Quality</h3>
                  <p className="text-gray-600 text-sm">
                    We maintain high standards for all properties and services on our platform.
                  </p>
                </div>

                <div className="text-center p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(43, 122, 120, 0.1)' }}>
                    <FaHandshake className="text-2xl" style={{ color: '#2B7A78' }} />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Transparency</h3>
                  <p className="text-gray-600 text-sm">
                    No hidden fees, no surprises. What you see is what you get.
                  </p>
                </div>

                <div className="text-center p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(58, 175, 169, 0.1)' }}>
                    <FaUsers className="text-2xl" style={{ color: '#3AAFA9' }} />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Community</h3>
                  <p className="text-gray-600 text-sm">
                    Building connections and fostering a sense of belonging wherever you stay.
                  </p>
                </div>

                <div className="text-center p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(43, 122, 120, 0.1)' }}>
                    <FaHome className="text-2xl" style={{ color: '#2B7A78' }} />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Innovation</h3>
                  <p className="text-gray-600 text-sm">
                    Continuously improving our platform with the latest technology and user feedback.
                  </p>
                </div>
              </div>
            </section>

            {/* How We Work */}
            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">How We Work</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="w-12 h-12 mx-auto mb-4 rounded-full flex items-center justify-center text-white font-bold text-xl" style={{ backgroundColor: '#3AAFA9' }}>
                    1
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Search & Discover</h3>
                  <p className="text-gray-600 text-sm">
                    Browse through our curated collection of verified properties in your preferred location.
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-12 h-12 mx-auto mb-4 rounded-full flex items-center justify-center text-white font-bold text-xl" style={{ backgroundColor: '#2B7A78' }}>
                    2
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Book Securely</h3>
                  <p className="text-gray-600 text-sm">
                    Pay just 20% advance through our secure payment gateway to confirm your booking.
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-12 h-12 mx-auto mb-4 rounded-full flex items-center justify-center text-white font-bold text-xl" style={{ backgroundColor: '#3AAFA9' }}>
                    3
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Move In</h3>
                  <p className="text-gray-600 text-sm">
                    Complete the remaining payment to the owner and enjoy your comfortable stay.
                  </p>
                </div>
              </div>
            </section>

            {/* Why Choose Us */}
            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">Why Choose NiwasNest?</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center mt-1" style={{ backgroundColor: '#3AAFA9' }}>
                      <span className="text-white text-xs">✓</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Verified Properties</h4>
                      <p className="text-gray-600 text-sm">Every property is personally verified by our team</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center mt-1" style={{ backgroundColor: '#3AAFA9' }}>
                      <span className="text-white text-xs">✓</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Flexible Payments</h4>
                      <p className="text-gray-600 text-sm">Pay only 20% advance, rest directly to owner</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center mt-1" style={{ backgroundColor: '#3AAFA9' }}>
                      <span className="text-white text-xs">✓</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">24/7 Support</h4>
                      <p className="text-gray-600 text-sm">Round-the-clock customer support for all your needs</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center mt-1" style={{ backgroundColor: '#2B7A78' }}>
                      <span className="text-white text-xs">✓</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">No Hidden Fees</h4>
                      <p className="text-gray-600 text-sm">Transparent pricing with no surprise charges</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center mt-1" style={{ backgroundColor: '#2B7A78' }}>
                      <span className="text-white text-xs">✓</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Easy Cancellation</h4>
                      <p className="text-gray-600 text-sm">Flexible cancellation policy for your peace of mind</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center mt-1" style={{ backgroundColor: '#2B7A78' }}>
                      <span className="text-white text-xs">✓</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Quality Assurance</h4>
                      <p className="text-gray-600 text-sm">Regular quality checks and user feedback monitoring</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Contact Section */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">Get in Touch</h2>
              <div className="rounded-xl p-8" style={{ backgroundColor: 'rgba(222, 242, 241, 0.5)' }}>
                <div className="text-center">
                  <p className="text-gray-700 mb-6">
                    Have questions or want to learn more about NiwasNest? We'd love to hear from you!
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-gray-700">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Email Us</h4>
                      <p className="text-sm">niwasnest2026@gmail.com</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Call Us</h4>
                      <p className="text-sm">+91 63048 09598</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">WhatsApp</h4>
                      <p className="text-sm">+91 63048 09598</p>
                    </div>
                  </div>
                  <div className="mt-6">
                    <Link 
                      href="/contact" 
                      className="inline-block px-8 py-3 text-white font-semibold rounded-lg transition-all hover:shadow-lg"
                      style={{ backgroundColor: '#3AAFA9' }}
                    >
                      Contact Us
                    </Link>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}