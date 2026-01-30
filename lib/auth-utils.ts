import { db } from "@/lib/db";
import { users } from "@/drizzle/schema";
import { eq } from "drizzle-orm";

/**
 * Helper to get the internal database User ID from the Clerk User ID.
 * @param clerkId The user ID from Clerk auth()
 * @returns The user record or null
 */
export async function getInternalUser(clerkId: string) {
  const user = await db.query.users.findFirst({
    where: eq(users.clerkId, clerkId),
  });
  return user;
}
