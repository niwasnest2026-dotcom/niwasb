import Link from 'next/link';

export default function TermsAndConditions() {
  return (
    <div className="min-h-screen py-12 px-4" style={{ 
      background: 'linear-gradient(135deg, #DEF2F1 0%, #FEFFFF 50%, #DEF2F1 100%)',
      backgroundSize: '400% 400%',
      animation: 'gradientShift 20s ease infinite'
    }}>
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="mb-8">
            <Link href="/" className="hover:underline mb-4 inline-block" style={{ color: '#2B7A78' }}>
              ← Back to Home
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Terms and Conditions</h1>
            <p className="text-gray-600">Last updated: December 24, 2024</p>
          </div>

          <div className="prose max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Acceptance of Terms</h2>
              <p className="text-gray-700 mb-4">
                By accessing and using NiwasNest ("we," "our," or "us"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Booking and Payment Terms</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  <strong>Advance Payment:</strong> A 20% advance payment is required to confirm your booking. The remaining 80% is to be paid directly to the property owner.
                </p>
                <p>
                  <strong>Security Deposit:</strong> Security deposits are set by individual property owners and must be paid as per the property's terms.
                </p>
                <p>
                  <strong>Payment Methods:</strong> We accept online payments through secure payment gateways. All transactions are processed securely.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Property Listings and Accuracy</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  We strive to ensure all property information is accurate and up-to-date. However, we cannot guarantee the complete accuracy of all listings.
                </p>
                <p>
                  Property owners are responsible for providing accurate information about their properties, including amenities, pricing, and availability.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. User Responsibilities</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  <strong>Accurate Information:</strong> You must provide accurate and complete information when making bookings.
                </p>
                <p>
                  <strong>Property Rules:</strong> You agree to follow all property rules and regulations as specified by the property owner.
                </p>
                <p>
                  <strong>Respectful Behavior:</strong> You agree to treat property owners, staff, and other residents with respect.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Cancellation Policy</h2>
              <p className="text-gray-700 mb-4">
                Cancellation policies vary by property. Please refer to the specific property's cancellation policy before booking. 
                For detailed information, please see our <Link href="/cancellation" className="hover:underline" style={{ color: '#3AAFA9' }}>Cancellation and Refunds Policy</Link>.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Limitation of Liability</h2>
              <p className="text-gray-700 mb-4">
                NiwasNest acts as a platform connecting users with property owners. We are not responsible for the condition of properties, 
                disputes between users and property owners, or any damages that may occur during your stay.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Privacy</h2>
              <p className="text-gray-700 mb-4">
                Your privacy is important to us. Please review our <Link href="/privacy" className="hover:underline" style={{ color: '#3AAFA9' }}>Privacy Policy</Link> 
                to understand how we collect, use, and protect your information.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Modifications to Terms</h2>
              <p className="text-gray-700 mb-4">
                We reserve the right to modify these terms at any time. Changes will be effective immediately upon posting on our website. 
                Your continued use of the service constitutes acceptance of the modified terms.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Contact Information</h2>
              <div className="text-gray-700 space-y-2">
                <p><strong>Email:</strong> niwasnest2026@gmail.com</p>
                <p><strong>Phone:</strong> +91 63048 09598</p>
                <p><strong>Address:</strong> Bangalore, Karnataka, India</p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}