import { cookies } from 'next/headers';
import { deleteSession } from '@/lib/auth-db';

export async function POST() {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get('uasc_session')?.value;
    if (sessionId) await deleteSession(sessionId);
    cookieStore.set('uasc_session', '', { maxAge: 0, path: '/' });
  } catch (err) {
    console.error('[auth/logout]', err);
  }
  return Response.json({ ok: true });
}
