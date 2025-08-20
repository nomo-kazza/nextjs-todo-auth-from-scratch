import { NextResponse } from 'next/server';
import { clearSession } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function POST() {
  const token = cookies().get('session')?.value;
  await clearSession(token);
  const res = NextResponse.json({ ok: true });
  res.cookies.set('session', '', { httpOnly: true, path: '/', maxAge: 0 });
  return res;
}
