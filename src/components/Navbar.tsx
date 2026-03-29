'use client';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useState } from 'react';

export default function Navbar({ variant = 'customer' }: { variant?: 'customer' | 'salon' | 'admin' }) {
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="text-xl font-bold text-primary-700">
            Krichi-Krichi
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            {variant === 'customer' && (
              <>
                <Link href="/customer" className="text-gray-700 hover:text-primary-600 transition-colors font-medium">
                  Browse Salons
                </Link>
              </>
            )}
            {variant === 'salon' && (
              <>
                <Link href="/salon/dashboard" className="text-gray-700 hover:text-primary-600 transition-colors font-medium">
                  Dashboard
                </Link>
              </>
            )}
            {variant === 'admin' && (
              <>
                <Link href="/admin" className="text-gray-700 hover:text-primary-600 transition-colors font-medium">
                  Dashboard
                </Link>
              </>
            )}
            {session ? (
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600">Hi, {session.user?.name}</span>
                <button onClick={() => signOut({ callbackUrl: '/' })} className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                  Sign Out
                </button>
              </div>
            ) : (
              <Link href="/auth/login" className="btn-primary text-sm !py-2 !px-4">
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile hamburger */}
          <button className="md:hidden p-2" onClick={() => setMenuOpen(!menuOpen)}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden pb-4 border-t border-gray-100">
            <div className="flex flex-col gap-3 pt-3">
              {variant === 'customer' && (
                <Link href="/customer" className="text-gray-700 hover:text-primary-600 py-2" onClick={() => setMenuOpen(false)}>
                  Browse Salons
                </Link>
              )}
              {variant === 'salon' && (
                <Link href="/salon/dashboard" className="text-gray-700 hover:text-primary-600 py-2" onClick={() => setMenuOpen(false)}>
                  Dashboard
                </Link>
              )}
              {session ? (
                <>
                  <span className="text-sm text-gray-600 py-2">Hi, {session.user?.name}</span>
                  <button onClick={() => signOut({ callbackUrl: '/' })} className="text-left text-primary-600 py-2">
                    Sign Out
                  </button>
                </>
              ) : (
                <Link href="/auth/login" className="text-primary-600 py-2" onClick={() => setMenuOpen(false)}>
                  Sign In
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
