import { SignedIn, SignedOut, SignInButton, SignUpButton } from "@clerk/nextjs";
import Link from "next/link";
import ThemeToggle from "../ModeToggle";
import { UserButtonClient } from "@/components/layout/user-button-client";

function Navbar() {
  return (
    <nav
      className="w-full flex justify-center px-4 py-6 sticky top-0 z-50"
      aria-label="Main navigation"
    >
      <div className="w-full max-w-5xl flex items-center gap-4 bg-surface/40 backdrop-blur-md rounded-full px-6 py-3 border border-border">
        {/* Logo */}
        <div className="font-bold text-lg md:text-2xl text-brand">
          <Link href="/">ZERRA</Link>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Mode Toggle */}
        <ThemeToggle />

        {/* Gap between toggle and auth buttons */}
        <div className="w-px h-5 bg-border" />

        {/* Auth Buttons */}
        <SignedOut>
          <div className="flex items-center gap-2">
            <SignInButton>
              <button className="bg-transparent text-primary-text font-medium text-xs md:text-sm px-2 md:px-4 h-9 rounded-full hover:bg-surface-muted transition-colors cursor-pointer">
                Log in
              </button>
            </SignInButton>
            <SignUpButton>
              <button className="bg-brand text-white rounded-full font-medium text-xs md:text-sm h-9 px-2 md:px-4 shadow-sm hover:opacity-90 transition-opacity cursor-pointer">
                Get started
              </button>
            </SignUpButton>
          </div>
        </SignedOut>

        <SignedIn>
          <div className="flex items-center justify-center">
            <UserButtonClient />
          </div>
        </SignedIn>
      </div>
    </nav>
  );
}

export default Navbar;
