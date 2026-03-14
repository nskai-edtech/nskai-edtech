import { db } from "./lib/db";
import { users } from "./drizzle/schema";
import { isNotNull } from "drizzle-orm";

async function debugUsersWithSchool() {
  const usersWithSchool = await db.select().from(users).where(isNotNull(users.schoolId));
  console.log(`Users with schoolId: ${usersWithSchool.length}`);
  usersWithSchool.forEach(u => {
    console.log(`Email: ${u.email}, Role: ${u.role}, Status: ${u.status}, SchoolId: ${u.schoolId}`);
  });
}

debugUsersWithSchool()
  .then(() => process.exit(0))
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
