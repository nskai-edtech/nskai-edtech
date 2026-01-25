"use client";

import { completeOnboarding } from "@/actions/onboarding";
import { useUser } from "@clerk/nextjs";
import { GraduationCap, BookOpen, Loader2, X } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

function Modal({
  isOpen,
  onClose,
  children,
}: {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md relative animate-in fade-in zoom-in duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X className="w-5 h-5" />
        </button>
        {children}
      </div>
    </div>
  );
}

export default function OnboardingPage() {
  const { user } = useUser();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showTutorForm, setShowTutorForm] = useState(false);

  const [formData, setFormData] = useState({
    expertise: "Software Development",
    bio: "",
  });

  const handleSuccess = async (role: "TUTOR" | "LEARNER") => {
    await user?.reload();

    if (role === "TUTOR") {
      router.push("/tutor");
    } else {
      router.push("/learner");
    }
  };

  const handleLearnerSelect = async () => {
    setIsLoading(true);
    const res = await completeOnboarding({ role: "LEARNER" });

    if (res?.success) {
      await handleSuccess("LEARNER");
    } else {
      setIsLoading(false);
      alert("Something went wrong. Please try again.");
    }
  };

  const handleTutorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const res = await completeOnboarding({
      role: "TUTOR",
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      bio: formData.bio,
      expertise: formData.expertise,
    });

    if (res?.success) {
      await handleSuccess("TUTOR");
    } else {
      setIsLoading(false);
      alert("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4 text-gray-900">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Welcome to NSKAI EdTech</h1>
        <p className="text-gray-600">How do you want to use the platform?</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 max-w-2xl w-full">
        {/* LEARNER CARD */}
        <button
          disabled={isLoading}
          onClick={handleLearnerSelect}
          className="group flex flex-col items-center p-8 bg-white rounded-xl shadow-sm border-2 border-transparent hover:border-blue-500 transition-all hover:shadow-md"
        >
          <div className="p-4 bg-blue-100 rounded-full mb-4 group-hover:bg-blue-200 transition-colors">
            <BookOpen className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-xl font-semibold mb-2">I want to Learn</h2>
          <p className="text-sm text-gray-500">
            Access courses and track progress.
          </p>
        </button>

        {/* TUTOR CARD */}
        <button
          disabled={isLoading}
          onClick={() => setShowTutorForm(true)}
          className="group flex flex-col items-center p-8 bg-white rounded-xl shadow-sm border-2 border-transparent hover:border-purple-500 transition-all hover:shadow-md"
        >
          <div className="p-4 bg-purple-100 rounded-full mb-4 group-hover:bg-purple-200 transition-colors">
            <GraduationCap className="w-8 h-8 text-purple-600" />
          </div>
          <h2 className="text-xl font-semibold mb-2">I want to Teach</h2>
          <p className="text-sm text-gray-500">
            Create courses and earn revenue.
          </p>
        </button>
      </div>

      {/* TUTOR APPLICATION MODAL */}
      <Modal isOpen={showTutorForm} onClose={() => setShowTutorForm(false)}>
        <form onSubmit={handleTutorSubmit} className="p-6">
          <h2 className="text-2xl font-bold mb-1">Tutor Application</h2>
          <p className="text-sm text-gray-500 mb-6">
            Tell us a bit about yourself.
          </p>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase">
                  First Name
                </label>
                <input
                  type="text"
                  value={user?.firstName || ""}
                  disabled
                  className="w-full mt-1 p-2 bg-gray-100 border rounded text-gray-600 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase">
                  Last Name
                </label>
                <input
                  type="text"
                  value={user?.lastName || ""}
                  disabled
                  className="w-full mt-1 p-2 bg-gray-100 border rounded text-gray-600 cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase">
                Email
              </label>
              <input
                type="text"
                value={user?.primaryEmailAddress?.emailAddress || ""}
                disabled
                className="w-full mt-1 p-2 bg-gray-100 border rounded text-gray-600 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-700 uppercase">
                Area of Expertise
              </label>
              <select
                required
                className="w-full mt-1 p-2 border rounded focus:ring-2 focus:ring-purple-500 outline-none"
                value={formData.expertise}
                onChange={(e) =>
                  setFormData({ ...formData, expertise: e.target.value })
                }
              >
                <option value="Software Development">
                  Software Development
                </option>
                <option value="Data Science">Data Science</option>
                <option value="Design">Product Design</option>
                <option value="Business">Business & Marketing</option>
                <option value="Mathematics">Mathematics</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-700 uppercase">
                Bio / Description
              </label>
              <textarea
                required
                placeholder="I have 5 years experience in..."
                className="w-full mt-1 p-2 border rounded focus:ring-2 focus:ring-purple-500 outline-none h-24 resize-none"
                value={formData.bio}
                onChange={(e) =>
                  setFormData({ ...formData, bio: e.target.value })
                }
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg transition-colors flex justify-center items-center"
            >
              {isLoading ? (
                <Loader2 className="animate-spin" />
              ) : (
                "Submit Application"
              )}
            </button>
          </div>
        </form>
      </Modal>

      {/* Global Loading State */}
      {isLoading && !showTutorForm && (
        <div className="mt-8 flex items-center text-gray-500">
          <Loader2 className="w-4 h-4 animate-spin mr-2" />
          Setting up your account...
        </div>
      )}
    </div>
  );
}
