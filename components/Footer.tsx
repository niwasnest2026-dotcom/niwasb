import Link from 'next/link';
import { FaLinkedinIn } from 'react-icons/fa';

export default function Footer() {
  return (
    <footer className="bg-neutral-900/95 backdrop-blur-xl text-neutral-300 mt-auto border-t border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1">
            <h2 className="text-2xl font-bold mb-4">
              <span className="text-primary">Niwas</span> <span className="text-white">Nest</span>
            </h2>
            <p className="text-sm leading-relaxed">
              Your trusted partner in finding the perfect property. Making real estate simple and accessible.
            </p>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-sm hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/listings" className="text-sm hover:text-white transition-colors">
                  Properties
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-sm hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-sm hover:text-white transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/terms" className="text-sm hover:text-white transition-colors">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-sm hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/cancellation" className="text-sm hover:text-white transition-colors">
                  Cancellation & Refunds
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Connect With Us</h3>
            <div className="flex space-x-3 mb-4">
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 bg-neutral-800/50 backdrop-blur-sm rounded-xl flex items-center justify-center hover:bg-neutral-700/50 transition-all duration-300 hover:scale-110"
              >
                <FaLinkedinIn className="text-sm" />
              </a>
            </div>
            <p className="text-sm">
              <a href="mailto:info@example.com" className="hover:text-white transition-colors">
                niwasnest2026@gmail.com
              </a>
            </p>
            <p className="text-sm">
              <a href="tel:+1234567890" className="hover:text-white transition-colors">
                +91 63048 09598
              </a>
            </p>
          </div>
        </div>

        <div className="border-t border-neutral-800 mt-8 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-sm text-center md:text-left">
              &copy; {new Date().getFullYear()} NiwasNest. All rights reserved.
            </p>
            <div className="flex flex-wrap justify-center md:justify-end space-x-6 text-sm">
              <Link href="/terms" className="hover:text-white transition-colors">
                Terms
              </Link>
              <Link href="/privacy" className="hover:text-white transition-colors">
                Privacy
              </Link>
              <Link href="/cancellation" className="hover:text-white transition-colors">
                Refunds
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
