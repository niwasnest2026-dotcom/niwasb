import Link from 'next/link';

export default function PrivacyPolicy() {
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
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
            <p className="text-gray-600">Last updated: December 24, 2024</p>
          </div>

          <div className="prose max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Introduction</h2>
              <p className="text-gray-700 mb-4">
                At NiwasNest ("we," "our," or "us"), we are committed to protecting your privacy and ensuring the security of your personal information. 
                This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Information We Collect</h2>
              
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Personal Information</h3>
              <div className="space-y-4 text-gray-700 mb-6">
                <p>When you create an account or make a booking, we may collect:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong>Contact Information:</strong> Name, email address, phone number</li>
                  <li><strong>Identity Information:</strong> Government ID details for verification</li>
                  <li><strong>Payment Information:</strong> Credit/debit card details, UPI information</li>
                  <li><strong>Profile Information:</strong> Profile picture, preferences, emergency contacts</li>
                </ul>
              </div>

              <h3 className="text-lg font-semibold text-gray-900 mb-3">Usage Information</h3>
              <div className="space-y-4 text-gray-700 mb-6">
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong>Device Information:</strong> IP address, browser type, device type</li>
                  <li><strong>Usage Data:</strong> Pages visited, time spent, search queries</li>
                  <li><strong>Location Data:</strong> Approximate location for property recommendations</li>
                  <li><strong>Communication Data:</strong> Messages, reviews, support interactions</li>
                </ul>
              </div>

              <h3 className="text-lg font-semibold text-gray-900 mb-3">Third-Party Information</h3>
              <div className="space-y-4 text-gray-700">
                <p>When you sign up using social media accounts (Google, Facebook), we may receive:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Basic profile information (name, email, profile picture)</li>
                  <li>Public profile information as permitted by your privacy settings</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. How We Use Your Information</h2>
              <div className="space-y-4 text-gray-700">
                <h3 className="text-lg font-semibold text-gray-900">Service Provision:</h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Process bookings and payments</li>
                  <li>Facilitate communication between guests and property owners</li>
                  <li>Provide customer support</li>
                  <li>Send booking confirmations and updates</li>
                </ul>

                <h3 className="text-lg font-semibold text-gray-900 mt-6">Platform Improvement:</h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Analyze usage patterns to improve our services</li>
                  <li>Personalize your experience and recommendations</li>
                  <li>Develop new features and services</li>
                  <li>Conduct research and analytics</li>
                </ul>

                <h3 className="text-lg font-semibold text-gray-900 mt-6">Communication:</h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Send important service updates and notifications</li>
                  <li>Respond to your inquiries and support requests</li>
                  <li>Send promotional offers (with your consent)</li>
                  <li>Conduct surveys and feedback collection</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Information Sharing and Disclosure</h2>
              <div className="space-y-4 text-gray-700">
                <h3 className="text-lg font-semibold text-gray-900">With Property Owners:</h3>
                <p>
                  We share necessary booking information (name, contact details, check-in dates) with property owners to facilitate your stay.
                </p>

                <h3 className="text-lg font-semibold text-gray-900 mt-6">With Service Providers:</h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Payment processors for transaction processing</li>
                  <li>Cloud storage providers for data hosting</li>
                  <li>Email and SMS service providers for communications</li>
                  <li>Analytics providers for service improvement</li>
                </ul>

                <h3 className="text-lg font-semibold text-gray-900 mt-6">Legal Requirements:</h3>
                <p>
                  We may disclose your information if required by law, court order, or government request, 
                  or to protect our rights, property, or safety.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Data Security</h2>
              <div className="space-y-4 text-gray-700">
                <p>We implement appropriate security measures to protect your personal information:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong>Encryption:</strong> All sensitive data is encrypted in transit and at rest</li>
                  <li><strong>Access Controls:</strong> Limited access to personal information on a need-to-know basis</li>
                  <li><strong>Regular Audits:</strong> Regular security assessments and updates</li>
                  <li><strong>Secure Infrastructure:</strong> Use of secure cloud services and databases</li>
                </ul>
                
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
                  <p className="text-sm text-yellow-800">
                    <strong>Note:</strong> While we strive to protect your information, no method of transmission over the internet 
                    or electronic storage is 100% secure. We cannot guarantee absolute security.
                  </p>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Your Rights and Choices</h2>
              <div className="space-y-4 text-gray-700">
                <h3 className="text-lg font-semibold text-gray-900">Access and Update:</h3>
                <p>You can access and update your personal information through your account settings.</p>

                <h3 className="text-lg font-semibold text-gray-900">Data Portability:</h3>
                <p>You can request a copy of your personal data in a structured, machine-readable format.</p>

                <h3 className="text-lg font-semibold text-gray-900">Deletion:</h3>
                <p>You can request deletion of your account and personal data, subject to legal retention requirements.</p>

                <h3 className="text-lg font-semibold text-gray-900">Marketing Communications:</h3>
                <p>You can opt-out of promotional emails by clicking the unsubscribe link or contacting us.</p>

                <h3 className="text-lg font-semibold text-gray-900">Cookie Preferences:</h3>
                <p>You can manage cookie preferences through your browser settings.</p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Cookies and Tracking Technologies</h2>
              <div className="space-y-4 text-gray-700">
                <p>We use cookies and similar technologies to:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Remember your preferences and settings</li>
                  <li>Analyze website traffic and usage patterns</li>
                  <li>Provide personalized content and advertisements</li>
                  <li>Improve website functionality and user experience</li>
                </ul>
                
                <p className="mt-4">
                  You can control cookies through your browser settings, but disabling cookies may affect website functionality.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Data Retention</h2>
              <div className="space-y-4 text-gray-700">
                <p>We retain your personal information for as long as necessary to:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Provide our services to you</li>
                  <li>Comply with legal obligations</li>
                  <li>Resolve disputes and enforce agreements</li>
                  <li>Improve our services and prevent fraud</li>
                </ul>
                
                <p className="mt-4">
                  When you delete your account, we will delete or anonymize your personal information within 30 days, 
                  except where retention is required by law.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Children's Privacy</h2>
              <p className="text-gray-700 mb-4">
                Our services are not intended for children under 18 years of age. We do not knowingly collect personal information 
                from children under 18. If you are a parent or guardian and believe your child has provided us with personal information, 
                please contact us immediately.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. International Data Transfers</h2>
              <p className="text-gray-700 mb-4">
                Your information may be transferred to and processed in countries other than your own. 
                We ensure appropriate safeguards are in place to protect your information in accordance with this Privacy Policy.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Changes to This Privacy Policy</h2>
              <p className="text-gray-700 mb-4">
                We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new 
                Privacy Policy on our website and updating the "Last updated" date. Your continued use of our services after any 
                changes constitutes acceptance of the updated Privacy Policy.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Contact Us</h2>
              <p className="text-gray-700 mb-4">
                If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us:
              </p>
              <div className="rounded-lg p-4" style={{ backgroundColor: 'rgba(58, 175, 169, 0.1)', borderColor: 'rgba(58, 175, 169, 0.3)', border: '1px solid' }}>
                <div className="text-gray-700 space-y-2">
                  <p><strong>Email:</strong> niwasnest2026@gmail.com</p>
                  <p><strong>Phone:</strong> +91 63048 09598</p>
                  <p><strong>WhatsApp:</strong> +91 63048 09598</p>
                  <p><strong>Address:</strong> Bangalore, Karnataka, India</p>
                  <p><strong>Support Hours:</strong> 9:00 AM - 9:00 PM (All days)</p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}