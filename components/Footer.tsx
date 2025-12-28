import Link from 'next/link';
import { FaLinkedinIn, FaPhone, FaEnvelope, FaWhatsapp, FaMapMarkerAlt } from 'react-icons/fa';

export default function Footer() {
  return (
    <footer className="mt-auto border-t" style={{ 
      backgroundColor: 'rgba(45, 55, 72, 0.95)', 
      backdropFilter: 'blur(12px)',
      borderColor: 'rgba(99, 179, 237, 0.3)'
    }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="col-span-1 md:col-span-1 min-w-0">
            <h2 className="text-2xl font-bold mb-4 break-words">
              <span style={{ color: '#FF6711' }}>Niwas</span> <span className="text-white">Nest</span>
            </h2>
            <p className="text-sm leading-relaxed text-gray-300 mb-4 break-words">
              Your trusted partner in finding the perfect home away from home. Making quality accommodation accessible and affordable for everyone.
            </p>
            <div className="flex space-x-3">
              <a
                href="https://wa.me/916304809598"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-110 flex-shrink-0"
                style={{ backgroundColor: 'rgba(255, 103, 17, 0.2)' }}
              >
                <FaWhatsapp className="text-sm" style={{ color: '#FF6711' }} />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-110 flex-shrink-0"
                style={{ backgroundColor: 'rgba(99, 179, 237, 0.2)' }}
              >
                <FaLinkedinIn className="text-sm" style={{ color: '#63B3ED' }} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="min-w-0">
            <h3 className="text-white font-semibold mb-4 break-words">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-sm text-gray-300 hover:text-white transition-colors block truncate">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/listings" className="text-sm text-gray-300 hover:text-white transition-colors block truncate">
                  Properties
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-sm text-gray-300 hover:text-white transition-colors block truncate">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-sm text-gray-300 hover:text-white transition-colors block truncate">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/help" className="text-sm text-gray-300 hover:text-white transition-colors block truncate">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-sm text-gray-300 hover:text-white transition-colors block truncate">
                  Blog
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & Policies */}
          <div className="min-w-0">
            <h3 className="text-white font-semibold mb-4 break-words">Legal & Policies</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/terms" className="text-sm text-gray-300 hover:text-white transition-colors block break-words">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-sm text-gray-300 hover:text-white transition-colors block break-words">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/cancellation" className="text-sm text-gray-300 hover:text-white transition-colors block break-words">
                  Cancellation Policy
                </Link>
              </li>
              <li>
                <Link href="/sitemap" className="text-sm text-gray-300 hover:text-white transition-colors block truncate">
                  Sitemap
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="min-w-0">
            <h3 className="text-white font-semibold mb-4 break-words">Contact Info</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 min-w-0">
                <FaPhone className="text-sm flex-shrink-0" style={{ color: '#FF6711' }} />
                <a href="tel:+916304809598" className="text-sm text-gray-300 hover:text-white transition-colors truncate">
                  +91 63048 09598
                </a>
              </div>
              <div className="flex items-center space-x-3 min-w-0">
                <FaEnvelope className="text-sm flex-shrink-0" style={{ color: '#63B3ED' }} />
                <a href="mailto:niwasnest2026@gmail.com" className="text-sm text-gray-300 hover:text-white transition-colors break-all">
                  niwasnest2026@gmail.com
                </a>
              </div>
              <div className="flex items-center space-x-3 min-w-0">
                <FaWhatsapp className="text-sm flex-shrink-0" style={{ color: '#FF6711' }} />
                <a href="https://wa.me/916304809598" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-300 hover:text-white transition-colors break-words">
                  WhatsApp Support
                </a>
              </div>
              <div className="flex items-center space-x-3 min-w-0">
                <FaMapMarkerAlt className="text-sm flex-shrink-0" style={{ color: '#63B3ED' }} />
                <span className="text-sm text-gray-300 break-words">
                  Bangalore, Karnataka, India
                </span>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t" style={{ borderColor: 'rgba(99, 179, 237, 0.3)' }}>
              <p className="text-xs text-gray-400 mb-2 break-words">Support Hours:</p>
              <p className="text-sm text-gray-300 break-words">9:00 AM - 9:00 PM (All days)</p>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t mt-8 pt-6" style={{ borderColor: 'rgba(99, 179, 237, 0.3)' }}>
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0 min-w-0">
            <div className="text-center md:text-left min-w-0 flex-1">
              <p className="text-sm text-gray-300 break-words">
                &copy; {new Date().getFullYear()} NiwasNest. All rights reserved.
              </p>
              <p className="text-xs text-gray-400 mt-1 break-words">
                Making quality accommodation accessible for everyone
              </p>
            </div>
            
            <div className="flex flex-wrap justify-center md:justify-end gap-2 md:gap-4 text-xs min-w-0">
              <Link href="/terms" className="text-gray-400 hover:text-white transition-colors whitespace-nowrap">
                Terms
              </Link>
              <span className="text-gray-600">•</span>
              <Link href="/privacy" className="text-gray-400 hover:text-white transition-colors whitespace-nowrap">
                Privacy
              </Link>
              <span className="text-gray-600">•</span>
              <Link href="/cancellation" className="text-gray-400 hover:text-white transition-colors whitespace-nowrap">
                Cancellation
              </Link>
              <span className="text-gray-600">•</span>
              <Link href="/help" className="text-gray-400 hover:text-white transition-colors whitespace-nowrap">
                Help
              </Link>
            </div>
          </div>
          
          {/* Trust Indicators */}
          <div className="mt-6 pt-4 border-t text-center" style={{ borderColor: 'rgba(99, 179, 237, 0.2)' }}>
            <div className="flex flex-wrap justify-center items-center gap-3 md:gap-6 text-xs text-gray-400">
              <div className="flex items-center space-x-2 whitespace-nowrap">
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: '#FF6711' }}></div>
                <span>Verified Properties</span>
              </div>
              <div className="flex items-center space-x-2 whitespace-nowrap">
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: '#63B3ED' }}></div>
                <span>Secure Payments</span>
              </div>
              <div className="flex items-center space-x-2 whitespace-nowrap">
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: '#FFD082' }}></div>
                <span>24/7 Support</span>
              </div>
              <div className="flex items-center space-x-2 whitespace-nowrap">
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: '#FF6711' }}></div>
                <span>No Hidden Fees</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
