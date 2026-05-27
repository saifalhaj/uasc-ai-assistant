/**
 * Server-only auth helpers.
 * Talks directly to Supabase — no FastAPI dependency needed on Vercel.
 *
 * Required env vars (Vercel project settings, NOT NEXT_PUBLIC_):
 *   SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 */

import { createClient } from '@supabase/supabase-js';
import { pbkdf2Sync, randomBytes, randomUUID } from 'crypto';

// ── Supabase client (server-side only) ────────────────────────────────────────

function getSupabase() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars');
  }
  return createClient(url, key, { auth: { persistSession: false } });
}

// ── Password hashing (must match Python: pbkdf2_hmac sha256 100k iters) ──────

function hashPassword(password: string, salt: string): string {
  return pbkdf2Sync(password, salt, 100_000, 32, 'sha256').toString('hex');
}

function generateSalt(): string {
  return randomBytes(16).toString('hex');
}

export function verifyPassword(plaintext: string, salt: string, storedHash: string): boolean {
  return hashPassword(plaintext, salt) === storedHash;
}

// ── Types ─────────────────────────────────────────────────────────────────────

export interface DbUser {
  id: string;
  station_id: string;
  password_hash: string;
  password_salt: string;
  level: string;
  display_name: string;
  clearance_label: string;
}

// ── DB operations ─────────────────────────────────────────────────────────────

export async function getUserByStation(stationId: string): Promise<DbUser | null> {
  const supabase = getSupabase();
  const { data } = await supabase
    .from('users')
    .select('*')
    .eq('station_id', stationId)
    .single();
  return (data as DbUser) ?? null;
}

export async function createSession(
  sessionId: string,
  userId: string,
  expiresAt: string,
): Promise<void> {
  const supabase = getSupabase();
  await supabase.from('sessions').insert({
    id: sessionId,
    user_id: userId,
    expires_at: expiresAt,
  });
}

export async function getSessionUser(sessionId: string): Promise<DbUser | null> {
  const supabase = getSupabase();
  const now = new Date().toISOString();
  const { data } = await supabase
    .from('sessions')
    .select('users(*)')
    .eq('id', sessionId)
    .gt('expires_at', now)
    .single();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return ((data as any)?.users as DbUser) ?? null;
}

export async function deleteSession(sessionId: string): Promise<void> {
  const supabase = getSupabase();
  await supabase.from('sessions').delete().eq('id', sessionId);
}

// ── Default account seeding ───────────────────────────────────────────────────

const SEED_USERS = [
  { station_id: 'uasc-L02', password: 'L02', level: 'L2', display_name: 'Operator', clearance_label: 'L2 · OPERATOR' },
  { station_id: 'uasc-L03', password: 'L03', level: 'L3', display_name: 'Analyst',  clearance_label: 'L3 · ANALYST'  },
  { station_id: 'uasc-L04', password: 'L04', level: 'L4', display_name: 'Ops Lead', clearance_label: 'L4 · OPS-LEAD' },
];

/**
 * Seeds default station accounts if the users table is empty.
 * Safe to call on every login request — skips immediately if rows exist.
 */
export async function ensureSeeded(): Promise<void> {
  const supabase = getSupabase();
  const { count, error } = await supabase
    .from('users')
    .select('id', { count: 'exact', head: true });

  // If rows already exist (or we can't tell), skip
  if (error || (count !== null && count > 0)) return;

  for (const u of SEED_USERS) {
    const salt = generateSalt();
    const hash = hashPassword(u.password, salt);
    await supabase.from('users').upsert(
      {
        id: randomUUID(),
        station_id: u.station_id,
        password_hash: hash,
        password_salt: salt,
        level: u.level,
        display_name: u.display_name,
        clearance_label: u.clearance_label,
      },
      { onConflict: 'station_id' },
    );
  }
}
