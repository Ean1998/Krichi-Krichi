import { NextRequest, NextResponse } from 'next/server';
import { getDbReady } from '@/lib/db';
import { v4 as uuid } from 'uuid';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';

export async function POST(req: NextRequest) {
  try {
    const { salon_id, rating, comment, customer_name } = await req.json();
    if (!salon_id || !rating || !customer_name) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const session = await getServerSession(authOptions);
    const sql = await getDbReady();
    const reviewId = uuid();
    const customerUserId = (session?.user as any)?.id || null;

    await sql`
      INSERT INTO reviews (id, salon_id, customer_name, customer_user_id, rating, comment)
      VALUES (${reviewId}, ${salon_id}, ${customer_name}, ${customerUserId}, ${rating}, ${comment || null})
    `;

    const stats = await sql`SELECT AVG(rating) as avg_rating, COUNT(*) as count FROM reviews WHERE salon_id = ${salon_id}`;
    const avgRating = Math.round(parseFloat(stats[0].avg_rating) * 10) / 10;
    const count = parseInt(stats[0].count);
    await sql`UPDATE salons SET rating = ${avgRating}, review_count = ${count} WHERE id = ${salon_id}`;

    const rows = await sql`SELECT * FROM reviews WHERE id = ${reviewId}`;
    return NextResponse.json({ review: rows[0], message: 'Review submitted' });
  } catch (error) {
    console.error('Review error:', error);
    return NextResponse.json({ error: 'Failed to submit review' }, { status: 500 });
  }
}
