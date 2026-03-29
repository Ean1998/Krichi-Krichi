import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const db = getDb();
    const salon = db.prepare('SELECT * FROM salons WHERE id = ?').get(params.id) as any;
    if (!salon) return NextResponse.json({ error: 'Salon not found' }, { status: 404 });

    const services = db.prepare('SELECT * FROM services WHERE salon_id = ? AND is_active = 1 ORDER BY category, name').all(params.id);
    const photos = db.prepare('SELECT * FROM salon_photos WHERE salon_id = ? ORDER BY created_at DESC').all(params.id);
    const reviews = db.prepare('SELECT * FROM reviews WHERE salon_id = ? ORDER BY created_at DESC LIMIT 50').all(params.id);

    return NextResponse.json({ salon, services, photos, reviews });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch salon' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const db = getDb();
    const salon = db.prepare('SELECT * FROM salons WHERE id = ?').get(params.id) as any;
    if (!salon) return NextResponse.json({ error: 'Salon not found' }, { status: 404 });
    if (salon.owner_id !== (session.user as any).id && (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const { name, description, address, city, phone, email, cover_image, logo, opening_hours } = body;

    db.prepare(`
      UPDATE salons SET name = ?, description = ?, address = ?, city = ?, phone = ?, email = ?,
        cover_image = COALESCE(?, cover_image), logo = COALESCE(?, logo), opening_hours = ?
      WHERE id = ?
    `).run(name, description, address, city, phone, email, cover_image, logo, JSON.stringify(opening_hours || {}), params.id);

    return NextResponse.json({ message: 'Salon updated' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update salon' }, { status: 500 });
  }
}
