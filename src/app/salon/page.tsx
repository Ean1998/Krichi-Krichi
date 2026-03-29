'use client';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

export default function SalonLandingPage() {
  const { data: session } = useSession();
  const isSalonOwner = session?.user && (session.user as any).role === 'salon';

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-100">
      <header className="p-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-primary-700">Krichi-Krichi</Link>
          {session ? (
            <Link href="/salon/dashboard" className="btn-primary text-sm !py-2 !px-4">Dashboard</Link>
          ) : (
            <div className="flex gap-3">
              <Link href="/auth/login?callbackUrl=/salon/dashboard" className="btn-secondary text-sm !py-2 !px-4">Sign In</Link>
              <Link href="/auth/register" className="btn-primary text-sm !py-2 !px-4">Register</Link>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-16 md:py-24">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 mb-6">
            Grow Your <span className="text-primary-600">Salon Business</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            Join Krichi-Krichi to reach new customers, manage bookings online, and showcase your work to thousands.
          </p>
          {isSalonOwner ? (
            <Link href="/salon/dashboard" className="btn-primary text-lg !py-4 !px-10 inline-block">
              Go to Dashboard
            </Link>
          ) : (
            <Link href="/auth/register" className="btn-primary text-lg !py-4 !px-10 inline-block">
              Register Your Salon — Free
            </Link>
          )}
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            { icon: '📋', title: 'List Your Services', desc: 'Add all your services with prices, durations, and descriptions. Customers find exactly what they need.' },
            { icon: '📸', title: 'Showcase Your Work', desc: 'Upload photos of your salon, your team, and your best work. First impressions matter!' },
            { icon: '📅', title: 'Receive Bookings', desc: 'Customers book directly through your profile. Manage everything from your dashboard.' },
          ].map(f => (
            <div key={f.title} className="card p-8 text-center">
              <div className="text-4xl mb-4">{f.icon}</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{f.title}</h3>
              <p className="text-gray-600">{f.desc}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
