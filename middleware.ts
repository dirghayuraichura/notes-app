import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Handle Socket.IO requests
  if (request.url.includes('/api/socket')) {
    // Allow all Socket.IO related requests
    return NextResponse.next();
  }

  // For all other API requests
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/api/socket/:path*',
    '/api/notes/:path*',
  ],
}; 