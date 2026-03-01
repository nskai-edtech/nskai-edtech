import {
  pgTable,
  uuid,
  text,
  timestamp,
  boolean,
  integer,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { users } from "./users";
import { courses } from "./courses";

// --- SKILLS (Graph Nodes) ---
export const skills = pgTable(
  "skill",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    title: text("title").notNull(),
    category: text("category").notNull(),
    description: text("description"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("skill_category_idx").on(table.category)],
);

// --- SKILL DEPENDENCIES (Edges) ---
export const skillDependencies = pgTable(
  "skill_dependency",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    skillId: uuid("skill_id")
      .references(() => skills.id, { onDelete: "cascade" })
      .notNull(),
    prerequisiteSkillId: uuid("prerequisite_skill_id")
      .references(() => skills.id, { onDelete: "cascade" })
      .notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("skill_dep_unique_idx").on(
      table.skillId,
      table.prerequisiteSkillId,
    ),
    index("skill_dep_prereq_idx").on(table.prerequisiteSkillId),
  ],
);

// --- USER SKILLS (Mastery) ---
export const userSkills = pgTable(
  "user_skill",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    skillId: uuid("skill_id")
      .references(() => skills.id, { onDelete: "cascade" })
      .notNull(),
    masteryScore: integer("mastery_score").default(0).notNull(),
    lastAssessedAt: timestamp("last_assessed_at")
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    uniqueIndex("user_skill_unique_idx").on(table.userId, table.skillId),
    index("user_skill_skill_idx").on(table.skillId),
  ],
);

// --- ASSESSMENTS (Diagnostic) ---
export const assessments = pgTable(
  "assessment",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    skillId: uuid("skill_id")
      .references(() => skills.id, { onDelete: "cascade" })
      .notNull(),
    questionText: text("question_text").notNull(),
    options: text("options").array().notNull(),
    correctOption: integer("correct_option").notNull(),
    difficulty: text("difficulty").default("BEGINNER"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("assessment_skill_idx").on(table.skillId)],
);

// --- USER ASSESSMENT RESULTS ---
export const userAssessmentResults = pgTable(
  "user_assessment_result",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    assessmentId: uuid("assessment_id")
      .references(() => assessments.id, { onDelete: "cascade" })
      .notNull(),
    isCorrect: boolean("is_correct").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("user_assessment_user_idx").on(table.userId),
    index("user_assessment_assessment_idx").on(table.assessmentId),
  ],
);

// --- COURSE SKILLS (Junction Table) ---
export const courseSkills = pgTable(
  "course_skill",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    courseId: uuid("course_id")
      .references(() => courses.id, { onDelete: "cascade" })
      .notNull(),
    skillId: uuid("skill_id")
      .references(() => skills.id, { onDelete: "cascade" })
      .notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("course_skill_unique_idx").on(table.courseId, table.skillId),
    index("course_skill_skill_idx").on(table.skillId),
  ],
);

// --- RELATIONS ---

export const skillRelations = relations(skills, ({ many }) => ({
  dependencies: many(skillDependencies, { relationName: "skillPrerequisites" }),
  prerequisites: many(skillDependencies, { relationName: "skillDependents" }),
  userSkills: many(userSkills),
  assessments: many(assessments),
  courseSkills: many(courseSkills),
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

export const courseSkillRelations = relations(courseSkills, ({ one }) => ({
  course: one(courses, {
    fields: [courseSkills.courseId],
    references: [courses.id],
  }),
  skill: one(skills, {
    fields: [courseSkills.skillId],
    references: [skills.id],
  }),
}));
