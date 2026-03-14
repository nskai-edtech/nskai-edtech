import { LiveSessionsBoard } from "./_components/live-sessions-board";
import { getLiveSessionsFeed } from "@/lib/live-sessions/queries";

export const dynamic = "force-dynamic";

export default async function LearnerLiveSessionsPage() {
    const initialData = await getLiveSessionsFeed();

    return (
        <main className="min-h-screen bg-zinc-50 px-4 py-8 dark:bg-zinc-950 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-6xl">
                <LiveSessionsBoard initialData={initialData} />
            </div>
        </main>
    );
}