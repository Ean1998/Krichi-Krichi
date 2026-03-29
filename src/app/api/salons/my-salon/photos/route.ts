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
    if (!salon) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { url, caption } = await req.json();
    if (!url) return NextResponse.json({ error: 'URL required' }, { status: 400 });

    const db = getDb();
    const photoId = uuid();
    db.prepare('INSERT INTO salon_photos (id, salon_id, url, caption) VALUES (?, ?, ?, ?)').run(photoId, salon.id, url, caption || null);

    const photo = db.prepare('SELECT * FROM salon_photos WHERE id = ?').get(photoId);
    return NextResponse.json({ photo });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to add photo' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const salon = await getMySalon();
    if (!salon) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const photoId = req.nextUrl.searchParams.get('id');
    if (!photoId) return NextResponse.json({ error: 'Photo ID required' }, { status: 400 });

    const db = getDb();
    db.prepare('DELETE FROM salon_photos WHERE id = ? AND salon_id = ?').run(photoId, salon.id);
    return NextResponse.json({ message: 'Photo deleted' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete photo' }, { status: 500 });
  }
}
