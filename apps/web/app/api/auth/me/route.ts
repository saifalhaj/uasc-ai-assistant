import { cookies } from 'next/headers';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';

export async function GET() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get('uasc_session')?.value;

  if (!sessionId) {
    return Response.json(null, { status: 401 });
  }

  const apiRes = await fetch(`${API_URL}/auth/me`, {
    headers: { 'X-Session-Id': sessionId },
  });

  if (!apiRes.ok) {
    return Response.json(null, { status: 401 });
  }

  return Response.json(await apiRes.json());
}
