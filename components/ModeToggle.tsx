/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { SunIcon, MoonIcon } from "lucide-react";
import { useState, useEffect } from "react";

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Sync with the class added by the layout script
    if (document.documentElement.classList.contains("dark")) {
      setIsDark(true);
    }
  }, []);

  const toggleTheme = () => {
    if (!mounted) return;

    if (!document.startViewTransition) {
      const isDark = document.documentElement.classList.toggle("dark");
      localStorage.setItem("theme", isDark ? "dark" : "light");
      setIsDark(isDark);
      return;
    }

    document.startViewTransition(() => {
      const isDark = document.documentElement.classList.toggle("dark");
      localStorage.setItem("theme", isDark ? "dark" : "light");
      setIsDark(isDark);
    });
  };

  // Prevent hydration mismatch by returning null or a placeholder until mounted
  if (!mounted) {
    return (
      <button className="p-2 border rounded-md opacity-50 cursor-not-allowed bg-surface text-primary-text">
        <SunIcon className="w-6 h-6" />
      </button>
    );
  }

  return (
    <button
      onClick={toggleTheme}
      className="p-2 border rounded-md bg-surface text-primary-text"
    >
      {isDark ? (
        <SunIcon className="w-6 h-6" />
      ) : (
        <MoonIcon className="w-6 h-6" />
      )}
    </button>
  );
}
