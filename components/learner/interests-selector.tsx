"use client";

import { Check } from "lucide-react";
import { TOPICS } from "@/lib/topics";

interface InterestsSelectorProps {
  selectedInterests: string[];
  onToggle: (topicId: string) => void;
}

export function InterestsSelector({
  selectedInterests,
  onToggle,
}: InterestsSelectorProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
      {TOPICS.map((topic) => {
        const isSelected = selectedInterests.includes(topic.id);

        return (
          <button
            key={topic.id}
            type="button"
            onClick={() => onToggle(topic.id)}
            className={`relative flex flex-col items-center p-4 rounded-xl border-2 transition-all duration-200 ${
              isSelected
                ? "border-brand bg-brand/5 shadow-md"
                : "border-border bg-surface hover:border-brand/50 hover:shadow-sm"
            }`}
          >
            {/* Selection Indicator */}
            {isSelected && (
              <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-brand flex items-center justify-center">
                <Check className="w-3 h-3 text-white" />
              </div>
            )}

            {/* Icon */}
            <div className={`p-2 rounded-xl mb-2 ${topic.color}`}>
              {topic.icon}
            </div>

            {/* Name */}
            <span className="text-xs font-medium text-primary-text text-center">
              {topic.name}
            </span>
          </button>
        );
      })}
    </div>
  );
}
