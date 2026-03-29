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

    const sql = getDb();

    const [bookingCount] = await sql`SELECT COUNT(*) as count FROM bookings`;
    const [revenueSum] = await sql`SELECT COALESCE(SUM(total_price), 0) as total FROM bookings`;
    const [commissionSum] = await sql`SELECT COALESCE(SUM(commission), 0) as total FROM bookings`;
    const [salonCount] = await sql`SELECT COUNT(*) as count FROM salons`;
    const [userCount] = await sql`SELECT COUNT(*) as count FROM users`;
    const [reviewCount] = await sql`SELECT COUNT(*) as count FROM reviews`;

    const recentBookings = await sql`
      SELECT b.*, s.name as salon_name, sv.name as service_name
      FROM bookings b
      JOIN salons s ON b.salon_id = s.id
      JOIN services sv ON b.service_id = sv.id
      ORDER BY b.created_at DESC LIMIT 20
    `;

    const topSalons = await sql`
      SELECT s.name, s.rating, s.review_count,
        (SELECT COUNT(*) FROM bookings WHERE salon_id = s.id) as booking_count,
        (SELECT COALESCE(SUM(commission), 0) FROM bookings WHERE salon_id = s.id) as total_commission
      FROM salons s
      ORDER BY booking_count DESC LIMIT 10
    `;

    return NextResponse.json({
      totalBookings: parseInt(bookingCount.count),
      totalRevenue: parseFloat(revenueSum.total),
      totalCommission: parseFloat(commissionSum.total),
      totalSalons: parseInt(salonCount.count),
      totalUsers: parseInt(userCount.count),
      totalReviews: parseInt(reviewCount.count),
      recentBookings,
      topSalons,
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
