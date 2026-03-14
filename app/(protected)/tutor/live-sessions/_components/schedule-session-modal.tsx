"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createLiveSession } from "@/actions/live-sessions/mutations";
import { useToast } from "@/components/ui/use-toast";

const scheduleSessionSchema = z.object({
    title: z.string().trim().min(3, "Title must be at least 3 characters").max(255),
    description: z.string().trim().max(1000).optional(),
    channelName: z
        .string()
        .trim()
        .min(3, "Channel name must be at least 3 characters")
        .max(255)
        .regex(
            /^[a-zA-Z0-9_-]+$/,
            "Channel name can only contain letters, numbers, underscores, and hyphens",
        ),
    startsAt: z.string().refine((date) => new Date(date) > new Date(), "Start time must be in the future"),
});

type ScheduleSessionInput = z.infer<typeof scheduleSessionSchema>;

interface ScheduleSessionModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSessionScheduled?: () => void;
}

export function ScheduleSessionModal({
    open,
    onOpenChange,
    onSessionScheduled,
}: ScheduleSessionModalProps) {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<ScheduleSessionInput>({
        resolver: zodResolver(scheduleSessionSchema),
    });

    const onSubmit = async (data: ScheduleSessionInput) => {
        try {
            setIsLoading(true);

            // Create the session (notifications are sent server-side inside this action)
            await createLiveSession({
                title: data.title,
                channelName: data.channelName,
                startsAt: new Date(data.startsAt),
            });

            toast({
                title: "Success",
                description: "Live session scheduled successfully. Learners have been notified.",
            });

            reset();
            onOpenChange(false);
            onSessionScheduled?.();
        } catch (error) {
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to schedule session",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg dark:bg-zinc-900">
                <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                    Schedule Live Session
                </h2>
                <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                    Create a new live classroom session
                </p>

                <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-zinc-900 dark:text-zinc-100">
                            Session Title
                        </label>
                        <input
                            type="text"
                            {...register("title")}
                            placeholder="e.g., Advanced React Patterns"
                            className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder-zinc-400"
                        />
                        {errors.title && (
                            <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                                {errors.title.message}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-zinc-900 dark:text-zinc-100">
                            Channel Name
                        </label>
                        <input
                            type="text"
                            {...register("channelName")}
                            placeholder="e.g., advanced-react-2026"
                            className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder-zinc-400"
                        />
                        {errors.channelName && (
                            <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                                {errors.channelName.message}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-zinc-900 dark:text-zinc-100">
                            Start Time
                        </label>
                        <input
                            type="datetime-local"
                            {...register("startsAt")}
                            className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                        />
                        {errors.startsAt && (
                            <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                                {errors.startsAt.message}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-zinc-900 dark:text-zinc-100">
                            Description (Optional)
                        </label>
                        <textarea
                            {...register("description")}
                            placeholder="What will this session cover?"
                            rows={3}
                            className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder-zinc-400"
                        />
                        {errors.description && (
                            <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                                {errors.description.message}
                            </p>
                        )}
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={() => onOpenChange(false)}
                            disabled={isLoading}
                            className="flex-1 rounded-lg border border-zinc-300 px-4 py-2 text-sm font-semibold text-zinc-800 transition-colors hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-50 dark:bg-blue-600 dark:hover:bg-blue-700"
                        >
                            {isLoading ? "Scheduling..." : "Schedule"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
