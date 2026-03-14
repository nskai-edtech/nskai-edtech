export type LiveSessionStatus =
    | "SCHEDULED"
    | "LIVE"
    | "ENDED"
    | "CANCELLED";

export type LiveSessionHostRole = "ORG_ADMIN" | "TUTOR";

export type ViewerRole = "ORG_ADMIN" | "TUTOR" | "LEARNER";

export type LiveSessionListItem = {
    id: string;
    title: string;
    description: string | null;
    status: LiveSessionStatus;
    hostId: string;
    hostRole: LiveSessionHostRole;
    hostDisplayName: string;
    channelName: string;
    thumbnailUrl: string | null;
    recordingUrl: string | null;
    startsAt: string;
    scheduledEndsAt: string | null;
    actualStartedAt: string | null;
    actualEndedAt: string | null;
    activeViewerCount: number;
    canJoin: boolean;
    canReplay: boolean;
    guestCode?: string | null;
};

export type GroupedLiveSessions = {
    liveNow: LiveSessionListItem[];
    upcoming: LiveSessionListItem[];
    past: LiveSessionListItem[];
};

export type LiveSessionsFeedResponse = {
    grouped: GroupedLiveSessions;
    serverTime: string;
};

export type LiveSessionWsEvent =
    | {
          type: "SESSION_UPSERTED";
          session: LiveSessionListItem;
      }
    | {
          type: "SESSION_REMOVED";
          sessionId: string;
      }
    | {
          type: "VIEWER_COUNT_CHANGED";
          sessionId: string;
          activeViewerCount: number;
      }
    | {
          type: "PING";
      };