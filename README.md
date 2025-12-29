# Niwas Nest - PG Rental Platform

## 🏠 Project Overview

**Niwas Nest** is a modern, full-featured PG (Paying Guest) rental platform built with Next.js 13, Supabase, and Razorpay. The platform provides a complete solution for managing PG properties, bookings, and payments with a beautiful, mobile-first design.

## ✨ Key Features

### 🔐 **User Management**
- **Secure Authentication**: Email/password login with Supabase Auth
- **User Profiles**: Complete profile management with phone, email, avatar
- **Role-Based Access**: Admin and Tenant roles with appropriate permissions
- **Protected Routes**: Secure admin dashboard and user areas

### 🏢 **Property Management**
- **Complete CRUD Operations**: Add, edit, delete properties via admin panel
- **Rich Property Data**: Name, location, pricing, amenities, images
- **Room-Level Management**: Individual rooms with sharing types (Single, Double, Triple, Quad)
- **Real-Time Availability**: Automatic bed availability tracking
- **Image Management**: Multiple property and room images with display ordering
- **Advanced Search**: Location-based search with autocomplete for areas, colleges, offices

### 📅 **Booking System**
- **Seamless Booking Flow**: Property search → Room selection → Payment → Confirmation
- **Room Selection Interface**: Modern card-based room selection with real-time availability
- **Automatic Confirmation**: Bookings confirmed immediately upon payment
- **Booking Management**: Users can view their booking history
- **Admin Oversight**: Complete booking management for administrators

### 💳 **Payment Integration**
- **Razorpay Integration**: Live payment gateway with webhook verification
- **20% Advance Payment**: Flexible payment structure (20% upfront, 80% to owner)
- **Payment Verification**: Secure payment confirmation with proper error handling
- **Receipt Generation**: Payment confirmations and booking receipts

### 🎨 **Modern UI/UX**
- **Gen-Z Friendly Design**: Modern blue-orange color scheme
- **Mobile-First**: Fully responsive design optimized for all devices
- **Interactive Elements**: Smooth animations and hover effects
- **Professional Layout**: Clean, intuitive interface with excellent user experience

### 🔍 **Advanced Search & Filtering**
- **Location Autocomplete**: Search by areas, colleges, offices across major cities
- **Smart Filtering**: Gender preference (Boys/Girls/Any), move-in dates
- **Real-Time Results**: Instant search results with nearby property suggestions
- **Search Parameter Persistence**: Maintains search context throughout booking flow

### 📱 **Communication Features**
- **WhatsApp Integration**: Direct inquiry system with property owners
- **Contact Management**: Centralized contact information management
- **Inquiry Templates**: Pre-formatted messages for property inquiries

### 👨‍💼 **Admin Dashboard**
- **Comprehensive Management**: Properties, bookings, users, amenities
- **Analytics Overview**: Property statistics and booking insights
- **Content Management**: Blog system for SEO and engagement
- **Settings Management**: Site-wide configuration and contact details

## 🛠 **Technology Stack**

### **Frontend**
- **Next.js 13**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first CSS framework
- **React Icons**: Comprehensive icon library

### **Backend**
- **Supabase**: Backend-as-a-Service with PostgreSQL
- **Next.js API Routes**: Server-side API endpoints
- **Row Level Security**: Database-level security policies

### **Payment**
- **Razorpay**: Payment gateway integration
- **Webhook Verification**: Secure payment confirmation

### **Authentication**
- **Supabase Auth**: Complete authentication system
- **JWT Tokens**: Secure session management

## 📊 **Database Schema**

### **Core Tables**
- **properties**: Property listings with location, pricing, amenities
- **property_rooms**: Individual rooms with sharing types and availability
- **bookings**: Complete booking records with payment tracking
- **profiles**: User profiles with role management
- **amenities**: Property amenities and features
- **property_images**: Image management for properties and rooms

## 🚀 **Getting Started**

### **Prerequisites**
- Node.js 18+ 
- npm or yarn
- Supabase account
- Razorpay account

### **Installation**

1. **Clone the repository**
```bash
git clone [repository-url]
cd niwas-nest
```

2. **Install dependencies**
```bash
npm install
```

3. **Environment Setup**
Create `.env.local` file with:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_secret
```

4. **Database Setup**
- Import the provided SQL schema to your Supabase project
- Configure Row Level Security policies
- Set up authentication providers

5. **Run Development Server**
```bash
npm run dev
```

Visit `http://localhost:3000` to see the application.

## 📱 **Key Pages & Features**

### **Public Pages**
- **Homepage** (`/`): Hero section with search and featured properties
- **Property Listings** (`/listings`): Search results with filtering
- **Property Details** (`/property/[id]`): Detailed property view with booking
- **About/Contact/Terms** (`/about`, `/contact`, `/terms`): Static pages

### **User Pages**
- **Login/Signup** (`/login`, `/signup`): Authentication pages
- **Profile** (`/profile`): User profile management
- **Bookings** (`/bookings`): User booking history
- **Favorites** (`/favorites`): Saved properties

### **Booking Flow**
- **Payment** (`/payment`): Payment processing page
- **Booking Summary** (`/booking-summary`): Booking confirmation
- **Payment Success** (`/payment-success`): Payment confirmation

### **Admin Panel**
- **Dashboard** (`/admin`): Admin overview with statistics
- **Properties** (`/admin/properties`): Property management
- **Bookings** (`/admin/bookings`): Booking oversight
- **Blog** (`/admin/blog`): Content management
- **Settings** (`/admin/settings`): Site configuration

## 🔧 **API Endpoints**

### **Authentication**
- `POST /api/auth/callback` - Supabase auth callback

### **Payments**
- `POST /api/create-order` - Create Razorpay order
- `POST /api/verify-payment` - Verify payment completion
- `POST /api/razorpay-webhook` - Handle payment webhooks

### **Notifications**
- `POST /api/send-booking-notifications` - Send booking confirmations

## 🎯 **Business Model**

### **Admin-Managed Platform**
- **Centralized Management**: All properties managed by admin team
- **Quality Control**: Ensures consistent property standards
- **Simplified Operations**: No complex owner onboarding or management

### **Revenue Streams**
- **Commission-Based**: Percentage of booking value
- **Service Fees**: Additional charges for premium services
- **Subscription Plans**: Future premium features for frequent users

## 🔒 **Security Features**

- **Authentication**: Secure user authentication with Supabase
- **Authorization**: Role-based access control
- **Payment Security**: PCI-compliant payment processing
- **Data Protection**: Row-level security in database
- **Input Validation**: Comprehensive form validation
- **HTTPS**: Secure data transmission

## 📈 **Performance Optimizations**

- **Image Optimization**: Next.js automatic image optimization
- **Code Splitting**: Automatic code splitting for faster loads
- **Caching**: Efficient caching strategies
- **Mobile Optimization**: Mobile-first responsive design
- **SEO Optimization**: Meta tags and structured data

## 🚀 **Deployment**

### **Recommended Platforms**
- **Vercel**: Seamless Next.js deployment
- **Netlify**: Alternative deployment option
- **Railway**: Full-stack deployment

### **Environment Variables**
Ensure all environment variables are properly configured in your deployment platform.

## 📞 **Support & Contact**

For technical support or business inquiries:
- **Email**: niwasnest2026@gmail.com
- **Phone**: +91 63048 09598
- **WhatsApp**: Available through the platform

## 🎉 **Project Status**

**✅ PRODUCTION READY**

This platform is fully functional and ready for client deployment with:
- Complete user authentication and management
- Full property and booking management system
- Integrated payment processing
- Professional admin dashboard
- Mobile-responsive design
- Secure and scalable architecture

The platform successfully handles the complete PG rental workflow from property search to booking confirmation and payment processing.

---

**Built with ❤️ for modern PG rental management**