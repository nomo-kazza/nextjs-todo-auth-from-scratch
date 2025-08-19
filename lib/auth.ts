
import { redis } from './db'
import bcrypt from 'bcryptjs'

export type User = { id: string; email: string; password_hash: string; createdAt: string }

export function hashPassword(pw: string) {
  const salt = bcrypt.genSaltSync(10);
  return bcrypt.hashSync(pw, salt);
}
export function verifyPassword(pw: string, hash: string) {
  return bcrypt.compareSync(pw, hash);
}
export async function createSession(userId: string) {
  const token = [...crypto.getRandomValues(new Uint8Array(32))].map(b => b.toString(16).padStart(2, '0')).join('');
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(); // 7 days
  await redis.hset(`session:${token}`, { userId, expiresAt });
  await redis.expireat(`session:${token}`, Math.floor(new Date(expiresAt).getTime() / 1000));
  return token;
}
export async function getUserBySessionToken(token?: string): Promise<User | null> {
  if (!token) return null;
  const sess = await redis.hgetall<{ userId: string; expiresAt: string }>(`session:${token}`);
  if (!sess || !sess.userId || !sess.expiresAt || new Date(sess.expiresAt) < new Date()) return null;
  const user = await redis.hgetall<User>(`user:${sess.userId}`);
  return user && user.id ? user : null;
}
export async function clearSession(token?: string) {
  if (!token) return;
  await redis.del(`session:${token}`);
}

export async function createUser(email: string, password: string): Promise<User> {
  const id = crypto.randomUUID();
  const createdAt = new Date().toISOString();
  const password_hash = hashPassword(password);
  const user: User = { id, email: email.toLowerCase(), password_hash, createdAt };
  // Check for existing user
  const existing = await redis.get<string>(`user:email:${user.email}`);
  if (existing) throw new Error('Email already in use');
  await redis.hset(`user:${id}`, user);
  await redis.set(`user:email:${user.email}`, id);
  return user;
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const id = await redis.get<string>(`user:email:${email.toLowerCase()}`);
  if (!id) return null;
  const user = await redis.hgetall<User>(`user:${id}`);
  return user && user.id ? user : null;
}
