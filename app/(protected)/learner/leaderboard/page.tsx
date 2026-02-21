import { Suspense } from "react";
import { getLeaderboard } from "@/actions/gamification";
import { Trophy, Flame, Medal, Star } from "lucide-react";
import Image from "next/image";

export default function LeaderboardPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="bg-linear-to-br from-brand/20 to-brand/5 rounded-3xl p-8 border border-brand/20 flex items-center gap-6 shadow-sm">
        <div className="w-20 h-20 bg-brand/20 rounded-full flex items-center justify-center shrink-0">
          <Trophy className="w-10 h-10 text-brand" />
        </div>
        <div>
          <h1 className="text-3xl font-black text-primary-text mb-2 tracking-tight">
            Top Learners
          </h1>
          <p className="text-secondary-text font-medium text-lg">
            Climb the ranks by watching videos, passing quizzes, and keeping
            your daily streak alive!
          </p>
        </div>
      </div>

      {/* Leaderboard Feed */}
      <Suspense
        fallback={
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="h-20 bg-surface-muted rounded-2xl animate-pulse"
              />
            ))}
          </div>
        }
      >
        <LeaderboardFeed />
      </Suspense>
    </div>
  );
}

async function LeaderboardFeed() {
  const users = await getLeaderboard();

  if (users.length === 0) {
    return (
      <div className="text-center py-20 text-secondary-text">
        <Star className="w-12 h-12 mx-auto mb-4 text-brand/30" />
        <p>No points have been earned yet. Be the first!</p>
      </div>
    );
  }

  return (
    <div className="bg-surface rounded-3xl border border-border shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-border bg-surface-muted/50 flex items-center text-sm font-bold text-secondary-text uppercase tracking-wider">
        <div className="w-16 text-center">Rank</div>
        <div className="flex-1">Learner</div>
        <div className="w-32 text-center">Streak</div>
        <div className="w-32 text-right">Points</div>
      </div>

      <div className="divide-y divide-border">
        {users.map((user, index) => {
          const rank = index + 1;
          const isTop3 = rank <= 3;
          let RankIcon = null;

          if (rank === 1)
            RankIcon = <Medal className="w-7 h-7 text-yellow-500" />;
          if (rank === 2)
            RankIcon = <Medal className="w-7 h-7 text-gray-400" />;
          if (rank === 3)
            RankIcon = <Medal className="w-7 h-7 text-amber-700" />;

          return (
            <div
              key={user.id}
              className={`flex items-center px-6 py-5 transition-colors ${
                isTop3
                  ? "bg-brand/5 hover:bg-brand/10"
                  : "hover:bg-surface-muted/30"
              }`}
            >
              {/* Rank */}
              <div className="w-16 flex justify-center items-center font-black text-xl">
                {RankIcon ? (
                  RankIcon
                ) : (
                  <span className="text-secondary-text">{rank}</span>
                )}
              </div>

              {/* User Identity */}
              <div className="flex-1 flex items-center gap-4">
                {user.imageUrl ? (
                  <Image
                    src={user.imageUrl}
                    alt={`${user.firstName || "Learner"}`}
                    width={48}
                    height={48}
                    className="rounded-full object-cover border-2 shadow-sm border-white"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-brand/10 flex flex-col justify-center items-center border border-brand/20">
                    <span className="text-brand font-bold text-lg">
                      {user.firstName?.charAt(0) || "L"}
                    </span>
                  </div>
                )}
                <div>
                  <h3 className="font-bold text-primary-text text-base">
                    {user.firstName} {user.lastName}
                  </h3>
                </div>
              </div>

              {/* Streak */}
              <div className="w-32 flex justify-center items-center">
                {(user.currentStreak || 0) > 0 ? (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-500/10 text-orange-600 rounded-full font-bold text-sm">
                    <Flame className="w-4 h-4 fill-current" />
                    {user.currentStreak} Day{user.currentStreak !== 1 && "s"}
                  </div>
                ) : (
                  <span className="text-secondary-text/50 font-medium text-sm">
                    -
                  </span>
                )}
              </div>

              {/* Points */}
              <div className="w-32 text-right">
                <div className="font-black text-xl text-brand">
                  {(user.points || 0).toLocaleString()}
                </div>
                <div className="text-xs uppercase font-bold text-secondary-text tracking-wider">
                  XP
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
