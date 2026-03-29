import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { v4 as uuid } from 'uuid';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';

const COMMISSION_RATE = parseFloat(process.env.COMMISSION_RATE || '0.15');

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { salon_id, service_id, customer_name, customer_email, customer_phone, booking_date, booking_time, notes, total_price } = body;

    if (!salon_id || !service_id || !customer_name || !customer_phone || !booking_date || !booking_time) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const session = await getServerSession(authOptions);
    const db = getDb();
    const bookingId = uuid();
    const commission = total_price * COMMISSION_RATE;

    db.prepare(`
      INSERT INTO bookings (id, salon_id, service_id, customer_name, customer_email, customer_phone, customer_user_id, booking_date, booking_time, total_price, commission, notes, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'confirmed')
    `).run(bookingId, salon_id, service_id, customer_name, customer_email || null, customer_phone, (session?.user as any)?.id || null, booking_date, booking_time, total_price, commission, notes || null);

    return NextResponse.json({ bookingId, message: 'Booking confirmed', commission });
  } catch (error) {
    return NextResponse.json({ error: 'Booking failed' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const db = getDb();
    const userId = (session.user as any).id;
    const role = (session.user as any).role;

    let bookings;
    if (role === 'admin') {
      bookings = db.prepare(`
        SELECT b.*, s.name as salon_name, sv.name as service_name
        FROM bookings b
        JOIN salons s ON b.salon_id = s.id
        JOIN services sv ON b.service_id = sv.id
        ORDER BY b.created_at DESC
      `).all();
    } else if (role === 'salon') {
      bookings = db.prepare(`
        SELECT b.*, s.name as salon_name, sv.name as service_name
        FROM bookings b
        JOIN salons s ON b.salon_id = s.id
        JOIN services sv ON b.service_id = sv.id
        WHERE s.owner_id = ?
        ORDER BY b.booking_date DESC, b.booking_time DESC
      `).all(userId);
    } else {
      bookings = db.prepare(`
        SELECT b.*, s.name as salon_name, sv.name as service_name
        FROM bookings b
        JOIN salons s ON b.salon_id = s.id
        JOIN services sv ON b.service_id = sv.id
        WHERE b.customer_user_id = ?
        ORDER BY b.booking_date DESC
      `).all(userId);
    }

    return NextResponse.json({ bookings });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 });
  }
}
