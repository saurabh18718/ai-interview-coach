export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  education: string;
  degree: string;
  skills: string;
  workExperience: string;
  currentRole: string;
  targetRole: string;
  experienceLevel: "Entry-Level" | "Mid-Level" | "Senior" | "Staff / Principal" | "Engineering Lead";
  careerGoals: string;
  preferredInterviewType: "Technical" | "Behavioral" | "System Design" | "HR & Cultural" | "Mixed Comprehensive";
  targetCompany?: string;
  avatarUrl?: string;
  onboardingCompleted?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface InterviewConfig {
  targetRole: string;
  company: string;
  experienceLevel: string;
  interviewType: string;
  difficulty: "Easy" | "Medium" | "Hard" | "Executive / FAANG";
  durationMinutes: number;
  totalQuestions: number;
  topics?: string;
  focusArea?: string;
}

export interface InterviewMessage {
  id: string;
  sender: "ai" | "user";
  text: string;
  timestamp: string;
  questionNumber?: number;
  interimFeedback?: string;
}

export interface QuestionCritique {
  question: string;
  candidateAnswer: string;
  score: number;
  critique: string;
  betterAnswerExample: string;
}

export interface InterviewEvaluation {
  overallScore: number;
  technicalScore: number;
  communicationScore: number;
  problemSolvingScore: number;
  verdict: string;
  summary: string;
  strengths: string[];
  weaknesses: string[];
  improvements: string[];
  questionBreakdown: QuestionCritique[];
  recommendedStudyTopics: { topic: string; reason: string }[];
}

export interface InterviewSession {
  id: string;
  userId: string;
  config: InterviewConfig;
  status: "in_progress" | "paused" | "completed";
  currentQuestionIndex: number;
  messages: InterviewMessage[];
  currentQuestionText?: string;
  elapsedSeconds: number;
  evaluation?: InterviewEvaluation;
  createdAt: string;
  updatedAt: string;
}

export interface PracticeQuestionItem {
  id: string;
  category: "Technical" | "Behavioral" | "System Design" | "HR" | "Coding" | "Leadership";
  role: string;
  difficulty: "Easy" | "Medium" | "Hard";
  question: string;
  hints: string[];
  evaluationCriteria?: string;
}

export interface PracticeEvaluationResult {
  score: number;
  feedback: string;
  strengths: string[];
  improvements: string[];
  idealAnswer: string;
}

export interface StudyTopic {
  id: string;
  title: string;
  category: string;
  targetRole: string;
  summary: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  estimatedMinutes: number;
  keyPoints: string[];
  practicePrompt: string;
}

export interface BookChapter {
  id: string;
  title: string;
  summary: string;
  content: string[];
  actionItems: string[];
}

export interface DigitalBook {
  id: string;
  title: string;
  subtitle: string;
  author: string;
  category: string;
  coverColor: string;
  readTime: string;
  chapters: BookChapter[];
}

export interface BlogPost {
  id: string;
  title: string;
  snippet: string;
  category: "Strategy" | "Technical" | "Behavioral" | "System Design" | "Career";
  author: string;
  date: string;
  readTime: string;
  content: string[];
  tags: string[];
}

export interface BookmarkItem {
  id: string;
  userId: string;
  itemType: "book" | "blog" | "topic";
  itemId: string;
  title: string;
  subtitle?: string;
  createdAt: string;
}
