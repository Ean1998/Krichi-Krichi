'use client';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';

interface Stats {
  totalBookings: number;
  totalRevenue: number;
  totalCommission: number;
  totalSalons: number;
  totalUsers: number;
  totalReviews: number;
  recentBookings: any[];
  topSalons: any[];
}

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login?callbackUrl=/admin');
      return;
    }
    if (session?.user && (session.user as any).role !== 'admin') {
      setError('Access denied. Admin only.');
      setLoading(false);
      return;
    }
    if (session?.user) {
      fetch('/api/admin/stats')
        .then(r => r.json())
        .then(data => { setStats(data); setLoading(false); })
        .catch(() => { setError('Failed to load stats'); setLoading(false); });
    }
  }, [session, status, router]);

  if (status === 'loading' || loading) return (
    <div className="min-h-screen bg-gray-50">
      <Navbar variant="admin" />
      <div className="flex items-center justify-center py-20">
        <div className="inline-block w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-gray-50">
      <Navbar variant="admin" />
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <div className="card p-10">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    </div>
  );

  if (!stats) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar variant="admin" />
      <div className="max-w-7xl mx-auto px-4 py-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">Admin Dashboard</h1>
        <p className="text-gray-500 mb-8">Platform overview and commission tracking</p>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {[
            { label: 'Total Bookings', value: stats.totalBookings, color: 'bg-blue-50 text-blue-700' },
            { label: 'Total Revenue', value: `$${stats.totalRevenue.toFixed(2)}`, color: 'bg-green-50 text-green-700' },
            { label: 'Your Commission', value: `$${stats.totalCommission.toFixed(2)}`, color: 'bg-primary-50 text-primary-700 ring-2 ring-primary-200' },
            { label: 'Salons', value: stats.totalSalons, color: 'bg-purple-50 text-purple-700' },
            { label: 'Users', value: stats.totalUsers, color: 'bg-orange-50 text-orange-700' },
            { label: 'Reviews', value: stats.totalReviews, color: 'bg-yellow-50 text-yellow-700' },
          ].map(stat => (
            <div key={stat.label} className={`card p-5 ${stat.color}`}>
              <p className="text-xs font-medium opacity-80">{stat.label}</p>
              <p className="text-xl md:text-2xl font-bold mt-1">{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Recent Bookings */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Recent Bookings</h3>
            <div className="space-y-2">
              {stats.recentBookings.map((b: any) => (
                <div key={b.id} className="card p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{b.customer_name}</p>
                      <p className="text-sm text-gray-500">{b.salon_name} &bull; {b.service_name}</p>
                      <p className="text-xs text-gray-400">{b.booking_date} at {b.booking_time}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">${b.total_price}</p>
                      <p className="text-xs text-primary-600 font-medium">+${b.commission.toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              ))}
              {stats.recentBookings.length === 0 && <p className="text-gray-500">No bookings yet.</p>}
            </div>
          </div>

          {/* Top Salons */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Top Salons</h3>
            <div className="space-y-2">
              {stats.topSalons.map((s: any, i: number) => (
                <div key={s.name} className="card p-4 flex items-center gap-4">
                  <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-primary-700 font-bold text-sm">
                    {i + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{s.name}</p>
                    <p className="text-sm text-gray-500">{s.booking_count} bookings &bull; {s.rating > 0 ? `${s.rating.toFixed(1)} ★` : 'No rating'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-primary-600">${s.total_commission.toFixed(2)}</p>
                    <p className="text-xs text-gray-400">commission</p>
                  </div>
                </div>
              ))}
              {stats.topSalons.length === 0 && <p className="text-gray-500">No salons yet.</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
