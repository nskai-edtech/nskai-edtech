/* eslint-disable @typescript-eslint/ban-ts-comment */
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// routes that require authentication
const isProtectedRoute = createRouteMatcher([
  "/org(.*)",
  "/tutor(.*)",
  "/learner(.*)",
  "/onboarding(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  const { userId, sessionClaims } = await auth();

  // Get the user's role from the session metadata
  // We use @ts-ignore because TypeScript doesn't know about our custom claims yet
  // @ts-ignore
  const role = sessionClaims?.metadata?.role;

  // 2. CHECK: Is user trying to access a protected route without being logged in?
  if (isProtectedRoute(req) && !userId) {
    return (await auth()).redirectToSignIn();
  }

  // 3. CHECK: Force Onboarding
  // If user is logged in, but HAS NO ROLE, they MUST go to /onboarding
  // (unless they are already there)
  if (userId && !role && !req.nextUrl.pathname.startsWith("/onboarding")) {
    return NextResponse.redirect(new URL("/onboarding", req.url));
  }

  // 4. CHECK: Prevent Onboarding Loop
  // If user HAS a role but tries to visit /onboarding, send them to their dashboard
  if (userId && role && req.nextUrl.pathname.startsWith("/onboarding")) {
    if (role === "TUTOR")
      return NextResponse.redirect(new URL("/tutor", req.url));
    if (role === "LEARNER")
      return NextResponse.redirect(new URL("/learner", req.url));
    if (role === "ORG_ADMIN")
      return NextResponse.redirect(new URL("/org", req.url));
  }

  // 5. CHECK: Role-Based Access Control (The Bouncer)

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

  // Block Tutors/Admins from /learner (Optional, but keeps things clean)
  if (
    req.nextUrl.pathname.startsWith("/learner") &&
    role !== "LEARNER" &&
    role !== "ORG_ADMIN"
  ) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
