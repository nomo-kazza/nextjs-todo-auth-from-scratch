import { Redis } from '@upstash/redis';

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export type Todo = {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
  userId: string;
};

export async function listTodosByUser(userId: string): Promise<Todo[]> {
  const todos = await redis.lrange<Todo>(`todos:${userId}`, 0, -1);
  return todos || [];
}

export async function createTodoForUser(
  userId: string,
  title: string,
): Promise<Todo> {
  const todo: Todo = {
    id: crypto.randomUUID(),
    title,
    completed: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    userId,
  };
  await redis.rpush(`todos:${userId}`, todo);
  return todo;
}

export async function updateTodoForUser(
  userId: string,
  id: string,
  data: Partial<Pick<Todo, 'title' | 'completed'>>,
): Promise<Todo | null> {
  const todos = await listTodosByUser(userId);
  const idx = todos.findIndex((t) => t.id === id);
  if (idx === -1) return null;
  const updated = {
    ...todos[idx],
    ...data,
    updatedAt: new Date().toISOString(),
  };
  todos[idx] = updated;
  await redis.del(`todos:${userId}`);
  await redis.rpush(`todos:${userId}`, ...todos);
  return updated;
}

export async function deleteTodoForUser(
  userId: string,
  id: string,
): Promise<boolean> {
  const todos = await listTodosByUser(userId);
  const filtered = todos.filter((t) => t.id !== id);
  await redis.del(`todos:${userId}`);
  await redis.rpush(`todos:${userId}`, ...filtered);
  return filtered.length < todos.length;
}
