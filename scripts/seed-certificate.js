"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// scripts/seed-certificate.ts
var db_1 = require("@/lib/db");
var schema_1 = require("@/drizzle/schema");
await db_1.db.insert(schema_1.certificates).values({
    id: "demo-certificate-id",
    userId: "clerk_id_of_existing_user",
    courseId: "uuid_of_existing_course",
    createdAt: new Date(),
});
