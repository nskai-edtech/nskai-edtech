"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { completeOnboarding } from "@/actions/onboarding";
import {
  Search,
  Check,
  ChevronRight,
  BarChart3,
  Pencil,
  BookOpen,
  Cpu,
  Megaphone,
  Library,
  Telescope,
  Landmark,
  PenTool,
  Music,
  FlaskConical,
  Calculator,
  Loader2,
} from "lucide-react";
import toast from "react-hot-toast";

// Topic type definition
interface Topic {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
}

// Available topics for selection
const TOPICS: Topic[] = [
  {
    id: "data-science",
    name: "Data Science",
    icon: <BarChart3 className="w-6 h-6" />,
    color: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
  },
  {
    id: "creative-writing",
    name: "Creative Writing",
    icon: <Pencil className="w-6 h-6" />,
    color:
      "bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400",
  },
  {
    id: "history",
    name: "History",
    icon: <BookOpen className="w-6 h-6" />,
    color: "bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400",
  },
  {
    id: "machine-learning",
    name: "Machine Learning",
    icon: <Cpu className="w-6 h-6" />,
    color: "bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400",
  },
  {
    id: "digital-marketing",
    name: "Digital Marketing",
    icon: <Megaphone className="w-6 h-6" />,
    color:
      "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400",
  },
  {
    id: "philosophy",
    name: "Philosophy",
    icon: <Library className="w-6 h-6" />,
    color:
      "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400",
  },
  {
    id: "astrophysics",
    name: "Astrophysics",
    icon: <Telescope className="w-6 h-6" />,
    color: "bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400",
  },
  {
    id: "economics",
    name: "Economics",
    icon: <Landmark className="w-6 h-6" />,
    color: "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400",
  },
  {
    id: "ux-design",
    name: "UX/UI Design",
    icon: <PenTool className="w-6 h-6" />,
    color:
      "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400",
  },
  {
    id: "music-theory",
    name: "Music Theory",
    icon: <Music className="w-6 h-6" />,
    color: "bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400",
  },
  {
    id: "biology",
    name: "Biology",
    icon: <FlaskConical className="w-6 h-6" />,
    color: "bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400",
  },
  {
    id: "advanced-math",
    name: "Advanced Math",
    icon: <Calculator className="w-6 h-6" />,
    color: "bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400",
  },
];

// Step type
type OnboardingStep = 1 | 2 | 3;

// Progress Bar Component
function ProgressBar({
  currentStep,
  totalSteps,
}: {
  currentStep: number;
  totalSteps: number;
}) {
  const progressPercent = Math.round((currentStep / totalSteps) * 100);

  return (
    <div className="w-full py-4 px-6 bg-surface border-b border-border">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-brand">
            Step {currentStep} of {totalSteps}
          </span>
        </div>
        <div className="flex-1 mx-6">
          <div className="h-1.5 bg-surface-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-brand rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
        <span className="text-sm text-secondary-text">
          {progressPercent}% Complete
        </span>
      </div>
    </div>
  );
}

// Topic Card Component
function TopicCard({
  topic,
  selected,
  onToggle,
}: {
  topic: Topic;
  selected: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`relative flex flex-col items-center p-6 rounded-xl border-2 transition-all duration-200 ${
        selected
          ? "border-brand bg-brand/5 shadow-md"
          : "border-border bg-surface hover:border-brand/50 hover:shadow-sm"
      }`}
    >
      {/* Selection Indicator */}
      {selected && (
        <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-brand flex items-center justify-center">
          <Check className="w-3 h-3 text-white" />
        </div>
      )}

      {/* Icon */}
      <div className={`p-3 rounded-xl mb-3 ${topic.color}`}>{topic.icon}</div>

      {/* Name */}
      <span className="text-sm font-medium text-primary-text text-center">
        {topic.name}
      </span>
    </button>
  );
}

export default function LearnerOnboardingPage() {
  const { user } = useUser();
  const router = useRouter();

  const [currentStep, setCurrentStep] = useState<OnboardingStep>(1);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [selectedGoal, setSelectedGoal] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Filter topics based on search
  const filteredTopics = TOPICS.filter((topic) =>
    topic.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Toggle topic selection
  const toggleTopic = (topicId: string) => {
    setSelectedTopics((prev) =>
      prev.includes(topicId)
        ? prev.filter((id) => id !== topicId)
        : [...prev, topicId],
    );
  };

  // Handle continue action
  const handleContinue = async () => {
    if (currentStep === 1 && selectedTopics.length >= 3) {
      setCurrentStep(2);
    } else if (currentStep === 2) {
      setCurrentStep(3);
    } else if (currentStep === 3) {
      // Complete onboarding and redirect
      setIsLoading(true);
      try {
        const result = await completeOnboarding({
          role: "LEARNER",
          interests: selectedTopics,
          learningGoal: selectedGoal,
        });

        if (result?.success) {
          await user?.reload();
          toast.success("Welcome to NSK.AI! Let's start learning.");
          router.push("/learner");
        } else {
          toast.error("Something went wrong. Please try again.");
          setIsLoading(false);
        }
      } catch (error) {
        console.error(error);
        toast.error("Failed to complete onboarding.");
        setIsLoading(false);
      }
    }
  };

  // Handle back action
  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as OnboardingStep);
    }
  };

  // Can continue check
  const canContinue =
    (currentStep === 1 && selectedTopics.length >= 3) ||
    (currentStep === 2 && selectedGoal) ||
    currentStep === 3;

  return (
    <div
      className="min-h-screen flex flex-col bg-surface"
      suppressHydrationWarning
    >
      {/* Progress Bar */}
      <ProgressBar currentStep={currentStep} totalSteps={3} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        {/* Step 1: Topic Selection */}
        {currentStep === 1 && (
          <div className="w-full max-w-4xl animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-primary-text mb-3">
                What sparks your curiosity?
              </h1>
              <p className="text-secondary-text">
                Pick at least 3 topics to help us personalize your learning
                path.
              </p>
            </div>

            {/* Search */}
            <div className="max-w-xl mx-auto mb-8">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-text" />
                <input
                  type="text"
                  placeholder="Search for specific topics (e.g., Data Science)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-surface border border-border rounded-full text-primary-text placeholder:text-secondary-text focus:outline-none focus:ring-2 focus:ring-brand/50"
                />
              </div>
            </div>

            {/* Topics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredTopics.map((topic) => (
                <TopicCard
                  key={topic.id}
                  topic={topic}
                  selected={selectedTopics.includes(topic.id)}
                  onToggle={() => toggleTopic(topic.id)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Learning Goals */}
        {currentStep === 2 && (
          <div className="w-full max-w-2xl animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-primary-text mb-3">
                What&apos;s your learning goal?
              </h1>
              <p className="text-secondary-text">
                Help us understand how we can support your journey.
              </p>
            </div>

            <div className="space-y-4">
              {[
                {
                  id: "career",
                  title: "Career Advancement",
                  desc: "I want to learn skills for my job or career change",
                },
                {
                  id: "personal",
                  title: "Personal Growth",
                  desc: "I'm learning for fun or personal development",
                },
                {
                  id: "academic",
                  title: "Academic Success",
                  desc: "I need help with school or university courses",
                },
                {
                  id: "certification",
                  title: "Get Certified",
                  desc: "I want to earn certificates and credentials",
                },
              ].map((goal) => (
                <button
                  key={goal.id}
                  type="button"
                  onClick={() => setSelectedGoal(goal.id)}
                  className={`w-full p-5 text-left bg-surface border rounded-xl transition-all group ${
                    selectedGoal === goal.id
                      ? "border-brand bg-brand/5 shadow-md"
                      : "border-border hover:border-brand/50 hover:shadow-sm"
                  }`}
                >
                  <h3
                    className={`font-semibold transition-colors ${
                      selectedGoal === goal.id
                        ? "text-brand"
                        : "text-primary-text group-hover:text-brand"
                    }`}
                  >
                    {goal.title}
                  </h3>
                  <p className="text-sm text-secondary-text mt-1">
                    {goal.desc}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Ready to Go */}
        {currentStep === 3 && (
          <div className="w-full max-w-lg text-center animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="w-20 h-20 rounded-full bg-brand/10 flex items-center justify-center mx-auto mb-6">
              <Check className="w-10 h-10 text-brand" />
            </div>
            <h1 className="text-3xl font-bold text-primary-text mb-3">
              You&apos;re all set, {user?.firstName || "Learner"}!
            </h1>
            <p className="text-secondary-text mb-8">
              We&apos;ve personalized your dashboard based on your interests.
              Ready to start learning?
            </p>

            <div className="flex flex-wrap justify-center gap-2 mb-8">
              {selectedTopics.slice(0, 5).map((topicId) => {
                const topic = TOPICS.find((t) => t.id === topicId);
                return topic ? (
                  <span
                    key={topicId}
                    className="px-3 py-1.5 bg-surface-muted rounded-full text-sm font-medium text-secondary-text"
                  >
                    {topic.name}
                  </span>
                ) : null;
              })}
              {selectedTopics.length > 5 && (
                <span className="px-3 py-1.5 bg-surface-muted rounded-full text-sm font-medium text-secondary-text">
                  +{selectedTopics.length - 5} more
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer with Navigation */}
      <div className="sticky bottom-0 bg-surface border-t border-border py-4 px-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Selected Topics Indicator */}
            {currentStep === 1 && (
              <div className="flex items-center gap-2">
                <div className="flex -space-x-1">
                  {selectedTopics.slice(0, 3).map((topicId, idx) => {
                    const topic = TOPICS.find((t) => t.id === topicId);
                    return topic ? (
                      <div
                        key={topicId}
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs ${topic.color} border-2 border-surface`}
                        style={{ zIndex: 3 - idx }}
                      >
                        {topic.icon}
                      </div>
                    ) : null;
                  })}
                </div>
                <span className="text-sm text-secondary-text">
                  Selected:{" "}
                  <span className="font-semibold text-primary-text">
                    {selectedTopics.length}
                  </span>
                  /3 topics
                </span>
              </div>
            )}

            {/* Back Button */}
            {currentStep > 1 && (
              <button
                type="button"
                onClick={handleBack}
                className="px-4 py-2 text-sm font-medium text-secondary-text hover:text-primary-text transition-colors"
              >
                Back
              </button>
            )}
          </div>

          {/* Continue Button */}
          <button
            type="button"
            onClick={handleContinue}
            disabled={!canContinue || isLoading}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium transition-all ${
              canContinue && !isLoading
                ? "bg-brand text-white hover:bg-brand/90 shadow-lg shadow-brand/20"
                : "bg-surface-muted text-secondary-text cursor-not-allowed"
            }`}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Setting up...
              </>
            ) : currentStep === 3 ? (
              "Start Learning"
            ) : (
              <>
                Continue
                <ChevronRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
