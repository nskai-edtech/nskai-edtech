"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Rocket } from "lucide-react";
import { enrollInLearningPath } from "@/actions/learning-paths";
import { usePaystackPayment } from "react-paystack";
import { verifyPathTransaction } from "@/actions/payment";
import { useUser } from "@clerk/nextjs";
import { toast } from "react-hot-toast";

interface EnrollPathButtonProps {
  pathId: string;
  price: number | null;
  isEnrolled: boolean;
}

interface PaystackSuccessResponse {
  reference: string;
  message: string;
  status: string;
  trans: string;
  transaction: string;
  trxref: string;
}

export function EnrollPathButton({
  pathId,
  price,
  isEnrolled,
}: EnrollPathButtonProps) {
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
      pathId,
      custom_fields: [
        {
          display_name: "Path ID",
          variable_name: "path_id",
          value: pathId,
        },
      ],
    },
  };

  const initializePayment = usePaystackPayment(config);

  const onSuccess = async (reference: PaystackSuccessResponse) => {
    try {
      setIsLoading(true);
      toast.loading("Verifying track access...", { id: "path-payment" });

      const result = await verifyPathTransaction(reference.reference, pathId);

      if (result.success) {
        toast.success("Track unlocked! Redirecting...", { id: "path-payment" });
        router.refresh();
        setTimeout(() => {
          router.push(`/learner/paths/${pathId}/view`);
        }, 1500);
      } else {
        toast.error(result.message || "Verification failed", {
          id: "path-payment",
        });
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Path payment verification failed:", error);
      toast.error("Something went wrong", { id: "path-payment" });
      setIsLoading(false);
    }
  };

  const onClose = () => {
    console.log("Payment closed");
  };

  const onEnroll = async () => {
    if (!user) {
      toast.error("Please login to enroll");
      return;
    }

    if (!price || price === 0) {
      try {
        setIsLoading(true);
        const res = await enrollInLearningPath(pathId);

        if (res.success) {
          toast.success("Successfully enrolled! Redirecting...");
          router.refresh();
          setTimeout(() => {
            router.push(`/learner/paths/${pathId}/view`);
          }, 1500);
        } else {
          toast.error(res.error || "Failed to enroll in curriculum.");
        }
      } catch (error) {
        console.error(error);
        toast.error("Something went wrong");
      } finally {
        setIsLoading(false);
      }
      return;
    }

    initializePayment({ onSuccess, onClose });
  };

  if (isEnrolled) {
    return (
      <button
        onClick={() => router.push(`/learner/paths/${pathId}/view`)}
        className="flex items-center gap-3 bg-emerald-600 text-white px-8 py-4 rounded-2xl font-black text-lg hover:bg-emerald-700 hover:-translate-y-1 transition-all shadow-lg shadow-emerald-900/20 active:scale-95"
      >
        <Rocket className="w-6 h-6 text-white" />
        Go to Track Content
      </button>
    );
  }

  return (
    <button
      onClick={onEnroll}
      disabled={isLoading}
      className="flex items-center gap-3 bg-brand text-white px-8 py-4 rounded-2xl font-black text-lg hover:bg-brand/90 hover:-translate-y-1 transition-all shadow-lg shadow-brand/20 active:scale-95 disabled:opacity-50"
    >
      {isLoading ? (
        <Loader2 className="w-6 h-6 animate-spin" />
      ) : (
        <>
          <Rocket className="w-6 h-6" />
          Enroll in Full Track — {formattedPrice}
        </>
      )}
    </button>
  );
}
