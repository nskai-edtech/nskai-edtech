import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs";
import Link from "next/link";
import ThemeToggle from "../ModeToggle";

function Navbar() {
  return (
    <nav className="flex items-center justify-between px-4 py-2 sticky top-0 z-50 bg-surface">
      <div className="font-bold text-xl text-brand ml-4">
        <Link href="/">ZERRA</Link>
      </div>
      <div className="flex items-center gap-2 sm:gap-4">
        <ThemeToggle />
        <SignedOut>
          <SignInButton />
          <SignUpButton>
            <button className="bg-brand text-white rounded-full font-medium text-xs sm:text-base h-8 sm:h-12 px-3 sm:px-5 cursor-pointer select-none">
              Get Started
            </button>
          </SignUpButton>
        </SignedOut>
        <SignedIn>
          <UserButton />
        </SignedIn>
      </div>
    </nav>
  );
}

export default Navbar;
