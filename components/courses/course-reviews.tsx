"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Heart, MessageSquare, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

import { StarRatingInput } from "./star-rating-input";
import {
  submitReview,
  getReviewsByCourse,
  toggleCourseLike,
  getUserReview,
  isCourseLiked,
} from "@/actions/reviews";
import { cn } from "@/lib/utils";

interface ReviewUser {
  id: string;
  firstName: string | null;
  lastName: string | null;
  imageUrl: string | null;
}

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: Date;
  user: ReviewUser;
}

interface CourseReviewsProps {
  courseId: string;
  isEnrolled: boolean;
  initialStats: {
    avgRating: number;
    totalReviews: number;
    totalLikes: number;
  };
}

export function CourseReviews({
  courseId,
  isEnrolled,
  initialStats,
}: CourseReviewsProps) {
  // State for fetching & paginating reviews
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  // State for user's own review
  const [userRating, setUserRating] = useState(0);
  const [userComment, setUserComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(false);

  // State for likes
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(initialStats.totalLikes);

  // Load initial data
  useEffect(() => {
    let mounted = true;

    async function loadInitialData() {
      try {
        const [reviewsRes, userReviewRes, likedRes] = await Promise.all([
          getReviewsByCourse(courseId, 1, 10),
          isEnrolled ? getUserReview(courseId) : Promise.resolve(null),
          isCourseLiked(courseId),
        ]);

        if (mounted) {
          if (reviewsRes && !reviewsRes.error && reviewsRes.reviews) {
            setReviews(reviewsRes.reviews);
            setHasMore(reviewsRes.hasNextPage ?? false);
          }

          if (userReviewRes && "rating" in userReviewRes) {
            setHasReviewed(true);
            setUserRating(userReviewRes.rating);
            setUserComment(userReviewRes.comment || "");
          }

          setIsLiked(likedRes);
        }
      } catch (error) {
        console.error("Failed to load review data", error);
      } finally {
        if (mounted) setIsLoading(false);
      }
    }

    loadInitialData();

    return () => {
      mounted = false;
    };
  }, [courseId, isEnrolled]);

  const fetchMoreReviews = async () => {
    const nextPage = page + 1;
    const res = await getReviewsByCourse(courseId, nextPage, 10);
    if (res && !res.error && res.reviews) {
      setReviews((prev) => [...prev, ...res.reviews!]);
      setHasMore(res.hasNextPage ?? false);
      setPage(nextPage);
    }
  };

  const handleLikeToggle = async () => {
    // Optimistic UI update
    const previousState = isLiked;
    setIsLiked(!previousState);
    setLikeCount((prev) => (previousState ? prev - 1 : prev + 1));

    const res = await toggleCourseLike(courseId);
    if (res && res.error) {
      // Revert if failed
      setIsLiked(previousState);
      setLikeCount((prev) => (previousState ? prev + 1 : prev - 1));
      if (res.error === "Unauthorized") {
        toast.error("Please log in to like a course");
      } else {
        toast.error(res.error);
      }
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isEnrolled) {
      toast.error("You must be enrolled to leave a review");
      return;
    }

    if (userRating === 0) {
      toast.error("Please select a star rating");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await submitReview(courseId, userRating, userComment);

      if (res && res.error) {
        toast.error(res.error);
      } else {
        toast.success(
          hasReviewed
            ? "Review updated successfully"
            : "Review submitted successfully",
        );
        setHasReviewed(true);
        // Reset and fetch reviews to show the newly submitted one at top
        setPage(1);
        const reviewsRes = await getReviewsByCourse(courseId, 1, 10);
        if (reviewsRes && !reviewsRes.error && reviewsRes.reviews) {
          setReviews(reviewsRes.reviews);
          setHasMore(reviewsRes.hasNextPage ?? false);
        }
      }
    } catch (error) {
      console.error("Failed to submit review", error);
      toast.error("Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-brand" />
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {/* Header & Stats & Like Button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 pb-8 border-b border-border/50">
        <div>
          <h2 className="text-3xl font-black text-primary-text flex items-center gap-3">
            <MessageSquare className="w-8 h-8 text-brand" />
            Student Feedback
          </h2>
          <p className="text-secondary-text mt-2 font-medium">
            See what others are saying about this course
          </p>
        </div>

        <button
          onClick={handleLikeToggle}
          className={cn(
            "flex items-center gap-2 px-6 py-3 rounded-full font-bold transition-all border",
            isLiked
              ? "bg-rose-50 border-rose-200 text-rose-600 hover:bg-rose-100"
              : "bg-surface border-border text-primary-text hover:bg-gray-50",
          )}
        >
          <Heart
            className={cn(
              "w-5 h-5",
              isLiked ? "fill-rose-500 text-rose-500" : "text-gray-400",
            )}
          />
          <span>
            {likeCount} {likeCount === 1 ? "Like" : "Likes"}
          </span>
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-10 items-start">
        {/* Left Column: Form (if enrolled) & Overall Stats */}
        <div className="space-y-8">
          <div className="bg-surface border border-border rounded-3xl p-8 text-center ring-1 ring-border/50">
            <h3 className="font-bold text-secondary-text text-sm uppercase tracking-wider mb-2">
              Course Rating
            </h3>
            <div className="flex items-center justify-center gap-3">
              <span className="text-6xl font-black text-primary-text">
                {initialStats.avgRating.toFixed(1)}
              </span>
              <div className="flex flex-col items-start gap-1">
                <StarRatingInput
                  value={Math.round(initialStats.avgRating)}
                  readonly
                  size={20}
                />
                <span className="text-sm font-semibold text-secondary-text">
                  Based on {initialStats.totalReviews} reviews
                </span>
              </div>
            </div>
          </div>

          {isEnrolled && (
            <div className="bg-brand/5 border border-brand/10 rounded-3xl p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />

              <h3 className="text-xl font-bold text-primary-text mb-4">
                {hasReviewed ? "Update Your Review" : "Leave a Review"}
              </h3>

              <form
                onSubmit={handleReviewSubmit}
                className="space-y-6 relative z-10"
              >
                <div className="space-y-2">
                  <label className="text-sm font-bold text-secondary-text">
                    Rating
                  </label>
                  <StarRatingInput
                    value={userRating}
                    onChange={setUserRating}
                    size={32}
                  />
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="comment"
                    className="text-sm font-bold text-secondary-text"
                  >
                    Comment (Optional)
                  </label>
                  <textarea
                    id="comment"
                    value={userComment}
                    onChange={(e) => setUserComment(e.target.value)}
                    placeholder="What did you think of the course?"
                    className="w-full min-h-[120px] p-4 bg-surface border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand/50 resize-y text-primary-text placeholder:text-gray-400"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || userRating === 0}
                  className="w-full bg-brand text-white font-bold py-3 rounded-xl hover:bg-brand/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : hasReviewed ? (
                    "Update Review"
                  ) : (
                    "Post Review"
                  )}
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Right Column: Reviews List */}
        <div className="lg:col-span-2 space-y-6">
          {reviews.length === 0 ? (
            <div className="bg-surface border border-border border-dashed rounded-3xl p-12 text-center text-secondary-text">
              <div className="mx-auto w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                <MessageSquare className="w-8 h-8 text-gray-300" />
              </div>
              <p className="font-semibold text-lg text-primary-text">
                No reviews yet
              </p>
              <p className="text-sm mt-1">
                Be the first to share your thoughts on this course!
              </p>
            </div>
          ) : (
            <>
              <div className="space-y-6">
                {reviews.map((review) => (
                  <div
                    key={review.id}
                    className="bg-surface border border-border rounded-2xl p-6 flex gap-5"
                  >
                    <div className="relative w-12 h-12 rounded-full overflow-hidden border border-border shrink-0 bg-gray-100 flex items-center justify-center">
                      {review.user.imageUrl ? (
                        <Image
                          src={review.user.imageUrl}
                          alt={review.user.firstName || "User"}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <span className="font-bold text-brand uppercase">
                          {review.user.firstName?.[0] ||
                            review.user.lastName?.[0] ||
                            "?"}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-bold text-primary-text">
                            {review.user.firstName} {review.user.lastName}
                          </h4>
                          <span className="text-xs text-secondary-text font-medium">
                            {new Date(review.createdAt).toLocaleDateString(
                              undefined,
                              {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              },
                            )}
                          </span>
                        </div>
                        <StarRatingInput
                          value={review.rating}
                          readonly
                          size={16}
                        />
                      </div>

                      {review.comment && (
                        <p className="text-secondary-text text-sm leading-relaxed mt-3">
                          {review.comment}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {hasMore && (
                <div className="pt-4 text-center">
                  <button
                    onClick={fetchMoreReviews}
                    className="text-brand font-bold text-sm bg-brand/5 hover:bg-brand/10 px-6 py-2 rounded-full transition-colors"
                  >
                    Load More Reviews
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
