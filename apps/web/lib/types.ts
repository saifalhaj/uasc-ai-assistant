export type Classification = 'restricted' | 'internal' | 'public';

export type SourceTier = 'authoritative' | 'reference' | 'external';

export type Risk = 'low' | 'elevated' | 'high';

export type EscalationFlag = 'none' | 'flagged' | 'escalated';

export type Language = 'en' | 'ar' | 'bilingual';

export interface Citation {
  n: number;
  title: string;
  classification: Classification;
  sourceTier: SourceTier;
  issuedAt: string;
  excerpt: string;
  excerptIsArabic?: boolean;
  docId: string;
}

export interface AnswerEnvelopeData {
  body: string;
  citations: Citation[];
  confidence: number;
  recency: string;
  recencyHealth: 'green' | 'amber' | 'red';
  risk: Risk;
  escalation: EscalationFlag;
  limitations: string;
  spatial?: boolean;
}

export interface User {
  name: string;
  clearance: string;
}

export interface Crumb {
  label: string;
  href?: string;
}
