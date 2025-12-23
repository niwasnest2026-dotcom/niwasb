import SearchForm from '@/components/SearchForm';
import FeaturedProperties from '@/components/FeaturedProperties';

export default function Home() {
  return (
    <div>
      <section className="py-16 px-4 relative overflow-hidden">
        <div className="max-w-4xl mx-auto text-center relative z-10 mb-10">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 text-neutral-900">
            Find safe, affordable
          </h1>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            <span className="text-primary">PGs & Hostels</span> near you
          </h2>
          <p className="text-lg md:text-xl text-neutral-700 max-w-2xl mx-auto font-medium">
            Book trusted student housing and coliving spaces across India with zero brokerage.
          </p>
        </div>

        <div className="max-w-4xl mx-auto relative z-10 pb-8">
          <SearchForm />
        </div>
      </section>

      <section className="py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-3">
              Available Properties
            </h2>
            <p className="text-neutral-600 text-lg font-medium">
              Browse our latest listings
            </p>
          </div>

          <FeaturedProperties />
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
              Why Choose Us?
            </h2>
            <p className="text-neutral-600 text-lg max-w-2xl mx-auto font-medium">
              We make finding your perfect home away from home simple, secure, and stress-free.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            <div className="glass-card p-8 rounded-3xl text-center hover:shadow-glass-lg transition-all duration-500 hover:scale-105">
              <div className="w-20 h-20 glass-badge rounded-full flex items-center justify-center mx-auto mb-5 shadow-md">
                <span className="text-4xl">🏠</span>
              </div>
              <h3 className="text-xl font-bold mb-3 text-neutral-900">Verified Properties</h3>
              <p className="text-neutral-600 font-medium">
                All listings are personally verified to ensure quality and safety for our users.
              </p>
            </div>

            <div className="glass-card p-8 rounded-3xl text-center hover:shadow-glass-lg transition-all duration-500 hover:scale-105">
              <div className="w-20 h-20 glass-badge rounded-full flex items-center justify-center mx-auto mb-5 shadow-md">
                <span className="text-4xl">💰</span>
              </div>
              <h3 className="text-xl font-bold mb-3 text-neutral-900">Zero Brokerage</h3>
              <p className="text-neutral-600 font-medium">
                Book directly with property owners without paying any brokerage fees.
              </p>
            </div>

            <div className="glass-card p-8 rounded-3xl text-center hover:shadow-glass-lg transition-all duration-500 hover:scale-105">
              <div className="w-20 h-20 glass-badge rounded-full flex items-center justify-center mx-auto mb-5 shadow-md">
                <span className="text-4xl">🔒</span>
              </div>
              <h3 className="text-xl font-bold mb-3 text-neutral-900">Secure Booking</h3>
              <p className="text-neutral-600 font-medium">
                Safe and secure payment process with instant booking confirmation.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
