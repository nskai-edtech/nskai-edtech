import { config } from "dotenv";
config({ path: ".env.local" });
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { users } from "../drizzle/schema";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

// Sample tutor data - 20 tutors with various statuses
// Using Unsplash professional headshot photos
const tutorData = [
  {
    clerkId: "tutor_seed_001",
    email: "john.smith@example.com",
    firstName: "John",
    lastName: "Smith",
    bio: "Senior software engineer with 10+ years of experience in full-stack development. Passionate about teaching React, Node.js, and system design.",
    expertise: "Full Stack Development",
    role: "TUTOR" as const,
    status: "ACTIVE" as const,
    imageUrl:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
  },
  {
    clerkId: "tutor_seed_002",
    email: "sarah.johnson@example.com",
    firstName: "Sarah",
    lastName: "Johnson",
    bio: "Data science expert specializing in machine learning and Python. Former Google engineer with a PhD in Computer Science.",
    expertise: "Data Science & ML",
    role: "TUTOR" as const,
    status: "ACTIVE" as const,
    imageUrl:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face",
  },
  {
    clerkId: "tutor_seed_003",
    email: "mike.chen@example.com",
    firstName: "Michael",
    lastName: "Chen",
    bio: "Frontend specialist with expertise in React, Vue, and modern CSS. Love creating beautiful, accessible user interfaces.",
    expertise: "Frontend Development",
    role: "TUTOR" as const,
    status: "PENDING" as const,
    imageUrl:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
  },
  {
    clerkId: "tutor_seed_004",
    email: "emily.davis@example.com",
    firstName: "Emily",
    lastName: "Davis",
    bio: "Cloud architecture expert with AWS and GCP certifications. Helping developers master cloud infrastructure and DevOps practices.",
    expertise: "Cloud & DevOps",
    role: "TUTOR" as const,
    status: "ACTIVE" as const,
    imageUrl:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
  },
  {
    clerkId: "tutor_seed_005",
    email: "david.wilson@example.com",
    firstName: "David",
    lastName: "Wilson",
    bio: "Mobile app developer with 8 years of experience in iOS and Android development using Swift and Kotlin.",
    expertise: "Mobile Development",
    role: "TUTOR" as const,
    status: "SUSPENDED" as const,
    imageUrl:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
  },
  {
    clerkId: "tutor_seed_006",
    email: "jessica.brown@example.com",
    firstName: "Jessica",
    lastName: "Brown",
    bio: "Cybersecurity specialist focused on ethical hacking and secure coding practices. Certified OSCP and CEH.",
    expertise: "Cybersecurity",
    role: "TUTOR" as const,
    status: "ACTIVE" as const,
    imageUrl:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face",
  },
  {
    clerkId: "tutor_seed_007",
    email: "robert.taylor@example.com",
    firstName: "Robert",
    lastName: "Taylor",
    bio: "Backend engineer specializing in distributed systems, microservices, and database optimization.",
    expertise: "Backend Development",
    role: "TUTOR" as const,
    status: "PENDING" as const,
    imageUrl:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face",
  },
  {
    clerkId: "tutor_seed_008",
    email: "amanda.martinez@example.com",
    firstName: "Amanda",
    lastName: "Martinez",
    bio: "UI/UX designer turned developer. Teaching the intersection of design and code with a focus on design systems.",
    expertise: "UI/UX Design",
    role: "TUTOR" as const,
    status: "ACTIVE" as const,
    imageUrl:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face",
  },
  {
    clerkId: "tutor_seed_009",
    email: "james.anderson@example.com",
    firstName: "James",
    lastName: "Anderson",
    bio: "Blockchain developer and Web3 enthusiast. Building decentralized applications with Solidity and Ethereum.",
    expertise: "Blockchain & Web3",
    role: "TUTOR" as const,
    status: "BANNED" as const,
    imageUrl:
      "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=150&h=150&fit=crop&crop=face",
  },
  {
    clerkId: "tutor_seed_010",
    email: "olivia.thomas@example.com",
    firstName: "Olivia",
    lastName: "Thomas",
    bio: "Game developer with experience in Unity and Unreal Engine. Teaching game design principles and C# programming.",
    expertise: "Game Development",
    role: "TUTOR" as const,
    status: "ACTIVE" as const,
    imageUrl:
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&h=150&fit=crop&crop=face",
  },
  {
    clerkId: "tutor_seed_011",
    email: "daniel.garcia@example.com",
    firstName: "Daniel",
    lastName: "Garcia",
    bio: "Database administrator and SQL expert. Specializing in PostgreSQL, MySQL, and database performance tuning.",
    expertise: "Database Administration",
    role: "TUTOR" as const,
    status: "ACTIVE" as const,
    imageUrl:
      "https://images.unsplash.com/photo-1463453091185-61582044d556?w=150&h=150&fit=crop&crop=face",
  },
  {
    clerkId: "tutor_seed_012",
    email: "sophia.lee@example.com",
    firstName: "Sophia",
    lastName: "Lee",
    bio: "AI researcher focused on natural language processing and computer vision. Making AI accessible to everyone.",
    expertise: "Artificial Intelligence",
    role: "TUTOR" as const,
    status: "PENDING" as const,
    imageUrl:
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop&crop=face",
  },
  {
    clerkId: "tutor_seed_013",
    email: "chris.wright@example.com",
    firstName: "Christopher",
    lastName: "Wright",
    bio: "Python instructor with a passion for clean code and test-driven development. Author of multiple programming courses.",
    expertise: "Python Programming",
    role: "TUTOR" as const,
    status: "ACTIVE" as const,
    imageUrl:
      "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&h=150&fit=crop&crop=face",
  },
  {
    clerkId: "tutor_seed_014",
    email: "megan.hall@example.com",
    firstName: "Megan",
    lastName: "Hall",
    bio: "JavaScript expert covering everything from vanilla JS to modern frameworks. Building the next generation of web developers.",
    expertise: "JavaScript & TypeScript",
    role: "TUTOR" as const,
    status: "ACTIVE" as const,
    imageUrl:
      "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&h=150&fit=crop&crop=face",
  },
  {
    clerkId: "tutor_seed_015",
    email: "kevin.adams@example.com",
    firstName: "Kevin",
    lastName: "Adams",
    bio: "DevOps engineer with expertise in CI/CD pipelines, Docker, and Kubernetes. Automating everything!",
    expertise: "DevOps & CI/CD",
    role: "TUTOR" as const,
    status: "SUSPENDED" as const,
    imageUrl:
      "https://images.unsplash.com/photo-1542178243-bc20204b769f?w=150&h=150&fit=crop&crop=face",
  },
  {
    clerkId: "tutor_seed_016",
    email: "rachel.nelson@example.com",
    firstName: "Rachel",
    lastName: "Nelson",
    bio: "Technical writer and documentation specialist. Teaching developers how to communicate effectively through docs.",
    expertise: "Technical Writing",
    role: "TUTOR" as const,
    status: "ACTIVE" as const,
    imageUrl:
      "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150&h=150&fit=crop&crop=face",
  },
  {
    clerkId: "tutor_seed_017",
    email: "brian.carter@example.com",
    firstName: "Brian",
    lastName: "Carter",
    bio: "Embedded systems engineer working with IoT devices and low-level programming in C and Rust.",
    expertise: "Embedded Systems",
    role: "TUTOR" as const,
    status: "PENDING" as const,
    imageUrl:
      "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&h=150&fit=crop&crop=face",
  },
  {
    clerkId: "tutor_seed_018",
    email: "lisa.mitchell@example.com",
    firstName: "Lisa",
    lastName: "Mitchell",
    bio: "Product manager turned developer advocate. Teaching the soft skills needed to succeed in tech.",
    expertise: "Product Management",
    role: "TUTOR" as const,
    status: "ACTIVE" as const,
    imageUrl:
      "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=150&h=150&fit=crop&crop=face",
  },
  {
    clerkId: "tutor_seed_019",
    email: "steven.perez@example.com",
    firstName: "Steven",
    lastName: "Perez",
    bio: "Software architect with 15 years of experience. Specializing in scalable system design and architectural patterns.",
    expertise: "System Architecture",
    role: "TUTOR" as const,
    status: "ACTIVE" as const,
    imageUrl:
      "https://images.unsplash.com/photo-1504257432389-52343af06ae3?w=150&h=150&fit=crop&crop=face",
  },
  {
    clerkId: "tutor_seed_020",
    email: "jennifer.roberts@example.com",
    firstName: "Jennifer",
    lastName: "Roberts",
    bio: "QA engineer and testing expert. Teaching automated testing, TDD, and quality assurance best practices.",
    expertise: "QA & Testing",
    role: "TUTOR" as const,
    status: "ACTIVE" as const,
    imageUrl:
      "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=150&h=150&fit=crop&crop=face",
  },
];

async function seedTutors() {
  console.log("🌱 Starting tutor seed...");

  try {
    for (const tutor of tutorData) {
      await db.insert(users).values(tutor).onConflictDoNothing();
      console.log(`✅ Inserted tutor: ${tutor.firstName} ${tutor.lastName}`);
    }

    console.log("\n🎉 Successfully seeded 20 tutors!");
    console.log("   - 12 ACTIVE tutors");
    console.log("   - 4 PENDING tutors");
    console.log("   - 2 SUSPENDED tutors");
    console.log("   - 1 BANNED tutor");
  } catch (error) {
    console.error("❌ Error seeding tutors:", error);
    process.exit(1);
  }
}

seedTutors();
