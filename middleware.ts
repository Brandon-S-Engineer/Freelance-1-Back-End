import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse, NextRequest } from 'next/server';

/* ────────────────────────────────────────────────────────── */
/*  Helpers                                                   */
/* ────────────────────────────────────────────────────────── */
const isApiRoute = createRouteMatcher(['/api/:path*']);

/*  Public paths that should never be protected (sign-in, etc.) */
const isPublicAuthUi = createRouteMatcher(['/sign-in(.*)', '/sign-up(.*)', '/sso-callback(.*)']);

/* ────────────────────────────────────────────────────────── */
/*  Middleware                                                */
/* ────────────────────────────────────────────────────────── */
export default clerkMiddleware(async (auth, req: NextRequest) => {
  /* 1️⃣  Allow public API routes to pass through */
  if (isApiRoute(req)) {
    return NextResponse.next();
  }

  /* 2️⃣  Allow Clerk’s own auth pages to pass through */
  if (isPublicAuthUi(req)) {
    return NextResponse.next();
  }

  /* 3️⃣  Protect everything else */
  await auth.protect(); // redirects to /sign-in when necessary
  return NextResponse.next();
});

/* ────────────────────────────────────────────────────────── */
export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
};
