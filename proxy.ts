/* eslint-disable @typescript-eslint/ban-ts-comment */
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isProtectedRoute = createRouteMatcher([
  "/org(.*)",
  "/tutor(.*)",
  "/learner(.*)",
  "/onboarding(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
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

  // Blocking Tutors/Admins from /learner (Optional, but keeps things clean)
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
