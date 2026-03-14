import { getTutorLiveSessionsFeed } from "@/actions/live-sessions/tutor-queries";
import { TutorLiveSessionsBoard } from "./_components/tutor-live-sessions-board";

export const dynamic = "force-dynamic";

export default async function TutorLiveSessionsPage() {
    try {
        const initialData = await getTutorLiveSessionsFeed();

        return (
            <main className="min-h-screen bg-zinc-50 px-4 py-8 dark:bg-zinc-950 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-6xl">
                    <TutorLiveSessionsBoard initialData={initialData} />
                </div>
            </main>
        );
    } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to load sessions";
        
        return (
            <main className="min-h-screen bg-zinc-50 px-4 py-8 dark:bg-zinc-950 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-6xl">
                    <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
                        <p className="font-semibold">Error</p>
                        <p className="text-sm">{message}</p>
                    </div>
                </div>
            </main>
        );
    }
}
