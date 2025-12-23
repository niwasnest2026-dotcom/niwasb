import Link from 'next/link';
import { FaArrowLeft, FaHome, FaUsers, FaShieldAlt, FaHeart } from 'react-icons/fa';

export default function AboutPage() {
  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <Link href="/" className="inline-flex items-center text-primary hover:text-primary-dark mb-6 transition-colors">
            <FaArrowLeft className="mr-2" />
            Back to Home
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-4">
            About <span className="text-primary">Niwas Nest</span>
          </h1>
          <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
            Your trusted partner in finding the perfect home away from home
          </p>
        </div>

        {/* Main Content */}
        <div className="glass-card rounded-2xl shadow-glass-lg p-8 mb-12">
          <div className="prose prose-lg max-w-none">
            <h2 className="text-2xl font-bold text-neutral-900 mb-4">Our Story</h2>
            <p className="text-neutral-700 mb-6">
              Niwas Nest was founded with a simple mission: to make finding quality student housing and co-living spaces 
              as easy and transparent as possible. We understand the challenges students and young professionals face when 
              searching for accommodation in new cities, and we're here to bridge that gap.
            </p>

            <h2 className="text-2xl font-bold text-neutral-900 mb-4">What We Do</h2>
            <p className="text-neutral-700 mb-6">
              We connect students and young professionals with verified, affordable, and safe accommodation options across India. 
              Our platform eliminates the hassle of dealing with brokers and provides a direct connection between property 
              owners and tenants.
            </p>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="glass-card rounded-xl p-6 text-center hover:shadow-glass-lg transition-all">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaHome className="text-2xl text-primary" />
            </div>
            <h3 className="text-lg font-bold text-neutral-900 mb-2">Verified Properties</h3>
            <p className="text-neutral-600 text-sm">
              All our listings are personally verified for quality and safety
            </p>
          </div>

          <div className="glass-card rounded-xl p-6 text-center hover:shadow-glass-lg transition-all">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaUsers className="text-2xl text-primary" />
            </div>
            <h3 className="text-lg font-bold text-neutral-900 mb-2">Zero Brokerage</h3>
            <p className="text-neutral-600 text-sm">
              Connect directly with property owners without any brokerage fees
            </p>
          </div>

          <div className="glass-card rounded-xl p-6 text-center hover:shadow-glass-lg transition-all">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaShieldAlt className="text-2xl text-primary" />
            </div>
            <h3 className="text-lg font-bold text-neutral-900 mb-2">Secure Booking</h3>
            <p className="text-neutral-600 text-sm">
              Safe and secure payment process with instant booking confirmation
            </p>
          </div>

          <div className="glass-card rounded-xl p-6 text-center hover:shadow-glass-lg transition-all">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaHeart className="text-2xl text-primary" />
            </div>
            <h3 className="text-lg font-bold text-neutral-900 mb-2">24/7 Support</h3>
            <p className="text-neutral-600 text-sm">
              Our team is always here to help you with any questions or concerns
            </p>
          </div>
        </div>

        {/* Mission & Vision */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="glass-card rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-neutral-900 mb-4">Our Mission</h2>
            <p className="text-neutral-700">
              To revolutionize the student housing experience by providing a transparent, secure, and user-friendly 
              platform that connects students with quality accommodation options across India.
            </p>
          </div>

          <div className="glass-card rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-neutral-900 mb-4">Our Vision</h2>
            <p className="text-neutral-700">
              To become India's most trusted platform for student housing, where every student can find their perfect 
              home away from home with confidence and ease.
            </p>
          </div>
        </div>

        {/* Call to Action */}
        <div className="glass-card rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-bold text-neutral-900 mb-4">Ready to Find Your Perfect Home?</h2>
          <p className="text-neutral-600 mb-6">
            Join thousands of students who have found their ideal accommodation through Niwas Nest
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/listings"
              className="px-8 py-3 bg-primary hover:bg-primary-dark text-white font-semibold rounded-lg transition-all"
            >
              Browse Properties
            </Link>
            <Link
              href="/contact"
              className="px-8 py-3 border border-primary text-primary hover:bg-primary hover:text-white font-semibold rounded-lg transition-all"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}