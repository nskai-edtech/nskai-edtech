/* eslint-disable @typescript-eslint/ban-ts-comment */
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isProtectedRoute = createRouteMatcher([
  "/org(.*)",
  "/tutor(.*)",
  "/learner(.*)",
  "/onboarding(.*)",
  "/school-dashboard(.*)",
  "/pending-approval(.*)",
  "/api/live/tutor-token"
]);

function generateCspHeaders(nonce: string) {
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' https://*.clerk.com https://*.clerk.accounts.dev https://*.sentry.io https://challenges.cloudflare.com https://va.vercel-scripts.com`,
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "img-src 'self' data: blob: https://images.unsplash.com https://plus.unsplash.com https://img.clerk.com https://api.dicebear.com https://*.utfs.io https://utfs.io https://*.ufs.sh https://ufs.sh https://image.mux.com",
    "font-src 'self' https://fonts.gstatic.com",
    "connect-src 'self' blob: https://*.clerk.com https://*.clerk.accounts.dev https://*.sentry.io https://*.mux.com https://*.uploadthing.com https://uploadthing.com https://*.ingest.uploadthing.com https://*.utfs.io https://utfs.io https://*.ufs.sh https://ufs.sh https://*.amazonaws.com wss://*.clerk.com wss://*.clerk.accounts.dev https://*.sd-rtn.com:* wss://*.sd-rtn.com:* https://*.agora.io:* wss://*.agora.io:*",
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

  // Block weird HTTP methods that regular users shouldn't be using on standard pages
  const allowedMethods = [
    "GET",
    "POST",
    "PUT",
    "DELETE",
    "PATCH",
    "OPTIONS",
    "HEAD",
  ];

  // FIXED: Using 'req' instead of 'request'
  if (!allowedMethods.includes(req.method)) {
    return new NextResponse("Method Not Allowed", { status: 405 });
  }

  const { userId, sessionClaims } = await auth();

  // @ts-ignore
  const role = sessionClaims?.metadata?.role;
  // @ts-ignore
  const status = sessionClaims?.metadata?.status;

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
  if (req.nextUrl.pathname === "/" && role === "SCHOOL_ADMIN") {
    if (status === "PENDING") {
      return NextResponse.redirect(new URL("/pending-approval", req.url));
    }
    return NextResponse.redirect(new URL("/school-dashboard", req.url));
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
    if (role === "SCHOOL_ADMIN") {
      if (status === "PENDING")
        return NextResponse.redirect(new URL("/pending-approval", req.url));
      return NextResponse.redirect(new URL("/school-dashboard", req.url));
    }
    return NextResponse.redirect(new URL("/", req.url));
  }

  if (isProtectedRoute(req) && !userId) {
    return (await auth()).redirectToSignIn();
  }

  if (
    userId &&
    (!role || role === undefined) &&
    !req.nextUrl.pathname.startsWith("/onboarding") &&
    !req.nextUrl.pathname.startsWith("/api")
  ) {
    return NextResponse.redirect(new URL("/onboarding", req.url));
  }

  // Allow pending-approval page for PENDING school admins
  if (req.nextUrl.pathname.startsWith("/pending-approval") && role === "SCHOOL_ADMIN" && status === "PENDING") {
    // Allow through — no redirect
  } else if (req.nextUrl.pathname.startsWith("/pending-approval")) {
    // Non-pending users shouldn't be here
    return NextResponse.redirect(new URL("/", req.url));
  }

  if (userId && role && req.nextUrl.pathname.startsWith("/onboarding")) {
    if (role === "TUTOR")
      return NextResponse.redirect(new URL("/tutor", req.url));
    if (role === "LEARNER")
      return NextResponse.redirect(new URL("/learner", req.url));
    if (role === "ORG_ADMIN")
      return NextResponse.redirect(new URL("/org", req.url));
    if (role === "SCHOOL_ADMIN") {
      if (status === "PENDING")
        return NextResponse.redirect(new URL("/pending-approval", req.url));
      return NextResponse.redirect(new URL("/school-dashboard", req.url));
    }
  }

  // Block non-SCHOOL_ADMINs from /school-dashboard — redirect each role to their own dashboard
  if (req.nextUrl.pathname.startsWith("/school-dashboard")) {
    if (role !== "SCHOOL_ADMIN") {
      if (role === "TUTOR") return NextResponse.redirect(new URL("/tutor", req.url));
      if (role === "LEARNER") return NextResponse.redirect(new URL("/learner", req.url));
      if (role === "ORG_ADMIN") return NextResponse.redirect(new URL("/org", req.url));
      return NextResponse.redirect(new URL("/", req.url));
    }
    if (status === "PENDING") {
      return NextResponse.redirect(new URL("/pending-approval", req.url));
    }
  }

  // Block non-TUTORs from /tutor — redirect each role to their own dashboard
  if (req.nextUrl.pathname.startsWith("/tutor") && role !== "TUTOR") {
    if (role === "SCHOOL_ADMIN") {
      return NextResponse.redirect(new URL(
        status === "PENDING" ? "/pending-approval" : "/school-dashboard",
        req.url
      ));
    }
    if (role === "LEARNER") return NextResponse.redirect(new URL("/learner", req.url));
    if (role === "ORG_ADMIN") return NextResponse.redirect(new URL("/org", req.url));
    return NextResponse.redirect(new URL("/", req.url));
  }

  // Blocking Tutors/Admins from /learner
  if (
    req.nextUrl.pathname.startsWith("/learner") &&
    role !== "LEARNER" &&
    role !== "SCHOOL_ADMIN"
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
