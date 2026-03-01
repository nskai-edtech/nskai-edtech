"use client";

import { useEffect, useState, useTransition, useRef, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Search,
  Loader2,
  X,
  SlidersHorizontal,
  ChevronDown,
  Sparkles,
} from "lucide-react";
import { getTopicById, TopicIcon } from "@/lib/topics";
import type { TopicData } from "@/lib/topics";
import type { SortOption, PriceFilter } from "@/actions/courses/types";

// ── Popular topics displayed in the dropdown ──────────────────────
const POPULAR_TOPIC_IDS = [
  "web-development",
  "data-science",
  "machine-learning",
  "artificial-intelligence",
  "mobile-development",
  "cybersecurity",
  "cloud-computing",
  "digital-marketing",
  "graphic-design",
  "ui-ux-design",
  "game-development",
  "blockchain",
  "python",
  "javascript",
  "devops",
  "business-analytics",
];

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "newest", label: "Newest" },
  { value: "popular", label: "Most Popular" },
  { value: "rating", label: "Highest Rated" },
  { value: "price-asc", label: "Price: Low → High" },
  { value: "price-desc", label: "Price: High → Low" },
];

const PRICE_OPTIONS: { value: PriceFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "free", label: "Free" },
  { value: "paid", label: "Paid" },
];

interface MarketplaceFiltersProps {
  userInterests: string[];
  totalCount: number;
}

export function MarketplaceFilters({
  userInterests,
  totalCount,
}: MarketplaceFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // State from URL params
  const initialSearch = searchParams.get("search") || "";
  const currentTag = searchParams.get("tag") || "";
  const currentSort = (searchParams.get("sort") as SortOption) || "newest";
  const currentPrice = (searchParams.get("price") as PriceFilter) || "all";
  const currentTab = searchParams.get("tab") || "all";

  const [searchValue, setSearchValue] = useState(initialSearch);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [showMoreTopics, setShowMoreTopics] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const sortRef = useRef<HTMLDivElement>(null);
  const isFirstRender = useRef(true);

  // Resolve user interest topics
  const interestTopics: TopicData[] = userInterests
    .map((id) => getTopicById(id))
    .filter((t): t is TopicData => !!t);

  // Popular topics for the dropdown (exclude already-selected interests for cleaner UX)
  const popularTopics: TopicData[] = POPULAR_TOPIC_IDS.map((id) =>
    getTopicById(id),
  ).filter((t): t is TopicData => !!t);

  // ── URL update helper ──
  const updateParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (
          value === null ||
          value === "" ||
          (value === "all" && (key === "price" || key === "tab"))
        ) {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      }
      // Reset page on filter change
      if (!("page" in updates)) {
        params.delete("page");
      }
      startTransition(() => {
        router.push(`/learner/marketplace?${params.toString()}`);
      });
    },
    [searchParams, router],
  );

  // ── Debounced text search ──
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    const currentUrlSearch = searchParams.get("search") || "";
    if (searchValue === currentUrlSearch) return;

    const timer = setTimeout(() => {
      updateParams({ search: searchValue || null });
    }, 400);

    return () => clearTimeout(timer);
  }, [searchValue, searchParams, updateParams]);

  // ── Close dropdowns on outside click ──
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
        setShowMoreTopics(false);
      }
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) {
        setShowSortDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ── Handlers ──
  const handleTagClick = (tagId: string) => {
    const newTag = tagId === currentTag ? null : tagId;
    updateParams({ tag: newTag });
    setShowDropdown(false);
    setShowMoreTopics(false);
  };

  const handleTabClick = (tab: string) => {
    if (tab === currentTab) return;
    // When switching tabs, clear tag filter (tab overrides)
    updateParams({ tab: tab === "all" ? null : tab, tag: null });
  };

  const handleSortChange = (sort: SortOption) => {
    updateParams({ sort: sort === "newest" ? null : sort });
    setShowSortDropdown(false);
  };

  const handlePriceChange = (price: PriceFilter) => {
    updateParams({ price: price === "all" ? null : price });
  };

  const clearAllFilters = () => {
    setSearchValue("");
    updateParams({
      search: null,
      tag: null,
      sort: null,
      price: null,
      tab: null,
    });
  };

  const hasActiveFilters =
    !!searchValue ||
    !!currentTag ||
    currentSort !== "newest" ||
    currentPrice !== "all" ||
    currentTab !== "all";

  const activeTagTopic = currentTag ? getTopicById(currentTag) : null;

  return (
    <div className="space-y-4">
      {/* ── Search Bar ── */}
      <div ref={searchRef} className="relative">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-text" />
          <input
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onFocus={() => setShowDropdown(true)}
            placeholder="Search courses by title, topic, or keyword..."
            className="w-full pl-12 pr-12 py-3.5 bg-surface border border-border rounded-2xl text-primary-text placeholder:text-secondary-text focus:outline-none focus:ring-2 focus:ring-brand/50 focus:border-brand/50 transition-all text-base"
          />
          {isPending ? (
            <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-text animate-spin" />
          ) : searchValue ? (
            <button
              onClick={() => {
                setSearchValue("");
                updateParams({ search: null });
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-text hover:text-primary-text transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          ) : null}
        </div>

        {/* ── Dropdown Panel ── */}
        {showDropdown && (
          <div className="absolute top-full left-0 right-0 mt-2 p-4 bg-surface border border-border rounded-2xl shadow-xl z-50 max-h-[70vh] overflow-y-auto">
            {/* User interests section */}
            {interestTopics.length > 0 && (
              <div className="mb-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-secondary-text mb-3 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  Your Interests
                </p>
                <div className="flex flex-wrap gap-2">
                  {interestTopics.map((topic) => (
                    <button
                      key={topic.id}
                      onClick={() => handleTagClick(topic.id)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                        currentTag === topic.id
                          ? "bg-brand text-white shadow-md"
                          : `${topic.color} hover:ring-2 hover:ring-brand/30`
                      }`}
                    >
                      <TopicIcon
                        name={topic.iconName}
                        className="w-3.5 h-3.5"
                      />
                      {topic.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* See More button — mobile only */}
            <button
              onClick={() => setShowMoreTopics((prev) => !prev)}
              className="md:hidden flex items-center gap-1.5 text-xs font-medium text-brand hover:text-brand/80 transition-colors mb-3"
            >
              {showMoreTopics ? "See Less" : "See More"}
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform ${
                  showMoreTopics ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Popular topics — always visible on md+, toggled on mobile */}
            <div className={`${showMoreTopics ? "block" : "hidden"} md:block`}>
              <p className="text-xs font-semibold uppercase tracking-wider text-secondary-text mb-3">
                Popular Topics
              </p>
              <div className="flex flex-wrap gap-2">
                {popularTopics.map((topic) => (
                  <button
                    key={topic.id}
                    onClick={() => handleTagClick(topic.id)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                      currentTag === topic.id
                        ? "bg-brand text-white shadow-md"
                        : `${topic.color} hover:ring-2 hover:ring-brand/30`
                    }`}
                  >
                    <TopicIcon name={topic.iconName} className="w-3.5 h-3.5" />
                    {topic.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Heading + Result Count ── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
        <div>
          <h1 className="text-3xl font-bold text-primary-text">
            Course Marketplace
          </h1>
          <p className="text-secondary-text mt-1">
            Browse our collection of courses across different categories
          </p>
        </div>
        <p className="text-sm text-secondary-text whitespace-nowrap">
          Showing{" "}
          <span className="font-semibold text-primary-text">{totalCount}</span>{" "}
          {totalCount === 1 ? "course" : "courses"}
        </p>
      </div>

      {/* ── Scrollable Pill Tabs ── */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide -mx-1 px-1">
        {/* All tab */}
        <button
          onClick={() => handleTabClick("all")}
          className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
            currentTab === "all"
              ? "bg-brand text-white shadow-md"
              : "bg-surface-muted text-secondary-text hover:text-primary-text hover:bg-surface border border-border"
          }`}
        >
          All
        </button>

        {/* For You tab */}
        {interestTopics.length > 0 && (
          <button
            onClick={() => handleTabClick("for-you")}
            className={`shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all ${
              currentTab === "for-you"
                ? "bg-brand text-white shadow-md"
                : "bg-surface-muted text-secondary-text hover:text-primary-text hover:bg-surface border border-border"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            For You
          </button>
        )}

        {/* Interest-based tabs */}
        {interestTopics.map((topic) => (
          <button
            key={topic.id}
            onClick={() => handleTabClick(topic.id)}
            className={`shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all ${
              currentTab === topic.id
                ? "bg-brand text-white shadow-md"
                : "bg-surface-muted text-secondary-text hover:text-primary-text hover:bg-surface border border-border"
            }`}
          >
            <TopicIcon name={topic.iconName} className="w-3.5 h-3.5" />
            {topic.name}
          </button>
        ))}
      </div>

      {/* ── Filter Bar: Sort + Price + Active tag ── */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Sort Dropdown */}
        <div ref={sortRef} className="relative">
          <button
            onClick={() => setShowSortDropdown(!showSortDropdown)}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium bg-surface border border-border text-secondary-text hover:text-primary-text transition-all"
          >
            <SlidersHorizontal className="w-4 h-4" />
            {SORT_OPTIONS.find((s) => s.value === currentSort)?.label || "Sort"}
            <ChevronDown
              className={`w-3.5 h-3.5 transition-transform ${showSortDropdown ? "rotate-180" : ""}`}
            />
          </button>
          {showSortDropdown && (
            <div className="absolute top-full left-0 mt-1 py-1 bg-surface border border-border rounded-xl shadow-xl z-50 min-w-45">
              {SORT_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => handleSortChange(opt.value)}
                  className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                    currentSort === opt.value
                      ? "text-brand font-medium bg-brand/5"
                      : "text-primary-text hover:bg-surface-muted"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Price Filter Pills */}
        <div className="inline-flex items-center bg-surface border border-border rounded-xl overflow-hidden">
          {PRICE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => handlePriceChange(opt.value)}
              className={`px-3 py-2 text-sm font-medium transition-all ${
                currentPrice === opt.value
                  ? "bg-brand text-white"
                  : "text-secondary-text hover:text-primary-text hover:bg-surface-muted"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Active tag chip */}
        {activeTagTopic && (
          <div className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium bg-brand/10 text-brand border border-brand/20">
            <TopicIcon name={activeTagTopic.iconName} className="w-3.5 h-3.5" />
            {activeTagTopic.name}
            <button
              onClick={() => updateParams({ tag: null })}
              className="ml-1 hover:bg-brand/20 rounded-full p-0.5 transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )}

        {/* Clear all filters */}
        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className="inline-flex items-center gap-1 px-3 py-2 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
          >
            <X className="w-3.5 h-3.5" />
            Clear all
          </button>
        )}
      </div>
    </div>
  );
}
