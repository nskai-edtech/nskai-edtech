"use client";

import { useState } from "react";
import { Check, Search, ChevronDown } from "lucide-react";
import {
  ALL_TOPICS,
  TopicIcon,
  filterTopics,
  paginateTopics,
} from "@/lib/topics";

interface InterestsSelectorProps {
  selectedInterests: string[];
  onToggle: (topicId: string) => void;
}

export function InterestsSelector({
  selectedInterests,
  onToggle,
}: InterestsSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(0);

  const filtered = filterTopics(ALL_TOPICS, searchQuery);
  const visible = paginateTopics(filtered, page);
  const hasMore = visible.length < filtered.length;

  const handleSeeMore = () => setPage((p) => p + 1);

  // Reset pagination when search changes
  const handleSearch = (value: string) => {
    setSearchQuery(value);
    setPage(0);
  };

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-text" />
        <input
          type="text"
          placeholder="Search interests (e.g., Machine Learning, Photography)"
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-surface border border-border rounded-full text-sm text-primary-text placeholder:text-secondary-text focus:outline-none focus:ring-2 focus:ring-brand/50"
        />
      </div>

      {/* Topics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {visible.map((topic) => {
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
                <TopicIcon name={topic.iconName} />
              </div>

              {/* Name */}
              <span className="text-xs font-medium text-primary-text text-center">
                {topic.name}
              </span>
            </button>
          );
        })}
      </div>

      {/* Empty State */}
      {visible.length === 0 && searchQuery && (
        <p className="text-center text-sm text-secondary-text py-6">
          No topics found for &quot;{searchQuery}&quot;
        </p>
      )}

      {/* See More */}
      {hasMore && (
        <div className="flex justify-center pt-2">
          <button
            type="button"
            onClick={handleSeeMore}
            className="inline-flex items-center gap-1.5 px-5 py-2 text-sm font-medium text-brand hover:text-brand-dark bg-brand/5 hover:bg-brand/10 rounded-full transition-colors"
          >
            See more
            <ChevronDown className="w-4 h-4" />
            <span className="text-xs text-secondary-text ml-1">
              ({filtered.length - visible.length} remaining)
            </span>
          </button>
        </div>
      )}
    </div>
  );
}
