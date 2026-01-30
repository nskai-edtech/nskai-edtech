"use client";

import { useEffect, useState, useTransition, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, Loader2 } from "lucide-react";

interface DebouncedSearchProps {
  placeholder?: string;
  basePath: string;
}

export function DebouncedSearch({
  placeholder = "Search...",
  basePath,
}: DebouncedSearchProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const initialSearch = searchParams.get("search") || "";
  const [searchValue, setSearchValue] = useState(initialSearch);
  const isFirstRender = useRef(true);

  // Debounce effect - only runs after user types
  useEffect(() => {
    // Skip on first render
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    // Skip if value matches current URL param
    const currentUrlSearch = searchParams.get("search") || "";
    if (searchValue === currentUrlSearch) {
      return;
    }

    const timer = setTimeout(() => {
      // Build new URL with search param
      const params = new URLSearchParams(searchParams.toString());

      if (searchValue) {
        params.set("search", searchValue);
        params.delete("page"); // Reset to page 1 on new search
      } else {
        params.delete("search");
      }

      startTransition(() => {
        router.push(`${basePath}?${params.toString()}`);
      });
    }, 400); // 400ms debounce

    return () => clearTimeout(timer);
  }, [searchValue, basePath, router, searchParams]);

  return (
    <div className="relative max-w-md flex-1">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-text" />
      <input
        type="text"
        value={searchValue}
        onChange={(e) => setSearchValue(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-10 pr-10 py-2.5 bg-surface border border-border rounded-lg text-primary-text placeholder:text-secondary-text focus:outline-none focus:ring-2 focus:ring-brand/50"
      />
      {isPending && (
        <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-text animate-spin" />
      )}
    </div>
  );
}
