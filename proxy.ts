/* eslint-disable @typescript-eslint/ban-ts-comment */
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isProtectedRoute = createRouteMatcher([
  "/org(.*)",
  "/tutor(.*)",
  "/learner(.*)",
  "/onboarding(.*)",
]);

function generateCspHeaders(nonce: string) {
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' https://*.clerk.com https://*.clerk.accounts.dev https://*.sentry.io https://challenges.cloudflare.com https://va.vercel-scripts.com`,
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "img-src 'self' data: blob: https://images.unsplash.com https://plus.unsplash.com https://img.clerk.com https://api.dicebear.com https://*.utfs.io https://utfs.io https://*.ufs.sh https://ufs.sh https://image.mux.com",
    "font-src 'self' https://fonts.gstatic.com",
    "connect-src 'self' https://*.clerk.com https://*.clerk.accounts.dev https://*.sentry.io https://*.mux.com https://*.uploadthing.com https://uploadthing.com https://*.utfs.io https://utfs.io https://*.ufs.sh https://ufs.sh wss://*.clerk.com wss://*.clerk.accounts.dev",
    "media-src 'self' blob: https://stream.mux.com https://*.mux.com",
    "frame-src 'self' https://*.clerk.com https://challenges.cloudflare.com",
    "worker-src 'self' blob:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'self'",
  ].join("; ");
}

export default clerkMiddleware(async (auth, req) => {
  // Generate a CSP nonce for this request
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");

  const { userId, sessionClaims } = await auth();

  // @ts-ignore
  const role = sessionClaims?.metadata?.role;

  // Redirect users to their dashboard when visiting the home page
  if (req.nextUrl.pathname === "/" && role === "ORG_ADMIN") {
    return NextResponse.redirect(new URL("/org", req.url));
  }
  if (req.nextUrl.pathname === "/" && role === "TUTOR") {
    return NextResponse.redirect(new URL("/tutor", req.url));
  }
  if (req.nextUrl.pathname === "/" && role === "LEARNER") {
    return NextResponse.redirect(new URL("/learner", req.url));
  }

  // Redirect authenticated users away from auth pages
  if (
    userId &&
    (req.nextUrl.pathname.startsWith("/sign-in") ||
      req.nextUrl.pathname.startsWith("/sign-up"))
  ) {
    if (role === "TUTOR")
      return NextResponse.redirect(new URL("/tutor", req.url));
    if (role === "LEARNER")
      return NextResponse.redirect(new URL("/learner", req.url));
    if (role === "ORG_ADMIN")
      return NextResponse.redirect(new URL("/org", req.url));
    return NextResponse.redirect(new URL("/", req.url));
  }

  if (isProtectedRoute(req) && !userId) {
    return (await auth()).redirectToSignIn();
  }

  if (userId && !role && !req.nextUrl.pathname.startsWith("/onboarding")) {
    return NextResponse.redirect(new URL("/onboarding", req.url));
  }

  if (userId && role && req.nextUrl.pathname.startsWith("/onboarding")) {
    if (role === "TUTOR")
      return NextResponse.redirect(new URL("/tutor", req.url));
    if (role === "LEARNER")
      return NextResponse.redirect(new URL("/learner", req.url));
    if (role === "ORG_ADMIN")
      return NextResponse.redirect(new URL("/org", req.url));
  }

  // Block Non-Admins from /org
  if (req.nextUrl.pathname.startsWith("/org") && role !== "ORG_ADMIN") {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // Block Learners from /tutor
  if (
    req.nextUrl.pathname.startsWith("/tutor") &&
    role !== "TUTOR" &&
    role !== "ORG_ADMIN"
  ) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // Blocking Tutors/Admins from /learner
  if (
    req.nextUrl.pathname.startsWith("/learner") &&
    role !== "LEARNER" &&
    role !== "ORG_ADMIN"
  ) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  const response = NextResponse.next({
    request: {
      headers: new Headers([
        ...Array.from(req.headers.entries()),
        ["x-nonce", nonce],
      ]),
    },
  });

  response.headers.set("Content-Security-Policy", generateCspHeaders(nonce));

  return response;
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
