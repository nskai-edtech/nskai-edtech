interface AssessmentNavigationProps {
  onNext: () => void;
  onPrevious: () => void;
  isFirst: boolean;
  isLast: boolean;
}

export function AssessmentNavigation({
  onNext,
  onPrevious,
  isFirst,
  isLast,
}: AssessmentNavigationProps) {
  return (
    // Navigation controls for moving between assessment questions
    <div className="flex justify-between pt-6">
      <button
        onClick={onPrevious}
        disabled={isFirst}
        className="rounded-md border px-4 py-2 text-sm disabled:opacity-50"
      >
        Previous
      </button>

      <button
        onClick={onNext}
        disabled={isLast}
        className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground disabled:opacity-50"
      >
        Next
      </button>
    </div>
  );
}
