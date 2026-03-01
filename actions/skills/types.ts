// --- Skill Types ---

export interface Skill {
  id: string;
  title: string;
  category: string;
  description: string | null;
  createdAt: Date;
}

export interface SkillWithCounts extends Skill {
  questionCount: number;
  userCount: number;
}

export interface SkillDependency {
  id: string;
  skillId: string;
  prerequisiteSkillId: string;
  prerequisiteTitle?: string;
  prerequisiteCategory?: string;
}

export interface SkillDetail extends Skill {
  prerequisites: {
    id: string;
    prerequisiteSkillId: string;
    title: string;
    category: string;
  }[];
  dependents: {
    id: string;
    skillId: string;
    title: string;
    category: string;
  }[];
  questionCount: number;
}

// --- Assessment Types ---

export interface AssessmentQuestion {
  id: string;
  skillId: string;
  questionText: string;
  options: string[];
  correctOption: number;
  difficulty: string | null;
  createdAt: Date;
}

export interface AssessmentQuestionLearner {
  id: string;
  skillId: string;
  questionText: string;
  options: string[];
  difficulty: string | null;
}

// --- User Skill Types ---

export interface UserSkillProfile {
  id: string;
  skillId: string;
  skillTitle: string;
  skillCategory: string;
  masteryScore: number;
  lastAssessedAt: Date | null;
}

export interface SkillGap {
  skillId: string;
  skillTitle: string;
  skillCategory: string;
  masteryScore: number;
  courses: {
    courseId: string;
    courseTitle: string;
    courseImageUrl: string | null;
  }[];
}

// --- Diagnostic Types ---

export interface DiagnosticResult {
  skillId: string;
  skillTitle: string;
  skillCategory: string;
  correct: number;
  total: number;
  masteryScore: number;
  previousScore: number | null;
}

export interface DiagnosticSubmission {
  results: DiagnosticResult[];
  totalCorrect: number;
  totalQuestions: number;
  overallScore: number;
  xpAwarded: number;
}
