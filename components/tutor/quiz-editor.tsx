"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PlusCircle, Trash2, Save, CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";
import { cn } from "@/lib/utils";
import { QuizQuestionWithAnswer } from "@/actions/quiz/types";
import { deleteQuizQuestion, saveQuizQuestion } from "@/actions/quiz/actions";
import { AiGenerateButton } from "@/components/ui/ai-generate-button";
import { getQuizQuestionsAdmin } from "@/actions/quiz/queries";

interface QuizEditorProps {
  lessonId: string;
  initialQuestions: QuizQuestionWithAnswer[];
}

function QuestionForm({
  lessonId,
  question,
  position,
  onSaved,
}: {
  lessonId: string;
  question?: QuizQuestionWithAnswer;
  position: number;
  onSaved: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [questionText, setQuestionText] = useState(
    question?.questionText ?? "",
  );
  const [options, setOptions] = useState<string[]>(
    question?.options ?? ["", "", "", ""],
  );
  const [correctOption, setCorrectOption] = useState<number>(
    question?.correctOption ?? 0,
  );

  function updateOption(index: number, value: string) {
    setOptions((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  }

  function handleSave() {
    if (!questionText.trim()) {
      toast.error("Question text is required.");
      return;
    }
    if (options.some((o) => !o.trim())) {
      toast.error("All options must be filled in.");
      return;
    }

    startTransition(async () => {
      const res = await saveQuizQuestion(
        lessonId,
        { questionText, options, correctOption, position },
        question?.id,
      );
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Question saved!");
        onSaved();
      }
    });
  }

  return (
    <div className="bg-surface border border-border rounded-2xl p-5 space-y-4">
      <textarea
        value={questionText}
        onChange={(e) => setQuestionText(e.target.value)}
        placeholder="Question text..."
        rows={2}
        className="w-full bg-surface-muted border border-border rounded-xl px-4 py-2 text-sm text-primary-text placeholder:text-secondary-text focus:outline-none focus:ring-2 focus:ring-brand resize-none"
      />
      <div className="grid gap-2">
        {options.map((opt, oi) => (
          <div key={oi} className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setCorrectOption(oi)}
              className={cn(
                "shrink-0 w-5 h-5 rounded-full border-2 transition-colors",
                correctOption === oi
                  ? "border-green-500 bg-green-500"
                  : "border-border",
              )}
              aria-label={`Mark option ${String.fromCharCode(65 + oi)} as correct`}
            />
            <input
              value={opt}
              onChange={(e) => updateOption(oi, e.target.value)}
              placeholder={`Option ${String.fromCharCode(65 + oi)}`}
              className="flex-1 bg-surface-muted border border-border rounded-xl px-4 py-2 text-sm text-primary-text placeholder:text-secondary-text focus:outline-none focus:ring-2 focus:ring-brand"
            />
          </div>
        ))}
        <p className="text-xs text-secondary-text">
          Click the circle to mark the correct answer.
        </p>
      </div>
      <button
        onClick={handleSave}
        disabled={isPending}
        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand text-white text-sm font-semibold hover:bg-brand/90 disabled:opacity-50 transition-colors"
      >
        <Save className="w-3.5 h-3.5" />
        {isPending ? "Saving..." : "Save Question"}
      </button>
    </div>
  );
}

export function QuizEditor({ lessonId, initialQuestions }: QuizEditorProps) {
  const router = useRouter();
  const [questions, setQuestions] =
    useState<QuizQuestionWithAnswer[]>(initialQuestions);
  const [adding, setAdding] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [isDeletingAll, setIsDeletingAll] = useState(false);

  // Sync state with server changes
  useEffect(() => {
    setQuestions(initialQuestions);
  }, [initialQuestions]);

  const handleGenerateQuiz = async () => {
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const forceRefreshQuestions = async () => {
      const res = await getQuizQuestionsAdmin(lessonId);
      if ("questions" in res) {
        setQuestions(res.questions);
      }
    };

    const aiGeneratedQuestions = [
      {
        questionText:
          "What is the main advantage of Server-Side Rendering (SSR)?",
        options: [
          "Faster database writes",
          "Improved SEO and initial load times",
          "No need for CSS",
          "Reduces server costs",
        ],
        correctOption: 1,
      },
      {
        questionText: "Which hook is used to manage side effects in React?",
        options: ["useState", "useContext", "useEffect", "useReducer"],
        correctOption: 2,
      },
      {
        questionText: "What does the 'key' prop do in React lists?",
        options: [
          "Defines the type of the element",
          "Helps React identify which items have changed, are added, or removed",
          "Specifies the CSS class for styling",
          "Indicates that the element is a form input",
        ],
        correctOption: 1,
      },
      {
        questionText: "What is the purpose of the 'useState' hook in React?",
        options: [
          "To manage side effects in functional components",
          "To manage local state in functional components",
          "To handle form submissions",
          "To define component props",
        ],
        correctOption: 1,
      },
    ];

    try {
      for (let i = 0; i < aiGeneratedQuestions.length; i++) {
        const q = aiGeneratedQuestions[i];
        await saveQuizQuestion(lessonId, {
          questionText: q.questionText,
          options: q.options,
          correctOption: q.correctOption,
          position: questions.length + i,
        });
      }

      toast.success("AI Quiz generated successfully!");
      setAdding(false);
      await forceRefreshQuestions();
    } catch (error) {
      console.error("Error generating quiz:", error);
      toast.error("Failed to generate quiz");
    }
  };

  function handleDelete(questionId: string) {
    startTransition(async () => {
      const res = await deleteQuizQuestion(questionId);
      if (res.error) {
        toast.error(res.error);
      } else {
        setQuestions((prev) => prev.filter((q) => q.id !== questionId));
        toast.success("Question deleted.");
        router.refresh();
      }
    });
  }

  const handleDeleteAll = async () => {
    if (
      !window.confirm(
        "Are you sure you want to delete ALL questions? This cannot be undone.",
      )
    ) {
      return;
    }

    setIsDeletingAll(true);
    try {
      // Fire all delete requests at the same time
      await Promise.all(questions.map((q) => deleteQuizQuestion(q.id)));

      setQuestions([]);
      toast.success("All questions deleted.");
      router.refresh();
    } catch (error) {
      console.error("Error deleting all questions:", error);
      toast.error("Something went wrong while deleting.");
    } finally {
      setIsDeletingAll(false);
    }
  };
  // --------------------------------

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <h3 className="font-semibold text-primary-text">
          Quiz Questions ({questions.length})
        </h3>

        <div className="flex items-center gap-3">
          {/* --- NEW DELETE ALL BUTTON --- */}
          {questions.length > 0 && (
            <button
              onClick={handleDeleteAll}
              disabled={isDeletingAll || isPending}
              className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-md text-red-500 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDeletingAll ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Trash2 className="w-3.5 h-3.5" />
              )}
              {isDeletingAll ? "Deleting..." : "Clear All"}
            </button>
          )}

          <AiGenerateButton
            onGenerate={handleGenerateQuiz}
            label="Generate Quiz"
          />
          <button
            onClick={() => setAdding(true)}
            className="flex items-center gap-2 text-sm text-brand font-medium hover:bg-brand/10 px-3 py-1.5 rounded-md transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            Add Question
          </button>
        </div>
      </div>

      {questions.map((q, qi) => (
        <div key={q.id} className="relative">
          <div className="absolute top-4 right-4 z-10">
            <button
              onClick={() => handleDelete(q.id)}
              disabled={isPending || isDeletingAll}
              className="text-secondary-text hover:text-red-500 transition-colors"
              aria-label="Delete question"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
          <div className="bg-surface border border-border rounded-2xl p-5 pr-12 space-y-2">
            <p className="text-sm font-medium text-secondary-text">Q{qi + 1}</p>
            <p className="text-primary-text font-semibold">{q.questionText}</p>
            <div className="grid gap-1 mt-2">
              {q.options.map((opt, oi) => (
                <div key={oi} className="flex items-center gap-2 text-sm">
                  {oi === q.correctOption ? (
                    <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-border shrink-0" />
                  )}
                  <span
                    className={
                      oi === q.correctOption
                        ? "text-green-600 font-medium"
                        : "text-primary-text"
                    }
                  >
                    {opt}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}

      {adding && (
        <QuestionForm
          lessonId={lessonId}
          position={questions.length}
          onSaved={() => {
            setAdding(false);
            router.refresh();
          }}
        />
      )}

      {questions.length === 0 && !adding && (
        <div className="text-center py-8 text-secondary-text text-sm border border-dashed border-border rounded-2xl">
          No questions yet. Add one or generate with AI to get started.
        </div>
      )}
    </div>
  );
}
