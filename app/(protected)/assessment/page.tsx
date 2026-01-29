import { AssessmentQuestion } from "@/components/assessment/assessment-question";
import { PageShell } from "@/components/layout/page-shell";

const mockQuestion = {
  question: "What is a variable in programming?",
  options: [
    "A container for storing data values",
    "A type of loop",
    "A conditional statement",
    "An error in the program",
  ],
};

export default function DiagnosticAssessmentPage() {
  return (
    <PageShell>
      <AssessmentQuestion
        question={mockQuestion.question}
        options={mockQuestion.options}
      />
    </PageShell>
  );
}
