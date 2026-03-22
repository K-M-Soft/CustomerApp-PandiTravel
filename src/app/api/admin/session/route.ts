import { NextRequest, NextResponse } from 'next/server';

import { isAdminRequest } from '@/lib/admin-auth';
const ATTEMPT_COOKIE = 'admin_login_attempts';

export async function GET(request: NextRequest) {
  // Check lockout status from cookie
  let locked = false;
  const cookie = request.cookies.get(ATTEMPT_COOKIE)?.value;
  if (cookie) {
    try {
      const parsed = JSON.parse(cookie);
      locked = parsed.locked || false;
    } catch {}
  }
  return NextResponse.json({ authenticated: isAdminRequest(request), locked });
}
