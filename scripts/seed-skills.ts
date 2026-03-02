import { config } from "dotenv";
config({ path: ".env.local" });
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "../drizzle/schema";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

// ─── Skills by Category ───
const SKILLS_DATA = [
  // ──────── Technology ────────
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
  {
    category: "Cybersecurity",
    skills: [
      { title: "Network Security Fundamentals", description: "Firewalls, encryption, threat detection" },
      { title: "Ethical Hacking", description: "Penetration testing, vulnerability assessment" },
    ],
  },
  {
    category: "Artificial Intelligence",
    skills: [
      { title: "Deep Learning", description: "Neural networks, CNNs, RNNs, transformers" },
      { title: "Natural Language Processing", description: "Text analysis, sentiment, chatbots, LLMs" },
      { title: "Computer Vision", description: "Image recognition, object detection, OCR" },
    ],
  },

  // ──────── Business & Finance ────────
  {
    category: "Business & Finance",
    skills: [
      { title: "Financial Literacy", description: "Budgeting, investing, personal finance management" },
      { title: "Accounting Fundamentals", description: "Bookkeeping, financial statements, auditing" },
      { title: "Entrepreneurship", description: "Business planning, startup strategy, fundraising" },
      { title: "Digital Marketing", description: "SEO, social media marketing, email campaigns, analytics" },
      { title: "Project Management", description: "Agile, Scrum, Kanban, stakeholder management" },
      { title: "Leadership & Management", description: "Team building, delegation, conflict resolution" },
      { title: "Business Analytics", description: "Data-driven decisions, KPIs, dashboards" },
      { title: "E-Commerce", description: "Online stores, payment systems, dropshipping" },
      { title: "Supply Chain Management", description: "Logistics, inventory, procurement" },
      { title: "Real Estate Basics", description: "Property investing, valuation, market analysis" },
    ],
  },

  // ──────── Sciences ────────
  {
    category: "Sciences",
    skills: [
      { title: "Biology Fundamentals", description: "Cell biology, genetics, ecology, evolution" },
      { title: "Chemistry Basics", description: "Atomic structure, reactions, organic chemistry" },
      { title: "Physics Principles", description: "Mechanics, thermodynamics, electromagnetism" },
      { title: "Environmental Science", description: "Climate change, ecosystems, sustainability" },
      { title: "Neuroscience Basics", description: "Brain function, cognition, behavior" },
      { title: "Astronomy & Astrophysics", description: "Stars, galaxies, cosmology, space exploration" },
    ],
  },

  // ──────── Arts & Humanities ────────
  {
    category: "Arts & Humanities",
    skills: [
      { title: "Creative Writing", description: "Fiction, poetry, screenwriting, narrative craft" },
      { title: "Philosophy & Ethics", description: "Logic, critical reasoning, moral philosophy" },
      { title: "Art History", description: "Major movements, prominent artists, visual analysis" },
      { title: "Music Theory", description: "Scales, harmony, rhythm, composition" },
      { title: "Film Studies", description: "Cinema analysis, directing, storytelling techniques" },
      { title: "Photography", description: "Composition, lighting, editing, visual storytelling" },
      { title: "Graphic Design", description: "Typography, layout, branding, visual identity" },
      { title: "UX/UI Design", description: "User research, wireframing, prototyping, usability" },
      { title: "Animation & Motion Graphics", description: "2D/3D animation, motion design, storyboarding" },
      { title: "Music Production", description: "DAWs, mixing, mastering, sound design" },
    ],
  },

  // ──────── Languages ────────
  {
    category: "Languages",
    skills: [
      { title: "English Language", description: "Grammar, vocabulary, reading, writing proficiency" },
      { title: "Spanish Language", description: "Conversational and written Spanish" },
      { title: "French Language", description: "Conversational and written French" },
      { title: "Mandarin Chinese", description: "Characters, tones, conversational Mandarin" },
      { title: "Arabic Language", description: "Script, grammar, conversational Arabic" },
      { title: "German Language", description: "Grammar, vocabulary, conversational German" },
      { title: "Japanese Language", description: "Hiragana, katakana, kanji, conversational Japanese" },
      { title: "Portuguese Language", description: "Brazilian & European Portuguese" },
      { title: "Korean Language", description: "Hangul, grammar, conversational Korean" },
    ],
  },

  // ──────── Health & Wellness ────────
  {
    category: "Health & Wellness",
    skills: [
      { title: "Nutrition & Dietetics", description: "Macros, meal planning, dietary science" },
      { title: "Psychology Fundamentals", description: "Cognitive, behavioral, and developmental psychology" },
      { title: "Mental Health & Wellbeing", description: "Stress management, mindfulness, resilience" },
      { title: "Public Health", description: "Epidemiology, health policy, community health" },
      { title: "Fitness & Exercise Science", description: "Training principles, kinesiology, program design" },
      { title: "First Aid & Emergency Care", description: "CPR, wound care, emergency response" },
    ],
  },

  // ──────── Mathematics ────────
  {
    category: "Mathematics",
    skills: [
      { title: "Algebra & Calculus", description: "Functions, derivatives, integrals, limits" },
      { title: "Linear Algebra", description: "Vectors, matrices, transformations" },
      { title: "Discrete Mathematics", description: "Logic, sets, combinatorics, graph theory" },
      { title: "Applied Statistics", description: "Regression, probability distributions, inference" },
    ],
  },

  // ──────── Social Sciences ────────
  {
    category: "Social Sciences",
    skills: [
      { title: "Sociology", description: "Social structures, culture, inequality, institutions" },
      { title: "Political Science", description: "Government systems, policy analysis, international relations" },
      { title: "Economics", description: "Micro and macroeconomics, market dynamics, trade" },
      { title: "Law & Legal Studies", description: "Legal systems, contracts, constitutional law" },
      { title: "Anthropology", description: "Cultural anthropology, human evolution, ethnography" },
      { title: "Geography", description: "Physical and human geography, GIS, cartography" },
    ],
  },

  // ──────── Engineering ────────
  {
    category: "Engineering",
    skills: [
      { title: "Mechanical Engineering", description: "Thermodynamics, mechanics, materials science" },
      { title: "Electrical Engineering", description: "Circuits, electronics, signal processing" },
      { title: "Civil Engineering", description: "Structural analysis, construction, geotechnics" },
      { title: "Aerospace Engineering", description: "Aerodynamics, propulsion, spacecraft design" },
      { title: "Biomedical Engineering", description: "Medical devices, biomechanics, biocompatibility" },
    ],
  },

  // ──────── Media & Communication ────────
  {
    category: "Media & Communication",
    skills: [
      { title: "Journalism", description: "Reporting, investigative journalism, media ethics" },
      { title: "Public Speaking", description: "Presentation skills, rhetoric, audience engagement" },
      { title: "Content Creation", description: "Blogging, video production, podcasting" },
      { title: "Social Media Strategy", description: "Platform management, engagement, analytics" },
      { title: "Public Relations", description: "Brand reputation, crisis communication, media relations" },
    ],
  },

  // ──────── Education ────────
  {
    category: "Education",
    skills: [
      { title: "Curriculum Design", description: "Learning objectives, assessment design, pedagogy" },
      { title: "Educational Technology", description: "EdTech tools, LMS, online learning design" },
      { title: "Teaching & Instruction", description: "Classroom management, differentiated instruction" },
    ],
  },

  // ──────── Personal Development ────────
  {
    category: "Personal Development",
    skills: [
      { title: "Critical Thinking", description: "Logical reasoning, analysis, problem solving" },
      { title: "Emotional Intelligence", description: "Self-awareness, empathy, relationship management" },
      { title: "Time Management & Productivity", description: "Goal setting, prioritization, focus techniques" },
      { title: "Networking & Communication", description: "Professional relationships, negotiation, collaboration" },
    ],
  },

  // ──────── Sustainability ────────
  {
    category: "Sustainability",
    skills: [
      { title: "Renewable Energy", description: "Solar, wind, hydro, energy storage systems" },
      { title: "Sustainable Agriculture", description: "Organic farming, permaculture, food systems" },
      { title: "Conservation & Ecology", description: "Biodiversity, wildlife management, habitat restoration" },
    ],
  },

  // ──────── Trades & Vocational ────────
  {
    category: "Trades & Vocational",
    skills: [
      { title: "Culinary Arts", description: "Cooking techniques, baking, food safety, cuisine styles" },
      { title: "Fashion & Textile Design", description: "Pattern making, sewing, fashion illustration" },
      { title: "Carpentry & Woodworking", description: "Joinery, furniture making, hand & power tools" },
      { title: "Automotive Basics", description: "Vehicle maintenance, engines, diagnostics" },
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

  // ─── Business & Finance ───
  "Financial Literacy": [
    {
      questionText: "What is compound interest?",
      options: [
        "Interest calculated only on the principal",
        "Interest calculated on both principal and accumulated interest",
        "A fixed-rate loan",
        "A type of bond",
      ],
      correctOption: 1,
      difficulty: "BEGINNER",
    },
    {
      questionText: "What is diversification in investing?",
      options: [
        "Putting all money in one stock",
        "Spreading investments across different assets to reduce risk",
        "Only investing in real estate",
        "Day trading",
      ],
      correctOption: 1,
      difficulty: "INTERMEDIATE",
    },
  ],
  "Accounting Fundamentals": [
    {
      questionText: "What does a balance sheet show?",
      options: [
        "Revenue and expenses over a period",
        "Assets, liabilities, and equity at a point in time",
        "Cash inflows and outflows",
        "Employee salaries",
      ],
      correctOption: 1,
      difficulty: "BEGINNER",
    },
    {
      questionText: "What is the accounting equation?",
      options: [
        "Revenue - Expenses = Profit",
        "Assets = Liabilities + Equity",
        "Cash In - Cash Out = Balance",
        "Income + Expenses = Revenue",
      ],
      correctOption: 1,
      difficulty: "BEGINNER",
    },
  ],
  "Digital Marketing": [
    {
      questionText: "What does SEO stand for?",
      options: [
        "Social Engagement Optimization",
        "Search Engine Optimization",
        "Sales Enhancement Online",
        "Site Efficiency Operations",
      ],
      correctOption: 1,
      difficulty: "BEGINNER",
    },
    {
      questionText: "What is a conversion rate?",
      options: [
        "The bounce rate of a website",
        "The percentage of visitors who complete a desired action",
        "The number of ad impressions",
        "The speed of a website",
      ],
      correctOption: 1,
      difficulty: "INTERMEDIATE",
    },
  ],
  "Project Management": [
    {
      questionText: "What is a Gantt chart used for?",
      options: [
        "Tracking budgets",
        "Visualizing project schedules and task timelines",
        "Measuring customer satisfaction",
        "Writing user stories",
      ],
      correctOption: 1,
      difficulty: "BEGINNER",
    },
    {
      questionText: "In Agile, what is a sprint?",
      options: [
        "A year-long planning cycle",
        "A short, time-boxed period to complete a set of work",
        "A type of software bug",
        "A final release review",
      ],
      correctOption: 1,
      difficulty: "BEGINNER",
    },
  ],
  "Entrepreneurship": [
    {
      questionText: "What is an MVP in startup context?",
      options: [
        "Most Valuable Player",
        "Minimum Viable Product",
        "Maximum Venture Potential",
        "Market Validated Plan",
      ],
      correctOption: 1,
      difficulty: "BEGINNER",
    },
  ],

  // ─── Sciences ───
  "Biology Fundamentals": [
    {
      questionText: "What is the basic unit of life?",
      options: ["Atom", "Molecule", "Cell", "Organ"],
      correctOption: 2,
      difficulty: "BEGINNER",
    },
    {
      questionText: "What molecule carries genetic information?",
      options: ["RNA", "DNA", "Protein", "Lipid"],
      correctOption: 1,
      difficulty: "BEGINNER",
    },
  ],
  "Chemistry Basics": [
    {
      questionText: "What is the chemical formula for water?",
      options: ["CO2", "H2O", "NaCl", "O2"],
      correctOption: 1,
      difficulty: "BEGINNER",
    },
    {
      questionText: "What does pH measure?",
      options: [
        "Temperature",
        "Acidity or alkalinity of a solution",
        "Density",
        "Electrical conductivity",
      ],
      correctOption: 1,
      difficulty: "BEGINNER",
    },
  ],
  "Physics Principles": [
    {
      questionText: "What is Newton's first law of motion?",
      options: [
        "Force equals mass times acceleration",
        "An object at rest stays at rest unless acted upon by a force",
        "Every action has an equal and opposite reaction",
        "Energy cannot be created or destroyed",
      ],
      correctOption: 1,
      difficulty: "BEGINNER",
    },
    {
      questionText: "What is the SI unit of force?",
      options: ["Watt", "Joule", "Newton", "Pascal"],
      correctOption: 2,
      difficulty: "BEGINNER",
    },
  ],
  "Environmental Science": [
    {
      questionText: "What is the greenhouse effect?",
      options: [
        "Growing plants in greenhouses",
        "Trapping of heat in Earth's atmosphere by greenhouse gases",
        "The cooling of the atmosphere",
        "Photosynthesis",
      ],
      correctOption: 1,
      difficulty: "BEGINNER",
    },
  ],

  // ─── Arts & Humanities ───
  "Creative Writing": [
    {
      questionText: "What is the 'point of view' in writing?",
      options: [
        "The story's main plot",
        "The perspective from which a story is told",
        "The setting of the story",
        "The climax of the narrative",
      ],
      correctOption: 1,
      difficulty: "BEGINNER",
    },
  ],
  "Philosophy & Ethics": [
    {
      questionText: "What is the Socratic method?",
      options: [
        "Lecturing students",
        "Asking a series of questions to stimulate critical thinking",
        "Writing essays",
        "Memorizing facts",
      ],
      correctOption: 1,
      difficulty: "BEGINNER",
    },
  ],
  "Music Theory": [
    {
      questionText: "How many notes are in a standard octave?",
      options: ["7", "8", "12", "10"],
      correctOption: 2,
      difficulty: "BEGINNER",
    },
    {
      questionText: "What is a chord?",
      options: [
        "A single note played loudly",
        "Two or more notes played simultaneously",
        "A rhythm pattern",
        "A musical key",
      ],
      correctOption: 1,
      difficulty: "BEGINNER",
    },
  ],
  "Graphic Design": [
    {
      questionText: "What does CMYK stand for?",
      options: [
        "Computer-Made Yellow Keys",
        "Cyan, Magenta, Yellow, Key (Black)",
        "Color, Mix, Yield, Kindle",
        "Creative Media Yield Kit",
      ],
      correctOption: 1,
      difficulty: "BEGINNER",
    },
  ],
  "UX/UI Design": [
    {
      questionText: "What is a wireframe?",
      options: [
        "A finished design mockup",
        "A basic structural blueprint of a page or screen",
        "A type of animation",
        "A coding framework",
      ],
      correctOption: 1,
      difficulty: "BEGINNER",
    },
    {
      questionText: "What does 'user persona' mean in UX?",
      options: [
        "An actual user interview",
        "A fictional representation of a target user based on research",
        "The login screen",
        "A color palette",
      ],
      correctOption: 1,
      difficulty: "INTERMEDIATE",
    },
  ],

  // ─── Languages ───
  "English Language": [
    {
      questionText: "What is a synonym?",
      options: [
        "A word with the opposite meaning",
        "A word with a similar meaning",
        "A word that sounds the same",
        "A word with multiple meanings",
      ],
      correctOption: 1,
      difficulty: "BEGINNER",
    },
  ],
  "Spanish Language": [
    {
      questionText: "What does 'Hola' mean in English?",
      options: ["Goodbye", "Hello", "Thank you", "Please"],
      correctOption: 1,
      difficulty: "BEGINNER",
    },
  ],

  // ─── Health & Wellness ───
  "Nutrition & Dietetics": [
    {
      questionText: "Which macronutrient provides the most energy per gram?",
      options: ["Carbohydrates", "Protein", "Fat", "Fiber"],
      correctOption: 2,
      difficulty: "BEGINNER",
    },
    {
      questionText: "What is a calorie?",
      options: [
        "A type of vitamin",
        "A unit of energy",
        "A mineral",
        "A hormone",
      ],
      correctOption: 1,
      difficulty: "BEGINNER",
    },
  ],
  "Psychology Fundamentals": [
    {
      questionText: "Who is considered the father of psychoanalysis?",
      options: ["Carl Jung", "B.F. Skinner", "Sigmund Freud", "Ivan Pavlov"],
      correctOption: 2,
      difficulty: "BEGINNER",
    },
    {
      questionText: "What is classical conditioning?",
      options: [
        "Learning through rewards",
        "Associating a stimulus with a response through repeated pairing",
        "Self-reflection",
        "Group therapy",
      ],
      correctOption: 1,
      difficulty: "INTERMEDIATE",
    },
  ],
  "Mental Health & Wellbeing": [
    {
      questionText: "What is mindfulness?",
      options: [
        "Multi-tasking efficiently",
        "Paying attention to the present moment without judgment",
        "Memorization technique",
        "A type of medication",
      ],
      correctOption: 1,
      difficulty: "BEGINNER",
    },
  ],

  // ─── Mathematics ───
  "Algebra & Calculus": [
    {
      questionText: "What is a derivative in calculus?",
      options: [
        "The area under a curve",
        "The rate of change of a function",
        "A type of equation",
        "The sum of a series",
      ],
      correctOption: 1,
      difficulty: "INTERMEDIATE",
    },
  ],
  "Linear Algebra": [
    {
      questionText: "What is a matrix?",
      options: [
        "A single number",
        "A rectangular array of numbers",
        "A type of graph",
        "A geometry formula",
      ],
      correctOption: 1,
      difficulty: "BEGINNER",
    },
  ],

  // ─── Social Sciences ───
  "Economics": [
    {
      questionText: "What is supply and demand?",
      options: [
        "A government regulation",
        "The relationship between how much of a good is available and how much people want it",
        "A type of tax",
        "A stock market indicator",
      ],
      correctOption: 1,
      difficulty: "BEGINNER",
    },
  ],
  "Law & Legal Studies": [
    {
      questionText: "What is a contract?",
      options: [
        "A verbal promise",
        "A legally binding agreement between parties",
        "A court order",
        "A type of law",
      ],
      correctOption: 1,
      difficulty: "BEGINNER",
    },
  ],

  // ─── Media & Communication ───
  "Public Speaking": [
    {
      questionText: "What is the 'rule of three' in public speaking?",
      options: [
        "Always speak for three minutes",
        "Presenting ideas in groups of three for impact and memorability",
        "Using three slides",
        "Speaking to three people",
      ],
      correctOption: 1,
      difficulty: "BEGINNER",
    },
  ],
  "Content Creation": [
    {
      questionText: "What is a content calendar?",
      options: [
        "A calendar app",
        "A schedule that plans when and where content will be published",
        "A social media feed",
        "A video editing timeline",
      ],
      correctOption: 1,
      difficulty: "BEGINNER",
    },
  ],

  // ─── Personal Development ───
  "Critical Thinking": [
    {
      questionText: "What is a logical fallacy?",
      options: [
        "A correct argument",
        "An error in reasoning that undermines the logic of an argument",
        "A scientific theory",
        "A type of evidence",
      ],
      correctOption: 1,
      difficulty: "BEGINNER",
    },
  ],
  "Emotional Intelligence": [
    {
      questionText: "What is empathy?",
      options: [
        "Feeling sorry for someone",
        "The ability to understand and share the feelings of others",
        "Being always optimistic",
        "Ignoring other people's emotions",
      ],
      correctOption: 1,
      difficulty: "BEGINNER",
    },
  ],

  // ─── Sustainability ───
  "Renewable Energy": [
    {
      questionText: "Which of these is a renewable energy source?",
      options: ["Coal", "Natural Gas", "Solar", "Oil"],
      correctOption: 2,
      difficulty: "BEGINNER",
    },
  ],

  // ─── Trades & Vocational ───
  "Culinary Arts": [
    {
      questionText: "What is 'mise en place'?",
      options: [
        "A type of dessert",
        "Having all ingredients measured and prepared before cooking",
        "A plating technique",
        "A French restaurant",
      ],
      correctOption: 1,
      difficulty: "BEGINNER",
    },
  ],
};

// ─── Dependencies ───
const DEPENDENCIES: [string, string][] = [
  // Tech
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
  ["Deep Learning", "Machine Learning Basics"],
  ["Natural Language Processing", "Deep Learning"],
  ["Computer Vision", "Deep Learning"],
  ["Ethical Hacking", "Network Security Fundamentals"],
  // Sciences
  ["Neuroscience Basics", "Biology Fundamentals"],
  ["Environmental Science", "Chemistry Basics"],
  // Business
  ["Business Analytics", "Financial Literacy"],
  ["E-Commerce", "Digital Marketing"],
  ["Supply Chain Management", "Project Management"],
  // Math
  ["Applied Statistics", "Algebra & Calculus"],
  ["Linear Algebra", "Algebra & Calculus"],
  // Engineering
  ["Aerospace Engineering", "Physics Principles"],
  ["Biomedical Engineering", "Biology Fundamentals"],
  // Sustainability
  ["Renewable Energy", "Environmental Science"],
  ["Conservation & Ecology", "Environmental Science"],
  // Education
  ["Educational Technology", "Curriculum Design"],
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
