
import { redis } from './db'
import bcrypt from 'bcryptjs'

export type User = { id: string; email: string; password_hash: string; createdAt: string }
/**
 * Hash a password
 * This function hashes a password using bcrypt.
 * It generates a salt and returns the hashed password.
 *
 * @param pw the password to hash
 * @returns the hashed password
 */
export function hashPassword(pw: string) {
  const salt = bcrypt.genSaltSync(10);
  return bcrypt.hashSync(pw, salt);
}
/**
 * Verify a password against a hash
 * This function checks if the provided password matches the stored hash.
 *
 * @param pw the password to verify
 * @param hash the stored password hash
 * @returns true if the password matches, false otherwise
 */
export function verifyPassword(pw: string, hash: string) {
  return bcrypt.compareSync(pw, hash);
}
/**
 * Create a new session for a user
 * This function creates a new session in the database and returns a token.
 * The session expires after 7 days.
 *
 * @param userId the user's ID
 * @returns the session token
 */
export async function createSession(userId: string) {
  const token = [...crypto.getRandomValues(new Uint8Array(32))].map(b => b.toString(16).padStart(2, '0')).join('');
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(); // 7 days
  await redis.hset(`session:${token}`, { userId, expiresAt });
  await redis.expireat(`session:${token}`, Math.floor(new Date(expiresAt).getTime() / 1000));
  return token;
}
/**
 * Get a user by session token
 * This function retrieves a user from the database by their session token.
 * It returns the user object if found, or null if not found or expired.
 *
 * @param token the session token
 * @returns the user object or null if not found or expired
 */
export async function getUserBySessionToken(token?: string): Promise<User | null> {
  if (!token) return null;
  const sess = await redis.hgetall<{ userId: string; expiresAt: string }>(`session:${token}`);
  if (!sess || !sess.userId || !sess.expiresAt || new Date(sess.expiresAt) < new Date()) return null;
  const user = await redis.hgetall<User>(`user:${sess.userId}`);
  return user && user.id ? user : null;
}
/**
 * Clear a session by token
 * This function deletes the session from the database.
 * It is used to log out a user or clear a session.
 *
 * @param token the session token
 */
export async function clearSession(token?: string) {
  if (!token) return;
  await redis.del(`session:${token}`);
}

/**
 * Create a new user
 * This function creates a new user in the database.
 * It hashes the password and checks if the email is already in use.
 *
 * @param email the user's email
 * @param password the user's password
 * @returns user object
 * @throws Error if email is already in use
 * @throws Error if password is invalid
 */
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
/**
 * Get a user by email
 * This function retrieves a user from the database by their email.
 * It returns the user object if found, or null if not found.
 *
 * @param email the user's email
 * @returns the user object or null if not found
 */
export async function getUserByEmail(email: string): Promise<User | null> {
  const id = await redis.get<string>(`user:email:${email.toLowerCase()}`);
  if (!id) return null;
  const user = await redis.hgetall<User>(`user:${id}`);
  return user && user.id ? user : null;
}
