import { NextRequest, NextResponse } from 'next/server';
import { getDbReady } from '@/lib/db';
import { v4 as uuid } from 'uuid';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';

export async function GET() {
  try {
    const sql = await getDbReady();
    const salons = await sql`
      SELECT s.*,
        (SELECT COUNT(*) FROM services WHERE salon_id = s.id AND is_active = 1) as service_count,
        (SELECT MIN(price) FROM services WHERE salon_id = s.id AND is_active = 1) as min_price
      FROM salons s
      WHERE s.is_approved = 1
      ORDER BY s.rating DESC, s.created_at DESC
    `;
    return NextResponse.json({ salons });
  } catch (error) {
    console.error('Fetch salons error:', error);
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
    const sql = await getDbReady();
    const salonId = uuid();
    const ownerId = (session.user as any).id;
    const hours = JSON.stringify(opening_hours || {});
    await sql`
      INSERT INTO salons (id, owner_id, name, description, address, city, phone, email, opening_hours)
      VALUES (${salonId}, ${ownerId}, ${name}, ${description || null}, ${address || null}, ${city || null}, ${phone || null}, ${email || null}, ${hours})
    `;
    return NextResponse.json({ salonId, message: 'Salon created' });
  } catch (error) {
    console.error('Create salon error:', error);
    return NextResponse.json({ error: 'Failed to create salon' }, { status: 500 });
  }
}
