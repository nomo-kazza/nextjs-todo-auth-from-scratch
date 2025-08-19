import { NextResponse } from 'next/server'
import { z } from 'zod'
import { verifyPassword, createSession, getUserByEmail } from '@/lib/auth'

const schema = z.object({ email: z.string().email(), password: z.string().min(8).max(100) })


export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = schema.parse(body);
    const user = await getUserByEmail(email);
    if (!user || !verifyPassword(password, user.password_hash)) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }
    const token = await createSession(user.id);
    const res = NextResponse.json({ ok: true, user: { id: user.id, email: user.email } });
    res.cookies.set('session', token, { httpOnly: true, sameSite: 'lax', path: '/', maxAge: 60 * 60 * 24 * 7 });
    return res;
  } catch (e: any) {
    return NextResponse.json({ error: String(e?.message || 'Invalid') }, { status: 400 });
  }
}

