import { db } from "./lib/db";
import { users, schools } from "./drizzle/schema";
import { eq, and, or } from "drizzle-orm";

async function repairData() {
  console.log("--- STARTING DATA REPAIR ---");
  
  // 1. Find the platform admin (Lawrence)
  const [admin] = await db.select().from(users).where(eq(users.email, "lawrenceozimana@gmail.com"));
  
  if (!admin) {
    console.error("Platform admin not found! Cannot repair.");
    return;
  }

  console.log(`Found Admin: ${admin.email} (${admin.id})`);

  // 2. Find all schools
  const allSchools = await db.select().from(schools);
  console.log(`Total schools found: ${allSchools.length}`);

  for (const school of allSchools) {
    console.log(`Processing school: ${school.name} (${school.id})`);
    
    // Check if any user is already linked to this school as SCHOOL_ADMIN
    const existingAdmin = await db.select().from(users).where(
      and(eq(users.schoolId, school.id), eq(users.role, "SCHOOL_ADMIN"))
    );

    if (existingAdmin.length > 0) {
      console.log(`  -> School already has admin: ${existingAdmin[0].email}. Skipping.`);
    } else {
      // Link the platform admin to the latest school for testing purposes, 
      // OR find a user whose email matches the ownerEmail/proprietorEmail
      
      const ownerUser = await db.select().from(users).where(
        or(eq(users.email, school.ownerEmail), eq(users.email, school.proprietorEmail))
      );

      if (ownerUser.length > 0) {
        console.log(`  -> Found matching owner user: ${ownerUser[0].email}. Linking...`);
        await db.update(users).set({
          role: "SCHOOL_ADMIN",
          status: "PENDING",
          schoolId: school.id
        }).where(eq(users.id, ownerUser[0].id));
      } else {
        // As a last resort for the current user's session, link it to the admin if requested or just log it
        console.log(`  -> No matching user found for emails ${school.ownerEmail} / ${school.proprietorEmail}`);
      }
    }
  }

  console.log("--- DATA REPAIR COMPLETE ---");
}

repairData()
  .then(() => process.exit(0))
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
