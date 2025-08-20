import { NextResponse } from 'next/server';
import { updateTodoForUser, deleteTodoForUser } from '@/lib/db';
import { z } from 'zod';
import { cookies } from 'next/headers';
import { getUserBySessionToken } from '@/lib/auth';

export const runtime = 'edge';

const IdSchema = z.string().min(1);
const UpdateSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  completed: z.boolean().optional(),
});

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } },
) {
  const token = cookies().get('session')?.value;
  const user = await getUserBySessionToken(token || undefined);
  if (!user)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const id = IdSchema.parse(params.id);
    const body = await req.json();
    const data = UpdateSchema.parse(body);
    const todo = await updateTodoForUser(user.id, id, data);
    if (!todo)
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(todo);
  } catch (e: any) {
    return NextResponse.json(
      { error: String(e?.message || 'Invalid request') },
      { status: 400 },
    );
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } },
) {
  const token = cookies().get('session')?.value;
  const user = await getUserBySessionToken(token || undefined);
  if (!user)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const id = IdSchema.parse(params.id);
    const ok = await deleteTodoForUser(user.id, id);
    if (!ok) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json(
      { error: String(e?.message || 'Invalid request') },
      { status: 400 },
    );
  }
}
