import { redirect } from "next/navigation";

import { getLiveSessionById } from "@/lib/live-sessions/queries";
import { LearnerStreamView } from "./_components/learner-stream-view";

export const dynamic = "force-dynamic";

type Props = {
    params: Promise<{ sessionId: string }>;
};

export default async function LearnerSessionViewPage({ params }: Props) {
    const { sessionId } = await params;

    const session = await getLiveSessionById(sessionId);

    if (!session) {
        redirect("/learner/live-sessions");
    }

    return <LearnerStreamView session={session} />;
}
