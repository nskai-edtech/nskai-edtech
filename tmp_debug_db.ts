import { db } from "./lib/db";
import { users, schools } from "./drizzle/schema";
import { eq, and } from "drizzle-orm";

async function debugPending() {
  console.log("--- DEBUGGING USERS ---");
  const allUsers = await db.select().from(users);
  allUsers.forEach(u => {
    if (u.role === "SCHOOL_ADMIN" || u.status === "PENDING" || u.email.includes("lawrence")) {
      console.log(`Email: ${u.email}, Role: ${u.role}, Status: ${u.status}, SchoolId: ${u.schoolId}`);
    }
  });
  
  console.log("--- VERIFYING JOINED QUERY ---");
  const joined = await db
    .select({
      user: users.email,
      school: schools.name,
      role: users.role,
      status: users.status
    })
    .from(users)
    .innerJoin(schools, eq(users.schoolId, schools.id))
    .where(and(eq(users.role, "SCHOOL_ADMIN"), eq(users.status, "PENDING")));
    
  console.log("Joined Pending Schools Query Result:", JSON.stringify(joined, null, 2));
}

debugPending()
  .then(() => process.exit(0))
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
