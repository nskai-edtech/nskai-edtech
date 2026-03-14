import {
    boolean,
    index,
    pgEnum,
    pgTable,
    text,
    timestamp,
    uniqueIndex,
    uuid,
    varchar,
} from "drizzle-orm/pg-core";

export const liveSessionStatusEnum = pgEnum("live_session_status", [
    "SCHEDULED",
    "LIVE",
    "ENDED",
    "CANCELLED",
]);

export const liveSessionHostRoleEnum = pgEnum("live_session_host_role", [
    "ORG_ADMIN",
    "TUTOR",
]);

export const liveSessions = pgTable(
    "live_sessions",
    {
        id: uuid("id").defaultRandom().primaryKey(),

        hostId: text("host_id").notNull(),
        hostRole: liveSessionHostRoleEnum("host_role").notNull(),

        title: varchar("title", { length: 255 }).notNull(),
        description: text("description"),

        channelName: varchar("channel_name", { length: 255 }).notNull(),

        status: liveSessionStatusEnum("status").notNull().default("SCHEDULED"),

        thumbnailUrl: text("thumbnail_url"),
        recordingUrl: text("recording_url"),

        guestAccessEnabled: boolean("guest_access_enabled")
            .notNull()
            .default(false),

        guestInviteCode: varchar("guest_invite_code", { length: 128 }),
        guestInviteRotatedAt: timestamp("guest_invite_rotated_at", {
            withTimezone: true,
        }),
        guestInviteExpiresAt: timestamp("guest_invite_expires_at", {
            withTimezone: true,
        }),

        startsAt: timestamp("starts_at", { withTimezone: true }).notNull(),
        scheduledEndsAt: timestamp("scheduled_ends_at", { withTimezone: true }),

        actualStartedAt: timestamp("actual_started_at", { withTimezone: true }),
        actualEndedAt: timestamp("actual_ended_at", { withTimezone: true }),

        createdAt: timestamp("created_at", { withTimezone: true })
            .defaultNow()
            .notNull(),
        updatedAt: timestamp("updated_at", { withTimezone: true })
            .defaultNow()
            .notNull(),
    },
    (table) => ({
        hostIdIdx: index("live_sessions_host_id_idx").on(table.hostId),
        hostRoleIdx: index("live_sessions_host_role_idx").on(table.hostRole),
        statusIdx: index("live_sessions_status_idx").on(table.status),
        startsAtIdx: index("live_sessions_starts_at_idx").on(table.startsAt),
        channelNameIdx: uniqueIndex("live_sessions_channel_name_idx").on(
            table.channelName,
        ),
        guestInviteCodeIdx: uniqueIndex("live_sessions_guest_invite_code_idx").on(
            table.guestInviteCode,
        ),
    }),
);

export const liveSessionViewers = pgTable(
    "live_session_viewers",
    {
        id: uuid("id").defaultRandom().primaryKey(),

        sessionId: uuid("session_id")
            .notNull()
            .references(() => liveSessions.id, { onDelete: "cascade" }),

        learnerId: text("learner_id").notNull(),

        joinedAt: timestamp("joined_at", { withTimezone: true }).defaultNow(),
        leftAt: timestamp("left_at", { withTimezone: true }),
        lastSeenAt: timestamp("last_seen_at", { withTimezone: true })
            .defaultNow()
            .notNull(),

        createdAt: timestamp("created_at", { withTimezone: true })
            .defaultNow()
            .notNull(),
        updatedAt: timestamp("updated_at", { withTimezone: true })
            .defaultNow()
            .notNull(),
    },
    (table) => ({
        sessionIdIdx: index("live_session_viewers_session_id_idx").on(table.sessionId),
        learnerIdIdx: index("live_session_viewers_learner_id_idx").on(table.learnerId),
        sessionLearnerUniqueIdx: uniqueIndex(
            "live_session_viewers_session_learner_unique_idx",
        ).on(table.sessionId, table.learnerId),
    }),
);