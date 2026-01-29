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
            <li
              key={index}
              onClick={() => onSelect(index)}
              className={[
                "cursor-pointer rounded-md border p-4 transition",
                isSelected
                  ? "border-primary bg-primary/10"
                  : "hover:bg-muted",
              ].join(" ")}
            >
              {option}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
