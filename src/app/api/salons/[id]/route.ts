import { NextRequest, NextResponse } from 'next/server';
import { getDbReady } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const sql = await getDbReady();
    const salons = await sql`SELECT * FROM salons WHERE id = ${params.id}`;
    if (salons.length === 0) return NextResponse.json({ error: 'Salon not found' }, { status: 404 });

    const services = await sql`SELECT * FROM services WHERE salon_id = ${params.id} AND is_active = 1 ORDER BY category, name`;
    const photos = await sql`SELECT * FROM salon_photos WHERE salon_id = ${params.id} ORDER BY created_at DESC`;
    const reviews = await sql`SELECT * FROM reviews WHERE salon_id = ${params.id} ORDER BY created_at DESC LIMIT 50`;

    return NextResponse.json({ salon: salons[0], services, photos, reviews });
  } catch (error) {
    console.error('Fetch salon error:', error);
    return NextResponse.json({ error: 'Failed to fetch salon' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const sql = await getDbReady();
    const salons = await sql`SELECT * FROM salons WHERE id = ${params.id}`;
    if (salons.length === 0) return NextResponse.json({ error: 'Salon not found' }, { status: 404 });
    const salon = salons[0];
    if (salon.owner_id !== (session.user as any).id && (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const { name, description, address, city, phone, email, cover_image, logo, opening_hours } = body;
    const hours = JSON.stringify(opening_hours || {});

    if (cover_image) {
      await sql`UPDATE salons SET name = ${name}, description = ${description || null}, address = ${address || null}, city = ${city || null}, phone = ${phone || null}, email = ${email || null}, cover_image = ${cover_image}, opening_hours = ${hours} WHERE id = ${params.id}`;
    } else if (logo) {
      await sql`UPDATE salons SET name = ${name}, description = ${description || null}, address = ${address || null}, city = ${city || null}, phone = ${phone || null}, email = ${email || null}, logo = ${logo}, opening_hours = ${hours} WHERE id = ${params.id}`;
    } else {
      await sql`UPDATE salons SET name = ${name}, description = ${description || null}, address = ${address || null}, city = ${city || null}, phone = ${phone || null}, email = ${email || null}, opening_hours = ${hours} WHERE id = ${params.id}`;
    }

    return NextResponse.json({ message: 'Salon updated' });
  } catch (error) {
    console.error('Update salon error:', error);
    return NextResponse.json({ error: 'Failed to update salon' }, { status: 500 });
  }
}
