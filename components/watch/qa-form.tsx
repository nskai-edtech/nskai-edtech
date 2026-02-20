"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Send } from "lucide-react";
import { toast } from "react-hot-toast";
import { askQuestion, answerQuestion } from "@/actions/qa";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  content: z.string().trim().min(1, {
    message: "Content is required.",
  }),
});

interface QaFormProps {
  lessonId?: string;
  questionId?: string;
  onSuccess?: () => void;
  placeholder?: string;
  className?: string;
}

export function QaForm({
  lessonId,
  questionId,
  onSuccess,
  placeholder = "Ask a question...",
  className,
}: QaFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      content: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!lessonId && !questionId) {
      toast.error("Missing context");
      return;
    }

    setIsSubmitting(true);
    try {
      let result;

      if (lessonId) {
        result = await askQuestion(lessonId, values.content);
      } else if (questionId) {
        result = await answerQuestion(questionId, values.content);
      }

      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success(lessonId ? "Question posted!" : "Reply posted!");
        form.reset();
        onSuccess?.();
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className={cn("relative flex items-end gap-2", className)}
    >
      <div className="flex-1">
        <textarea
          {...form.register("content")}
          className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none custom-scrollbar"
          placeholder={placeholder}
          disabled={isSubmitting}
          aria-invalid={!!form.formState.errors.content}
          aria-describedby="content-error"
        />
        <p
          id="content-error"
          className="text-xs text-red-500 mt-1 min-h-[1rem]"
          aria-live="polite"
        >
          {form.formState.errors.content?.message || ""}
        </p>
      </div>
      <button
        type="submit"
        disabled={isSubmitting}
        aria-label={
          isSubmitting
            ? lessonId
              ? "Posting question"
              : "Posting reply"
            : lessonId
              ? "Post question"
              : "Post reply"
        }
        className="h-10 w-10 flex items-center justify-center rounded-md bg-brand text-primary-foreground hover:bg-brand/90 disabled:opacity-50 transition-colors"
      >
        {isSubmitting ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Send className="h-4 w-4" />
        )}
      </button>
    </form>
  );
}
