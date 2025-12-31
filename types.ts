
export enum RiskLevel {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High'
}

export type ScamCategory = 
  | 'Banking Fraud' 
  | 'Prize/Lottery' 
  | 'Government/Tax' 
  | 'Job/Investment' 
  | 'Delivery/Package' 
  | 'Impersonation' 
  | 'Phishing' 
  | 'Safe/Legitimate'
  | 'Other';

export interface AnalysisResult {
  riskLevel: RiskLevel;
  confidence: number;
  category: ScamCategory;
  summary: string;
  redFlags: string[];
  psychologicalTactics: string[];
  recommendedActions: string[];
  safeReply: string | null;
  doNotDo: string[];
  timestamp?: number;
  originalMessage?: string;
  isImage?: boolean;
}

export interface SampleMessage {
  id: string;
  label: string;
  text: string;
}

export type Language = 'en' | 'hi';
