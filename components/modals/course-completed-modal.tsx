"use client";

import { useModalStore } from "@/hooks/use-modal-store";
import { useRouter } from "next/navigation";
import { Trophy, ArrowRight, X } from "lucide-react";

export const CourseCompletedModal = () => {
  const { isOpen, onClose, type, data } = useModalStore();
  const router = useRouter();

  const isModalOpen = isOpen && type === "courseCompleted";
  if (!isModalOpen) return null;

  const handleViewCertificate = () => {
    onClose();
    router.push("/learner/certificates");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-surface w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-border relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-surface-muted transition-colors text-secondary-text hover:text-primary-text z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top celebration area */}
        <div className="relative bg-linear-to-br from-brand/20 via-amber-500/10 to-brand/5 px-6 pt-10 pb-8 text-center">
          {/* Decorative confetti circles */}
          <div className="absolute top-4 left-8 w-3 h-3 rounded-full bg-amber-400/60 animate-bounce" />
          <div className="absolute top-8 right-12 w-2 h-2 rounded-full bg-brand/50 animate-bounce delay-150" />
          <div className="absolute bottom-6 left-16 w-2 h-2 rounded-full bg-green-400/50 animate-bounce delay-300" />
          <div className="absolute top-12 left-24 w-1.5 h-1.5 rounded-full bg-pink-400/40 animate-bounce delay-200" />

          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shadow-lg shadow-amber-500/10">
            <Trophy className="w-10 h-10 text-amber-500" />
          </div>

          <h2 className="text-2xl font-black text-primary-text mb-2">
            Congratulations!
          </h2>
          <p className="text-secondary-text text-sm">
            You&apos;ve done something amazing!
          </p>
        </div>

        {/* Content */}
        <div className="px-6 py-6 text-center space-y-4">
          <div>
            <p className="text-secondary-text text-sm mb-1">
              You have successfully completed
            </p>
            <h3 className="text-lg font-bold text-primary-text leading-snug">
              {data.courseTitle || "this course"}
            </h3>
          </div>

          <p className="text-secondary-text text-sm">
            Your certificate is now available. Download it to showcase your
            achievement!
          </p>

          {/* Actions */}
          <div className="flex flex-col gap-3 pt-2">
            <button
              onClick={handleViewCertificate}
              className="flex items-center justify-center gap-2 w-full px-6 py-3 bg-brand text-white font-bold rounded-xl hover:bg-brand-dark transition-colors shadow-lg shadow-brand/20"
            >
              View Certificate
              <ArrowRight className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="text-sm text-secondary-text hover:text-primary-text transition-colors font-medium py-2"
            >
              Continue Learning
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
