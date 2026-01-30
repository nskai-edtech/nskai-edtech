import { config } from "dotenv";
config({ path: ".env.local" });
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "../drizzle/schema";
import { eq } from "drizzle-orm";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

// Course categories and titles for realistic data
const courseCategories = [
  {
    category: "Web Development",
    courses: [
      "Complete React Developer Course",
      "Next.js 14 Masterclass",
      "Vue.js 3 Fundamentals",
      "Angular for Beginners",
      "Full Stack JavaScript Bootcamp",
      "Modern CSS and Tailwind",
      "HTML5 & Web APIs Deep Dive",
      "Progressive Web Apps (PWA)",
      "GraphQL with Apollo Client",
      "REST API Design Best Practices",
    ],
  },
  {
    category: "Backend Development",
    courses: [
      "Node.js Backend Masterclass",
      "Python Django Full Course",
      "Go Programming for Web",
      "Java Spring Boot Complete Guide",
      "Ruby on Rails Fundamentals",
      "Express.js REST APIs",
      "FastAPI Python Framework",
      "Microservices Architecture",
      "Database Design & SQL Mastery",
      "Redis Caching Strategies",
    ],
  },
  {
    category: "Data Science & ML",
    courses: [
      "Machine Learning A-Z",
      "Deep Learning with TensorFlow",
      "Python for Data Science",
      "Natural Language Processing",
      "Computer Vision with OpenCV",
      "Data Visualization with D3.js",
      "Statistics for Data Science",
      "Big Data with Apache Spark",
      "AI Prompt Engineering",
      "MLOps and Model Deployment",
    ],
  },
  {
    category: "Mobile Development",
    courses: [
      "React Native Complete Course",
      "Flutter Development Bootcamp",
      "iOS Development with Swift",
      "Android Kotlin Masterclass",
      "Cross-Platform Mobile Apps",
      "Mobile UI/UX Design",
      "Firebase for Mobile Apps",
      "Mobile App Security",
      "App Store Optimization",
      "Mobile Testing Automation",
    ],
  },
  {
    category: "DevOps & Cloud",
    courses: [
      "AWS Solutions Architect",
      "Docker & Kubernetes Mastery",
      "CI/CD Pipeline Design",
      "Terraform Infrastructure as Code",
      "Google Cloud Platform Essentials",
      "Azure Fundamentals",
      "Linux System Administration",
      "Monitoring with Prometheus",
      "GitOps with ArgoCD",
      "Cloud Security Best Practices",
    ],
  },
  {
    category: "Cybersecurity",
    courses: [
      "Ethical Hacking Complete Course",
      "Web Application Security",
      "Network Security Fundamentals",
      "Penetration Testing Bootcamp",
      "Secure Coding Practices",
      "Cryptography Essentials",
      "Security+ Certification Prep",
      "Incident Response & Forensics",
      "Zero Trust Architecture",
      "Cloud Security Masterclass",
    ],
  },
  {
    category: "UI/UX Design",
    courses: [
      "UX Design Fundamentals",
      "Figma Masterclass",
      "Design Systems Creation",
      "User Research Methods",
      "Prototyping with Framer",
      "Accessibility in Design",
      "Motion Design for UI",
      "Design Thinking Workshop",
      "Color Theory for Designers",
      "Typography Essentials",
    ],
  },
  {
    category: "Blockchain & Web3",
    courses: [
      "Solidity Smart Contracts",
      "Ethereum DApp Development",
      "NFT Marketplace Building",
      "DeFi Protocol Design",
      "Blockchain Architecture",
      "Web3.js Complete Guide",
      "Rust for Blockchain",
      "Layer 2 Solutions",
      "DAO Governance Systems",
      "Crypto Wallet Development",
    ],
  },
  {
    category: "Game Development",
    courses: [
      "Unity Game Development",
      "Unreal Engine 5 Masterclass",
      "Godot Engine Fundamentals",
      "Game Design Principles",
      "3D Modeling for Games",
      "Game Physics & Animation",
      "Multiplayer Game Systems",
      "Mobile Game Monetization",
      "VR Game Development",
      "Game AI Programming",
    ],
  },
  {
    category: "Career & Soft Skills",
    courses: [
      "Technical Interview Prep",
      "System Design for Interviews",
      "Building Your Portfolio",
      "Freelancing for Developers",
      "Tech Leadership Skills",
      "Communication for Engineers",
      "Agile & Scrum Mastery",
      "Remote Work Best Practices",
      "Open Source Contributing",
      "Personal Branding for Tech",
    ],
  },
];

// Unsplash course images
const courseImages = [
  "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=450&fit=crop",
  "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&h=450&fit=crop",
  "https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=800&h=450&fit=crop",
  "https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=800&h=450&fit=crop",
  "https://images.unsplash.com/photo-1587620962725-abab7fe55159?w=800&h=450&fit=crop",
  "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&h=450&fit=crop",
  "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&h=450&fit=crop",
  "https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=800&h=450&fit=crop",
  "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&h=450&fit=crop",
  "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=450&fit=crop",
];

// Generate course descriptions
function generateDescription(title: string, category: string): string {
  const intros = [
    `Master ${title.toLowerCase()} with this comprehensive course.`,
    `Learn everything you need to know about ${title.toLowerCase()}.`,
    `A complete guide to ${title.toLowerCase()} for all skill levels.`,
    `Deep dive into ${title.toLowerCase()} with hands-on projects.`,
    `Become proficient in ${title.toLowerCase()} with expert instruction.`,
  ];

  const middles = [
    `This course covers all essential concepts in ${category.toLowerCase()}, from basics to advanced techniques.`,
    `Perfect for developers looking to expand their ${category.toLowerCase()} skills.`,
    `Includes real-world projects and practical exercises.`,
    `Updated for 2024 with the latest industry best practices.`,
    `Join thousands of students who have transformed their careers.`,
  ];

  const endings = [
    "Certificate of completion included.",
    "Lifetime access to course materials.",
    "24/7 support from our expert instructors.",
    "Regular updates with new content.",
    "Community access for networking.",
  ];

  return `${intros[Math.floor(Math.random() * intros.length)]} ${middles[Math.floor(Math.random() * middles.length)]} ${endings[Math.floor(Math.random() * endings.length)]}`;
}

// Generate random price (5000 - 50000 Kobo = ₦50 - ₦500)
function generatePrice(): number {
  const prices = [
    5000, 7500, 10000, 15000, 20000, 25000, 30000, 35000, 40000, 45000, 50000,
  ];
  return prices[Math.floor(Math.random() * prices.length)];
}

async function seedCourses() {
  console.log("🌱 Starting course seed...");

  try {
    // Get all tutors to assign courses
    const tutors = await db.query.users.findMany({
      where: eq(schema.users.role, "TUTOR"),
    });

    if (tutors.length === 0) {
      console.log("❌ No tutors found! Please run seed-tutors.ts first.");
      process.exit(1);
    }

    console.log(`📚 Found ${tutors.length} tutors to assign courses to.\n`);

    let courseCount = 0;
    const allCourses: {
      title: string;
      description: string;
      tutorId: string;
      price: number;
      isPublished: boolean;
      imageUrl: string;
    }[] = [];

    // Generate 100 courses from our categories
    for (const categoryData of courseCategories) {
      for (const courseTitle of categoryData.courses) {
        const randomTutor = tutors[Math.floor(Math.random() * tutors.length)];
        const randomImage =
          courseImages[Math.floor(Math.random() * courseImages.length)];

        // 80% chance of being published
        const isPublished = Math.random() > 0.2;

        allCourses.push({
          title: courseTitle,
          description: generateDescription(courseTitle, categoryData.category),
          tutorId: randomTutor.id,
          price: generatePrice(),
          isPublished,
          imageUrl: randomImage,
        });

        courseCount++;
      }
    }

    console.log(`📝 Preparing to insert ${allCourses.length} courses...\n`);

    // Insert courses
    for (const course of allCourses) {
      await db.insert(schema.courses).values(course).onConflictDoNothing();
      console.log(`✅ Inserted: ${course.title}`);
    }

    // Summary
    const publishedCount = allCourses.filter((c) => c.isPublished).length;
    const draftCount = allCourses.filter((c) => !c.isPublished).length;

    console.log("\n🎉 Successfully seeded courses!");
    console.log(`   - Total: ${courseCount} courses`);
    console.log(`   - Published: ${publishedCount} courses`);
    console.log(`   - Drafts: ${draftCount} courses`);
    console.log(`   - Categories: ${courseCategories.length}`);
    console.log(
      `\n📄 Pagination: ${Math.ceil(courseCount / 20)} pages (20 per page)`,
    );
  } catch (error) {
    console.error("❌ Error seeding courses:", error);
    process.exit(1);
  }
}

seedCourses();
