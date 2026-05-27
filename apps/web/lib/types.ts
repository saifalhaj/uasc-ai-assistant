export type Classification = 'restricted' | 'internal' | 'public';

export type SourceTier = 'authoritative' | 'reference' | 'external';

/** UI-facing document type shown in the upload form. Mapped to SourceTier internally. */
export type DocType = 'law-regulation' | 'sop' | 'report';

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

// ─── Insight Library ────────────────────────────────────────────────────────

export type DocExtension = 'PDF' | 'DOCX' | 'MD' | 'XLSX' | 'TXT';

export type DocStatus = 'indexed' | 'processing' | 'failed';

export interface UploaderInfo {
  name: string;
  clearance: string; // e.g. "L4 · OPS-LEAD"
}

export interface Document {
  id: string;                      // e.g. 'DOC-2941' or UUID
  title: string;
  extension: DocExtension;
  sizeBytes: number;
  pages?: number;
  classification: Classification;
  sourceTier: SourceTier;
  language: Language;
  tags: string[];
  uploader: UploaderInfo;
  uploadedAt: string;              // ISO 8601
  referenceCount: number;
  referenceHistory: number[];      // last 10 periods → sparkline bars
  lastReferencedAt: string | null;
  status: DocStatus;
}

export interface DocumentListResponse {
  documents: Document[];
  total: number;
}
