import {
  pgTable,
  uuid,
  text,
  timestamp,
  integer,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { users } from "./users";
import { pointReasonEnum } from "./enums";

export const pointTransactions = pgTable(
  "point_transaction",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    amount: integer("amount").notNull(),
    reason: pointReasonEnum("reason").notNull(),
    referenceId: text("reference_id"), // e.g. chapterId or date string
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  // Ensure we don't accidentally double-award for the exact same reason/reference
  (t) => [
    uniqueIndex("point_tx_user_reason_ref_idx").on(
      t.userId,
      t.reason,
      t.referenceId,
    ),
  ],
);

export const dailyWatchTime = pgTable(
  "daily_watch_time",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    date: text("date").notNull(), // Format: YYYY-MM-DD
    minutesWatched: integer("minutes_watched").default(0).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => [uniqueIndex("daily_watch_time_user_date_idx").on(t.userId, t.date)],
);

export const pointTransactionRelations = relations(
  pointTransactions,
  ({ one }) => ({
    user: one(users, {
      fields: [pointTransactions.userId],
      references: [users.id],
    }),
  }),
);

export const dailyWatchTimeRelations = relations(dailyWatchTime, ({ one }) => ({
  user: one(users, {
    fields: [dailyWatchTime.userId],
    references: [users.id],
  }),
}));
