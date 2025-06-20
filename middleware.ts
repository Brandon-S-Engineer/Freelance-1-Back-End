import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse, NextRequest } from 'next/server';

const isApiRoute = createRouteMatcher(['/api/:path*']);

export default clerkMiddleware(async (auth, req: NextRequest) => {
  // 1️⃣ Public API routes
  if (isApiRoute(req)) {
    return NextResponse.next();
  }

  // 2️⃣ Protect all other routes
  await auth.protect(); // ✅ This returns void on success
  return NextResponse.next();
});

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
};
