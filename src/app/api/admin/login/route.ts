import { NextRequest, NextResponse } from 'next/server';
import { isValidAdminCredentials, setAdminSession } from '@/lib/admin-auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const username = String(body?.username || '');
    const password = String(body?.password || '');

    if (!isValidAdminCredentials(username, password)) {
      return NextResponse.json({ error: 'Hibás felhasználónév vagy jelszó.' }, { status: 401 });
    }

    const response = NextResponse.json({ success: true });
    setAdminSession(response);
    return response;
  } catch (error) {
    console.error('Admin login error:', error);
    return NextResponse.json({ error: 'Belépés sikertelen.' }, { status: 500 });
  }
}
