'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';

interface Salon {
  id: string;
  name: string;
  description: string;
  address: string;
  city: string;
  cover_image: string;
  logo: string;
  rating: number;
  review_count: number;
  service_count: number;
  min_price: number;
}

export default function CustomerPage() {
  const [salons, setSalons] = useState<Salon[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/salons')
      .then(r => r.json())
      .then(data => { setSalons(data.salons || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = salons.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.city?.toLowerCase().includes(search.toLowerCase()) ||
    s.description?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar variant="customer" />
      {/* Hero search */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 py-12 md:py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-6">Find Your Perfect Salon</h1>
          <div className="relative">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search salons by name, city..."
              className="w-full pl-12 pr-4 py-4 rounded-2xl text-lg border-0 shadow-xl focus:ring-4 focus:ring-primary-300 outline-none"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Salon Grid */}
      <div className="max-w-7xl mx-auto px-4 py-10">
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-500">Loading salons...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">💇</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No salons found</h3>
            <p className="text-gray-500">
              {salons.length === 0 ? 'No salons registered yet. Check back soon!' : 'Try a different search term.'}
            </p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(salon => (
              <Link href={`/customer/salons/${salon.id}`} key={salon.id} className="group">
                <div className="card group-hover:-translate-y-1">
                  <div className="h-48 bg-gradient-to-br from-primary-200 to-primary-300 relative overflow-hidden">
                    {salon.cover_image ? (
                      <img src={salon.cover_image} alt={salon.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <svg className="w-16 h-16 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      </div>
                    )}
                    {salon.logo && (
                      <div className="absolute bottom-3 left-3 w-12 h-12 rounded-full bg-white shadow-lg overflow-hidden">
                        <img src={salon.logo} alt="" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                  <div className="p-5">
                    <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-primary-600 transition-colors">{salon.name}</h3>
                    {salon.city && <p className="text-sm text-gray-500 mb-2">📍 {salon.city}{salon.address ? `, ${salon.address}` : ''}</p>}
                    <p className="text-sm text-gray-600 line-clamp-2 mb-3">{salon.description || 'Professional salon services'}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <span className="text-yellow-500">★</span>
                        <span className="font-semibold text-sm">{salon.rating > 0 ? salon.rating.toFixed(1) : 'New'}</span>
                        {salon.review_count > 0 && <span className="text-xs text-gray-400">({salon.review_count})</span>}
                      </div>
                      {salon.min_price > 0 && (
                        <span className="text-sm text-gray-600">From <span className="font-semibold text-primary-600">${salon.min_price}</span></span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
