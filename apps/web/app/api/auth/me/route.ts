import { cookies } from 'next/headers';
import { getSessionUser } from '@/lib/auth-db';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get('uasc_session')?.value;
    if (!sessionId) return Response.json(null, { status: 401 });

    const user = await getSessionUser(sessionId);
    if (!user) return Response.json(null, { status: 401 });

    return Response.json({
      stationId: user.station_id,
      displayName: user.display_name,
      level: user.level,
      clearanceLabel: user.clearance_label,
    });
  } catch (err) {
    console.error('[auth/me]', err);
    return Response.json(null, { status: 401 });
  }
}
