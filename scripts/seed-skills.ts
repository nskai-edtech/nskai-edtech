import { config } from "dotenv";
config({ path: ".env.local" });
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "../drizzle/schema";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

// ─── Skills by Category ───
const SKILLS_DATA = [
  {
    category: "Web Development",
    skills: [
      { title: "HTML & CSS Fundamentals", description: "Core web markup and styling" },
      { title: "JavaScript Basics", description: "Variables, functions, DOM manipulation" },
      { title: "React Fundamentals", description: "Components, hooks, state management" },
      { title: "Next.js & SSR", description: "Server-side rendering, app router, data fetching" },
      { title: "CSS Frameworks", description: "Tailwind CSS, Bootstrap, responsive design" },
    ],
  },
  {
    category: "Backend Development",
    skills: [
      { title: "Node.js & Express", description: "Server-side JavaScript, REST APIs" },
      { title: "SQL & Databases", description: "Relational databases, queries, schema design" },
      { title: "API Design", description: "REST principles, authentication, versioning" },
      { title: "Python Backend", description: "Django, FastAPI, Flask" },
    ],
  },
  {
    category: "Data Science",
    skills: [
      { title: "Python for Data Science", description: "NumPy, pandas, matplotlib" },
      { title: "Statistics & Probability", description: "Distributions, hypothesis testing, regression" },
      { title: "Machine Learning Basics", description: "Supervised & unsupervised learning" },
      { title: "Data Visualization", description: "Creating effective charts and dashboards" },
    ],
  },
  {
    category: "DevOps & Cloud",
    skills: [
      { title: "Git & Version Control", description: "Branching, merging, collaboration workflows" },
      { title: "Docker & Containers", description: "Image creation, docker-compose, registries" },
      { title: "CI/CD Pipelines", description: "Automated testing and deployment" },
      { title: "Cloud Platforms", description: "AWS, GCP, Azure fundamentals" },
    ],
  },
  {
    category: "Mobile Development",
    skills: [
      { title: "React Native", description: "Cross-platform mobile development with React" },
      { title: "iOS Basics (Swift)", description: "Swift programming, UIKit, SwiftUI" },
      { title: "Mobile UI/UX", description: "Touch interactions, responsive layout, accessibility" },
    ],
  },
];

// ─── Question Templates per Skill ───
type QuestionSeed = {
  questionText: string;
  options: string[];
  correctOption: number;
  difficulty: string;
};

const QUESTION_MAP: Record<string, QuestionSeed[]> = {
  "HTML & CSS Fundamentals": [
    {
      questionText: "Which HTML element is used to define a hyperlink?",
      options: ["<link>", "<a>", "<href>", "<url>"],
      correctOption: 1,
      difficulty: "BEGINNER",
    },
    {
      questionText: "What does the CSS property 'display: flex' do?",
      options: [
        "Makes text bold",
        "Creates a flexible box layout",
        "Hides the element",
        "Makes the element fixed",
      ],
      correctOption: 1,
      difficulty: "BEGINNER",
    },
    {
      questionText: "Which CSS unit is relative to the viewport width?",
      options: ["px", "em", "vw", "rem"],
      correctOption: 2,
      difficulty: "INTERMEDIATE",
    },
    {
      questionText: "What is the CSS specificity order (highest to lowest)?",
      options: [
        "Class > ID > Element",
        "ID > Class > Element",
        "Element > Class > ID",
        "ID > Element > Class",
      ],
      correctOption: 1,
      difficulty: "INTERMEDIATE",
    },
    {
      questionText: "Which pseudo-element is used to style the first line of a block?",
      options: ["::first-line", "::before", ":first-child", "::first-letter"],
      correctOption: 0,
      difficulty: "ADVANCED",
    },
  ],
  "JavaScript Basics": [
    {
      questionText: "What keyword declares a block-scoped variable in JavaScript?",
      options: ["var", "let", "define", "dim"],
      correctOption: 1,
      difficulty: "BEGINNER",
    },
    {
      questionText: "What does '===' check in JavaScript?",
      options: [
        "Value equality only",
        "Type equality only",
        "Value and type equality",
        "Reference equality",
      ],
      correctOption: 2,
      difficulty: "BEGINNER",
    },
    {
      questionText: "Which array method returns a new array with transformed elements?",
      options: ["forEach", "filter", "map", "reduce"],
      correctOption: 2,
      difficulty: "INTERMEDIATE",
    },
    {
      questionText: "What is a closure in JavaScript?",
      options: [
        "A way to close the browser window",
        "A function that retains access to its outer scope",
        "A type of loop",
        "A method to end a promise",
      ],
      correctOption: 1,
      difficulty: "INTERMEDIATE",
    },
    {
      questionText: "What does the 'async' keyword do before a function?",
      options: [
        "Makes it run faster",
        "Makes it return a Promise",
        "Makes it synchronous",
        "Makes it a generator",
      ],
      correctOption: 1,
      difficulty: "ADVANCED",
    },
  ],
  "React Fundamentals": [
    {
      questionText: "What hook is used to manage state in a functional component?",
      options: ["useEffect", "useState", "useRef", "useMemo"],
      correctOption: 1,
      difficulty: "BEGINNER",
    },
    {
      questionText: "What is JSX?",
      options: [
        "A database query language",
        "A JavaScript syntax extension for writing UI",
        "A CSS preprocessor",
        "A testing framework",
      ],
      correctOption: 1,
      difficulty: "BEGINNER",
    },
    {
      questionText: "When does useEffect run with an empty dependency array?",
      options: [
        "On every render",
        "Only on mount",
        "Only on unmount",
        "Never",
      ],
      correctOption: 1,
      difficulty: "INTERMEDIATE",
    },
    {
      questionText: "What is the purpose of React.memo?",
      options: [
        "To create memos in the app",
        "To memoize a component to prevent unnecessary re-renders",
        "To store data in localStorage",
        "To define global state",
      ],
      correctOption: 1,
      difficulty: "ADVANCED",
    },
  ],
  "Next.js & SSR": [
    {
      questionText: "What is the default rendering strategy in Next.js App Router?",
      options: [
        "Client-side rendering",
        "Server-side rendering",
        "Static generation",
        "Incremental regeneration",
      ],
      correctOption: 1,
      difficulty: "BEGINNER",
    },
    {
      questionText: "Which file defines a route in Next.js App Router?",
      options: ["index.js", "route.ts", "page.tsx", "_app.tsx"],
      correctOption: 2,
      difficulty: "BEGINNER",
    },
    {
      questionText: "What directive marks a component as client-side in Next.js?",
      options: ["'use server'", "'use client'", "'use browser'", "'use csr'"],
      correctOption: 1,
      difficulty: "INTERMEDIATE",
    },
  ],
  "Node.js & Express": [
    {
      questionText: "What is middleware in Express.js?",
      options: [
        "A database driver",
        "A function that processes requests before they reach routes",
        "A CSS framework",
        "A testing tool",
      ],
      correctOption: 1,
      difficulty: "BEGINNER",
    },
    {
      questionText: "Which module is used for file operations in Node.js?",
      options: ["http", "fs", "path", "url"],
      correctOption: 1,
      difficulty: "BEGINNER",
    },
    {
      questionText: "What does 'npm init' do?",
      options: [
        "Installs all packages",
        "Creates a package.json file",
        "Starts the server",
        "Runs tests",
      ],
      correctOption: 1,
      difficulty: "BEGINNER",
    },
  ],
  "SQL & Databases": [
    {
      questionText: "Which SQL keyword is used to retrieve data from a database?",
      options: ["GET", "FETCH", "SELECT", "RETRIEVE"],
      correctOption: 2,
      difficulty: "BEGINNER",
    },
    {
      questionText: "What is a PRIMARY KEY?",
      options: [
        "The first column in a table",
        "A unique identifier for each row",
        "A foreign key reference",
        "An index",
      ],
      correctOption: 1,
      difficulty: "BEGINNER",
    },
    {
      questionText: "Which JOIN returns rows that have matching values in both tables?",
      options: ["LEFT JOIN", "RIGHT JOIN", "INNER JOIN", "CROSS JOIN"],
      correctOption: 2,
      difficulty: "INTERMEDIATE",
    },
    {
      questionText: "What is database normalization?",
      options: [
        "Making the database faster",
        "Organizing data to reduce redundancy",
        "Adding more indexes",
        "Encrypting data",
      ],
      correctOption: 1,
      difficulty: "INTERMEDIATE",
    },
  ],
  "Git & Version Control": [
    {
      questionText: "Which command creates a new Git branch?",
      options: ["git new", "git branch", "git create", "git init"],
      correctOption: 1,
      difficulty: "BEGINNER",
    },
    {
      questionText: "What does 'git merge' do?",
      options: [
        "Deletes a branch",
        "Combines changes from two branches",
        "Creates a new repository",
        "Pushes code to remote",
      ],
      correctOption: 1,
      difficulty: "BEGINNER",
    },
    {
      questionText: "What is a Git rebase?",
      options: [
        "Deleting commit history",
        "Replaying commits on top of another base",
        "Creating a new branch",
        "Undoing a merge",
      ],
      correctOption: 1,
      difficulty: "INTERMEDIATE",
    },
  ],
  "Python for Data Science": [
    {
      questionText: "Which Python library is primarily used for data manipulation?",
      options: ["NumPy", "pandas", "matplotlib", "scikit-learn"],
      correctOption: 1,
      difficulty: "BEGINNER",
    },
    {
      questionText: "What is a DataFrame in pandas?",
      options: [
        "A chart type",
        "A 2D labeled data structure",
        "A type of loop",
        "A database connection",
      ],
      correctOption: 1,
      difficulty: "BEGINNER",
    },
    {
      questionText: "Which function is used to read a CSV file in pandas?",
      options: ["pd.open_csv()", "pd.read_csv()", "pd.load()", "pd.import_csv()"],
      correctOption: 1,
      difficulty: "BEGINNER",
    },
  ],
  "Statistics & Probability": [
    {
      questionText: "What does the mean of a dataset represent?",
      options: ["Most frequent value", "Middle value", "Average value", "Range"],
      correctOption: 2,
      difficulty: "BEGINNER",
    },
    {
      questionText: "What is a normal distribution?",
      options: [
        "A flat distribution",
        "A bell-shaped symmetric distribution",
        "A skewed distribution",
        "A binary distribution",
      ],
      correctOption: 1,
      difficulty: "INTERMEDIATE",
    },
  ],
  "Docker & Containers": [
    {
      questionText: "What is a Docker container?",
      options: [
        "A virtual machine",
        "A lightweight isolated environment for running applications",
        "A database",
        "A code editor",
      ],
      correctOption: 1,
      difficulty: "BEGINNER",
    },
    {
      questionText: "What file defines a Docker image's build instructions?",
      options: ["docker-compose.yml", "Dockerfile", "package.json", ".dockerignore"],
      correctOption: 1,
      difficulty: "BEGINNER",
    },
  ],
  "React Native": [
    {
      questionText: "What language does React Native use?",
      options: ["Swift", "Kotlin", "JavaScript/TypeScript", "Dart"],
      correctOption: 2,
      difficulty: "BEGINNER",
    },
    {
      questionText: "Which component is used for scrollable lists in React Native?",
      options: ["ScrollView", "ListView", "FlatList", "TableView"],
      correctOption: 2,
      difficulty: "INTERMEDIATE",
    },
  ],
};

// ─── Dependencies ───
const DEPENDENCIES: [string, string][] = [
  ["React Fundamentals", "HTML & CSS Fundamentals"],
  ["React Fundamentals", "JavaScript Basics"],
  ["Next.js & SSR", "React Fundamentals"],
  ["React Native", "React Fundamentals"],
  ["Node.js & Express", "JavaScript Basics"],
  ["API Design", "Node.js & Express"],
  ["Machine Learning Basics", "Python for Data Science"],
  ["Machine Learning Basics", "Statistics & Probability"],
  ["CI/CD Pipelines", "Git & Version Control"],
  ["CI/CD Pipelines", "Docker & Containers"],
  ["Cloud Platforms", "Docker & Containers"],
];

async function seed() {
  console.log("🌱 Seeding skills...");

  // Track created skill IDs by title
  const skillIdMap: Record<string, string> = {};

  // 1. Create skills
  for (const category of SKILLS_DATA) {
    for (const skill of category.skills) {
      // Upsert - check if exists first
      const existing = await db.query.skills.findFirst({
        where: (s, { eq }) => eq(s.title, skill.title),
      });

      if (existing) {
        skillIdMap[skill.title] = existing.id;
        console.log(`  ↩ Skill exists: ${skill.title}`);
      } else {
        const [created] = await db
          .insert(schema.skills)
          .values({
            title: skill.title,
            category: category.category,
            description: skill.description,
          })
          .returning({ id: schema.skills.id });
        skillIdMap[skill.title] = created.id;
        console.log(`  ✅ Created skill: ${skill.title}`);
      }
    }
  }

  // 2. Create dependencies
  console.log("\n🔗 Seeding skill dependencies...");
  for (const [skillTitle, prereqTitle] of DEPENDENCIES) {
    const skillId = skillIdMap[skillTitle];
    const prereqId = skillIdMap[prereqTitle];
    if (!skillId || !prereqId) {
      console.log(`  ⚠ Skipping dep: ${skillTitle} → ${prereqTitle} (missing skill)`);
      continue;
    }

    const existing = await db.query.skillDependencies.findFirst({
      where: (sd, { and, eq }) =>
        and(eq(sd.skillId, skillId), eq(sd.prerequisiteSkillId, prereqId)),
    });

    if (!existing) {
      await db.insert(schema.skillDependencies).values({
        skillId,
        prerequisiteSkillId: prereqId,
      });
      console.log(`  ✅ ${skillTitle} depends on ${prereqTitle}`);
    } else {
      console.log(`  ↩ Dependency exists: ${skillTitle} → ${prereqTitle}`);
    }
  }

  // 3. Create assessment questions
  console.log("\n📝 Seeding assessment questions...");
  let totalQuestions = 0;
  for (const [skillTitle, questions] of Object.entries(QUESTION_MAP)) {
    const skillId = skillIdMap[skillTitle];
    if (!skillId) {
      console.log(`  ⚠ No skill found for: ${skillTitle}`);
      continue;
    }

    for (const q of questions) {
      // Check if question already exists (by text match)
      const existing = await db.query.assessments.findFirst({
        where: (a, { and, eq }) =>
          and(eq(a.skillId, skillId), eq(a.questionText, q.questionText)),
      });

      if (!existing) {
        await db.insert(schema.assessments).values({
          skillId,
          questionText: q.questionText,
          options: q.options,
          correctOption: q.correctOption,
          difficulty: q.difficulty,
        });
        totalQuestions++;
      }
    }
    console.log(`  ✅ ${skillTitle}: ${questions.length} questions`);
  }

  console.log(
    `\n🎉 Seeding complete! Created ${Object.keys(skillIdMap).length} skills, ${DEPENDENCIES.length} deps, ${totalQuestions} questions.`,
  );
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ Seed error:", err);
    process.exit(1);
  });
