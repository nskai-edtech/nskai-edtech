import type { ReactNode } from "react";
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
  Code,
  Shield,
  Cloud,
  Smartphone,
  Server,
  Gamepad2,
  Bot,
  Briefcase,
  DollarSign,
  Lightbulb,
  Users,
  Store,
  Brain,
  HeartPulse,
  Globe,
  Languages,
  Palette,
  Camera,
  Film,
  Mic,
  Leaf,
  Atom,
  Rocket,
  Wrench,
  GraduationCap,
  Presentation,
  MessageSquare,
  Newspaper,
  Share2,
  Dna,
  Mountain,
  Gavel,
  Plane,
  Stethoscope,
  Dumbbell,
  Heart,
  Monitor,
  Layers,
  Clapperboard,
  Wifi,
  Database,
  Blocks,
  LineChart,
  Building2,
  Receipt,
  Network,
  PackageSearch,
  Earth,
  TestTube,
  TreePine,
  Sprout,
  Droplet,
  Thermometer,
  Microscope,
  Pill,
  type LucideIcon,
} from "lucide-react";

// ── Data Types ──────────────────────────────────────────────────
export interface TopicData {
  id: string;
  name: string;
  iconName: string;
  color: string;
}

/** Legacy type kept for backward compatibility */
export interface Topic {
  id: string;
  name: string;
  icon: ReactNode;
  color: string;
}

// ── Icon Registry ───────────────────────────────────────────────
const ICON_MAP: Record<string, LucideIcon> = {
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
  Code,
  Shield,
  Cloud,
  Smartphone,
  Server,
  Gamepad2,
  Bot,
  Briefcase,
  DollarSign,
  Lightbulb,
  Users,
  Store,
  Brain,
  HeartPulse,
  Globe,
  Languages,
  Palette,
  Camera,
  Film,
  Mic,
  Leaf,
  Atom,
  Rocket,
  Wrench,
  GraduationCap,
  Presentation,
  MessageSquare,
  Newspaper,
  Share2,
  Dna,
  Mountain,
  Gavel,
  Plane,
  Stethoscope,
  Dumbbell,
  Heart,
  Monitor,
  Layers,
  Clapperboard,
  Wifi,
  Database,
  Blocks,
  LineChart,
  Building2,
  Receipt,
  Network,
  PackageSearch,
  Earth,
  TestTube,
  TreePine,
  Sprout,
  Droplet,
  Thermometer,
  Microscope,
  Pill,
};

/** Resolve an icon name to a rendered React element */
export function TopicIcon({
  name,
  className = "w-6 h-6",
}: {
  name: string;
  className?: string;
}) {
  const Icon = ICON_MAP[name];
  if (!Icon) return null;
  return <Icon className={className} />;
}

// ── Pagination constant ─────────────────────────────────────────
export const TOPICS_PER_PAGE = 15;

// ── Color palette (cycled across topics) ────────────────────────
const COLORS = [
  "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
  "bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400",
  "bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400",
  "bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400",
  "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400",
  "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400",
  "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400",
  "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400",
  "bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400",
  "bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400",
  "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400",
  "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400",
  "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400",
  "bg-sky-100 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400",
  "bg-fuchsia-100 dark:bg-fuchsia-900/30 text-fuchsia-600 dark:text-fuchsia-400",
  "bg-lime-100 dark:bg-lime-900/30 text-lime-600 dark:text-lime-400",
  "bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400",
];

const c = (i: number) => COLORS[i % COLORS.length];

// Topic List (~95 diverse topics)

export const ALL_TOPICS: TopicData[] = [
  // ─── Technology ───
  {
    id: "data-science",
    name: "Data Science",
    iconName: "BarChart3",
    color: c(0),
  },
  {
    id: "machine-learning",
    name: "Machine Learning",
    iconName: "Cpu",
    color: c(3),
  },
  {
    id: "artificial-intelligence",
    name: "Artificial Intelligence",
    iconName: "Bot",
    color: c(10),
  },
  {
    id: "web-development",
    name: "Web Development",
    iconName: "Code",
    color: c(0),
  },
  {
    id: "mobile-development",
    name: "Mobile Development",
    iconName: "Smartphone",
    color: c(4),
  },
  {
    id: "cybersecurity",
    name: "Cybersecurity",
    iconName: "Shield",
    color: c(6),
  },
  {
    id: "cloud-computing",
    name: "Cloud Computing",
    iconName: "Cloud",
    color: c(13),
  },
  { id: "devops", name: "DevOps", iconName: "Server", color: c(7) },
  {
    id: "game-development",
    name: "Game Development",
    iconName: "Gamepad2",
    color: c(10),
  },
  { id: "robotics", name: "Robotics", iconName: "Bot", color: c(8) },
  { id: "blockchain", name: "Blockchain", iconName: "Blocks", color: c(14) },
  {
    id: "internet-of-things",
    name: "Internet of Things",
    iconName: "Wifi",
    color: c(4),
  },
  {
    id: "data-engineering",
    name: "Data Engineering",
    iconName: "Database",
    color: c(7),
  },
  {
    id: "computer-vision",
    name: "Computer Vision",
    iconName: "Monitor",
    color: c(3),
  },
  {
    id: "natural-language-processing",
    name: "Natural Language Processing",
    iconName: "MessageSquare",
    color: c(0),
  },

  // ─── Business & Finance ───
  {
    id: "digital-marketing",
    name: "Digital Marketing",
    iconName: "Megaphone",
    color: c(4),
  },
  {
    id: "entrepreneurship",
    name: "Entrepreneurship",
    iconName: "Rocket",
    color: c(6),
  },
  {
    id: "project-management",
    name: "Project Management",
    iconName: "Briefcase",
    color: c(7),
  },
  {
    id: "finance",
    name: "Finance & Investing",
    iconName: "DollarSign",
    color: c(4),
  },
  { id: "accounting", name: "Accounting", iconName: "Receipt", color: c(5) },
  { id: "leadership", name: "Leadership", iconName: "Users", color: c(10) },
  {
    id: "supply-chain",
    name: "Supply Chain Management",
    iconName: "PackageSearch",
    color: c(8),
  },
  {
    id: "human-resources",
    name: "Human Resources",
    iconName: "Users",
    color: c(9),
  },
  {
    id: "business-analytics",
    name: "Business Analytics",
    iconName: "LineChart",
    color: c(0),
  },
  { id: "e-commerce", name: "E-Commerce", iconName: "Store", color: c(11) },
  { id: "economics", name: "Economics", iconName: "Landmark", color: c(6) },
  {
    id: "real-estate",
    name: "Real Estate",
    iconName: "Building2",
    color: c(12),
  },
  {
    id: "product-management",
    name: "Product Management",
    iconName: "Layers",
    color: c(7),
  },

  // ─── Sciences ───
  { id: "biology", name: "Biology", iconName: "FlaskConical", color: c(8) },
  { id: "chemistry", name: "Chemistry", iconName: "TestTube", color: c(10) },
  { id: "physics", name: "Physics", iconName: "Atom", color: c(0) },
  {
    id: "astrophysics",
    name: "Astrophysics",
    iconName: "Telescope",
    color: c(2),
  },
  {
    id: "environmental-science",
    name: "Environmental Science",
    iconName: "Leaf",
    color: c(4),
  },
  { id: "neuroscience", name: "Neuroscience", iconName: "Brain", color: c(3) },
  { id: "genetics", name: "Genetics", iconName: "Dna", color: c(10) },
  {
    id: "marine-biology",
    name: "Marine Biology",
    iconName: "Droplet",
    color: c(0),
  },
  { id: "geology", name: "Geology", iconName: "Mountain", color: c(12) },
  {
    id: "quantum-physics",
    name: "Quantum Physics",
    iconName: "Atom",
    color: c(14),
  },
  {
    id: "microbiology",
    name: "Microbiology",
    iconName: "Microscope",
    color: c(8),
  },
  {
    id: "climate-science",
    name: "Climate Science",
    iconName: "Thermometer",
    color: c(6),
  },

  // ─── Arts & Humanities ───
  {
    id: "creative-writing",
    name: "Creative Writing",
    iconName: "Pencil",
    color: c(1),
  },
  { id: "philosophy", name: "Philosophy", iconName: "Library", color: c(5) },
  { id: "history", name: "History", iconName: "BookOpen", color: c(2) },
  { id: "music-theory", name: "Music Theory", iconName: "Music", color: c(3) },
  {
    id: "film-studies",
    name: "Film Studies",
    iconName: "Clapperboard",
    color: c(9),
  },
  { id: "photography", name: "Photography", iconName: "Camera", color: c(12) },
  {
    id: "graphic-design",
    name: "Graphic Design",
    iconName: "Palette",
    color: c(14),
  },
  { id: "ux-design", name: "UX/UI Design", iconName: "PenTool", color: c(7) },
  { id: "fine-art", name: "Fine Art", iconName: "Palette", color: c(9) },
  { id: "art-history", name: "Art History", iconName: "BookOpen", color: c(5) },
  { id: "animation", name: "Animation", iconName: "Film", color: c(10) },
  {
    id: "music-production",
    name: "Music Production",
    iconName: "Mic",
    color: c(3),
  },

  // ─── Languages ───
  {
    id: "english-language",
    name: "English Language",
    iconName: "Languages",
    color: c(0),
  },
  { id: "spanish", name: "Spanish", iconName: "Languages", color: c(6) },
  { id: "french", name: "French", iconName: "Languages", color: c(0) },
  {
    id: "mandarin",
    name: "Mandarin Chinese",
    iconName: "Languages",
    color: c(6),
  },
  { id: "japanese", name: "Japanese", iconName: "Languages", color: c(3) },
  { id: "arabic", name: "Arabic", iconName: "Languages", color: c(4) },
  { id: "german", name: "German", iconName: "Languages", color: c(5) },
  { id: "korean", name: "Korean", iconName: "Languages", color: c(10) },
  { id: "portuguese", name: "Portuguese", iconName: "Languages", color: c(4) },

  // ─── Health & Wellness ───
  { id: "nutrition", name: "Nutrition", iconName: "HeartPulse", color: c(4) },
  { id: "psychology", name: "Psychology", iconName: "Brain", color: c(10) },
  {
    id: "public-health",
    name: "Public Health",
    iconName: "Stethoscope",
    color: c(6),
  },
  {
    id: "sports-science",
    name: "Sports Science",
    iconName: "Dumbbell",
    color: c(1),
  },
  {
    id: "mental-health",
    name: "Mental Health",
    iconName: "Heart",
    color: c(9),
  },
  { id: "pharmacology", name: "Pharmacology", iconName: "Pill", color: c(8) },

  // ─── Mathematics ───
  {
    id: "advanced-math",
    name: "Advanced Mathematics",
    iconName: "Calculator",
    color: c(9),
  },
  { id: "statistics", name: "Statistics", iconName: "BarChart3", color: c(7) },
  {
    id: "linear-algebra",
    name: "Linear Algebra",
    iconName: "Calculator",
    color: c(0),
  },
  { id: "calculus", name: "Calculus", iconName: "Calculator", color: c(10) },
  {
    id: "discrete-math",
    name: "Discrete Mathematics",
    iconName: "Calculator",
    color: c(14),
  },

  // ─── Social Sciences ───
  { id: "sociology", name: "Sociology", iconName: "Users", color: c(5) },
  {
    id: "political-science",
    name: "Political Science",
    iconName: "Landmark",
    color: c(6),
  },
  { id: "anthropology", name: "Anthropology", iconName: "Globe", color: c(1) },
  { id: "geography", name: "Geography", iconName: "Earth", color: c(4) },
  { id: "law", name: "Law", iconName: "Gavel", color: c(12) },
  {
    id: "international-relations",
    name: "International Relations",
    iconName: "Globe",
    color: c(0),
  },

  // ─── Engineering ───
  {
    id: "mechanical-engineering",
    name: "Mechanical Engineering",
    iconName: "Wrench",
    color: c(12),
  },
  {
    id: "electrical-engineering",
    name: "Electrical Engineering",
    iconName: "Lightbulb",
    color: c(5),
  },
  {
    id: "civil-engineering",
    name: "Civil Engineering",
    iconName: "Building2",
    color: c(1),
  },
  {
    id: "aerospace-engineering",
    name: "Aerospace Engineering",
    iconName: "Plane",
    color: c(13),
  },
  {
    id: "biomedical-engineering",
    name: "Biomedical Engineering",
    iconName: "HeartPulse",
    color: c(3),
  },

  // ─── Media & Communication ───
  { id: "journalism", name: "Journalism", iconName: "Newspaper", color: c(12) },
  {
    id: "public-relations",
    name: "Public Relations",
    iconName: "Megaphone",
    color: c(7),
  },
  {
    id: "content-creation",
    name: "Content Creation",
    iconName: "Pencil",
    color: c(14),
  },
  { id: "podcasting", name: "Podcasting", iconName: "Mic", color: c(10) },
  {
    id: "social-media",
    name: "Social Media Management",
    iconName: "Share2",
    color: c(0),
  },

  // ─── Sustainability ───
  {
    id: "renewable-energy",
    name: "Renewable Energy",
    iconName: "Leaf",
    color: c(4),
  },
  {
    id: "sustainable-agriculture",
    name: "Sustainable Agriculture",
    iconName: "Sprout",
    color: c(4),
  },
  {
    id: "conservation",
    name: "Conservation",
    iconName: "TreePine",
    color: c(11),
  },

  // ─── Education ───
  {
    id: "edtech",
    name: "Educational Technology",
    iconName: "GraduationCap",
    color: c(0),
  },
  {
    id: "curriculum-design",
    name: "Curriculum Design",
    iconName: "BookOpen",
    color: c(7),
  },

  // ─── Personal Development ───
  {
    id: "public-speaking",
    name: "Public Speaking",
    iconName: "Presentation",
    color: c(1),
  },
  {
    id: "critical-thinking",
    name: "Critical Thinking",
    iconName: "Lightbulb",
    color: c(5),
  },
  {
    id: "emotional-intelligence",
    name: "Emotional Intelligence",
    iconName: "Heart",
    color: c(9),
  },
  {
    id: "networking",
    name: "Professional Networking",
    iconName: "Network",
    color: c(7),
  },
];

// ── Helper Utilities

/** Filter topics by search query (case-insensitive) */
export function filterTopics(topics: TopicData[], query: string): TopicData[] {
  if (!query.trim()) return topics;
  const lower = query.toLowerCase();
  return topics.filter((t) => t.name.toLowerCase().includes(lower));
}

/** Get a cumulative slice of topics up to `(page+1) * pageSize` */
export function paginateTopics(
  topics: TopicData[],
  page: number,
  pageSize = TOPICS_PER_PAGE,
): TopicData[] {
  return topics.slice(0, (page + 1) * pageSize);
}

/** Look up a topic by ID */
export function getTopicById(id: string): TopicData | undefined {
  return ALL_TOPICS.find((t) => t.id === id);
}

// ── Legacy `TOPICS` export (backward-compatible)
// Components that still import `TOPICS` with `icon: ReactNode` get
// the full list resolved.
export const TOPICS: Topic[] = ALL_TOPICS.map((t) => ({
  id: t.id,
  name: t.name,
  icon: <TopicIcon name={t.iconName} />,
  color: t.color,
}));
