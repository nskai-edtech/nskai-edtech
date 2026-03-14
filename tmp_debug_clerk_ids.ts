import { db } from "./lib/db";
import { users } from "./drizzle/schema";

async function debugClerkIds() {
  const allUsers = await db.select().from(users);
  console.log(`Total users: ${allUsers.length}`);
  allUsers.forEach(u => {
    console.log(`Email: ${u.email}, ClerkId: ${u.clerkId}, Role: ${u.role}`);
  });
}

debugClerkIds()
  .then(() => process.exit(0))
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
