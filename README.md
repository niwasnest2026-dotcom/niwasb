# NiwasNest - Property Booking Platform

A modern, clean property booking platform built with Next.js, Supabase, and Razorpay integration.

## 🚀 Features

- **Property Listings**: Browse and search properties with detailed information
- **User Authentication**: Google OAuth integration via Supabase
- **Secure Payments**: Razorpay integration for advance payments (20%)
- **Booking Management**: User and admin booking management
- **Responsive Design**: Modern UI with Tailwind CSS
- **Real-time Database**: Supabase for data management

## 🛠 Tech Stack

- **Frontend**: Next.js 13, React, TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth with Google OAuth
- **Payments**: Razorpay
- **Deployment**: Vercel

## 📁 Project Structure

```
├── app/                    # Next.js 13 app directory
│   ├── api/               # API routes
│   │   ├── create-order/  # Razorpay order creation
│   │   ├── verify-payment/ # Payment verification
│   │   └── razorpay-webhook/ # Webhook handling
│   ├── admin/             # Admin dashboard
│   ├── bookings/          # User bookings page
│   ├── booking-summary/   # Booking confirmation
│   ├── listings/          # Property listings
│   ├── login/             # Authentication pages
│   └── ...               # Other pages
├── components/            # Reusable components
│   ├── Header.tsx
│   ├── Footer.tsx
│   ├── RazorpayPayment.tsx
│   └── ...
├── contexts/              # React contexts
│   └── AuthContext.tsx
├── lib/                   # Utilities
│   ├── supabase.ts
│   └── env-config.ts
└── types/                 # TypeScript types
    └── database.ts
```

## 🔧 Environment Variables

Create a `.env.local` file with:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Razorpay Configuration
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_secret

# Site Configuration
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

## 🚀 Getting Started

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd niwasnest
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   - Copy `.env.example` to `.env.local`
   - Fill in your Supabase and Razorpay credentials

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

## 📊 Database Schema

The application uses the following main tables:

- **properties**: Property listings with details
- **bookings**: User bookings and payment information
- **profiles**: User profile information
- **property_images**: Property image galleries
- **amenities**: Property amenities

## 💳 Payment Flow

1. User selects a property and fills booking details
2. System creates Razorpay order (20% advance payment)
3. User completes payment via Razorpay
4. Payment is verified using signature validation
5. Booking is automatically created with 'booked' status
6. User receives confirmation and can view in "My Bookings"

## 🔐 Security Features

- Server-side payment verification
- Secure environment variable handling
- Authentication required for all booking operations
- Input validation and sanitization

## 🎨 UI/UX Features

- Modern gradient design with orange/blue theme
- Responsive layout for all devices
- Loading states and error handling
- Clean, intuitive user interface

## 📱 Key Pages

- **Home**: Hero section with search and featured properties
- **Listings**: Property search and filtering
- **Property Details**: Individual property information
- **Booking Summary**: Payment and confirmation
- **My Bookings**: User booking management
- **Admin Dashboard**: Booking and property management

## 🔄 Deployment

The application is configured for Vercel deployment:

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

## 📞 Support

For support, contact:
- Email: niwasnest2026@gmail.com
- Phone: +91 63048 09598
- WhatsApp: Available 9 AM - 9 PM

---

Built with ❤️ for modern property booking needs.