import SearchForm from '@/components/SearchForm';
import FeaturedProperties from '@/components/FeaturedProperties';

export default function Home() {
  return (
    <div>
      <section className="py-16 px-4 relative overflow-hidden" style={{ 
        background: 'linear-gradient(135deg, #3AAFA9 0%, #2B7A78 100%)',
        color: '#FEFFFF'
      }}>
        <div className="max-w-4xl mx-auto text-center relative z-10 mb-10">
          <h1 className="font-merriweather text-4xl md:text-5xl lg:text-6xl font-bold mb-4" style={{ color: '#FEFFFF' }}>
            Find safe, affordable
          </h1>
          <h2 className="font-merriweather text-4xl md:text-5xl lg:text-6xl font-bold mb-6" style={{ color: '#FEFFFF' }}>
            <span style={{ 
              background: 'linear-gradient(135deg, #DEF2F1, #FEFFFF)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>PGs & Hostels</span> near you
          </h2>
          <p className="text-lg md:text-xl max-w-2xl mx-auto font-medium" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
            Book trusted student housing and coliving spaces across India with zero brokerage.
          </p>
        </div>

        <div className="max-w-4xl mx-auto relative z-10 pb-8">
          <SearchForm />
        </div>
      </section>

      <section className="py-12 px-4" style={{ backgroundColor: 'rgba(222, 242, 241, 0.3)' }}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="font-merriweather text-3xl md:text-4xl font-bold mb-3" style={{ color: '#17252A' }}>
              Available Properties
            </h2>
            <p className="text-lg font-medium" style={{ color: 'rgba(23, 37, 42, 0.7)' }}>
              Browse our latest listings
            </p>
          </div>

          <FeaturedProperties />
        </div>
      </section>

      <section className="py-16 px-4" style={{ backgroundColor: '#DEF2F1' }}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-merriweather text-3xl md:text-4xl font-bold mb-4" style={{ color: '#17252A' }}>
              Why Choose Us?
            </h2>
            <p className="text-lg max-w-2xl mx-auto font-medium" style={{ color: 'rgba(23, 37, 42, 0.7)' }}>
              We make finding your perfect home away from home simple, secure, and stress-free.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            <div className="p-8 rounded-3xl text-center hover:shadow-lg transition-all duration-500 hover:scale-105" style={{ 
              background: 'rgba(222, 242, 241, 0.7)', 
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(43, 122, 120, 0.2)',
              boxShadow: '0 8px 32px rgba(23, 37, 42, 0.1)'
            }}>
              <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5 shadow-md" style={{ 
                background: 'rgba(43, 122, 120, 0.1)', 
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(43, 122, 120, 0.2)'
              }}>
                <span className="text-4xl">🏠</span>
              </div>
              <h3 className="text-xl font-bold mb-3" style={{ color: '#17252A' }}>Verified Properties</h3>
              <p className="font-medium" style={{ color: 'rgba(23, 37, 42, 0.7)' }}>
                All listings are personally verified to ensure quality and safety for our users.
              </p>
            </div>

            <div className="p-8 rounded-3xl text-center hover:shadow-lg transition-all duration-500 hover:scale-105" style={{ 
              background: 'rgba(222, 242, 241, 0.7)', 
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(43, 122, 120, 0.2)',
              boxShadow: '0 8px 32px rgba(23, 37, 42, 0.1)'
            }}>
              <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5 shadow-md" style={{ 
                background: 'rgba(43, 122, 120, 0.1)', 
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(43, 122, 120, 0.2)'
              }}>
                <span className="text-4xl">💰</span>
              </div>
              <h3 className="text-xl font-bold mb-3" style={{ color: '#17252A' }}>Zero Brokerage</h3>
              <p className="font-medium" style={{ color: 'rgba(23, 37, 42, 0.7)' }}>
                Book directly with property owners without paying any brokerage fees.
              </p>
            </div>

            <div className="p-8 rounded-3xl text-center hover:shadow-lg transition-all duration-500 hover:scale-105" style={{ 
              background: 'rgba(222, 242, 241, 0.7)', 
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(43, 122, 120, 0.2)',
              boxShadow: '0 8px 32px rgba(23, 37, 42, 0.1)'
            }}>
              <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5 shadow-md" style={{ 
                background: 'rgba(43, 122, 120, 0.1)', 
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(43, 122, 120, 0.2)'
              }}>
                <span className="text-4xl">🔒</span>
              </div>
              <h3 className="text-xl font-bold mb-3" style={{ color: '#17252A' }}>Secure Booking</h3>
              <p className="font-medium" style={{ color: 'rgba(23, 37, 42, 0.7)' }}>
                Safe and secure payment process with instant booking confirmation.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
