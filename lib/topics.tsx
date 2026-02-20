import {
  BarChart3,
  Pencil,
  BookOpen,
  Cpu,
  Megaphone,
  Library,
  Telescope,
  Landmark,
  PenTool,
  Music,
  FlaskConical,
  Calculator,
} from "lucide-react";

// Topic type definition
export interface Topic {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
}

// Available topics for selection (from learner onboarding)
export const TOPICS: Topic[] = [
  {
    id: "data-science",
    name: "Data Science",
    icon: <BarChart3 className="w-6 h-6" />,
    color: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
  },
  {
    id: "creative-writing",
    name: "Creative Writing",
    icon: <Pencil className="w-6 h-6" />,
    color:
      "bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400",
  },
  {
    id: "history",
    name: "History",
    icon: <BookOpen className="w-6 h-6" />,
    color: "bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400",
  },
  {
    id: "machine-learning",
    name: "Machine Learning",
    icon: <Cpu className="w-6 h-6" />,
    color: "bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400",
  },
  {
    id: "digital-marketing",
    name: "Digital Marketing",
    icon: <Megaphone className="w-6 h-6" />,
    color:
      "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400",
  },
  {
    id: "philosophy",
    name: "Philosophy",
    icon: <Library className="w-6 h-6" />,
    color:
      "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400",
  },
  {
    id: "astrophysics",
    name: "Astrophysics",
    icon: <Telescope className="w-6 h-6" />,
    color: "bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400",
  },
  {
    id: "economics",
    name: "Economics",
    icon: <Landmark className="w-6 h-6" />,
    color: "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400",
  },
  {
    id: "ux-design",
    name: "UX/UI Design",
    icon: <PenTool className="w-6 h-6" />,
    color:
      "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400",
  },
  {
    id: "music-theory",
    name: "Music Theory",
    icon: <Music className="w-6 h-6" />,
    color: "bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400",
  },
  {
    id: "biology",
    name: "Biology",
    icon: <FlaskConical className="w-6 h-6" />,
    color: "bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400",
  },
  {
    id: "advanced-math",
    name: "Advanced Math",
    icon: <Calculator className="w-6 h-6" />,
    color: "bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400",
  },
];
