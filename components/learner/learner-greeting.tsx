"use client";

import { useEffect, useState } from "react";

export function LearnerGreeting({ name }: { name: string }) {
  const [greeting, setGreeting] = useState("Welcome");

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setGreeting("Good morning");
    } else if (hour < 18) {
      setGreeting("Good afternoon");
    } else {
      setGreeting("Good evening");
    }
  }, []);

  return (
    <h1 className="text-3xl font-black text-primary-text flex items-center gap-3">
      {greeting}, {name}! <span className="text-4xl">👋</span>
    </h1>
  );
}
