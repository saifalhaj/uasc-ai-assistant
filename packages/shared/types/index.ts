export type Classification = "public" | "internal" | "restricted";
export type SourceTier = "authoritative" | "vetted" | "open";
export type Language = "en" | "ar" | "mixed";
export type RiskLevel = "low" | "medium" | "high";

export interface Citation {
  chunk_id: string;
  classification: Classification;
  source_tier: SourceTier;
  language: Language;
  link: string;
  text_excerpt: string;
  page_or_section?: string;
  source_name: string;
}

export interface AnswerEnvelope {
  answer: string;
  citations: Citation[];
  confidence: number;
  recency: string;
  risk_level: RiskLevel;
  escalation_flag: boolean;
  limitations: string[];
  session_id?: string;
}

export interface ChatSession {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface ChatTurn {
  question: string;
  envelope: AnswerEnvelope;
}

export interface ChatThread {
  session: ChatSession;
  turns: ChatTurn[];
}

export interface DocumentMetadata {
  title: string;
  classification: Classification;
  source_tier: SourceTier;
  language: Language;
  tags: string[];
}

export interface UploadResponse {
  document_id: string;
  status: "queued" | "indexing" | "indexed" | "error";
  message: string;
  chunk_count?: number;
}

export interface ChatRequest {
  question: string;
  top_k?: number;
  session_id?: string;
}

export interface IndexingStatus {
  document_id: string;
  status: "queued" | "indexing" | "indexed" | "error";
  chunk_count?: number;
  error?: string;
}
