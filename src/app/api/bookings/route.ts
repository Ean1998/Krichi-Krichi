import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { v4 as uuid } from 'uuid';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';

const COMMISSION_RATE = parseFloat(process.env.COMMISSION_RATE || '0.06');

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { salon_id, service_id, customer_name, customer_email, customer_phone, booking_date, booking_time, notes, total_price } = body;

    if (!salon_id || !service_id || !customer_name || !customer_phone || !booking_date || !booking_time) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const session = await getServerSession(authOptions);
    const sql = getDb();
    const bookingId = uuid();
    const commission = total_price * COMMISSION_RATE;
    const customerUserId = (session?.user as any)?.id || null;

    await sql`
      INSERT INTO bookings (id, salon_id, service_id, customer_name, customer_email, customer_phone, customer_user_id, booking_date, booking_time, total_price, commission, notes, status)
      VALUES (${bookingId}, ${salon_id}, ${service_id}, ${customer_name}, ${customer_email || null}, ${customer_phone}, ${customerUserId}, ${booking_date}, ${booking_time}, ${total_price}, ${commission}, ${notes || null}, 'confirmed')
    `;

    return NextResponse.json({ bookingId, message: 'Booking confirmed', commission });
  } catch (error) {
    console.error('Booking error:', error);
    return NextResponse.json({ error: 'Booking failed' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const sql = getDb();
    const userId = (session.user as any).id;
    const role = (session.user as any).role;

    let bookings;
    if (role === 'admin') {
      bookings = await sql`
        SELECT b.*, s.name as salon_name, sv.name as service_name
        FROM bookings b
        JOIN salons s ON b.salon_id = s.id
        JOIN services sv ON b.service_id = sv.id
        ORDER BY b.created_at DESC
      `;
    } else if (role === 'salon') {
      bookings = await sql`
        SELECT b.*, s.name as salon_name, sv.name as service_name
        FROM bookings b
        JOIN salons s ON b.salon_id = s.id
        JOIN services sv ON b.service_id = sv.id
        WHERE s.owner_id = ${userId}
        ORDER BY b.booking_date DESC, b.booking_time DESC
      `;
    } else {
      bookings = await sql`
        SELECT b.*, s.name as salon_name, sv.name as service_name
        FROM bookings b
        JOIN salons s ON b.salon_id = s.id
        JOIN services sv ON b.service_id = sv.id
        WHERE b.customer_user_id = ${userId}
        ORDER BY b.booking_date DESC
      `;
    }

    return NextResponse.json({ bookings });
  } catch (error) {
    console.error('Fetch bookings error:', error);
    return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 });
  }
}
