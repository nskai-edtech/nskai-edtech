import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as dotenv from "dotenv";
import { eq } from "drizzle-orm";
import * as schema from "../drizzle/schema/index";

dotenv.config({ path: ".env.local" });

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

interface TopicEntry {
  id: string;
  name: string;
  keywords: string[];
}

const TOPIC_KEYWORDS: TopicEntry[] = [
  {
    id: "data-science",
    name: "Data Science",
    keywords: ["data science", "data analysis", "pandas", "numpy", "jupyter"],
  },
  {
    id: "machine-learning",
    name: "Machine Learning",
    keywords: [
      "machine learning",
      "ml model",
      "supervised learning",
      "unsupervised",
      "neural network",
      "deep learning",
      "tensorflow",
      "pytorch",
    ],
  },
  {
    id: "artificial-intelligence",
    name: "Artificial Intelligence",
    keywords: [
      "artificial intelligence",
      "ai ",
      "intelligent systems",
      "chatgpt",
      "llm",
      "large language model",
    ],
  },
  {
    id: "web-development",
    name: "Web Development",
    keywords: [
      "web development",
      "html",
      "css",
      "javascript",
      "react",
      "nextjs",
      "next.js",
      "vue",
      "angular",
      "frontend",
      "front-end",
      "backend",
      "back-end",
      "fullstack",
      "full-stack",
      "node.js",
      "nodejs",
    ],
  },
  {
    id: "mobile-development",
    name: "Mobile Development",
    keywords: [
      "mobile development",
      "ios",
      "android",
      "react native",
      "flutter",
      "swift",
      "kotlin",
    ],
  },
  {
    id: "cybersecurity",
    name: "Cybersecurity",
    keywords: [
      "cybersecurity",
      "security",
      "hacking",
      "penetration testing",
      "ethical hacking",
      "infosec",
    ],
  },
  {
    id: "cloud-computing",
    name: "Cloud Computing",
    keywords: [
      "cloud computing",
      "aws",
      "azure",
      "gcp",
      "google cloud",
      "serverless",
      "docker",
      "kubernetes",
    ],
  },
  {
    id: "devops",
    name: "DevOps",
    keywords: [
      "devops",
      "ci/cd",
      "continuous integration",
      "continuous deployment",
      "jenkins",
      "terraform",
      "ansible",
    ],
  },
  {
    id: "game-development",
    name: "Game Development",
    keywords: [
      "game development",
      "game design",
      "unity",
      "unreal engine",
      "godot",
      "game programming",
    ],
  },
  {
    id: "robotics",
    name: "Robotics",
    keywords: ["robotics", "robot", "arduino", "raspberry pi", "automation"],
  },
  {
    id: "blockchain",
    name: "Blockchain",
    keywords: [
      "blockchain",
      "cryptocurrency",
      "bitcoin",
      "ethereum",
      "smart contract",
      "solidity",
      "web3",
    ],
  },
  {
    id: "internet-of-things",
    name: "Internet of Things",
    keywords: ["internet of things", "iot", "embedded systems", "sensor"],
  },
  {
    id: "data-engineering",
    name: "Data Engineering",
    keywords: [
      "data engineering",
      "data pipeline",
      "etl",
      "data warehouse",
      "spark",
      "kafka",
      "airflow",
    ],
  },
  {
    id: "computer-vision",
    name: "Computer Vision",
    keywords: [
      "computer vision",
      "image recognition",
      "object detection",
      "opencv",
      "image processing",
    ],
  },
  {
    id: "natural-language-processing",
    name: "Natural Language Processing",
    keywords: [
      "natural language processing",
      "nlp",
      "text analysis",
      "sentiment analysis",
      "text mining",
    ],
  },
  {
    id: "digital-marketing",
    name: "Digital Marketing",
    keywords: [
      "digital marketing",
      "seo",
      "sem",
      "google ads",
      "facebook ads",
      "social media marketing",
      "email marketing",
    ],
  },
  {
    id: "entrepreneurship",
    name: "Entrepreneurship",
    keywords: [
      "entrepreneurship",
      "startup",
      "business plan",
      "venture capital",
      "bootstrapping",
    ],
  },
  {
    id: "project-management",
    name: "Project Management",
    keywords: [
      "project management",
      "agile",
      "scrum",
      "kanban",
      "pmp",
      "project planning",
    ],
  },
  {
    id: "finance",
    name: "Finance & Investing",
    keywords: [
      "finance",
      "investing",
      "stock market",
      "trading",
      "financial analysis",
      "portfolio",
    ],
  },
  {
    id: "accounting",
    name: "Accounting",
    keywords: [
      "accounting",
      "bookkeeping",
      "financial statements",
      "tax",
      "audit",
    ],
  },
  {
    id: "leadership",
    name: "Leadership",
    keywords: ["leadership", "management", "team building", "executive"],
  },
  {
    id: "supply-chain",
    name: "Supply Chain Management",
    keywords: ["supply chain", "logistics", "inventory", "procurement"],
  },
  {
    id: "human-resources",
    name: "Human Resources",
    keywords: [
      "human resources",
      "hr ",
      "recruitment",
      "talent management",
      "employee",
    ],
  },
  {
    id: "business-analytics",
    name: "Business Analytics",
    keywords: [
      "business analytics",
      "business intelligence",
      "bi ",
      "dashboard",
      "kpi",
    ],
  },
  {
    id: "e-commerce",
    name: "E-Commerce",
    keywords: [
      "e-commerce",
      "ecommerce",
      "online store",
      "shopify",
      "woocommerce",
    ],
  },
  {
    id: "economics",
    name: "Economics",
    keywords: [
      "economics",
      "microeconomics",
      "macroeconomics",
      "economic theory",
    ],
  },
  {
    id: "product-management",
    name: "Product Management",
    keywords: [
      "product management",
      "product strategy",
      "roadmap",
      "user research",
    ],
  },
  {
    id: "biology",
    name: "Biology",
    keywords: [
      "biology",
      "cell biology",
      "molecular biology",
      "organism",
      "evolution",
    ],
  },
  {
    id: "chemistry",
    name: "Chemistry",
    keywords: [
      "chemistry",
      "organic chemistry",
      "inorganic",
      "chemical reaction",
      "periodic table",
    ],
  },
  {
    id: "physics",
    name: "Physics",
    keywords: [
      "physics",
      "mechanics",
      "thermodynamics",
      "electromagnetism",
      "quantum",
    ],
  },
  {
    id: "environmental-science",
    name: "Environmental Science",
    keywords: [
      "environmental science",
      "ecology",
      "pollution",
      "biodiversity",
      "ecosystem",
    ],
  },
  {
    id: "neuroscience",
    name: "Neuroscience",
    keywords: ["neuroscience", "brain", "cognitive science", "neurology"],
  },
  {
    id: "genetics",
    name: "Genetics",
    keywords: ["genetics", "dna", "genome", "gene therapy", "heredity"],
  },
  {
    id: "creative-writing",
    name: "Creative Writing",
    keywords: [
      "creative writing",
      "fiction writing",
      "storytelling",
      "poetry",
      "screenplay",
    ],
  },
  {
    id: "philosophy",
    name: "Philosophy",
    keywords: ["philosophy", "ethics", "metaphysics", "epistemology", "logic"],
  },
  {
    id: "history",
    name: "History",
    keywords: ["history", "historical", "ancient", "medieval", "world war"],
  },
  {
    id: "music-theory",
    name: "Music Theory",
    keywords: ["music theory", "composition", "harmony", "melody", "rhythm"],
  },
  {
    id: "photography",
    name: "Photography",
    keywords: [
      "photography",
      "camera",
      "lightroom",
      "photoshop",
      "portrait photography",
    ],
  },
  {
    id: "graphic-design",
    name: "Graphic Design",
    keywords: [
      "graphic design",
      "illustrator",
      "photoshop",
      "branding",
      "visual design",
      "logo design",
    ],
  },
  {
    id: "ux-design",
    name: "UX/UI Design",
    keywords: [
      "ux design",
      "ui design",
      "user experience",
      "user interface",
      "figma",
      "wireframe",
      "prototype",
    ],
  },
  {
    id: "animation",
    name: "Animation",
    keywords: [
      "animation",
      "motion graphics",
      "after effects",
      "3d animation",
      "2d animation",
    ],
  },
  {
    id: "english-language",
    name: "English Language",
    keywords: ["english language", "english grammar", "ielts", "toefl", "esl"],
  },
  {
    id: "psychology",
    name: "Psychology",
    keywords: [
      "psychology",
      "cognitive psychology",
      "behavioral",
      "clinical psychology",
      "psychotherapy",
    ],
  },
  {
    id: "nutrition",
    name: "Nutrition",
    keywords: [
      "nutrition",
      "diet",
      "vitamins",
      "meal planning",
      "healthy eating",
    ],
  },
  {
    id: "public-health",
    name: "Public Health",
    keywords: ["public health", "epidemiology", "healthcare", "health policy"],
  },
  {
    id: "statistics",
    name: "Statistics",
    keywords: [
      "statistics",
      "probability",
      "hypothesis testing",
      "regression",
      "statistical analysis",
    ],
  },
  {
    id: "linear-algebra",
    name: "Linear Algebra",
    keywords: ["linear algebra", "matrix", "vector", "eigenvalue"],
  },
  {
    id: "calculus",
    name: "Calculus",
    keywords: ["calculus", "differential", "integral", "derivative", "limit"],
  },
  {
    id: "sociology",
    name: "Sociology",
    keywords: ["sociology", "social theory", "social structure", "society"],
  },
  {
    id: "political-science",
    name: "Political Science",
    keywords: [
      "political science",
      "government",
      "democracy",
      "political theory",
      "public policy",
    ],
  },
  {
    id: "law",
    name: "Law",
    keywords: [
      "law",
      "legal",
      "constitutional",
      "criminal law",
      "contract law",
      "court",
    ],
  },
  {
    id: "journalism",
    name: "Journalism",
    keywords: [
      "journalism",
      "news writing",
      "investigative",
      "media",
      "reporting",
    ],
  },
  {
    id: "content-creation",
    name: "Content Creation",
    keywords: [
      "content creation",
      "blogging",
      "vlogging",
      "youtube",
      "content strategy",
    ],
  },
  {
    id: "social-media",
    name: "Social Media Management",
    keywords: [
      "social media",
      "instagram",
      "tiktok",
      "twitter",
      "linkedin marketing",
    ],
  },
  {
    id: "public-speaking",
    name: "Public Speaking",
    keywords: [
      "public speaking",
      "presentation",
      "communication skills",
      "speech",
    ],
  },
  {
    id: "critical-thinking",
    name: "Critical Thinking",
    keywords: [
      "critical thinking",
      "problem solving",
      "analytical thinking",
      "reasoning",
    ],
  },
];

function inferTags(title: string, description: string | null): string[] {
  const text = `${title} ${description || ""}`.toLowerCase();
  const matched: string[] = [];

  for (const topic of TOPIC_KEYWORDS) {
    for (const keyword of topic.keywords) {
      if (text.includes(keyword.toLowerCase())) {
        matched.push(topic.id);
        break;
      }
    }
  }

  return matched.slice(0, 5);
}

async function main() {
  console.log("Backfilling course tags...");

  const allCourses = await db.query.courses.findMany({
    columns: { id: true, title: true, description: true, tags: true },
  });

  console.log(`Found ${allCourses.length} courses`);

  let updated = 0;
  let skipped = 0;

  for (const course of allCourses) {
    if (course.tags && course.tags.length > 0) {
      skipped++;
      continue;
    }

    const tags = inferTags(course.title, course.description);

    if (tags.length > 0) {
      await db
        .update(schema.courses)
        .set({ tags })
        .where(eq(schema.courses.id, course.id));
      console.log(`  [${course.title}] -> ${tags.join(", ")}`);
      updated++;
    } else {
      console.log(`  [${course.title}] -> no matching tags`);
      skipped++;
    }
  }

  console.log(`\nDone: ${updated} updated, ${skipped} skipped`);
}

main().catch(console.error);
