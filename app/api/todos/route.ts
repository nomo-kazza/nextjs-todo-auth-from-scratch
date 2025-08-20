import { NextResponse } from 'next/server';
import { listTodosByUser, createTodoForUser } from '@/lib/db';
import { z } from 'zod';
import { cookies } from 'next/headers';
import { getUserBySessionToken } from '@/lib/auth';

export async function GET() {
  const token = cookies().get('session')?.value;
  const user = await getUserBySessionToken(token || undefined);
  if (!user)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const todos = await listTodosByUser(user.id);
  return NextResponse.json(todos);
}

const CreateSchema = z.object({ title: z.string().min(1).max(200) });

export async function POST(req: Request) {
  const token = cookies().get('session')?.value;
  const user = await getUserBySessionToken(token || undefined);
  if (!user)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const body = await req.json();
    const { title } = CreateSchema.parse(body);
    const todo = await createTodoForUser(user.id, title);
    return NextResponse.json(todo, { status: 201 });
  } catch (e: any) {
    return NextResponse.json(
      { error: String(e?.message || 'Invalid request') },
      { status: 400 },
    );
  }
}
