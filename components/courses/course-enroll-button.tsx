"use client";

import { ShoppingCart, CheckCircle } from "lucide-react";
import Link from "next/link";
import { toast } from "react-hot-toast";

interface CourseEnrollButtonProps {
  courseId: string;
  isEnrolled: boolean;
  price: number | null;
}

export const CourseEnrollButton = ({
  courseId,
  isEnrolled,
  price,
}: CourseEnrollButtonProps) => {
  const formattedPrice = price
    ? new Intl.NumberFormat("en-NG", {
        style: "currency",
        currency: "NGN",
      }).format(price / 100)
    : "Free";

  const onEnroll = async () => {
    // This will eventually integrate with Paystack
    toast.success("Purchase flow starting soon!");
  };

  if (isEnrolled) {
    return (
      <Link
        href={`/watch/${courseId}`}
        className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-surface-muted text-primary-text font-bold rounded-xl border border-border hover:bg-surface transition-all"
      >
        <CheckCircle className="w-5 h-5 text-green-500" />
        Continue Learning
      </Link>
    );
  }

  return (
    <button
      onClick={onEnroll}
      className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-brand text-white font-bold rounded-xl hover:bg-brand-dark transition-all shadow-lg shadow-brand/20 active:scale-95 disabled:opacity-50"
    >
      <ShoppingCart className="w-5 h-5" />
      Buy now for {formattedPrice}
    </button>
  );
};
