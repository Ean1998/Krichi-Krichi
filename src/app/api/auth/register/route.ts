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
    const sql = getDb();
    const existing = await sql`SELECT id FROM users WHERE email = ${email}`;
    if (existing.length > 0) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 400 });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = uuid();
    await sql`INSERT INTO users (id, email, password, name, role, phone) VALUES (${userId}, ${email}, ${hashedPassword}, ${name}, ${role || 'customer'}, ${phone || null})`;
    return NextResponse.json({ userId, message: 'Account created successfully' });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 });
  }
}
