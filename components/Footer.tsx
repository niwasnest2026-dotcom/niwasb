import Link from 'next/link';
import { FaLinkedinIn, FaPhone, FaEnvelope, FaWhatsapp, FaMapMarkerAlt } from 'react-icons/fa';

export default function Footer() {
  return (
    <footer className="mt-auto border-t" style={{ 
      backgroundColor: 'rgba(23, 37, 42, 0.95)', 
      backdropFilter: 'blur(12px)',
      borderColor: 'rgba(43, 122, 120, 0.3)'
    }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="col-span-1 md:col-span-1">
            <h2 className="text-2xl font-bold mb-4">
              <span style={{ color: '#3AAFA9' }}>Niwas</span> <span className="text-white">Nest</span>
            </h2>
            <p className="text-sm leading-relaxed text-gray-300 mb-4">
              Your trusted partner in finding the perfect home away from home. Making quality accommodation accessible and affordable for everyone.
            </p>
            <div className="flex space-x-3">
              <a
                href="https://wa.me/916304809598"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-110"
                style={{ backgroundColor: 'rgba(58, 175, 169, 0.2)' }}
              >
                <FaWhatsapp className="text-sm" style={{ color: '#3AAFA9' }} />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-110"
                style={{ backgroundColor: 'rgba(43, 122, 120, 0.2)' }}
              >
                <FaLinkedinIn className="text-sm" style={{ color: '#2B7A78' }} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-sm text-gray-300 hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/listings" className="text-sm text-gray-300 hover:text-white transition-colors">
                  Properties
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-sm text-gray-300 hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-sm text-gray-300 hover:text-white transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/help" className="text-sm text-gray-300 hover:text-white transition-colors">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-sm text-gray-300 hover:text-white transition-colors">
                  Blog
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & Policies */}
          <div>
            <h3 className="text-white font-semibold mb-4">Legal & Policies</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/terms" className="text-sm text-gray-300 hover:text-white transition-colors">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-sm text-gray-300 hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/cancellation" className="text-sm text-gray-300 hover:text-white transition-colors">
                  Cancellation Policy
                </Link>
              </li>
              <li>
                <Link href="/sitemap" className="text-sm text-gray-300 hover:text-white transition-colors">
                  Sitemap
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-white font-semibold mb-4">Contact Info</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <FaPhone className="text-sm" style={{ color: '#3AAFA9' }} />
                <a href="tel:+916304809598" className="text-sm text-gray-300 hover:text-white transition-colors">
                  +91 63048 09598
                </a>
              </div>
              <div className="flex items-center space-x-3">
                <FaEnvelope className="text-sm" style={{ color: '#2B7A78' }} />
                <a href="mailto:niwasnest2026@gmail.com" className="text-sm text-gray-300 hover:text-white transition-colors">
                  niwasnest2026@gmail.com
                </a>
              </div>
              <div className="flex items-center space-x-3">
                <FaWhatsapp className="text-sm" style={{ color: '#3AAFA9' }} />
                <a href="https://wa.me/916304809598" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-300 hover:text-white transition-colors">
                  WhatsApp Support
                </a>
              </div>
              <div className="flex items-center space-x-3">
                <FaMapMarkerAlt className="text-sm" style={{ color: '#2B7A78' }} />
                <span className="text-sm text-gray-300">
                  Bangalore, Karnataka, India
                </span>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t" style={{ borderColor: 'rgba(43, 122, 120, 0.3)' }}>
              <p className="text-xs text-gray-400 mb-2">Support Hours:</p>
              <p className="text-sm text-gray-300">9:00 AM - 9:00 PM (All days)</p>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t mt-8 pt-6" style={{ borderColor: 'rgba(43, 122, 120, 0.3)' }}>
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-center md:text-left">
              <p className="text-sm text-gray-300">
                &copy; {new Date().getFullYear()} NiwasNest. All rights reserved.
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Making quality accommodation accessible for everyone
              </p>
            </div>
            
            <div className="flex flex-wrap justify-center md:justify-end gap-4 text-xs">
              <Link href="/terms" className="text-gray-400 hover:text-white transition-colors">
                Terms
              </Link>
              <span className="text-gray-600">•</span>
              <Link href="/privacy" className="text-gray-400 hover:text-white transition-colors">
                Privacy
              </Link>
              <span className="text-gray-600">•</span>
              <Link href="/cancellation" className="text-gray-400 hover:text-white transition-colors">
                Cancellation
              </Link>
              <span className="text-gray-600">•</span>
              <Link href="/help" className="text-gray-400 hover:text-white transition-colors">
                Help
              </Link>
            </div>
          </div>
          
          {/* Trust Indicators */}
          <div className="mt-6 pt-4 border-t text-center" style={{ borderColor: 'rgba(43, 122, 120, 0.2)' }}>
            <div className="flex flex-wrap justify-center items-center gap-6 text-xs text-gray-400">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#3AAFA9' }}></div>
                <span>Verified Properties</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#2B7A78' }}></div>
                <span>Secure Payments</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#3AAFA9' }}></div>
                <span>24/7 Support</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#2B7A78' }}></div>
                <span>No Hidden Fees</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
