import type { ToolType } from "./supabase";

// ---- Error Decoder ----
export interface ErrorExplanation {
  summary: string;
  errorType: string;
  plainEnglish: string;
  likelyCauses: string[];
  suggestedFix: string;
  codeSnippet: string;
  language: string;
  prevention: string[];
}

// ---- Project Planner ----
export interface ProjectPlan {
  projectTitle: string;
  summary: string;
  features: { name: string; description: string; priority: "High" | "Medium" | "Low" }[];
  techStack: { category: string; recommendation: string; reason: string }[];
  milestones: { name: string; duration: string; tasks: string[] }[];
  fileStructure: string[];
  nextSteps: string[];
}

// ---- Code Review ----
export interface CodeReview {
  overallScore: number;
  summary: string;
  bugs: { severity: "High" | "Medium" | "Low"; description: string; line?: string; suggestion: string }[];
  readability: { issue: string; suggestion: string }[];
  bestPractices: { practice: string; status: "Good" | "Needs Work"; note: string }[];
  improvements: string[];
  refactoredCode?: string;
}

// ---- Doc Generator ----
export interface GeneratedDocs {
  title: string;
  description: string;
  installation: string;
  usage: string;
  functions: { name: string; description: string; params: { name: string; type: string; description: string }[]; returns: string; example: string }[];
  codeStructure: string;
  dependencies: string[];
  notes: string[];
}

export type AnalysisResult = ErrorExplanation | ProjectPlan | CodeReview | GeneratedDocs;

export interface AnalysisRequest {
  tool: ToolType;
  input: string;
}

export const TOOL_LABELS: Record<ToolType, string> = {
  error_decoder: "Error Decoder",
  project_planner: "Project Planner",
  code_review: "Code Review",
  doc_generator: "Doc Generator",
};
