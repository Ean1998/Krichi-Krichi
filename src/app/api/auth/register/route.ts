import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { v4 as uuid } from 'uuid';

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, role, phone } = await req.json();
    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Name, email, and password are required' }, { status: 400 });
    }
    const db = getDb();
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existing) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 400 });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = uuid();
    db.prepare('INSERT INTO users (id, email, password, name, role, phone) VALUES (?, ?, ?, ?, ?, ?)').run(
      userId, email, hashedPassword, name, role || 'customer', phone || null
    );
    return NextResponse.json({ userId, message: 'Account created successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 });
  }
}
