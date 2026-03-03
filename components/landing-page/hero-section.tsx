import { SignedOut, SignInButton } from "@clerk/nextjs";
import Image from "next/image";

const leftImages = [
  "ai-mentor-screen-dark.png",
  "course-marketplace-light.png",
  "learner-dashboard-light.png",
  "skills-assessment-screen-light.png",
  "features-screen-dark.png",
  "delete-course-modal-screen.png",
];

const rightImages = [
  "quiz-editor-screen.png",
  "tutor-analytics-screen-1.png",
  "watch-screen-light.png",
  "impact-screen-light.png",
  "footer-screen-light.png",
  "code-reviewer-screen-light.png",
];

function HeroSection() {
  return (
    <section className="w-full flex flex-col items-center justify-center py-16 min-h-[calc(100vh-80px)] overflow-hidden bg-surface">
      {/* Headline */}
      <div className="max-w-3xl w-full flex flex-col items-center text-center gap-5 mb-14 px-4">
        <h1 className="text-5xl md:text-6xl font-extrabold text-primary-text leading-tight tracking-tight uppercase">
          Unlock Your <span className="text-brand">Learning</span> Potential
        </h1>
        <p className="text-base md:text-lg text-secondary-text max-w-xl">
          ZERRA is an AI-powered learning platform built for ambitious learners.
          Master new skills faster with personalized guidance and instant
          feedback.
        </p>
        <div className="flex items-center justify-center gap-4 mt-2">
          <SignedOut>
            <SignInButton>
              <button className="bg-brand text-white font-medium text-xs sm:text-base px-6 sm:px-8 h-10 sm:h-12 rounded-full hover:opacity-90 transition-opacity cursor-pointer shadow-lg">
                Start Learning
              </button>
            </SignInButton>
          </SignedOut>
        </div>
      </div>

      {/* Three-column hero: grid | phone | grid */}
      <div className="flex items-center justify-center gap-4 md:gap-6 w-full max-w-5xl px-4">
        {/* Left grid — 3 columns x 2 rows */}
        <div className="grid grid-cols-3 gap-3 shrink-0">
          {leftImages.map((img) => (
            <div
              key={img}
              className="w-28 h-20 md:w-44 md:h-32 rounded-xl overflow-hidden bg-surface-muted border border-border shadow-sm"
            >
              <Image
                src={`/${img}`}
                alt="App feature"
                width={176}
                height={128}
                className="object-cover w-full h-full"
              />
            </div>
          ))}
        </div>

        {/* Center mobile mockup */}
        <div
          className="shrink-0 rounded-3xl overflow-hidden border-4 border-brand bg-surface-muted"
          style={{
            width: 210,
            height: 400,
            boxShadow:
              "0 40px 80px rgba(0,0,0,0.25), 0 0 0 1px var(--app-border)",
          }}
        >
          <Image
            src="/mobile-screen.png"
            alt="ZERRA Mobile App"
            width={210}
            height={400}
            className="object-cover w-full h-full"
          />
        </div>

        {/* Right grid — 3 columns x 2 rows */}
        <div className="grid grid-cols-3 gap-3 shrink-0">
          {rightImages.map((img) => (
            <div
              key={img}
              className="w-28 h-20 md:w-44 md:h-32 rounded-xl overflow-hidden bg-surface-muted border border-border shadow-sm"
            >
              <Image
                src={`/${img}`}
                alt="App feature"
                width={176}
                height={128}
                className="object-cover w-full h-full"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Tagline */}
      <p className="mt-10 text-md text-secondary-text text-center px-4 max-w-lg">
        <span className="text-brand font-semibold">ZERRA</span> is a
        personalized learning companion for ambitious professionals and
        students. Make faster progress with AI that adapts to your goals.
      </p>
    </section>
  );
}

export default HeroSection;
