interface AssessmentProgressProps {
  current: number;
  total: number;
}

export function AssessmentProgress({
  current,
  total,
}: AssessmentProgressProps) {
  return (
    // Displays current progress in the assessment flow
    <div className="text-sm text-muted-foreground">
      Question {current} of {total}
    </div>
  );
}
