'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FaSearch, FaChevronDown, FaChevronUp, FaQuestionCircle, FaBook, FaHeadset, FaShieldAlt } from 'react-icons/fa';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

const faqData: FAQItem[] = [
  // Booking & Payments
  {
    id: '1',
    category: 'Booking & Payments',
    question: 'How do I book a property on NiwasNest?',
    answer: 'To book a property: 1) Search for properties in your preferred location, 2) Select a property and room type, 3) Fill in your details, 4) Pay 20% advance through our secure payment gateway, 5) Receive booking confirmation via email.'
  },
  {
    id: '2',
    category: 'Booking & Payments',
    question: 'What payment methods do you accept?',
    answer: 'We accept all major credit/debit cards, UPI (GPay, PhonePe, Paytm), net banking, and digital wallets through our secure Razorpay payment gateway.'
  },
  {
    id: '3',
    category: 'Booking & Payments',
    question: 'Why do I only pay 20% advance?',
    answer: 'Our 20% advance payment model ensures you secure your booking while keeping the majority of payment (80%) to be paid directly to the property owner, reducing transaction costs and building trust.'
  },
  {
    id: '4',
    category: 'Booking & Payments',
    question: 'When do I pay the remaining 80%?',
    answer: 'The remaining 80% is paid directly to the property owner as per the agreed terms, typically upon check-in or as specified in your booking agreement.'
  },
  {
    id: '5',
    category: 'Booking & Payments',
    question: 'Is my payment information secure?',
    answer: 'Yes, all payments are processed through Razorpay, a PCI DSS compliant payment gateway. We use SSL encryption and do not store your payment information on our servers.'
  },

  // Cancellation & Refunds
  {
    id: '6',
    category: 'Cancellation & Refunds',
    question: 'Can I cancel my booking?',
    answer: 'Yes, you can cancel your booking up to 24 hours before check-in for a full refund. Cancellations made less than 24 hours before check-in are subject to a 50% cancellation fee.'
  },
  {
    id: '7',
    category: 'Cancellation & Refunds',
    question: 'How long does it take to receive my refund?',
    answer: 'Refunds are processed within 5-7 business days for credit/debit cards, 2-3 business days for UPI/digital wallets, and 3-5 business days for net banking.'
  },
  {
    id: '8',
    category: 'Cancellation & Refunds',
    question: 'What if I need to cancel due to an emergency?',
    answer: 'In case of medical emergencies, natural disasters, or other unforeseen circumstances, we may waive cancellation fees on a case-by-case basis. Please contact our support team with relevant documentation.'
  },

  // Properties & Verification
  {
    id: '9',
    category: 'Properties & Verification',
    question: 'Are all properties verified?',
    answer: 'Yes, every property on NiwasNest is personally verified by our team. We check the property condition, amenities, safety features, and ensure all information is accurate.'
  },
  {
    id: '10',
    category: 'Properties & Verification',
    question: 'What if the property doesn\'t match the listing?',
    answer: 'If a property doesn\'t match the listing, please contact us immediately. We will work with the property owner to resolve the issue or provide alternative accommodation.'
  },
  {
    id: '11',
    category: 'Properties & Verification',
    question: 'How do I know if a property is available?',
    answer: 'Property availability is updated in real-time. If you can see the "Book Now" button, the property is available for your selected dates.'
  },

  // Account & Profile
  {
    id: '12',
    category: 'Account & Profile',
    question: 'Do I need to create an account to book?',
    answer: 'While you can browse properties without an account, you need to provide your details during the booking process. Creating an account helps you manage your bookings and preferences.'
  },
  {
    id: '13',
    category: 'Account & Profile',
    question: 'How do I update my booking details?',
    answer: 'You can update certain booking details by contacting our support team. Changes are subject to availability and may incur additional charges if applicable.'
  },
  {
    id: '14',
    category: 'Account & Profile',
    question: 'Can I modify my check-in/check-out dates?',
    answer: 'Date modifications are subject to availability and may incur additional charges if the new dates have different pricing. Contact our support team for assistance.'
  },

  // Support & Safety
  {
    id: '15',
    category: 'Support & Safety',
    question: 'How do I contact customer support?',
    answer: 'You can reach us via phone (+91 63048 09598), email (niwasnest2026@gmail.com), or WhatsApp (+91 63048 09598). Our support hours are 9 AM - 9 PM, all days.'
  },
  {
    id: '16',
    category: 'Support & Safety',
    question: 'What safety measures do you have in place?',
    answer: 'We verify all properties and property owners, use secure payment processing, provide 24/7 customer support, and have a review system to maintain quality standards.'
  },
  {
    id: '17',
    category: 'Support & Safety',
    question: 'What if I have issues during my stay?',
    answer: 'Contact our support team immediately if you face any issues during your stay. We will work with the property owner to resolve the problem or provide alternative solutions.'
  }
];

const categories = ['All', 'Booking & Payments', 'Cancellation & Refunds', 'Properties & Verification', 'Account & Profile', 'Support & Safety'];

export default function Help() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const filteredFAQs = faqData.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleExpanded = (id: string) => {
    setExpandedItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  return (
    <div className="min-h-screen py-12 px-4" style={{ 
      background: 'linear-gradient(135deg, #DEF2F1 0%, #FEFFFF 50%, #DEF2F1 100%)',
      backgroundSize: '400% 400%',
      animation: 'gradientShift 20s ease infinite'
    }}>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link href="/" className="hover:underline mb-4 inline-block" style={{ color: '#2B7A78' }}>
            ← Back to Home
          </Link>
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Help Center</h1>
            <p className="text-xl text-gray-600">
              Find answers to frequently asked questions and get the help you need
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="relative">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search for help topics..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-lg"
            />
          </div>
        </div>

        {/* Quick Help Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Link href="/contact" className="bg-white rounded-xl shadow-lg p-6 text-center hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(58, 175, 169, 0.1)' }}>
              <FaHeadset className="text-xl" style={{ color: '#3AAFA9' }} />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Contact Support</h3>
            <p className="text-sm text-gray-600">Get direct help from our team</p>
          </Link>

          <Link href="/about" className="bg-white rounded-xl shadow-lg p-6 text-center hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(43, 122, 120, 0.1)' }}>
              <FaBook className="text-xl" style={{ color: '#2B7A78' }} />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">About Us</h3>
            <p className="text-sm text-gray-600">Learn more about NiwasNest</p>
          </Link>

          <Link href="/terms" className="bg-white rounded-xl shadow-lg p-6 text-center hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(58, 175, 169, 0.1)' }}>
              <FaShieldAlt className="text-xl" style={{ color: '#3AAFA9' }} />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Terms & Policies</h3>
            <p className="text-sm text-gray-600">Read our terms and policies</p>
          </Link>

          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(43, 122, 120, 0.1)' }}>
              <FaQuestionCircle className="text-xl" style={{ color: '#2B7A78' }} />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">FAQs</h3>
            <p className="text-sm text-gray-600">Browse common questions</p>
          </div>
        </div>

        {/* Category Filter */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Browse by Category</h2>
          <div className="flex flex-wrap gap-2">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  selectedCategory === category
                    ? 'text-white shadow-lg'
                    : 'text-gray-600 bg-gray-100 hover:bg-gray-200'
                }`}
                style={selectedCategory === category ? { backgroundColor: '#3AAFA9' } : {}}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* FAQ List */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            {selectedCategory === 'All' ? 'All Questions' : selectedCategory}
            <span className="text-sm font-normal text-gray-500 ml-2">
              ({filteredFAQs.length} {filteredFAQs.length === 1 ? 'question' : 'questions'})
            </span>
          </h2>

          {filteredFAQs.length === 0 ? (
            <div className="text-center py-12">
              <FaQuestionCircle className="text-4xl text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No questions found</h3>
              <p className="text-gray-600 mb-4">
                Try adjusting your search terms or browse different categories.
              </p>
              <Link 
                href="/contact" 
                className="inline-block px-6 py-3 text-white font-semibold rounded-lg transition-all hover:shadow-lg"
                style={{ backgroundColor: '#3AAFA9' }}
              >
                Contact Support
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredFAQs.map(faq => (
                <div key={faq.id} className="border border-gray-200 rounded-lg">
                  <button
                    onClick={() => toggleExpanded(faq.id)}
                    className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">{faq.question}</h3>
                      <span className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor: 'rgba(58, 175, 169, 0.1)', color: '#2B7A78' }}>
                        {faq.category}
                      </span>
                    </div>
                    <div className="ml-4">
                      {expandedItems.includes(faq.id) ? (
                        <FaChevronUp className="text-gray-400" />
                      ) : (
                        <FaChevronDown className="text-gray-400" />
                      )}
                    </div>
                  </button>
                  
                  {expandedItems.includes(faq.id) && (
                    <div className="px-6 pb-4">
                      <div className="pt-4 border-t border-gray-100">
                        <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Still Need Help */}
        <div className="mt-8 bg-white rounded-2xl shadow-lg p-8 text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Still need help?</h2>
          <p className="text-gray-600 mb-6">
            Can't find what you're looking for? Our support team is here to help you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/contact" 
              className="px-8 py-3 text-white font-semibold rounded-lg transition-all hover:shadow-lg"
              style={{ backgroundColor: '#3AAFA9' }}
            >
              Contact Support
            </Link>
            <a 
              href="https://wa.me/916304809598" 
              target="_blank" 
              rel="noopener noreferrer"
              className="px-8 py-3 font-semibold rounded-lg border-2 transition-all hover:shadow-lg"
              style={{ borderColor: '#2B7A78', color: '#2B7A78' }}
            >
              WhatsApp Us
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}