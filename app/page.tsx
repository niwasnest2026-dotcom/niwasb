import SearchForm from '@/components/SearchForm';
import FeaturedProperties from '@/components/FeaturedProperties';
import { FaHome, FaShieldAlt, FaUsers, FaWifi, FaDumbbell } from 'react-icons/fa';

export default function Home() {
  return (
    <div>
      {/* Hero Section with Orange Gradient */}
      <section className="py-20 px-4 relative overflow-hidden" style={{ 
        background: 'linear-gradient(135deg, #FF6711 0%, #E55A0F 100%)',
        color: '#F7FAFC'
      }}>
        <div className="max-w-5xl mx-auto text-center relative z-10 mb-12">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-black mb-6 leading-tight" style={{ color: '#F7FAFC' }}>
            Experience Vibrant
          </h1>
          <h2 className="text-5xl md:text-6xl lg:text-7xl font-black mb-8 leading-tight">
            <span style={{ 
              background: 'linear-gradient(135deg, #FFD082, #FFF4EC)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>Coliving</span> at Niwas Nest
          </h2>
          <p className="text-xl md:text-2xl max-w-3xl mx-auto font-medium leading-relaxed" style={{ color: 'rgba(247, 250, 252, 0.9)' }}>
            Live comfortably in modern, fully-furnished spaces made for students and young professionals. Connect, thrive, and make the most of your city life.
          </p>
        </div>

        <div className="max-w-4xl mx-auto relative z-10 pb-8">
          <SearchForm />
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 rounded-full opacity-20" style={{ backgroundColor: '#FFD082' }}></div>
        <div className="absolute bottom-20 right-10 w-32 h-32 rounded-full opacity-10" style={{ backgroundColor: '#FFF4EC' }}></div>
      </section>

      {/* Available Properties */}
      <section className="py-20 px-4" style={{ backgroundColor: 'rgba(99, 179, 237, 0.3)' }}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black mb-6" style={{ color: '#2D3748' }}>
              Available Properties
            </h2>
            <p className="text-xl font-medium" style={{ color: 'rgba(45, 55, 72, 0.7)' }}>
              Browse our latest listings
            </p>
          </div>

          <FeaturedProperties />
        </div>
      </section>

      {/* Why Choose Section with Sky Blue Background */}
      <section className="py-20 px-4" style={{ backgroundColor: '#63B3ED' }}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black mb-6" style={{ color: '#2D3748' }}>
              Why Choose Niwas Nest?
            </h2>
            <p className="text-xl max-w-3xl mx-auto font-medium leading-relaxed" style={{ color: 'rgba(45, 55, 72, 0.8)' }}>
              Modern, comfortable, and ready for you.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Community Vibes */}
            <div className="p-8 rounded-3xl text-center hover:shadow-2xl transition-all duration-500 hover:scale-105 modern-card">
              <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg" style={{ 
                backgroundColor: '#FFD082'
              }}>
                <FaUsers className="text-3xl" style={{ color: '#2D3748' }} />
              </div>
              <h3 className="text-2xl font-bold mb-4" style={{ color: '#2D3748' }}>Community Vibes</h3>
              <p className="text-lg font-medium leading-relaxed" style={{ color: 'rgba(45, 55, 72, 0.7)' }}>
                Meet fellow students and young pros in a friendly, inclusive environment.
              </p>
            </div>

            {/* All-Inclusive */}
            <div className="p-8 rounded-3xl text-center hover:shadow-2xl transition-all duration-500 hover:scale-105 modern-card">
              <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg" style={{ 
                backgroundColor: '#FFD082'
              }}>
                <FaHome className="text-3xl" style={{ color: '#2D3748' }} />
              </div>
              <h3 className="text-2xl font-bold mb-4" style={{ color: '#2D3748' }}>All-Inclusive</h3>
              <p className="text-lg font-medium leading-relaxed" style={{ color: 'rgba(45, 55, 72, 0.7)' }}>
                Enjoy fully furnished rooms, with utilities and housekeeping—all included.
              </p>
            </div>

            {/* Great Amenities */}
            <div className="p-8 rounded-3xl text-center hover:shadow-2xl transition-all duration-500 hover:scale-105 modern-card">
              <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg" style={{ 
                backgroundColor: '#FFD082'
              }}>
                <FaShieldAlt className="text-3xl" style={{ color: '#2D3748' }} />
              </div>
              <h3 className="text-2xl font-bold mb-4" style={{ color: '#2D3748' }}>Great Amenities</h3>
              <p className="text-lg font-medium leading-relaxed" style={{ color: 'rgba(45, 55, 72, 0.7)' }}>
                Access gym, lounge, study area, and other top-notch facilities.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Most Popular Facilities */}
      <section className="py-20 px-4" style={{ backgroundColor: '#F7FAFC' }}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black mb-6" style={{ color: '#2D3748' }}>
              Most Popular Facilities
            </h2>
            <p className="text-xl max-w-3xl mx-auto font-medium" style={{ color: 'rgba(45, 55, 72, 0.7)' }}>
              Modern, comfortable and ready for you. ✨
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Fully Furnished Rooms */}
            <div className="relative rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105" style={{ backgroundColor: '#FFD082' }}>
              <div className="p-8 text-center">
                <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6" style={{ backgroundColor: 'rgba(45, 55, 72, 0.1)' }}>
                  <FaHome className="text-3xl" style={{ color: '#2D3748' }} />
                </div>
                <h3 className="text-2xl font-bold mb-4" style={{ color: '#2D3748' }}>Fully Furnished Rooms</h3>
                <p className="text-lg font-medium" style={{ color: 'rgba(45, 55, 72, 0.8)' }}>
                  Modern, comfortable and ready for you.
                </p>
              </div>
            </div>

            {/* Awesome Gym */}
            <div className="relative rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105" style={{ backgroundColor: '#90CDF4' }}>
              <div className="p-8 text-center">
                <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6" style={{ backgroundColor: 'rgba(45, 55, 72, 0.1)' }}>
                  <FaDumbbell className="text-3xl" style={{ color: '#2D3748' }} />
                </div>
                <h3 className="text-2xl font-bold mb-4" style={{ color: '#2D3748' }}>Awesome Gym</h3>
                <p className="text-lg font-medium" style={{ color: 'rgba(45, 55, 72, 0.8)' }}>
                  Stay fit with our well-equipped gym.
                </p>
              </div>
            </div>

            {/* Study Lounge */}
            <div className="relative rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105" style={{ backgroundColor: '#FFF4EC' }}>
              <div className="p-8 text-center">
                <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6" style={{ backgroundColor: 'rgba(45, 55, 72, 0.1)' }}>
                  <FaWifi className="text-3xl" style={{ color: '#2D3748' }} />
                </div>
                <h3 className="text-2xl font-bold mb-4" style={{ color: '#2D3748' }}>Study Lounge</h3>
                <p className="text-lg font-medium" style={{ color: 'rgba(45, 55, 72, 0.8)' }}>
                  Quiet workspace perfect for productivity.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
