import Link from 'next/link';
import { FaHome, FaSearch, FaBuilding, FaUser, FaQuestionCircle, FaShieldAlt, FaEnvelope, FaBook } from 'react-icons/fa';

export default function Sitemap() {
  const siteLinks = [
    {
      category: 'Main Pages',
      icon: FaHome,
      links: [
        { name: 'Home', href: '/', description: 'Search and discover properties' },
        { name: 'Property Listings', href: '/listings', description: 'Browse all available properties' },
        { name: 'About Us', href: '/about', description: 'Learn about NiwasNest' },
        { name: 'Contact', href: '/contact', description: 'Get in touch with us' },
        { name: 'Help Center', href: '/help', description: 'Find answers to common questions' },
      ]
    },
    {
      category: 'Legal & Policies',
      icon: FaShieldAlt,
      links: [
        { name: 'Terms and Conditions', href: '/terms', description: 'Our terms of service' },
        { name: 'Privacy Policy', href: '/privacy', description: 'How we protect your data' },
        { name: 'Cancellation Policy', href: '/cancellation', description: 'Booking cancellation and refunds' },
      ]
    },
    {
      category: 'User Features',
      icon: FaUser,
      links: [
        { name: 'Payment', href: '/payment', description: 'Secure booking payments' },
        { name: 'Blog', href: '/blog', description: 'Tips and guides for renters' },
      ]
    },
    {
      category: 'Admin (Property Owners)',
      icon: FaBuilding,
      links: [
        { name: 'Admin Dashboard', href: '/admin', description: 'Property management dashboard' },
        { name: 'Add Property', href: '/admin/properties/add', description: 'List your property' },
        { name: 'Manage Properties', href: '/admin/properties', description: 'Manage your listings' },
        { name: 'Blog Management', href: '/admin/blog', description: 'Manage blog posts' },
      ]
    }
  ];

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
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Site Map</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Navigate through all pages and features available on NiwasNest
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {siteLinks.map((section, index) => (
            <div key={index} className="bg-white rounded-2xl shadow-lg p-8">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 rounded-full flex items-center justify-center mr-4" style={{ backgroundColor: 'rgba(58, 175, 169, 0.1)' }}>
                  <section.icon className="text-xl" style={{ color: '#3AAFA9' }} />
                </div>
                <h2 className="text-2xl font-semibold text-gray-900">{section.category}</h2>
              </div>
              
              <div className="space-y-4">
                {section.links.map((link, linkIndex) => (
                  <Link
                    key={linkIndex}
                    href={link.href}
                    className="block p-4 rounded-lg border border-gray-200 hover:shadow-md transition-all hover:border-primary/30"
                  >
                    <h3 className="font-semibold text-gray-900 mb-1">{link.name}</h3>
                    <p className="text-sm text-gray-600">{link.description}</p>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Quick Stats */}
        <div className="mt-12 bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">Platform Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
            <div className="p-4">
              <div className="text-3xl font-bold mb-2" style={{ color: '#3AAFA9' }}>15+</div>
              <div className="text-sm text-gray-600">Total Pages</div>
            </div>
            <div className="p-4">
              <div className="text-3xl font-bold mb-2" style={{ color: '#2B7A78' }}>1000+</div>
              <div className="text-sm text-gray-600">Properties Listed</div>
            </div>
            <div className="p-4">
              <div className="text-3xl font-bold mb-2" style={{ color: '#3AAFA9' }}>50+</div>
              <div className="text-sm text-gray-600">Cities Covered</div>
            </div>
            <div className="p-4">
              <div className="text-3xl font-bold mb-2" style={{ color: '#2B7A78' }}>24/7</div>
              <div className="text-sm text-gray-600">Support Available</div>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="mt-8 bg-white rounded-2xl shadow-lg p-8 text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Need Help Navigating?</h2>
          <p className="text-gray-600 mb-6">
            Our support team is here to help you find what you're looking for.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/contact" 
              className="px-8 py-3 text-white font-semibold rounded-lg transition-all hover:shadow-lg"
              style={{ backgroundColor: '#3AAFA9' }}
            >
              Contact Support
            </Link>
            <Link 
              href="/help" 
              className="px-8 py-3 font-semibold rounded-lg border-2 transition-all hover:shadow-lg"
              style={{ borderColor: '#2B7A78', color: '#2B7A78' }}
            >
              Visit Help Center
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}