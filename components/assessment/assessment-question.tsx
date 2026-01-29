interface AssessmentQuestionProps {
  question: string;
  options: string[];
}

export function AssessmentQuestion({
  question,
  options,
}: AssessmentQuestionProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">{question}</h2>

      <ul className="space-y-3">
        {options.map((option, index) => (
          <li
            key={index}
            className="cursor-pointer rounded-md border p-4 hover:bg-muted transition"
          >
            {option}
          </li>
        ))}
      </ul>
    </div>
  );
}
