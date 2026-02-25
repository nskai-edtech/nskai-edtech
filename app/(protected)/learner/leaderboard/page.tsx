import { Suspense } from "react";
import { Trophy, Flame, Medal, Star } from "lucide-react";
import Image from "next/image";
import { getLeaderboardData } from "@/actions/gamification/queries";

export default function LeaderboardPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="bg-linear-to-br from-brand/20 to-brand/5 rounded-3xl p-6 md:p-8 border border-brand/20 flex flex-col md:flex-row items-center text-center md:text-left gap-4 md:gap-6 shadow-sm">
        <div className="w-16 h-16 md:w-20 md:h-20 bg-brand/20 rounded-full flex items-center justify-center shrink-0">
          <Trophy className="w-8 h-8 md:w-10 md:h-10 text-brand" />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-primary-text mb-2 tracking-tight">
            Top Learners
          </h1>
          <p className="text-secondary-text font-medium text-base md:text-lg">
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
  const users = await getLeaderboardData();

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
      <div className="px-4 md:px-6 py-4 border-b border-border bg-surface-muted/50 flex items-center text-xs md:text-sm font-bold text-secondary-text uppercase tracking-wider">
        <div className="w-10 shrink-0 md:w-16 text-center">Rank</div>
        <div className="flex-1 ml-2 md:ml-0">Learner</div>
        <div className="w-20 md:w-32 text-center text-[10px] md:text-sm">
          Streak
        </div>
        <div className="w-16 md:w-32 text-right text-[10px] md:text-sm">
          Points
        </div>
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
              className={`flex items-center px-4 md:px-6 py-3 md:py-5 transition-colors ${
                isTop3
                  ? "bg-brand/5 hover:bg-brand/10"
                  : "hover:bg-surface-muted/30"
              }`}
            >
              {/* Rank */}
              <div className="w-10 md:w-16 flex justify-center items-center font-black text-lg md:text-xl shrink-0">
                {RankIcon ? (
                  RankIcon
                ) : (
                  <span className="text-secondary-text">{rank}</span>
                )}
              </div>

              {/* User Identity */}
              <div className="flex-1 flex items-center gap-3 overflow-hidden ml-2 md:ml-0">
                {user.imageUrl ? (
                  <Image
                    src={user.imageUrl}
                    alt={`${user.firstName || "Learner"}`}
                    width={40}
                    height={40}
                    className="rounded-full object-cover border-2 shadow-sm border-white w-8 h-8 md:w-12 md:h-12 shrink-0"
                  />
                ) : (
                  <div className="w-8 h-8 md:w-12 md:h-12 rounded-full bg-brand/10 flex shrink-0 flex-col justify-center items-center border border-brand/20">
                    <span className="text-brand font-bold text-base md:text-lg">
                      {user.firstName?.charAt(0) || "L"}
                    </span>
                  </div>
                )}
                <div className="min-w-0">
                  <h3 className="font-bold text-primary-text text-sm md:text-base truncate">
                    {user.firstName || "Anonymous"} {user.lastName || ""}
                  </h3>
                </div>
              </div>

              {/* Streak */}
              <div className="w-20 md:w-32 flex justify-center items-center shrink-0">
                {(user.currentStreak || 0) > 0 ? (
                  <div className="flex items-center gap-1 md:gap-1.5 px-2 md:px-3 py-1 md:py-1.5 bg-orange-500/10 text-orange-600 rounded-full font-bold text-[10px] md:text-sm">
                    <Flame className="w-3 h-3 md:w-4 md:h-4 fill-current shrink-0" />
                    <span className="truncate">
                      {user.currentStreak} Day{user.currentStreak !== 1 && "s"}
                    </span>
                  </div>
                ) : (
                  <span className="text-secondary-text/50 font-medium text-xs md:text-sm">
                    -
                  </span>
                )}
              </div>

              {/* Points */}
              <div className="w-16 md:w-32 text-right shrink-0">
                <div className="font-black text-base md:text-xl text-brand truncate">
                  <span title={(user.points || 0).toLocaleString()}>
                    {Intl.NumberFormat("en-US", {
                      notation: "compact",
                      maximumFractionDigits: 1,
                    }).format(user.points || 0)}
                  </span>
                </div>
                <div className="text-[10px] md:text-xs uppercase font-bold text-secondary-text tracking-wider">
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
