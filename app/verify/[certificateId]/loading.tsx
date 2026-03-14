export default function Loading() {
    return (
        <main className="min-h-screen bg-gray-50 dark:bg-zinc-950 flex flex-col items-center py-12 px-4 sm:px-6">
            <div className="mb-8 flex items-center gap-2 font-black text-2xl text-zinc-900 dark:text-zinc-100">
                <div className="w-10 h-10 rounded-xl bg-brand flex items-center justify-center text-white text-xl">
                    Z
                </div>
                ZERRA
            </div>

            <div className="w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-3xl shadow-xl border border-zinc-200 dark:border-zinc-800 p-8 animate-pulse">
                <div className="h-10 bg-zinc-200 dark:bg-zinc-700 rounded w-3/4 mx-auto mb-6" />
                <div className="space-y-4">
                    <div className="h-24 bg-zinc-200 dark:bg-zinc-700 rounded" />
                    <div className="h-24 bg-zinc-200 dark:bg-zinc-700 rounded" />
                </div>
            </div>
        </main>
    );
}