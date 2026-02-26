import "dotenv/config";
import { db } from "@/lib/db";
import { certificates } from "@/drizzle/schema";
import { randomUUID } from "crypto";

async function main() {
  const certificateId = randomUUID(); // generates a proper UUID
  const userId = "user_392Km3zxIlRXvCarUBAQeqbr77D";
  const courseId = "2e5f736f-1b54-4fcb-b7bb-62c9ddc7c0db";
  await db.insert(certificates).values({
    id: certificateId,
    userId: userId,
    courseId: courseId,
    createdAt: new Date(),
  });

  console.log(`Demo certificate created with ID: ${certificateId}`);
}

main().catch(console.error);
