import { redirect } from "next/navigation";

import { getTutorLiveSessionById } from "@/actions/live-sessions/tutor-queries";
import { TutorStreamingRoom } from "./_components/tutor-streaming-room";

export const dynamic = "force-dynamic";

type Props = {
    params: Promise<{ sessionId: string }>;
};

export default async function TutorStreamingPage({ params }: Props) {
    const { sessionId } = await params;

    const session = await getTutorLiveSessionById(sessionId);

    if (!session) {
        redirect("/tutor/live-sessions");
    }

    if (session.status === "CANCELLED" || session.status === "ENDED") {
        redirect("/tutor/live-sessions");
    }

    return <TutorStreamingRoom session={session} />;
}
