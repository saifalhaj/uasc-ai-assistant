import { cookies } from 'next/headers';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';

export async function POST(request: Request) {
  const body = await request.json();

  const apiRes = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const data = await apiRes.json();

  if (!apiRes.ok) {
    return Response.json(data, { status: apiRes.status });
  }

  // Set httpOnly session cookie (server-side, not readable by JS)
  const cookieStore = await cookies();
  cookieStore.set('uasc_session', data.sessionId, {
    httpOnly: true,
    path: '/',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24, // 24 hours
    secure: process.env.NODE_ENV === 'production',
  });

  return Response.json({ user: data.user });
}
