import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { v4 as uuid } from 'uuid';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';

async function getMySalon() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;
  const db = getDb();
  return db.prepare('SELECT * FROM salons WHERE owner_id = ? LIMIT 1').get((session.user as any).id) as any;
}

export async function POST(req: NextRequest) {
  try {
    const salon = await getMySalon();
    if (!salon) return NextResponse.json({ error: 'Unauthorized or no salon' }, { status: 401 });

    const { name, description, price, duration, category } = await req.json();
    if (!name || !price || !duration) {
      return NextResponse.json({ error: 'Name, price, and duration are required' }, { status: 400 });
    }

    const db = getDb();
    const serviceId = uuid();
    db.prepare('INSERT INTO services (id, salon_id, name, description, price, duration, category) VALUES (?, ?, ?, ?, ?, ?, ?)').run(
      serviceId, salon.id, name, description || null, price, duration, category || 'General'
    );

    const service = db.prepare('SELECT * FROM services WHERE id = ?').get(serviceId);
    return NextResponse.json({ service });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to add service' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const salon = await getMySalon();
    if (!salon) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const serviceId = req.nextUrl.searchParams.get('id');
    if (!serviceId) return NextResponse.json({ error: 'Service ID required' }, { status: 400 });

    const db = getDb();
    db.prepare('UPDATE services SET is_active = 0 WHERE id = ? AND salon_id = ?').run(serviceId, salon.id);
    return NextResponse.json({ message: 'Service deleted' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete service' }, { status: 500 });
  }
}
