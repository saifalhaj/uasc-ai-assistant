import { cookies } from 'next/headers';
import { randomBytes } from 'crypto';
import { getUserByStation, verifyPassword, createSession, ensureSeeded } from '@/lib/auth-db';

const SESSION_TTL_SECONDS = 60 * 60 * 24; // 24 hours

export async function POST(request: Request) {
  try {
    const { stationId, passphrase } = await request.json();

    // Seed default accounts on first-ever login (no-op if rows already exist)
    await ensureSeeded();

    const user = await getUserByStation(stationId);
    if (!user || !verifyPassword(passphrase, user.password_salt, user.password_hash)) {
      return Response.json(
        { detail: 'AUTH-403 · Invalid station ID or passphrase.' },
        { status: 403 },
      );
    }

    const sessionId = randomBytes(32).toString('base64url');
    const expiresAt = new Date(Date.now() + SESSION_TTL_SECONDS * 1000).toISOString();
    await createSession(sessionId, user.id, expiresAt);

    const cookieStore = await cookies();
    cookieStore.set('uasc_session', sessionId, {
      httpOnly: true,
      path: '/',
      sameSite: 'lax',
      maxAge: SESSION_TTL_SECONDS,
      secure: process.env.NODE_ENV === 'production',
    });

    return Response.json({
      user: {
        stationId: user.station_id,
        displayName: user.display_name,
        level: user.level,
        clearanceLabel: user.clearance_label,
      },
    });
  } catch (err) {
    console.error('[auth/login]', err);
    return Response.json({ detail: 'AUTH-500 · Server error.' }, { status: 500 });
  }
}
