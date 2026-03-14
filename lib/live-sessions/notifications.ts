import { db } from "@/lib/db";
import { liveSessions } from "@/drizzle/schema/live-sessions";
import { users } from "@/drizzle/schema/users";
import { purchases } from "@/drizzle/schema/interactions";
import { courses } from "@/drizzle/schema/courses";
import { eq } from "drizzle-orm";
import { sendEmail } from "@/lib/email";
import LiveSessionScheduledEmail from "@/emails/live-session-scheduled";

interface NotifyLearnersInput {
    sessionId: string;
    tutorId: string;
}

/**
 * Fetch learners who should be notified about a live session
 * (Learners enrolled in the tutor's courses)
 */
export async function getLearnersForNotification(
    sessionId: string,
    tutorId: string,
) {
    try {
        const session = await db.query.liveSessions.findFirst({
            where: eq(liveSessions.id, sessionId),
            columns: {
                id: true,
                title: true,
                startsAt: true,
                description: true,
                channelName: true,
            },
        });

        if (!session) {
            return null;
        }

        // Get all learners who purchased courses from this tutor
        const learnerPurchases = await db
            .selectDistinct({
                userId: purchases.userId,
                email: users.email,
                firstName: users.firstName,
            })
            .from(purchases)
            .innerJoin(courses, eq(purchases.courseId, courses.id))
            .innerJoin(users, eq(purchases.userId, users.id))
            .where(eq(courses.tutorId, tutorId));

        return {
            session,
            learners: learnerPurchases.map((p) => ({
                userId: p.userId,
                email: p.email,
                firstName: p.firstName || "Learner",
            })),
        };
    } catch (error) {
        console.error("[NOTIFICATIONS] Error fetching learners:", error);
        return null;
    }
}

/**
 * Send email notifications to learners about a scheduled session
 * This should be called from the server action after creating the session
 */
export async function notifyLearnersOfScheduledSession(
    input: NotifyLearnersInput,
) {
    const { sessionId, tutorId } = input;

    // If tutorId is empty, fetch it from the session
    let actualTutorId = tutorId;
    if (!actualTutorId) {
        const session = await db.query.liveSessions.findFirst({
            where: eq(liveSessions.id, sessionId),
            columns: { hostId: true },
        });
        if (!session) {
            throw new Error("Session not found");
        }
        actualTutorId = session.hostId;
    }

    try {
        const data = await getLearnersForNotification(sessionId, actualTutorId);

        if (!data || data.learners.length === 0) {
            console.log(
                `[NOTIFICATIONS] No learners to notify for session ${sessionId}`,
            );
            return { success: true, notified: 0 };
        }

        const { session, learners } = data;
        let notifiedCount = 0;
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

        // Send emails in batches to avoid rate limiting
        for (const learner of learners) {
            try {
                const result = await sendEmail({
                    to: learner.email,
                    subject: `New Live Session: ${session.title}`,
                    react: LiveSessionScheduledEmail({
                        learnerName: learner.firstName,
                        sessionTitle: session.title,
                        sessionDescription: session.description || "",
                        startTime: new Date(session.startsAt).toLocaleString(
                            "en-US",
                            {
                                dateStyle: "medium",
                                timeStyle: "short",
                            },
                        ),
                        joinUrl: `${appUrl}/learner/live-sessions`,
                    }),
                });

                if (result.success) {
                    notifiedCount++;
                } else {
                    console.error(
                        `[NOTIFICATIONS] Failed to send email to ${learner.email}:`,
                        result.error,
                    );
                }
            } catch (error) {
                console.error(
                    `[NOTIFICATIONS] Error sending email to ${learner.email}:`,
                    error,
                );
            }
        }

        console.log(
            `[NOTIFICATIONS] Notified ${notifiedCount} learners for session ${sessionId}`,
        );

        return { success: true, notified: notifiedCount };
    } catch (error) {
        console.error("[NOTIFICATIONS] Error notifying learners:", error);
        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : "Unknown error occurred",
        };
    }
}
