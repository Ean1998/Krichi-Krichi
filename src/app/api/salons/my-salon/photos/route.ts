import { NextRequest, NextResponse } from 'next/server';
import { getDbReady } from '@/lib/db';
import { v4 as uuid } from 'uuid';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';

async function getMySalon() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;
  const sql = await getDbReady();
  const salons = await sql`SELECT * FROM salons WHERE owner_id = ${(session.user as any).id} LIMIT 1`;
  return salons[0] || null;
}

export async function POST(req: NextRequest) {
  try {
    const salon = await getMySalon();
    if (!salon) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { url, caption } = await req.json();
    if (!url) return NextResponse.json({ error: 'URL required' }, { status: 400 });

    const sql = await getDbReady();
    const photoId = uuid();
    await sql`INSERT INTO salon_photos (id, salon_id, url, caption) VALUES (${photoId}, ${salon.id}, ${url}, ${caption || null})`;

    const rows = await sql`SELECT * FROM salon_photos WHERE id = ${photoId}`;
    return NextResponse.json({ photo: rows[0] });
  } catch (error) {
    console.error('Add photo error:', error);
    return NextResponse.json({ error: 'Failed to add photo' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const salon = await getMySalon();
    if (!salon) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const photoId = req.nextUrl.searchParams.get('id');
    if (!photoId) return NextResponse.json({ error: 'Photo ID required' }, { status: 400 });

    const sql = await getDbReady();
    await sql`DELETE FROM salon_photos WHERE id = ${photoId} AND salon_id = ${salon.id}`;
    return NextResponse.json({ message: 'Photo deleted' });
  } catch (error) {
    console.error('Delete photo error:', error);
    return NextResponse.json({ error: 'Failed to delete photo' }, { status: 500 });
  }
}
