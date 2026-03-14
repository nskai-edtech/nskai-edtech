import {
  pgTable,
  text,
  varchar,
  integer,
  uuid,
  timestamp,
  jsonb,
} from "drizzle-orm/pg-core";

// Step 1: Identity & Brand
export const schools = pgTable("schools", {
  id: uuid("id").defaultRandom().primaryKey(), // Zerra Internal UUID
  name: text("name").notNull(),
  motto: text("motto"),
  yearEstablished: integer("year_established"),
  schoolType: varchar("school_type", { length: 100 }).notNull(),
  educationLevels: jsonb("education_levels").$type<string[]>(), // e.g., ['Primary', 'Secondary']
  logoUrl: text("logo_url"),
  primaryColor: varchar("primary_color", { length: 7 }),
  curriculumType: varchar("curriculum_type", { length: 100 }),

  // [NEW] The Security Challenge Answers
  ownerName: text("owner_name").notNull(),
  ownerEmail: varchar("owner_email", { length: 255 }).notNull(),
  proprietorName: text("proprietor_name").notNull(),
  proprietorEmail: varchar("proprietor_email", { length: 255 }).notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Step 2: Contact & Location
export const schoolLocations = pgTable("school_locations", {
  id: uuid("id").defaultRandom().primaryKey(),
  schoolId: uuid("school_id")
    .notNull()
    .references(() => schools.id, { onDelete: "cascade" })
    .unique(), // Ensures strict 1-to-1 relationship
  email: varchar("email", { length: 255 }).notNull(),
  receptionPhone: varchar("reception_phone", { length: 50 }).notNull(),
  fullAddress: text("full_address").notNull(),
  country: varchar("country", { length: 100 }).notNull(),
  state: varchar("state", { length: 100 }).notNull(),
  lga: varchar("lga", { length: 100 }).notNull(),
  website: varchar("website", { length: 255 }),
});

// Step 3: Financial & Compliance
export const schoolFinancials = pgTable("school_financials", {
  id: uuid("id").defaultRandom().primaryKey(),
  schoolId: uuid("school_id")
    .notNull()
    .references(() => schools.id, { onDelete: "cascade" })
    .unique(), // Ensures strict 1-to-1 relationship
  cacRegistrationNumber: varchar("cac_registration_number", { length: 100 }),
  tin: varchar("tin", { length: 100 }),
  settlementBankName: varchar("settlement_bank_name", { length: 255 }),
  accountNumber: varchar("account_number", { length: 50 }),
  accountName: varchar("account_name", { length: 255 }),
});
