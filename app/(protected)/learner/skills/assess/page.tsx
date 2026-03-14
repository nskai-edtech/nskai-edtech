"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Target, ArrowLeft, Loader2, ChevronRight, Filter } from "lucide-react";
import { startDiagnostic } from "@/actions/skills/diagnostic";
import {
  getAvailableSkillCategories,
  getSkillsByCategory,
} from "@/actions/skills/queries";
import {
  AssessmentPlayer,
  AssessmentResults,
} from "@/components/skills/assessment-player";
import type {
  AssessmentQuestionLearner,
  DiagnosticSubmission,
} from "@/actions/skills/types";
import { cn } from "@/lib/utils";

type ViewState = "categories" | "skills" | "loading" | "playing" | "results";

export default function AssessPage() {
  const [view, setView] = useState<ViewState>("categories");
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [skills, setSkills] = useState<
    { id: string; title: string; questionCount: number }[]
  >([]);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [questions, setQuestions] = useState<AssessmentQuestionLearner[]>([]);
  const [skillMap, setSkillMap] = useState<Record<string, string>>({});
  const [results, setResults] = useState<DiagnosticSubmission | null>(null);

  // Load categories on mount
  useEffect(() => {
    (async () => {
      const res = await getAvailableSkillCategories();
      if ("categories" in res) setCategories(res.categories);
    })();
  }, []);

  // Load skills when category is selected
  const handleCategorySelect = useCallback(async (category: string) => {
    setSelectedCategory(category);
    const res = await getSkillsByCategory(category);
    if ("skills" in res) {
      setSkills(res.skills);
      setSelectedSkills(res.skills.map((s) => s.id)); // All selected by default
    }
    setView("skills");
  }, []);

  const toggleSkill = (id: string) => {
    setSelectedSkills((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id],
    );
  };

  const handleStart = async () => {
    if (selectedSkills.length === 0) return;
    setView("loading");
    const res = await startDiagnostic(selectedSkills);
    if ("error" in res) {
      setView("skills");
      return;
    }
    setQuestions(res.questions);
    setSkillMap(res.skillMap);
    setView("playing");
  };

  const handleAllSkills = async () => {
    setView("loading");
    const res = await startDiagnostic();
    if ("error" in res) {
      setView("categories");
      return;
    }
    setQuestions(res.questions);
    setSkillMap(res.skillMap);
    setView("playing");
  };

  const handleComplete = (submission: DiagnosticSubmission) => {
    setResults(submission);
    setView("results");
  };

  const handleRetake = () => {
    setResults(null);
    setQuestions([]);
    setSkillMap({});
    setSelectedSkills([]);
    setSelectedCategory(null);
    setView("categories");
  };

  return (
    <div className="space-y-6 min-w-0">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/learner/skills"
          className="p-2 rounded-lg hover:bg-surface-muted transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-secondary-text" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary-text">
            Skills Assessment
          </h1>
          <p className="text-secondary-text">
            {view === "categories" && "Choose a category or assess all skills"}
            {view === "skills" &&
              `Select skills in ${selectedCategory} to assess`}
            {view === "loading" && "Preparing your assessment..."}
            {view === "playing" &&
              "Answer each question to the best of your ability"}
            {view === "results" && "Your assessment results"}
          </p>
        </div>
      </div>

      {/* Category Selection */}
      {view === "categories" && (
        <div className="space-y-4">
          {/* Assess All CTA */}
          <button
            type="button"
            onClick={handleAllSkills}
            className="w-full flex items-center justify-between p-5 bg-brand/5 border-2 border-brand/20 rounded-xl hover:bg-brand/10 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-brand/10">
                <Target className="w-5 h-5 text-brand" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-primary-text">
                  Full Assessment
                </p>
                <p className="text-sm text-secondary-text">
                  Test across all available skills
                </p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-brand group-hover:translate-x-1 transition-transform" />
          </button>

          {/* Category Cards */}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => handleCategorySelect(category)}
                className="flex items-center justify-between p-4 bg-surface border border-border rounded-xl hover:border-brand/40 hover:bg-surface-muted transition-colors text-left group"
              >
                <div className="flex items-center gap-3">
                  <Filter className="w-4 h-4 text-secondary-text" />
                  <span className="font-medium text-primary-text">
                    {category}
                  </span>
                </div>
                <ChevronRight className="w-4 h-4 text-secondary-text group-hover:text-brand group-hover:translate-x-1 transition-all" />
              </button>
            ))}
          </div>

          {categories.length === 0 && (
            <div className="text-center py-12 text-secondary-text">
              No assessment questions have been set up yet. Check back later.
            </div>
          )}
        </div>
      )}

      {/* Skill Selection within Category */}
      {view === "skills" && (
        <div className="space-y-4">
          <button
            type="button"
            onClick={() => {
              setView("categories");
              setSelectedCategory(null);
            }}
            className="text-sm text-secondary-text hover:text-primary-text transition-colors flex items-center gap-1"
          >
            <ArrowLeft className="w-3 h-3" /> Back to categories
          </button>

          <div className="space-y-2">
            {skills.map((skill) => (
              <label
                key={skill.id}
                className={cn(
                  "flex items-center gap-3 p-4 bg-surface border rounded-xl cursor-pointer transition-colors",
                  selectedSkills.includes(skill.id)
                    ? "border-brand bg-brand/5"
                    : "border-border hover:border-brand/30",
                )}
              >
                <input
                  type="checkbox"
                  checked={selectedSkills.includes(skill.id)}
                  onChange={() => toggleSkill(skill.id)}
                  className="w-4 h-4 rounded border-border text-brand focus:ring-brand"
                />
                <div className="flex-1">
                  <p className="font-medium text-primary-text">{skill.title}</p>
                  <p className="text-xs text-secondary-text">
                    {skill.questionCount} question
                    {skill.questionCount !== 1 ? "s" : ""}
                  </p>
                </div>
              </label>
            ))}
          </div>

          <button
            type="button"
            onClick={handleStart}
            disabled={selectedSkills.length === 0}
            className={cn(
              "w-full py-3 rounded-lg font-medium transition-all",
              selectedSkills.length > 0
                ? "bg-brand text-white hover:bg-brand/90 shadow-lg shadow-brand/20"
                : "bg-surface-muted text-secondary-text cursor-not-allowed",
            )}
          >
            Start Assessment ({selectedSkills.length} skill
            {selectedSkills.length !== 1 ? "s" : ""})
          </button>
        </div>
      )}

      {/* Loading */}
      {view === "loading" && (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-brand mb-4" />
          <p className="text-secondary-text">Loading questions...</p>
        </div>
      )}

      {/* Assessment Player */}
      {view === "playing" && questions.length > 0 && (
        <AssessmentPlayer
          questions={questions}
          skillMap={skillMap}
          onComplete={handleComplete}
        />
      )}

      {/* Results */}
      {view === "results" && results && (
        <AssessmentResults results={results} onRetakeAction={handleRetake} />
      )}
    </div>
  );
}
