import Link from "next/link";
import Image from "next/image";
import { MessageCircle, Users } from "lucide-react";

interface ActivityFeedItem {
  id: string;
  type: "enrollment" | "review";
  amount?: number;
  rating?: number;
  comment?: string;
  createdAt: Date;
  course: {
    id: string;
    title: string;
  };
  user: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    imageUrl: string | null;
  };
}

interface ActivityFeedProps {
  activities: ActivityFeedItem[];
}

export function ActivityFeed({ activities }: ActivityFeedProps) {
  if (activities.length === 0) {
    return (
      <div className="bg-surface border border-border rounded-xl p-6">
        <h3 className="text-lg font-semibold text-primary-text mb-4">
          Activity Feed
        </h3>
        <div className="py-12 text-center">
          <Users className="w-12 h-12 text-secondary-text/40 mx-auto mb-4" />
          <p className="text-secondary-text font-medium">No recent activity</p>
          <p className="text-sm text-secondary-text mt-1">
            Enrollments and reviews will appear here
          </p>
        </div>
      </div>
    );
  }

  const timeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 60) return "just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  return (
    <div className="bg-surface border border-border rounded-xl p-6">
      <h3 className="text-lg font-semibold text-primary-text mb-4">
        Activity Feed
      </h3>

      <div className="space-y-3">
        {activities.slice(0, 6).map((activity) => (
          <div
            key={activity.id}
            className="flex items-start gap-3 p-3 rounded-lg hover:bg-surface-muted/50 transition-colors"
          >
            {activity.user.imageUrl ? (
              <Image
                src={activity.user.imageUrl}
                alt={`${activity.user.firstName} ${activity.user.lastName}`}
                width={32}
                height={32}
                className="w-8 h-8 rounded-full object-cover shrink-0"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-linear-to-br from-blue-400 to-purple-500 flex items-center justify-center shrink-0 text-white text-xs font-semibold">
                {activity.user.firstName?.[0]}
                {activity.user.lastName?.[0]}
              </div>
            )}

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm text-primary-text">
                    <span className="font-medium">
                      {activity.user.firstName} {activity.user.lastName}
                    </span>
                    {activity.type === "enrollment" && (
                      <span className="text-secondary-text"> enrolled in</span>
                    )}
                    {activity.type === "review" && (
                      <span className="text-secondary-text"> reviewed</span>
                    )}{" "}
                    <Link
                      href={`/tutor/courses/${activity.course.id}`}
                      className="text-brand hover:underline font-medium truncate"
                    >
                      {activity.course.title}
                    </Link>
                  </p>
                </div>
                {activity.type === "enrollment" && (
                  <Users className="w-4 h-4 text-cyan-600 dark:text-cyan-400 shrink-0 mt-0.5" />
                )}
                {activity.type === "review" && (
                  <MessageCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                )}
              </div>

              <div className="flex items-center gap-2 mt-1">
                {activity.type === "review" &&
                  activity.rating !== undefined && (
                    <div className="flex items-center gap-1 text-xs">
                      <div className="flex gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <span
                            key={i}
                            className={`text-xs ${
                              i < activity.rating!
                                ? "text-amber-400"
                                : "text-slate-300 dark:text-slate-600"
                            }`}
                          >
                            ★
                          </span>
                        ))}
                      </div>
                      <span className="text-secondary-text">
                        {activity.rating} stars
                      </span>
                    </div>
                  )}
                <span className="text-xs text-secondary-text">
                  {timeAgo(new Date(activity.createdAt))}
                </span>
              </div>

              {activity.type === "review" && activity.comment && (
                <p className="text-xs text-secondary-text mt-1.5 line-clamp-2">
                  &quot;{activity.comment}&quot;
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
