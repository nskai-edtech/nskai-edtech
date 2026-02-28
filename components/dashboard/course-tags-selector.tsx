"use client";

import { useState } from "react";
import { Check, Search, ChevronDown, X } from "lucide-react";
import {
  ALL_TOPICS,
  TopicIcon,
  filterTopics,
  paginateTopics,
  getTopicById,
} from "@/lib/topics";

interface CourseTagsSelectorProps {
  selectedTags: string[];
  onChange: (tags: string[]) => void;
  maxTags?: number;
}

export function CourseTagsSelector({
  selectedTags,
  onChange,
  maxTags = 5,
}: CourseTagsSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);

  const filtered = filterTopics(ALL_TOPICS, searchQuery);
  const visible = paginateTopics(filtered, page);
  const hasMore = visible.length < filtered.length;

  const toggleTag = (topicId: string) => {
    if (selectedTags.includes(topicId)) {
      onChange(selectedTags.filter((id) => id !== topicId));
    } else if (selectedTags.length < maxTags) {
      onChange([...selectedTags, topicId]);
    }
  };

  const removeTag = (topicId: string) => {
    onChange(selectedTags.filter((id) => id !== topicId));
  };

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    setPage(0);
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2 min-h-8">
        {selectedTags.map((tagId) => {
          const topic = getTopicById(tagId);
          if (!topic) return null;
          return (
            <span
              key={tagId}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-brand/10 text-brand text-xs font-semibold border border-brand/20"
            >
              <TopicIcon name={topic.iconName} className="w-3.5 h-3.5" />
              {topic.name}
              <button
                type="button"
                onClick={() => removeTag(tagId)}
                className="ml-0.5 hover:text-red-500 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          );
        })}
        {selectedTags.length === 0 && (
          <span className="text-xs text-secondary-text italic">
            No tags selected
          </span>
        )}
      </div>

      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-brand hover:text-brand-dark transition-colors"
      >
        {isExpanded ? "Hide tags" : "Select tags"}
        <ChevronDown
          className={`w-4 h-4 transition-transform ${isExpanded ? "rotate-180" : ""}`}
        />
      </button>

      {isExpanded && (
        <div className="space-y-3 border border-border rounded-xl p-4 bg-surface">
          <div className="flex items-center justify-between">
            <p className="text-xs text-secondary-text font-medium">
              {selectedTags.length}/{maxTags} tags selected
            </p>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-text" />
            <input
              type="text"
              placeholder="Search topics..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-surface border border-border rounded-lg text-sm text-primary-text placeholder:text-secondary-text focus:outline-none focus:ring-2 focus:ring-brand/50"
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-60 overflow-y-auto">
            {visible.map((topic) => {
              const isSelected = selectedTags.includes(topic.id);
              const isDisabled = !isSelected && selectedTags.length >= maxTags;

              return (
                <button
                  key={topic.id}
                  type="button"
                  onClick={() => !isDisabled && toggleTag(topic.id)}
                  disabled={isDisabled}
                  className={`relative flex items-center gap-2 p-2.5 rounded-lg border text-left transition-all text-xs font-medium ${
                    isSelected
                      ? "border-brand bg-brand/5 text-brand"
                      : isDisabled
                        ? "border-border bg-surface-muted/50 text-secondary-text/50 cursor-not-allowed"
                        : "border-border bg-surface hover:border-brand/50 text-primary-text"
                  }`}
                >
                  {isSelected && (
                    <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-brand flex items-center justify-center">
                      <Check className="w-2.5 h-2.5 text-white" />
                    </div>
                  )}
                  <div className={`p-1 rounded-md ${topic.color}`}>
                    <TopicIcon name={topic.iconName} className="w-3.5 h-3.5" />
                  </div>
                  <span className="truncate">{topic.name}</span>
                </button>
              );
            })}
          </div>

          {visible.length === 0 && searchQuery && (
            <p className="text-center text-xs text-secondary-text py-4">
              No topics found for &quot;{searchQuery}&quot;
            </p>
          )}

          {hasMore && (
            <div className="flex justify-center">
              <button
                type="button"
                onClick={() => setPage((p) => p + 1)}
                className="inline-flex items-center gap-1 px-4 py-1.5 text-xs font-medium text-brand hover:text-brand-dark bg-brand/5 hover:bg-brand/10 rounded-full transition-colors"
              >
                Show more
                <ChevronDown className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
