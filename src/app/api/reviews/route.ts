import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
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
    const db = getDb();
    const reviewId = uuid();

    db.prepare(`
      INSERT INTO reviews (id, salon_id, customer_name, customer_user_id, rating, comment)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(reviewId, salon_id, customer_name, (session?.user as any)?.id || null, rating, comment || null);

    // Update salon rating
    const stats = db.prepare('SELECT AVG(rating) as avg_rating, COUNT(*) as count FROM reviews WHERE salon_id = ?').get(salon_id) as any;
    db.prepare('UPDATE salons SET rating = ?, review_count = ? WHERE id = ?').run(
      Math.round(stats.avg_rating * 10) / 10, stats.count, salon_id
    );

    const review = db.prepare('SELECT * FROM reviews WHERE id = ?').get(reviewId);
    return NextResponse.json({ review, message: 'Review submitted' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to submit review' }, { status: 500 });
  }
}
