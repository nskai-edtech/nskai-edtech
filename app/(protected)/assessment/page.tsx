"use client";

import { useState } from "react";
import { PageShell } from "@/components/layout/page-shell";
import { AssessmentQuestion } from "@/components/assessment/assessment-question";
import { AssessmentProgress } from "@/components/assessment/assessment-progress";
import { AssessmentNavigation } from "@/components/assessment/assessment-navigation";

// Temporary mock data until backend integration
const questions = [
  {
    question: "What is a variable in programming?",
    options: [
      "A container for storing data values",
      "A type of loop",
      "A conditional statement",
      "An error in the program",
    ],
  },
  {
    question: "What does a function do?",
    options: [
      "Stores data permanently",
      "Performs a specific task",
      "Creates a database",
      "Styles a webpage",
    ],
  },
];

export default function DiagnosticAssessmentPage() {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Stores selected option index for each question
  const [answers, setAnswers] = useState<(number | null)[]>(
    Array(questions.length).fill(null)
  );

  const currentQuestion = questions[currentIndex];
  const selectedIndex = answers[currentIndex];

  function handleSelect(index: number) {
    setAnswers((prev) => {
      const updated = [...prev];
      updated[currentIndex] = index;
      return updated;
    });
  }

  return (
    <PageShell>
      <div className="space-y-6">
        <AssessmentProgress
          current={currentIndex + 1}
          total={questions.length}
        />

        <AssessmentQuestion
          question={currentQuestion.question}
          options={currentQuestion.options}
          selectedIndex={selectedIndex}
          onSelect={handleSelect}
        />

        <AssessmentNavigation
          onPrevious={() => setCurrentIndex((i) => i - 1)}
          onNext={() => setCurrentIndex((i) => i + 1)}
          isFirst={currentIndex === 0}
          isLast={currentIndex === questions.length - 1}
        />
      </div>
    </PageShell>
  );
}
