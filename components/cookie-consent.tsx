"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { X } from "lucide-react";

const COOKIE_CONSENT_KEY = "zerra-cookie-consent";

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!consent) {
      // Small delay so the banner doesn't flash on initial load
      const timer = setTimeout(() => setVisible(true), 500);
      return () => clearTimeout(timer);
    }
  }, []);

  const accept = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, "accepted");
    setVisible(false);
  };

  const decline = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, "declined");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 z-100 p-4 sm:p-6 pointer-events-none">
      <div className="max-w-2xl mx-auto bg-surface border border-border rounded-2xl shadow-lg p-5 sm:p-6 pointer-events-auto animate-in slide-in-from-bottom-4 fade-in duration-300">
        <div className="flex items-start gap-3">
          <div className="flex-1">
            <h3 className="font-semibold text-primary-text text-sm mb-1">
              We use cookies
            </h3>
            <p className="text-secondary-text text-xs leading-relaxed">
              ZERRA uses essential cookies for authentication and platform
              functionality, and optional analytics cookies to improve your
              experience. Read our{" "}
              <Link
                href="/cookie-policy"
                className="text-brand underline hover:no-underline"
              >
                Cookie Policy
              </Link>{" "}
              for details.
            </p>
          </div>
          <button
            onClick={decline}
            aria-label="Dismiss cookie banner"
            className="text-secondary-text hover:text-primary-text transition shrink-0 mt-0.5"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="flex items-center gap-3 mt-4">
          <button
            onClick={accept}
            className="bg-brand text-white text-xs font-semibold px-4 py-2 rounded-lg hover:opacity-90 transition"
          >
            Accept All
          </button>
          <button
            onClick={decline}
            className="border border-border text-primary-text text-xs font-semibold px-4 py-2 rounded-lg hover:bg-surface-muted transition"
          >
            Essential Only
          </button>
        </div>
      </div>
    </div>
  );
}
