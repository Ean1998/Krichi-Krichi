import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = getDb();

    const totalBookings = (db.prepare('SELECT COUNT(*) as count FROM bookings').get() as any).count;
    const totalRevenue = (db.prepare('SELECT COALESCE(SUM(total_price), 0) as total FROM bookings').get() as any).total;
    const totalCommission = (db.prepare('SELECT COALESCE(SUM(commission), 0) as total FROM bookings').get() as any).total;
    const totalSalons = (db.prepare('SELECT COUNT(*) as count FROM salons').get() as any).count;
    const totalUsers = (db.prepare('SELECT COUNT(*) as count FROM users').get() as any).count;
    const totalReviews = (db.prepare('SELECT COUNT(*) as count FROM reviews').get() as any).count;

    const recentBookings = db.prepare(`
      SELECT b.*, s.name as salon_name, sv.name as service_name
      FROM bookings b
      JOIN salons s ON b.salon_id = s.id
      JOIN services sv ON b.service_id = sv.id
      ORDER BY b.created_at DESC LIMIT 20
    `).all();

    const topSalons = db.prepare(`
      SELECT s.name, s.rating, s.review_count,
        (SELECT COUNT(*) FROM bookings WHERE salon_id = s.id) as booking_count,
        (SELECT COALESCE(SUM(commission), 0) FROM bookings WHERE salon_id = s.id) as total_commission
      FROM salons s
      ORDER BY booking_count DESC LIMIT 10
    `).all();

    return NextResponse.json({
      totalBookings, totalRevenue, totalCommission, totalSalons, totalUsers, totalReviews,
      recentBookings, topSalons,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
