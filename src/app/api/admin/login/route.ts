import { NextRequest, NextResponse } from 'next/server';
import { isValidAdminCredentials, setAdminSession } from '@/lib/admin-auth';

const ATTEMPT_COOKIE = 'admin_login_attempts';
const MAX_ATTEMPTS = 2;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const username = String(body?.username || '');
    const password = String(body?.password || '');
    const sessionSecret = String(body?.sessionSecret || '');

    // Get attempts from cookie
    let attempts = 0;
    let locked = false;
    const cookie = request.cookies.get(ATTEMPT_COOKIE)?.value;
    if (cookie) {
      try {
        const parsed = JSON.parse(cookie);
        attempts = parsed.attempts || 0;
        locked = parsed.locked || false;
      } catch {}
    }

    // If locked, require sessionSecret
    if (locked) {
      const expectedSecret = process.env.ADMIN_SESSION_SECRET;
      if (!sessionSecret) {
        const res = NextResponse.json({
          error: 'Túl sok hibás próbálkozás. Add meg az admin session titkos kulcsot!',
          requireSessionSecret: true
        }, { status: 403 });
        res.cookies.set(ATTEMPT_COOKIE, JSON.stringify({ attempts, locked }), {
          httpOnly: true,
          sameSite: 'lax',
          path: '/',
          maxAge: 60 * 10
        });
        return res;
      }
      if (sessionSecret !== expectedSecret) {
        const res = NextResponse.json({
          error: 'Hibás titkos kulcs.',
          requireSessionSecret: true
        }, { status: 403 });
        res.cookies.set(ATTEMPT_COOKIE, JSON.stringify({ attempts, locked }), {
          httpOnly: true,
          sameSite: 'lax',
          path: '/',
          maxAge: 60 * 10
        });
        return res;
      }
      // Correct secret, unlock
      const res = NextResponse.json({ success: true, unlocked: true });
      res.cookies.set(ATTEMPT_COOKIE, JSON.stringify({ attempts: 0, locked: false }), {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 10
      });
      return res;
    }

    // Not locked, check credentials
    if (!isValidAdminCredentials(username, password)) {
      attempts += 1;
      if (attempts >= MAX_ATTEMPTS) {
        locked = true;
      }
      const res = NextResponse.json({ error: 'Hibás felhasználónév vagy jelszó.', locked }, { status: 401 });
      res.cookies.set(ATTEMPT_COOKIE, JSON.stringify({ attempts, locked }), {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 10
      });
      return res;
    }

    // Success: reset attempts, set session
    const response = NextResponse.json({ success: true });
    setAdminSession(response);
    response.cookies.set(ATTEMPT_COOKIE, JSON.stringify({ attempts: 0, locked: false }), {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 10
    });
    return response;
  } catch (error) {
    console.error('Admin login error:', error);
    return NextResponse.json({ error: 'Belépés sikertelen.' }, { status: 500 });
  }
}
