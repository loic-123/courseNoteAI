// Quiz/QCM Types
export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correct_answer: number; // Index (0-based)
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
  topic: string;
}

export interface QuizMetadata {
  total_questions: number;
  estimated_time_minutes: number;
  passing_score_percentage: number;
}

export interface QCMData {
  questions: QuizQuestion[];
  metadata: QuizMetadata;
}

// Generation Types
export type TechnicalLevel = 'beginner' | 'intermediate' | 'advanced';
export type Length = 'short' | 'medium' | 'long';
export type Language = 'en' | 'fr';

export interface GenerationParams {
  file: File;
  claudeApiKey: string;
  institutionId: string;
  courseId?: string;
  courseCode?: string;
  courseName?: string;
  moduleId?: string;
  moduleName?: string;
  creatorName: string;
  detailLevel: number; // 1-10
  useMetaphors: boolean;
  technicalLevel: TechnicalLevel;
  length: Length;
  language: Language;
}

// Course with institutions for API response
interface CourseWithInstitutions {
  id: string;
  code: string;
  name: string;
  institutions?: {
    id: string;
    name: string;
    short_name: string;
  } | {
    id: string;
    name: string;
    short_name: string;
  }[];
}

// Note Types - matches API response structure
export interface Note {
  id: string;
  title: string;
  // API returns 'courses' with nested 'institutions'
  courses?: CourseWithInstitutions | CourseWithInstitutions[];
  // Transformed fields for client use
  course?: {
    id: string;
    code: string;
    name: string;
  };
  institution?: {
    id: string;
    name: string;
    short_name: string;
  };
  module?: {
    id: string;
    name: string;
  } | null;
  creator_name: string;
  language: Language;
  notes_markdown: string;
  qcm_json: QCMData;
  visual_prompt: string;
  visual_image_url: string | null;
  upvotes: number;
  downvotes: number;
  views_count: number;
  created_at: string;
  updated_at: string;
}

// Institution & Course Types
export interface Institution {
  id: string;
  name: string;
  short_name: string;
}

export interface Course {
  id: string;
  institution_id: string;
  code: string;
  name: string;
  description?: string | null;
  notes_count?: number;
}

export interface Module {
  id: string;
  course_id: string;
  name: string;
  description?: string | null;
  order_index: number;
}

// API Response Types
export interface GenerateResponse {
  success: boolean;
  noteId: string;
  notesMarkdown: string;
  qcmJson: QCMData;
  visualUrl: string | null;
}

export interface NotesListResponse {
  notes: Note[];
  total: number;
  limit: number;
  offset: number;
}

export interface VoteResponse {
  success: boolean;
  upvotes: number;
  downvotes: number;
}
