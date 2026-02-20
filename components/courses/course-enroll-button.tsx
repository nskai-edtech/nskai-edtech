"use client";

import { ShoppingCart, CheckCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { usePaystackPayment } from "react-paystack";
import { verifyTransaction, enrollFree } from "@/actions/payment";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useUser } from "@clerk/nextjs";

interface CourseEnrollButtonProps {
  courseId: string;
  isEnrolled: boolean;
  price: number | null;
}

interface PaystackSuccessResponse {
  reference: string;
  message: string;
  status: string;
  trans: string;
  transaction: string;
  trxref: string;
}

export const CourseEnrollButton = ({
  courseId,
  isEnrolled,
  price,
}: CourseEnrollButtonProps) => {
  const router = useRouter();
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState(false);

  // Format price for display
  const formattedPrice = price
    ? new Intl.NumberFormat("en-NG", {
        style: "currency",
        currency: "NGN",
      }).format(price / 100)
    : "Free";

  // Paystack Config
  const config = {
    reference: new Date().getTime().toString(),
    email: user?.emailAddresses[0]?.emailAddress || "",
    amount: price || 0,
    currency: "NGN",
    publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || "",
    metadata: {
      courseId,
      custom_fields: [
        {
          display_name: "Course ID",
          variable_name: "course_id",
          value: courseId,
        },
      ],
    },
  };

  const initializePayment = usePaystackPayment(config);

  const onSuccess = async (reference: PaystackSuccessResponse) => {
    try {
      setIsLoading(true);
      toast.loading("Verifying payment...", { id: "payment" });

      const result = await verifyTransaction(reference.reference, courseId);

      if (result.success) {
        toast.success("Enrolled successfully!", { id: "payment" });
        router.refresh();
        // Redirect to Watch Page
        setTimeout(() => {
          router.push(`/watch/${courseId}`);
        }, 1000);
      } else {
        toast.error(result.message || "Verification failed", { id: "payment" });
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Payment verification failed:", error);
      toast.error("Something went wrong", { id: "payment" });
      setIsLoading(false);
    }
  };

  const onClose = () => {
    console.log("Payment closed");
  };

  const handleEnroll = async () => {
    if (!user) {
      toast.error("Please login to enroll");
      return;
    }

    if (!price || price === 0) {
      try {
        setIsLoading(true);
        toast.loading("Enrolling...", { id: "enroll" });

        const result = await enrollFree(courseId);

        if (result.success) {
          toast.success("Enrolled successfully!", { id: "enroll" });
          router.refresh();
          setTimeout(() => {
            router.push(`/watch/${courseId}`);
          }, 1000);
        } else {
          toast.error(result.message || "Enrollment failed", { id: "enroll" });
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Free enrollment failed:", error);
        toast.error("Something went wrong", { id: "enroll" });
        setIsLoading(false);
      }
      return;
    }

    initializePayment({ onSuccess, onClose });
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
      onClick={handleEnroll}
      disabled={isLoading}
      className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-brand text-white font-bold rounded-xl hover:bg-brand-dark transition-all shadow-lg shadow-brand/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isLoading ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : (
        <ShoppingCart className="w-5 h-5" />
      )}
      Buy now for {formattedPrice}
    </button>
  );
};
