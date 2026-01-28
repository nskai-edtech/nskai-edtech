import HeroProgressImage from "./hero-progress-image";

function HeroSection() {
  return (
    <div className="flex flex-col gap-10 items-center lg:flex-row lg:items-center justify-center lg:gap-8 min-h-[calc(100vh-80px)] py-12 lg:py-0">
      {/* LEFT */}
      <div className="flex-1 flex flex-col items-center lg:items-start gap-6">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary-text text-center lg:text-left">
          Master Any Skill With NSKAI <br className="hidden md:block" />{" "}
          Alongside <span className="text-brand">AI</span> as Your Tutor
        </h1>
        <p className="text-base md:text-lg mt-4 text-secondary-text text-left lg:text-left">
          NSKAI is a revolutionary learning platform that combines the power of
          AI to simplify complex topics and courses with expert-led courses to
          help you achieve your goals.
        </p>
        <div className="flex items-center gap-4 mt-4 select-none">
          <button className="bg-brand text-white rounded-full font-semibold text-[10px] sm:text-base h-10 sm:h-12 px-4 sm:px-5 cursor-pointer hover:bg-brand/85 transition-all duration-300">
            Start Learning for Free
          </button>
          <button className="bg-surface-muted border border-border text-primary-text rounded-full font-semibold text-[10px] sm:text-base h-10 sm:h-12 px-4 sm:px-5 cursor-pointer hover:border-brand/50 transition-all duration-300">
            Explore Courses
          </button>
        </div>
      </div>
      {/* RIGHT */}
      <div className="flex-1 w-full">
        <HeroProgressImage />
      </div>
    </div>
  );
}

export default HeroSection;
