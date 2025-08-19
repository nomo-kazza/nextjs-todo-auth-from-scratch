import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getUserBySessionToken } from '@/lib/auth'


export async function GET() {
  const token = cookies().get('session')?.value;
  const user = await getUserBySessionToken(token || undefined);
  if (!user) return NextResponse.json({ user: null }, { status: 401 });
  return NextResponse.json({ user: { id: user.id, email: user.email } });
}

