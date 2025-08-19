import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createSession, createUser } from '@/lib/auth'

const schema = z.object({ email: z.string().email(), password: z.string().min(8).max(100) })


export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = schema.parse(body);
    const user = await createUser(email, password);
    const token = await createSession(user.id);
    const res = NextResponse.json({ ok: true });
    res.cookies.set('session', token, { httpOnly: true, sameSite: 'lax', path: '/', maxAge: 60 * 60 * 24 * 7 });
    return res;
  } catch (e: any) {
    const msg = String(e?.message || 'Invalid');
    const status = /in use/i.test(msg) ? 409 : 400;
    return NextResponse.json({ error: msg }, { status });
  }
}

