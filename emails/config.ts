/**
 * Shared constants for email templates.
 *
 * `BASE_URL` reads from NEXT_PUBLIC_APP_URL at render-time (server-side)
 * and falls back to the production Vercel deployment.
 */
export const BASE_URL =
  process.env.NEXT_PUBLIC_APP_URL || "https://nskai-edtech.vercel.app";

export const PLATFORM_NAME = "ZERRA";
export const CONTACT_EMAIL = "Contact@nskai.org";
export const TAGLINE = `${PLATFORM_NAME} — Learn. Build. Grow.`;
