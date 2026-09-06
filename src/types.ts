export interface SiteColors {
  gold: string;
  goldSoft: string;
  ember: string;
  ink: string;
  card: string;
}

export interface SiteConfig {
  header: {
    siteName: string;
    subtitle: string;
    badgeText: string;
  };
  hero: {
    verse: string;
    description: string;
  };
  upload: {
    mainText: string;
    subText: string;
    extractBtnText: string;
    summaryBtnText: string;
    questionBtnText: string;
  };
  footer: {
    ownerName: string;
    requireAuth: boolean;
  };
  ads: {
    enabled: boolean;
    adSenseId: string;
  };
  colors: SiteColors;
}

export interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}

export interface Flashcard {
  id: number;
  question: string;
  answer: string;
  tag?: string;
}

export interface SummaryLog {
  id: string;
  studentName: string;
  studentEmail?: string;
  documentName: string;
  fileType?: string;
  date: string;
  timestamp: number;
  excerpt: string;
  summary: string;
  questions: Question[];
  flashcards: Flashcard[];
}

export interface StudentAccount {
  id: string;
  name: string;
  email: string;
  registrationDate: string;
  lastActive: string;
  operationsCount: number;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}

export type SummaryLanguage = 'ar' | 'en' | 'bilingual';

export type InternetSpeed = 'ultra' | 'stable' | 'saver';
