import {
  pgTable,
  uuid,
  text,
  timestamp,
  boolean,
  integer,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { users } from "./users";

// 10. SKILLS (Graph Nodes)
export const skills = pgTable("skill", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: text("title").notNull(),
  category: text("category").notNull(), // e.g., "Frontend", "Backend"
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 11. SKILL DEPENDENCIES (Edges)
export const skillDependencies = pgTable("skill_dependency", {
  id: uuid("id").defaultRandom().primaryKey(),
  skillId: uuid("skill_id")
    .references(() => skills.id, { onDelete: "cascade" })
    .notNull(),
  prerequisiteSkillId: uuid("prerequisite_skill_id")
    .references(() => skills.id, { onDelete: "cascade" })
    .notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 12. USER SKILLS (Mastery)
export const userSkills = pgTable("user_skill", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  skillId: uuid("skill_id")
    .references(() => skills.id, { onDelete: "cascade" })
    .notNull(),
  masteryScore: integer("mastery_score").default(0).notNull(), // 0-100
  lastAssessedAt: timestamp("last_assessed_at").defaultNow(),
});

// 13. ASSESSMENTS (Diagnostic)
export const assessments = pgTable("assessment", {
  id: uuid("id").defaultRandom().primaryKey(),
  skillId: uuid("skill_id")
    .references(() => skills.id, { onDelete: "cascade" })
    .notNull(),
  questionText: text("question_text").notNull(),
  options: text("options").array().notNull(), // Postgres Array
  correctOption: integer("correct_option").notNull(), // Index
  difficulty: text("difficulty").default("BEGINNER"), // BEGINNER, INTERMEDIATE, ADVANCED
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 14. USER ASSESSMENT RESULTS
export const userAssessmentResults = pgTable("user_assessment_result", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  assessmentId: uuid("assessment_id")
    .references(() => assessments.id, { onDelete: "cascade" })
    .notNull(),
  isCorrect: boolean("is_correct").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// RELATIONS

export const skillRelations = relations(skills, ({ many }) => ({
  dependencies: many(skillDependencies, { relationName: "skillPrerequisites" }),
  prerequisites: many(skillDependencies, { relationName: "skillDependents" }),
  userSkills: many(userSkills),
  assessments: many(assessments),
}));

export const skillDependencyRelations = relations(
  skillDependencies,
  ({ one }) => ({
    skill: one(skills, {
      fields: [skillDependencies.skillId],
      references: [skills.id],
      relationName: "skillPrerequisites",
    }),
    prerequisite: one(skills, {
      fields: [skillDependencies.prerequisiteSkillId],
      references: [skills.id],
      relationName: "skillDependents",
    }),
  }),
);

export const userSkillRelations = relations(userSkills, ({ one }) => ({
  user: one(users, {
    fields: [userSkills.userId],
    references: [users.id],
  }),
  skill: one(skills, {
    fields: [userSkills.skillId],
    references: [skills.id],
  }),
}));

export const assessmentRelations = relations(assessments, ({ one, many }) => ({
  skill: one(skills, {
    fields: [assessments.skillId],
    references: [skills.id],
  }),
  results: many(userAssessmentResults),
}));

export const userAssessmentResultRelations = relations(
  userAssessmentResults,
  ({ one }) => ({
    user: one(users, {
      fields: [userAssessmentResults.userId],
      references: [users.id],
    }),
    assessment: one(assessments, {
      fields: [userAssessmentResults.assessmentId],
      references: [assessments.id],
    }),
  }),
);
