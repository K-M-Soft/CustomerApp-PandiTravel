import { NextRequest, NextResponse } from 'next/server';

export const ADMIN_SESSION_COOKIE = 'pandi_admin_session';

function getAdminUsername() {
  return process.env.ADMIN_USERNAME || 'admin';
}

function getAdminPassword() {
  return process.env.ADMIN_PASSWORD || 'admin';
}

function getSessionSecret() {
  return process.env.ADMIN_SESSION_SECRET || 'pandi-travel-admin-secret';
}

function getExpectedToken() {
  return Buffer.from(
    `${getAdminUsername()}:${getAdminPassword()}:${getSessionSecret()}`
  ).toString('base64url');
}

export function isValidAdminCredentials(username: string, password: string) {
  return username === getAdminUsername() && password === getAdminPassword();
}

export function isAdminRequest(request: NextRequest) {
  const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  return token === getExpectedToken();
}

export function setAdminSession(response: NextResponse) {
  response.cookies.set({
    name: ADMIN_SESSION_COOKIE,
    value: getExpectedToken(),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 8,
  });
}

export function clearAdminSession(response: NextResponse) {
  response.cookies.set({
    name: ADMIN_SESSION_COOKIE,
    value: '',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
}
