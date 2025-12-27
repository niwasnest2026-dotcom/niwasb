import Link from 'next/link';

export default function CancellationPolicy() {
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
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Cancellation and Refunds Policy</h1>
            <p className="text-gray-600">Last updated: December 24, 2024</p>
          </div>

          <div className="prose max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Cancellation Policy Overview</h2>
              <p className="text-gray-700 mb-4">
                At NiwasNest, we understand that plans can change. Our cancellation policy is designed to be fair to both guests and property owners while providing flexibility when possible.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Standard Cancellation Policy</h2>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                <h3 className="text-lg font-semibold text-blue-900 mb-3">Free Cancellation Period</h3>
                <p className="text-blue-800">
                  <strong>24 Hours:</strong> Free cancellation up to 24 hours before your scheduled check-in date with full refund of advance payment.
                </p>
              </div>

              <div className="space-y-4 text-gray-700">
                <div className="border-l-4 border-yellow-400 pl-4">
                  <h4 className="font-semibold text-gray-900">Less than 24 Hours Before Check-in:</h4>
                  <p>Cancellations made less than 24 hours before check-in are subject to a 50% cancellation fee.</p>
                </div>
                
                <div className="border-l-4 border-red-400 pl-4">
                  <h4 className="font-semibold text-gray-900">No-Show Policy:</h4>
                  <p>If you don't show up without prior cancellation, the full advance payment will be forfeited.</p>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Property-Specific Policies</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  Some properties may have their own specific cancellation policies that differ from our standard policy. 
                  These will be clearly displayed on the property listing page before you make your booking.
                </p>
                <p>
                  <strong>Premium Properties:</strong> Some premium properties may have stricter cancellation policies due to high demand.
                </p>
                <p>
                  <strong>Long-term Stays:</strong> Properties offering monthly or longer stays may have different cancellation terms.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Refund Process</h2>
              <div className="space-y-4 text-gray-700">
                <h3 className="text-lg font-semibold text-gray-900">Refund Timeline:</h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong>Credit/Debit Cards:</strong> 5-7 business days</li>
                  <li><strong>UPI/Digital Wallets:</strong> 2-3 business days</li>
                  <li><strong>Net Banking:</strong> 3-5 business days</li>
                </ul>
                
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mt-4">
                  <p className="text-sm text-gray-600">
                    <strong>Note:</strong> Refund processing times may vary depending on your bank or payment provider. 
                    We initiate refunds immediately upon cancellation approval.
                  </p>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. How to Cancel Your Booking</h2>
              <div className="space-y-4 text-gray-700">
                <h3 className="text-lg font-semibold text-gray-900">Online Cancellation:</h3>
                <ol className="list-decimal list-inside space-y-2 ml-4">
                  <li>Log in to your NiwasNest account</li>
                  <li>Go to "My Bookings" section</li>
                  <li>Find your booking and click "Cancel Booking"</li>
                  <li>Follow the cancellation process</li>
                  <li>You'll receive a confirmation email</li>
                </ol>

                <h3 className="text-lg font-semibold text-gray-900 mt-6">Contact Support:</h3>
                <div className="rounded-lg p-4" style={{ backgroundColor: 'rgba(58, 175, 169, 0.1)', borderColor: 'rgba(58, 175, 169, 0.3)', border: '1px solid' }}>
                  <p><strong>Phone:</strong> +91 63048 09598</p>
                  <p><strong>Email:</strong> niwasnest2026@gmail.com</p>
                  <p><strong>WhatsApp:</strong> +91 63048 09598</p>
                  <p><strong>Support Hours:</strong> 9:00 AM - 9:00 PM (All days)</p>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Special Circumstances</h2>
              <div className="space-y-4 text-gray-700">
                <h3 className="text-lg font-semibold text-gray-900">Emergency Situations:</h3>
                <p>
                  In case of medical emergencies, natural disasters, or other unforeseen circumstances, 
                  we may waive cancellation fees on a case-by-case basis. Please contact our support team with relevant documentation.
                </p>

                <h3 className="text-lg font-semibold text-gray-900">Property Issues:</h3>
                <p>
                  If a property becomes unavailable due to issues on the owner's side, you will receive a full refund 
                  or be offered alternative accommodation of similar or better quality.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Security Deposit Refunds</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  Security deposits are handled directly by property owners and are separate from our cancellation policy.
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Security deposits are refundable upon checkout, subject to property inspection</li>
                  <li>Deductions may be made for damages or violations of property rules</li>
                  <li>Disputes regarding security deposits should be resolved directly with the property owner</li>
                  <li>NiwasNest can mediate disputes if needed</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Modification Policy</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  <strong>Date Changes:</strong> Subject to availability and may incur additional charges if the new dates have different pricing.
                </p>
                <p>
                  <strong>Room Changes:</strong> Changes to room type or sharing arrangements are subject to availability and price differences.
                </p>
                <p>
                  <strong>Guest Changes:</strong> Changes to guest information must be made at least 24 hours before check-in.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Contact Us</h2>
              <p className="text-gray-700 mb-4">
                If you have any questions about our cancellation and refunds policy, please don't hesitate to contact us:
              </p>
              <div className="text-gray-700 space-y-2">
                <p><strong>Email:</strong> niwasnest2026@gmail.com</p>
                <p><strong>Phone:</strong> +91 63048 09598</p>
                <p><strong>WhatsApp:</strong> +91 63048 09598</p>
                <p><strong>Address:</strong> Bangalore, Karnataka, India</p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}