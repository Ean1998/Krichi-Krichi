import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const sql = getDb();
    const userId = (session.user as any).id;
    const salons = await sql`SELECT * FROM salons WHERE owner_id = ${userId} LIMIT 1`;

    if (salons.length === 0) return NextResponse.json({ salon: null });

    const salon = salons[0];
    const services = await sql`SELECT * FROM services WHERE salon_id = ${salon.id} AND is_active = 1 ORDER BY category, name`;
    const photos = await sql`SELECT * FROM salon_photos WHERE salon_id = ${salon.id} ORDER BY created_at DESC`;

    return NextResponse.json({ salon, services, photos });
  } catch (error) {
    console.error('Fetch my salon error:', error);
    return NextResponse.json({ error: 'Failed to fetch salon' }, { status: 500 });
  }
}
