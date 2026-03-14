"use client";

interface CancelSessionDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    sessionTitle: string;
    onConfirm: () => Promise<void>;
    isLoading: boolean;
}

export function CancelSessionDialog({
    open,
    onOpenChange,
    sessionTitle,
    onConfirm,
    isLoading,
}: CancelSessionDialogProps) {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow-lg dark:bg-zinc-900">
                <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                    Cancel Session?
                </h2>
                <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                    Are you sure you want to cancel <span className="font-semibold">{sessionTitle}</span>?
                    This action cannot be undone, and learners will not be notified of the cancellation.
                </p>

                <div className="mt-6 flex gap-3">
                    <button
                        type="button"
                        onClick={() => onOpenChange(false)}
                        disabled={isLoading}
                        className="flex-1 rounded-lg border border-zinc-300 px-4 py-2 text-sm font-semibold text-zinc-800 transition-colors hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
                    >
                        Keep Session
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={isLoading}
                        className="flex-1 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-50 dark:bg-red-600 dark:hover:bg-red-700"
                    >
                        {isLoading ? "Cancelling..." : "Cancel Session"}
                    </button>
                </div>
            </div>
        </div>
    );
}
