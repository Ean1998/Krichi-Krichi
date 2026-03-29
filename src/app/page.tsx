import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-100">
      {/* Header */}
      <header className="p-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl md:text-3xl font-bold text-primary-700">
            Krichi-Krichi
          </h1>
          <Link href="/admin" className="text-sm text-gray-500 hover:text-primary-600 transition-colors">
            Admin
          </Link>
        </div>
      </header>

      {/* Hero */}
      <main className="max-w-7xl mx-auto px-4 pt-12 md:pt-24 pb-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-extrabold text-gray-900 mb-6 leading-tight">
            Beauty & Wellness,<br />
            <span className="text-primary-600">Booked Easily</span>
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
            Discover top salons near you, book your favorite services instantly,
            and look your best — all in one place.
          </p>
        </div>

        {/* Choice Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Customer Card */}
          <Link href="/customer" className="group">
            <div className="card p-8 md:p-12 text-center group-hover:-translate-y-2 transition-all duration-300 border-2 border-transparent group-hover:border-primary-300">
              <div className="w-20 h-20 md:w-24 md:h-24 mx-auto mb-6 bg-primary-100 rounded-full flex items-center justify-center group-hover:bg-primary-200 transition-colors">
                <svg className="w-10 h-10 md:w-12 md:h-12 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">For Customers</h3>
              <p className="text-gray-600 mb-6">
                Browse salons, view services & prices, read reviews, and book appointments instantly.
              </p>
              <span className="btn-primary inline-block">
                Find a Salon
              </span>
            </div>
          </Link>

          {/* Salon Card */}
          <Link href="/salon" className="group">
            <div className="card p-8 md:p-12 text-center group-hover:-translate-y-2 transition-all duration-300 border-2 border-transparent group-hover:border-primary-300">
              <div className="w-20 h-20 md:w-24 md:h-24 mx-auto mb-6 bg-primary-100 rounded-full flex items-center justify-center group-hover:bg-primary-200 transition-colors">
                <svg className="w-10 h-10 md:w-12 md:h-12 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">For Salons</h3>
              <p className="text-gray-600 mb-6">
                List your salon, manage services, showcase your work, and receive bookings online.
              </p>
              <span className="btn-primary inline-block">
                Register Your Salon
              </span>
            </div>
          </Link>
        </div>

        {/* Features */}
        <div className="mt-24 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto text-center">
          {[
            { icon: '⚡', title: 'Instant Booking', desc: 'Book in seconds' },
            { icon: '⭐', title: 'Verified Reviews', desc: 'Real customer feedback' },
            { icon: '📱', title: 'Mobile Friendly', desc: 'Book from any device' },
            { icon: '🔒', title: 'Secure', desc: 'Your data is safe' },
          ].map((f) => (
            <div key={f.title}>
              <div className="text-3xl mb-2">{f.icon}</div>
              <h4 className="font-semibold text-gray-900">{f.title}</h4>
              <p className="text-sm text-gray-500">{f.desc}</p>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-500 text-sm">
          &copy; 2024 Krichi-Krichi. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
