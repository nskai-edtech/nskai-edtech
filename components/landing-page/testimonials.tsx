/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useEffect } from "react";
import { Star, ThumbsUp, ChevronDown } from "lucide-react";

type Role = "Student" | "Educator";

interface Testimonial {
  id: number;
  image: string;
  name: string;
  occupation: string;
  stars: number;
  review: string;
  role: Role;
  tag: string;
  likes: number;
}

const TESTIMONIALS: Testimonial[] = [
  {
    id: 1,
    image: "https://i.pravatar.cc/150?u=1",
    name: "Sarah Jenkins",
    occupation: "Computer Science Student",
    stars: 5,
    review:
      "The AI Tutor helped me understand complex algorithms in minutes. My grades improved significantly this semester! It's like having a private professor available 24/7.",
    role: "Student",
    tag: "AI Tutor",
    likes: 124,
  },
  {
    id: 2,
    image: "https://i.pravatar.cc/150?u=2",
    name: "Dr. Marcus Thorne",
    occupation: "University Professor",
    stars: 5,
    review:
      "Integrating this into my curriculum increased student engagement by 40%. It's a game-changer for personalized learning at a scale I never thought possible.",
    role: "Educator",
    tag: "Educator Suite",
    likes: 89,
  },
  {
    id: 3,
    image: "https://i.pravatar.cc/150?u=3",
    name: "Leo Rodriguez",
    occupation: "Full Stack Developer Student",
    stars: 5,
    review:
      "The Code Helper is like having a mentor by my side 24/7. I finished my final project two weeks early and understood every line I wrote.",
    role: "Student",
    tag: "Code Helper",
    likes: 56,
  },
  {
    id: 4,
    image: "https://i.pravatar.cc/150?u=4",
    name: "Emily Chen",
    occupation: "Data Science Major",
    stars: 5,
    review:
      "I was struggling with Python libraries until I used the interactive simulations. Now visualizing data structures feels intuitive.",
    role: "Student",
    tag: "Interactive Sims",
    likes: 210,
  },
  {
    id: 5,
    image: "https://i.pravatar.cc/150?u=5",
    name: "Michael Ross",
    occupation: "High School Teacher",
    stars: 4,
    review:
      "Great tool for creating custom assignments. The AI suggestions for grading rubrics save me hours every week.",
    role: "Educator",
    tag: "Lesson Planning",
    likes: 45,
  },
  {
    id: 6,
    image: "https://i.pravatar.cc/150?u=6",
    name: "Jessica Alba",
    occupation: "UX Design Student",
    stars: 5,
    review:
      "The design feedback I get is specific and actionable. It's helping me build a portfolio that actually stands out.",
    role: "Student",
    tag: "Design Feedback",
    likes: 78,
  },
  {
    id: 7,
    image: "https://i.pravatar.cc/150?u=7",
    name: "David Kim",
    occupation: "Bootcamp Graduate",
    stars: 5,
    review:
      "Transitioning from sales to tech was hard, but the personalized roadmap kept me on track. I landed my first dev job last week!",
    role: "Student",
    tag: "Career Path",
    likes: 342,
  },
  {
    id: 8,
    image: "https://i.pravatar.cc/150?u=8",
    name: "Amanda Lowery",
    occupation: "Online Tutor",
    stars: 5,
    review:
      "My students love the gamified elements. It makes homework feel less like a chore and more like a challenge to beat.",
    role: "Educator",
    tag: "Gamification",
    likes: 67,
  },
  {
    id: 9,
    image: "https://i.pravatar.cc/150?u=9",
    name: "James Wilson",
    occupation: "History Major",
    stars: 4,
    review:
      "Being able to debate historical figures AI-personas helped me ace my thesis defense. A very unique way to learn.",
    role: "Student",
    tag: "AI Personas",
    likes: 92,
  },
  {
    id: 10,
    image: "https://i.pravatar.cc/150?u=10",
    name: "Sarah Connor",
    occupation: "Cybersecurity Student",
    stars: 5,
    review:
      "The virtual labs are safe environments to test penetration testing scripts. I learned more here than in my textbooks.",
    role: "Student",
    tag: "Virtual Labs",
    likes: 115,
  },
  {
    id: 11,
    image: "https://i.pravatar.cc/150?u=11",
    name: "Robert Fox",
    occupation: "Vocational Instructor",
    stars: 5,
    review:
      "For hands-on trades, the AR visualizations (beta) are incredible. Students can 'see' the engine parts before touching them.",
    role: "Educator",
    tag: "AR Learning",
    likes: 88,
  },
  {
    id: 12,
    image: "https://i.pravatar.cc/150?u=12",
    name: "Linda Martinez",
    occupation: "Language Learner",
    stars: 5,
    review:
      "Practicing Spanish conversation with the AI feels natural and low-pressure. My confidence in speaking has skyrocketed.",
    role: "Student",
    tag: "Language Lab",
    likes: 203,
  },
  {
    id: 13,
    image: "https://i.pravatar.cc/150?u=13",
    name: "Thomas Anderson",
    occupation: "Self-Taught Dev",
    stars: 5,
    review:
      "The 'Explain Like I'm 5' feature is a lifesaver for complex architecture patterns. Finally, Microservices make sense.",
    role: "Student",
    tag: "Concept Simplifier",
    likes: 440,
  },
  {
    id: 14,
    image: "https://i.pravatar.cc/150?u=14",
    name: "Patricia Clark",
    occupation: "Biology Teacher",
    stars: 4,
    review:
      "The automated quiz generation based on my lecture notes saves me at least 5 hours of prep time per week.",
    role: "Educator",
    tag: "Auto-Quiz",
    likes: 55,
  },
  {
    id: 15,
    image: "https://i.pravatar.cc/150?u=15",
    name: "Kevin Wright",
    occupation: "MBA Student",
    stars: 5,
    review:
      "Financial modeling simulations gave me real-world experience without the risk. Essential for any finance student.",
    role: "Student",
    tag: "Simulations",
    likes: 101,
  },
  {
    id: 16,
    image: "https://i.pravatar.cc/150?u=16",
    name: "Nancy Hall",
    occupation: "Homeschool Parent",
    stars: 5,
    review:
      "As a parent-teacher, keeping track of 3 kids' progress was a nightmare. The dashboard simplifies everything.",
    role: "Educator",
    tag: "Parent Dashboard",
    likes: 134,
  },
  {
    id: 17,
    image: "https://i.pravatar.cc/150?u=17",
    name: "Daniel Lee",
    occupation: "Physics Undergrad",
    stars: 5,
    review:
      "Solving quantum mechanics problems with step-by-step AI guidance helped me pass my hardest class.",
    role: "Student",
    tag: "Step-by-Step",
    likes: 198,
  },
  {
    id: 18,
    image: "https://i.pravatar.cc/150?u=18",
    name: "Karen White",
    occupation: "Corporate Trainer",
    stars: 4,
    review:
      "We use this for employee onboarding. The tracking metrics are exactly what HR needed to verify compliance.",
    role: "Educator",
    tag: "Enterprise",
    likes: 72,
  },
  {
    id: 19,
    image: "https://i.pravatar.cc/150?u=19",
    name: "Steven King",
    occupation: "Creative Writing Student",
    stars: 5,
    review:
      "The prompts and plot-hole detection tools are amazing. It doesn't write for me, but it makes me a better writer.",
    role: "Student",
    tag: "Writing Assistant",
    likes: 156,
  },
  {
    id: 20,
    image: "https://i.pravatar.cc/150?u=20",
    name: "Betty Green",
    occupation: "Music Teacher",
    stars: 5,
    review:
      "Theory lessons are interactive now! My students actually look forward to learning scales and harmony.",
    role: "Educator",
    tag: "Interactive Music",
    likes: 93,
  },
  {
    id: 21,
    image: "https://i.pravatar.cc/150?u=21",
    name: "Anthony Scott",
    occupation: "Medical Student",
    stars: 5,
    review:
      "The anatomy memorization tools uses spaced repetition perfectly. I retained 2x more information for my boards.",
    role: "Student",
    tag: "Spaced Repetition",
    likes: 312,
  },
  {
    id: 22,
    image: "https://i.pravatar.cc/150?u=22",
    name: "Lisa Baker",
    occupation: "Digital Marketing Student",
    stars: 5,
    review:
      "Running simulated ad campaigns helped me understand ROI and targeting better than any lecture could.",
    role: "Student",
    tag: "Ad Sim",
    likes: 87,
  },
  {
    id: 23,
    image: "https://i.pravatar.cc/150?u=23",
    name: "Mark Turner",
    occupation: "Coding Bootcamp Instructor",
    stars: 5,
    review:
      "I can monitor 50 students simultaneously. The system flags who is stuck so I can intervene immediately. Invaluable.",
    role: "Educator",
    tag: "Class Monitor",
    likes: 145,
  },
  {
    id: 24,
    image: "https://i.pravatar.cc/150?u=24",
    name: "Sandra Bullock",
    occupation: "Psychology Major",
    stars: 5,
    review:
      "The case study analysis tool helps break down complex diagnoses. It builds critical thinking skills effectively.",
    role: "Student",
    tag: "Case Studies",
    likes: 109,
  },
  {
    id: 25,
    image: "https://i.pravatar.cc/150?u=25",
    name: "Paul Adams",
    occupation: "Chemistry Teacher",
    stars: 5,
    review:
      "Virtual titrations means no more broken glassware! Students still learn the process perfectly before the real lab.",
    role: "Educator",
    tag: "Safety First",
    likes: 64,
  },
  {
    id: 26,
    image: "https://i.pravatar.cc/150?u=26",
    name: "Donna Hill",
    occupation: "Nursing Student",
    stars: 5,
    review:
      "Patient care scenarios are so realistic. It prepares you for the pressure of decision making in a hospital.",
    role: "Student",
    tag: "Clinical Sim",
    likes: 276,
  },
  {
    id: 27,
    image: "https://i.pravatar.cc/150?u=27",
    name: "Brian Mitchell",
    occupation: "Economics Student",
    stars: 4,
    review:
      "Macro-economic modeling tools are great. A bit of a learning curve, but worth it for the insights.",
    role: "Student",
    tag: "Econ Models",
    likes: 99,
  },
  {
    id: 28,
    image: "https://i.pravatar.cc/150?u=28",
    name: "Carol Campbell",
    occupation: "ESL Teacher",
    stars: 5,
    review:
      "My students' pronunciation improved drastically with the real-time audio feedback feature.",
    role: "Educator",
    tag: "Audio Feedback",
    likes: 112,
  },
  {
    id: 29,
    image: "https://i.pravatar.cc/150?u=29",
    name: "Edward Collins",
    occupation: "Architecture Student",
    stars: 5,
    review:
      "Visualizing structural loads in AR helped me verify my designs instantly. It bridged the gap between sketch and physics.",
    role: "Student",
    tag: "AR Struct",
    likes: 187,
  },
  {
    id: 30,
    image: "https://i.pravatar.cc/150?u=30",
    name: "Rebecca Parker",
    occupation: "Art History Major",
    stars: 5,
    review:
      "Exploring high-res museum scans and having AI explain the brushwork details is magical.",
    role: "Student",
    tag: "Virtual Museum",
    likes: 82,
  },
];

function TestimonialsSection() {
  const [activeTab, setActiveTab] = useState<"All" | Role | string>("All");

  const [visibleCount, setVisibleCount] = useState(3);

  useEffect(() => {
    // adjust for larger screens on the client side only
    if (window.matchMedia("(min-width: 768px)").matches) {
      setVisibleCount(6);
    }
  }, []);

  // Reset visible count when tab changes
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    const isDesktop = window.matchMedia("(min-width: 768px)").matches;
    setVisibleCount(isDesktop ? 6 : 3);
  };

  const filteredTestimonials =
    activeTab === "All"
      ? TESTIMONIALS
      : TESTIMONIALS.filter((t) => t.role === activeTab);

  const visibleTestimonials = filteredTestimonials.slice(0, visibleCount);
  const hasMoreToShow = visibleCount < filteredTestimonials.length;

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + 3);
  };

  return (
    <div className="pb-24">
      {/* TESTIMONIAL HERO IMAGE */}
      <div
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url('https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2671&auto=format&fit=crop')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
        className="w-full h-96 flex flex-col justify-center items-center rounded-2xl mb-16 px-4"
      >
        <span className="bg-white/20 text-white backdrop-blur-sm px-4 py-1.5 rounded-full text-sm font-medium mb-4">
          Learners
        </span>
        <h2 className="text-3xl md:text-5xl font-bold text-white text-center mb-4">
          Discover how our AI-powered tools
        </h2>
        <p className="text-gray-200 text-center max-w-[800px] text-lg md:text-xl font-light">
          are transforming the educational journey for students and educators
          worldwide.
        </p>
        {/* button */}
        <div className="flex gap-4 mt-8">
          <button className="bg-white text-brand rounded-full font-semibold text-sm sm:text-base h-10 sm:h-12 px-6 hover:bg-white/90 transition-all duration-300">
            View All Stories
          </button>
          <button className="bg-white/20 backdrop-blur-sm border border-white/30 text-white rounded-full font-semibold text-sm sm:text-base h-10 sm:h-12 px-6 hover:bg-white/30 transition-all duration-300">
            Join 10k+ Students
          </button>
        </div>
      </div>

      {/* HEADER & TABS */}
      <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-8 gap-6">
        <div className="flex flex-col gap-2">
          <span className="font-bold text-3xl text-primary-text">
            Success Stories
          </span>
          <span className="text-secondary-text">
            Filtering {TESTIMONIALS.length}+ verified testimonials
          </span>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-6 border-b border-border pb-2 w-full md:w-auto overflow-x-auto">
          {["All", "Student", "Educator"].map((tab) => (
            <span
              key={tab}
              onClick={() => handleTabChange(tab)}
              className={
                activeTab ===
                (tab === "Student"
                  ? "Student"
                  : tab === "Educator"
                    ? "Educator"
                    : "All")
                  ? "font-semibold text-brand border-b-2 border-brand pb-2 -mb-2.5 cursor-pointer whitespace-nowrap"
                  : "text-secondary-text cursor-pointer hover:text-primary-text transition-colors whitespace-nowrap pb-2"
              }
            >
              {tab === "All" ? "All Testimonials" : `${tab}s`}
            </span>
          ))}
        </div>
      </div>

      {/* GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {visibleTestimonials.map((t) => (
          <div
            key={t.id}
            className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col gap-4"
          >
            {/* Header: Avatar & Info */}
            <div className="flex items-center gap-4">
              <img
                src={t.image}
                alt={t.name}
                className="w-12 h-12 rounded-full object-cover"
              />
              <div className="flex flex-col">
                <h4 className="font-bold text-gray-900 dark:text-white text-base">
                  {t.name}
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {t.occupation}
                </p>
              </div>
            </div>

            {/* Stars */}
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < t.stars
                      ? "text-brand fill-brand"
                      : "text-gray-300 dark:text-gray-600"
                  }`}
                />
              ))}
            </div>

            {/* Review */}
            <p className="text-sm text-gray-600 dark:text-gray-300 italic leading-relaxed grow">
              &quot;{t.review}&quot;
            </p>

            {/* Footer: Tag & Likes */}
            <div className="flex items-center justify-between mt-2 pt-4 border-t border-gray-100 dark:border-gray-700">
              <span className="text-xs font-medium text-brand bg-brand/10 px-3 py-1 rounded-full">
                {t.tag}
              </span>
              <div className="flex items-center gap-1.5 text-gray-400 text-xs font-medium">
                <ThumbsUp className="w-3.5 h-3.5" />
                <span>{t.likes}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Load More Button */}
      {hasMoreToShow && (
        <div className="flex justify-center mt-10">
          <button
            onClick={handleLoadMore}
            className="flex items-center gap-2 px-6 py-3 bg-brand/10 hover:bg-brand/20 text-brand font-semibold rounded-full transition-all duration-300 hover:shadow-md"
          >
            Load more
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}

export default TestimonialsSection;
