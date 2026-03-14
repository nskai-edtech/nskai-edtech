import type {
    LiveSessionHostRole,
    ViewerRole,
} from "@/lib/live-sessions/types";

export function canHostLiveSessions(role: ViewerRole): role is LiveSessionHostRole {
    return role === "ORG_ADMIN" || role === "TUTOR";
}

export function canWatchLiveSessions(role: ViewerRole): boolean {
    return role === "LEARNER" || role === "TUTOR" || role === "ORG_ADMIN";
}