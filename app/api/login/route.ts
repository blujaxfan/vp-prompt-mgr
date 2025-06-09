// ai-prompt-manager-app/app/api/login/route.ts
import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { setCookie } from 'cookies-next';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { userId, password } = body;

  const { FIXED_USER_ID, FIXED_PASSWORD, JWT_SECRET } = process.env;

  if (!FIXED_USER_ID || !FIXED_PASSWORD || !JWT_SECRET) {
    console.error('Missing required environment variables for authentication.');
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
  }

  if (userId === FIXED_USER_ID && password === FIXED_PASSWORD) {
    // Credentials are correct, create a token
    const token = jwt.sign({ userId }, JWT_SECRET, { expiresIn: '1h' });

    const response = NextResponse.json({ success: true });

    // Set the token in a secure, httpOnly cookie
    setCookie('session_token', token, {
      req: request,
      res: response,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60, // 1 hour
      path: '/',
    });

    return response;
  }

  return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
}