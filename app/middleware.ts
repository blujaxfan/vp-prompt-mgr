// ai-prompt-manager-app/middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import { getCookie } from 'cookies-next';
import * as jose from 'jose';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionToken = getCookie('session_token', { req: request });
  const secret = new TextEncoder().encode(process.env.JWT_SECRET);

  let isTokenValid = false;

  if (sessionToken) {
    try {
      await jose.jwtVerify(sessionToken, secret);
      isTokenValid = true;
    } catch (error) {
      // Token is invalid or expired
      isTokenValid = false;
    }
  }

  // If the user is trying to access a protected page without a valid token,
  // redirect them to the login page.
  if (!isTokenValid && pathname !== '/login') {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // If the user is authenticated and tries to visit the login page,
  // redirect them to the home page.
  if (isTokenValid && pathname === '/login') {
    return NextResponse.redirect(new URL('/', request.url));
  }
  
  // Also, add an API route for logout
  if (pathname === '/api/logout') {
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.set('session_token', '', { maxAge: -1 }); // Delete cookie
    return response;
  }

  return NextResponse.next();
}

// Specify which paths the middleware should apply to
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};