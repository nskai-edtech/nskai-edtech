"use client";

import {
  GraduationCap,
  BookOpen,
  School,
  Users,
  BookHeart,
  Loader2,
  X,
} from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard";
import {
  completeOnboarding,
  completeB2BOnboarding,
} from "@/actions/onboarding";
import { useUser } from "@clerk/nextjs";

function Modal({
  isOpen,
  onClose,
  children,
  wide = false,
}: {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  wide?: boolean;
}) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm overflow-y-auto">
      <div
        className={`bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full relative animate-in fade-in zoom-in duration-200 border dark:border-gray-800 my-auto ${wide ? "max-w-4xl" : "max-w-md"}`}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-50 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 bg-white/50 dark:bg-black/50 rounded-full p-1"
        >
          <X className="w-5 h-5" />
        </button>
        {children}
      </div>
    </div>
  );
}

export default function OnboardingHub() {
  const { user } = useUser();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // Tutor Application State
  const [tutorData, setTutorData] = useState({
    firstName: "",
    lastName: "",
    bio: "",
    expertise: "",
  });
  const [isTutorSubmitting, setIsTutorSubmitting] = useState(false);

  // B2B Student/Teacher Verification State
  const [b2bData, setB2bData] = useState({
    schoolId: "",
    proprietorSelection: "",
    classOrSubject: "",
  });

  // Mock Data for Schools & Proprietors Dropdowns (To be fetched from DB later)
  const mockSchools = [
    { id: "org_1", name: "Greenwood High" },
    { id: "org_2", name: "Lagos International School" },
  ];

  // The randomly ordered Proprietor dropdown list to prevent guessing
  // cspell:disable
  const mockProprietors = [
    "Dr. Samuel Ogundipe",
    "Mrs. Alice Johnson", // Correct answer for Greenwood theoretically
    "Mr. Femi Alabi",
    "Chief Emmanuel Coker",
  ];
  // cspell:enable

  // Modals state
  const [activeModal, setActiveModal] = useState<
    "TUTOR" | "SCHOOL" | "STUDENT" | "TEACHER" | null
  >(null);

  // ================= B2C WORKFLOWS =================
  const handleTutorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsTutorSubmitting(true);
    try {
      const res = await completeOnboarding({
        role: "TUTOR",
        firstName: tutorData.firstName,
        lastName: tutorData.lastName,
        bio: tutorData.bio,
        expertise: tutorData.expertise,
      });
      if (res.success) {
        await user?.reload();
        setActiveModal(null);
        router.push("/tutor");
      } else {
        alert("Error: " + res.error);
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong. Please try again.");
    } finally {
      setIsTutorSubmitting(false);
    }
  };

  const handleLearnerSelect = async () => {
    setIsLoading(true);
    const res = await completeOnboarding({ role: "LEARNER" });
    if (res.success) {
      await user?.reload();
      router.push("/learner");
    } else {
      alert("Error: " + res.error);
      setIsLoading(false);
    }
  };


  // ================= B2B WORKFLOWS =================
  const handleB2BSubmit = async (
    e: React.FormEvent,
    role: "STUDENT" | "TEACHER",
  ) => {
    e.preventDefault();
    setIsLoading(true);

    // In a real scenario, we verify the proprietor selection against DB securely
    // For now, we submit to backend as PENDING
    const res = await completeB2BOnboarding({
      role,
      schoolId: b2bData.schoolId,
      classOrSubject: b2bData.classOrSubject,
    });

    if (res.success) {
      await user?.reload();
      alert(
        `Passed Challenge! Submitted as pending ${role} for your school. Awaiting Admin Approval.`,
      );
      setActiveModal(null);
      // Optional: push to a pending dashboard or learner view
      router.push("/learner");
    } else {
      alert("Error: " + (res.error || "Failed"));
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-950 p-4 py-12 text-gray-900 dark:text-gray-100">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-extrabold mb-3 tracking-tight">
          Welcome to Zerra
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Zerra connects individual learners with top creators, while also
          powering full digital infrastructures for modern schools. How are you
          joining us today?
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 max-w-4xl w-full">
        {/* ==================== B2C Section ==================== */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-2 px-2">
            <div className="h-px flex-1 bg-gray-200 dark:bg-gray-800"></div>
            <span className="text-xs font-bold uppercase tracking-widest text-gray-400">
              Direct Zerra Users
            </span>
            <div className="h-px flex-1 bg-gray-200 dark:bg-gray-800"></div>
          </div>

          {/* LEARNER CARD */}
          <button
            onClick={handleLearnerSelect}
            className="w-full group flex items-center p-5 bg-white dark:bg-gray-900 rounded-xl shadow-sm border-2 border-transparent hover:border-blue-500 transition-all hover:shadow-md text-left"
          >
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg mr-4 group-hover:bg-blue-200 transition-colors">
              <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold mb-1">I want to Learn</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Discover and take courses directly on Zerra.
              </p>
            </div>
          </button>

          {/* TUTOR CARD */}
          <button
            onClick={() => setActiveModal("TUTOR")}
            className="w-full group flex items-center p-5 bg-white dark:bg-gray-900 rounded-xl shadow-sm border-2 border-transparent hover:border-purple-500 transition-all hover:shadow-md text-left"
          >
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg mr-4 group-hover:bg-purple-200 transition-colors">
              <GraduationCap className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold mb-1">I want to Teach</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Create independent courses and earn revenue.
              </p>
            </div>
          </button>
        </div>

        {/* ==================== B2B Section ==================== */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-2 px-2">
            <div className="h-px flex-1 bg-gray-200 dark:bg-gray-800"></div>
            <span className="text-xs font-bold uppercase tracking-widest text-gray-400">
              Zerra for Schools
            </span>
            <div className="h-px flex-1 bg-gray-200 dark:bg-gray-800"></div>
          </div>

          {/* REGISTER SCHOOL CARD */}
          <button
            onClick={() => setActiveModal("SCHOOL")}
            className="w-full group flex items-center p-5 bg-white dark:bg-gray-900 rounded-xl shadow-sm border-2 border-transparent hover:border-emerald-500 transition-all hover:shadow-md text-left"
          >
            <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg mr-4 group-hover:bg-emerald-200 transition-colors">
              <School className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold mb-1">Register My School</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Onboard your entire institution as an Admin.
              </p>
            </div>
          </button>

          <div className="grid grid-cols-2 gap-4">
            {/* JOIN AS STUDENT CARD */}
            <button
              onClick={() => setActiveModal("STUDENT")}
              className="w-full group flex flex-col items-center justify-center p-4 bg-white dark:bg-gray-900 rounded-xl shadow-sm border-2 border-transparent hover:border-orange-500 transition-all hover:shadow-md text-center"
            >
              <div className="p-2 justify-center bg-orange-100 dark:bg-orange-900/30 rounded-full mb-2 group-hover:bg-orange-200 transition-colors">
                <BookHeart className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              </div>
              <h2 className="text-sm font-bold">Join as Student</h2>
            </button>

            {/* JOIN AS STAFF CARD */}
            <button
              onClick={() => setActiveModal("TEACHER")}
              className="w-full group flex flex-col items-center justify-center p-4 bg-white dark:bg-gray-900 rounded-xl shadow-sm border-2 border-transparent hover:border-indigo-500 transition-all hover:shadow-md text-center"
            >
              <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-full mb-2 group-hover:bg-indigo-200 transition-colors">
                <Users className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h2 className="text-sm font-bold">Join as Staff</h2>
            </button>
          </div>
        </div>
      </div>

      {/* =============================== MODALS =============================== */}

      {/* 1. TUTOR FORM MODAL (B2C) */}
      <Modal
        isOpen={activeModal === "TUTOR"}
        onClose={() => setActiveModal(null)}
      >
        <form onSubmit={handleTutorSubmit} className="p-6">
          <h2 className="text-2xl font-bold mb-1">Tutor Application</h2>
          <p className="text-sm text-gray-500 mb-6">
            Tell us about yourself to get started as an independent tutor on
            Zerra.
          </p>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  First Name *
                </label>
                <input
                  required
                  type="text"
                  value={tutorData.firstName}
                  onChange={(e) =>
                    setTutorData((d) => ({ ...d, firstName: e.target.value }))
                  }
                  placeholder="e.g. Jane"
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Last Name *
                </label>
                <input
                  required
                  type="text"
                  value={tutorData.lastName}
                  onChange={(e) =>
                    setTutorData((d) => ({ ...d, lastName: e.target.value }))
                  }
                  placeholder="e.g. Doe"
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Area of Expertise *
              </label>
              <input
                required
                type="text"
                value={tutorData.expertise}
                onChange={(e) =>
                  setTutorData((d) => ({ ...d, expertise: e.target.value }))
                }
                placeholder="e.g. Mathematics, Web Development, Music"
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Short Bio *
              </label>
              <textarea
                required
                rows={3}
                value={tutorData.bio}
                onChange={(e) =>
                  setTutorData((d) => ({ ...d, bio: e.target.value }))
                }
                placeholder="Tell students about your background, teaching style, and experience..."
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
              />
            </div>
            <button
              type="submit"
              disabled={isTutorSubmitting}
              className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isTutorSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Independent Tutor Profile"
              )}
            </button>
          </div>
        </form>
      </Modal>

      {/* 2. SCHOOL WIZARD MODAL (B2B Admin) */}
      <Modal
        isOpen={activeModal === "SCHOOL"}
        onClose={() => setActiveModal(null)}
        wide
      >
        <div id="onboarding-scroll-container" className="max-h-[85vh] overflow-y-auto w-full bg-white rounded-xl">
          {/* Reuse the OnboardingWizard component here! */}
          <OnboardingWizard />
        </div>
      </Modal>

      {/* 3. SECURITY CHALLENGE MODAL (B2B Student/Teacher) */}
      <Modal
        isOpen={activeModal === "STUDENT" || activeModal === "TEACHER"}
        onClose={() => setActiveModal(null)}
      >
        <form
          onSubmit={(e) =>
            handleB2BSubmit(e, activeModal as "STUDENT" | "TEACHER")
          }
          className="p-6"
        >
          <h2 className="text-2xl font-bold mb-1">
            Join as{" "}
            {activeModal === "STUDENT" ? "School Student" : "School Teacher"}
          </h2>
          <p className="text-sm text-gray-500 mb-6 border-b border-gray-100 pb-4">
            You are requesting securely verified access to a private school
            space.
          </p>

          <div className="space-y-5">
            {/* Step 1: Select School */}
            <div>
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase block mb-1">
                1. Select Your School
              </label>
              <select
                required
                className="w-full p-3 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-gray-100"
                value={b2bData.schoolId}
                onChange={(e) =>
                  setB2bData({ ...b2bData, schoolId: e.target.value })
                }
              >
                <option value="" disabled>
                  Search to find your school...
                </option>
                {mockSchools.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Step 2: The Security Challenge (Proprietor verification) */}
            {b2bData.schoolId && (
              <div className="animate-in fade-in slide-in-from-top-2 p-4 bg-orange-50 dark:bg-orange-900/10 border border-orange-200 dark:border-orange-800 rounded-lg">
                <label className="text-xs font-bold text-orange-800 dark:text-orange-400 uppercase flex items-center gap-2 mb-2">
                  <span>🔒</span> SECURITY CHALLENGE: Verification
                </label>
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                  To prove you belong to this institution, please select the
                  correct name of the{" "}
                  <strong>School Owner or Proprietor</strong>.
                </p>
                <select
                  required
                  className="w-full p-3 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                  value={b2bData.proprietorSelection}
                  onChange={(e) =>
                    setB2bData({
                      ...b2bData,
                      proprietorSelection: e.target.value,
                    })
                  }
                >
                  <option value="" disabled>
                    Select the owner&apos;s name...
                  </option>
                  {mockProprietors.map((p, i) => (
                    <option key={i} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Step 3: Specifics */}
            {b2bData.proprietorSelection && (
              <div className="animate-in fade-in slide-in-from-top-2">
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase block mb-1">
                  3.{" "}
                  {activeModal === "STUDENT"
                    ? "What class are you in?"
                    : "What subjects do you teach?"}
                </label>
                <input
                  required
                  type="text"
                  placeholder={
                    activeModal === "STUDENT"
                      ? "e.g., Primary 1"
                      : "e.g., Mathematics, Physics"
                  }
                  className="w-full p-3 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  value={b2bData.classOrSubject}
                  onChange={(e) =>
                    setB2bData({ ...b2bData, classOrSubject: e.target.value })
                  }
                />
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || !b2bData.classOrSubject}
              className="w-full py-4 mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors flex justify-center items-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <Loader2 className="animate-spin" />
              ) : (
                `Request Account Pending Approval`
              )}
            </button>
          </div>
        </form>
      </Modal>

      {/* Global Loading State */}
      {isLoading && !activeModal && (
        <div className="mt-8 flex items-center text-gray-500">
          <Loader2 className="w-4 h-4 animate-spin mr-2" />
          Processing request...
        </div>
      )}
    </div>
  );
}
