interface AssessmentQuestionProps {
  question: string;
  options: string[];
  selectedIndex: number | null;
  onSelect: (index: number) => void;
}

export function AssessmentQuestion({
  question,
  options,
  selectedIndex,
  onSelect,
}: AssessmentQuestionProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">{question}</h2>

      <ul className="space-y-3">
        {options.map((option, index) => {
          const isSelected = selectedIndex === index;

          return (
            <li key={index}>
            <button
                type="button"
                onClick={() => onSelect(index)}
                className={[
                  "w-full text-left cursor-pointer rounded-md border p-4 transition-colors",
                  isSelected
                    ? "border-primary bg-primary/15 ring-2 ring-primary font-medium"
                    : "hover:bg-muted",
                ].join(" ")}
                >
                  {option}
                </button>
            </li>

          );
        })}
      </ul>
    </div>
  );
}
