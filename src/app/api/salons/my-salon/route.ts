import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const db = getDb();
    const userId = (session.user as any).id;
    const salon = db.prepare('SELECT * FROM salons WHERE owner_id = ? LIMIT 1').get(userId) as any;

    if (!salon) return NextResponse.json({ salon: null });

    const services = db.prepare('SELECT * FROM services WHERE salon_id = ? AND is_active = 1 ORDER BY category, name').all(salon.id);
    const photos = db.prepare('SELECT * FROM salon_photos WHERE salon_id = ? ORDER BY created_at DESC').all(salon.id);

    return NextResponse.json({ salon, services, photos });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch salon' }, { status: 500 });
  }
}
