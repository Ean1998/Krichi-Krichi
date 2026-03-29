import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { v4 as uuid } from 'uuid';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';

export async function GET() {
  try {
    const db = getDb();
    const salons = db.prepare(`
      SELECT s.*,
        (SELECT COUNT(*) FROM services WHERE salon_id = s.id AND is_active = 1) as service_count,
        (SELECT MIN(price) FROM services WHERE salon_id = s.id AND is_active = 1) as min_price
      FROM salons s
      WHERE s.is_approved = 1
      ORDER BY s.rating DESC, s.created_at DESC
    `).all();
    return NextResponse.json({ salons });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch salons' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const body = await req.json();
    const { name, description, address, city, phone, email, opening_hours } = body;
    if (!name) {
      return NextResponse.json({ error: 'Salon name is required' }, { status: 400 });
    }
    const db = getDb();
    const salonId = uuid();
    db.prepare(`
      INSERT INTO salons (id, owner_id, name, description, address, city, phone, email, opening_hours)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(salonId, (session.user as any).id, name, description, address, city, phone, email, JSON.stringify(opening_hours || {}));
    return NextResponse.json({ salonId, message: 'Salon created' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create salon' }, { status: 500 });
  }
}
