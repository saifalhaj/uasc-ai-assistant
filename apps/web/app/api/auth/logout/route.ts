import { cookies } from 'next/headers';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';

export async function POST() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get('uasc_session')?.value;

  if (sessionId) {
    await fetch(`${API_URL}/auth/logout`, {
      method: 'POST',
      headers: { 'X-Session-Id': sessionId },
    }).catch(() => {});
  }

  cookieStore.set('uasc_session', '', {
    httpOnly: true,
    path: '/',
    maxAge: 0,
  });

  return Response.json({ ok: true });
}
