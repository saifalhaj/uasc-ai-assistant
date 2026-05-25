"use client";

import { useState } from "react";
import type { AnswerEnvelope, Citation } from "@uasc/shared";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const CLASSIFICATION_BADGE: Record<string, string> = {
  public: "bg-uasc-card text-uasc-sub border-uasc-border",
  internal: "bg-uasc-card text-uasc-sub border-uasc-border",
  restricted: "bg-uasc-border text-uasc-text border-uasc-border",
};

const TIER_BADGE: Record<string, string> = {
  authoritative: "bg-uasc-card text-uasc-text",
  vetted: "bg-uasc-card text-uasc-sub",
  open: "bg-uasc-card text-uasc-muted",
};

const RISK_BADGE: Record<string, string> = {
  low: "bg-uasc-card text-uasc-muted",
  medium: "bg-uasc-border text-uasc-sub",
  high: "bg-uasc-border text-uasc-text",
};

function CitationCard({ citation, index }: { citation: Citation; index: number }) {
  return (
    <div className="border border-uasc-border bg-uasc-card rounded p-3 space-y-2 text-sm">
      <div className="flex items-start justify-between gap-2">
        <span className="font-medium text-uasc-text text-xs truncate">{citation.source_name}</span>
        <span className="text-xs text-uasc-muted shrink-0">#{index + 1}</span>
      </div>
      <div className="flex flex-wrap gap-1">
        <span className={`text-xs px-2 py-0.5 rounded border font-medium ${CLASSIFICATION_BADGE[citation.classification] || "bg-uasc-card text-uasc-muted border-uasc-border"}`}>
          {citation.classification}
        </span>
        <span className={`text-xs px-2 py-0.5 rounded font-medium ${TIER_BADGE[citation.source_tier] || "bg-uasc-card text-uasc-muted"}`}>
          {citation.source_tier}
        </span>
        <span className="text-xs px-2 py-0.5 rounded bg-uasc-border text-uasc-muted">
          {citation.language}
        </span>
        {citation.page_or_section && (
          <span className="text-xs px-2 py-0.5 rounded bg-uasc-border text-uasc-muted">
            {citation.page_or_section}
          </span>
        )}
      </div>
      <p className="text-uasc-muted text-xs leading-relaxed line-clamp-3">{citation.text_excerpt}</p>
      {citation.link && (
        <a
          href={citation.link}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-uasc-sub underline hover:text-uasc-text"
        >
          View source
        </a>
      )}
    </div>
  );
}

export default function ChatPage() {
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnswerEnvelope | null>(null);
  const [error, setError] = useState<string>("");

  const ask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch(`${API_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: question.trim(), top_k: 5 }),
      });

      if (!res.ok) {
        const detail = await res.json();
        throw new Error(detail.detail || `HTTP ${res.status}`);
      }

      const data: AnswerEnvelope = await res.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message || "Request failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-xl font-semibold text-uasc-text tracking-wide">Ask the UASC Agent</h1>

      <form onSubmit={ask} className="flex gap-3">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask in English or Arabic..."
          dir="auto"
          disabled={loading}
          className="flex-1 bg-uasc-card border border-uasc-border text-uasc-text placeholder-uasc-muted rounded px-4 py-2.5 text-sm focus:outline-none focus:border-uasc-sub disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={loading || !question.trim()}
          className="px-6 py-2.5 bg-uasc-text text-uasc-bg rounded font-medium text-sm hover:opacity-90 transition disabled:opacity-30 disabled:cursor-not-allowed shrink-0"
        >
          {loading ? "Thinking..." : "Ask"}
        </button>
      </form>

      {error && (
        <div className="bg-uasc-card border border-uasc-border text-uasc-sub text-sm rounded px-4 py-3">
          {error}
        </div>
      )}

      {result && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Answer panel */}
          <div className="lg:col-span-2 space-y-4">
            {/* Status bar */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className={`px-2 py-0.5 rounded text-xs font-medium ${RISK_BADGE[result.risk_level] || "bg-uasc-card text-uasc-muted"}`}>
                Risk: {result.risk_level}
              </span>
              <span className="bg-uasc-card text-uasc-muted text-xs px-2 py-0.5 rounded">
                Confidence: {(result.confidence * 100).toFixed(0)}%
              </span>
              {result.escalation_flag && (
                <span className="bg-red-100 text-red-700 border border-red-200 px-2 py-0.5 rounded-full font-semibold">
                  RESTRICTED SOURCE
                </span>
              )}
            </div>

            {/* Answer text */}
            <div className="bg-uasc-card border border-uasc-border rounded p-5">
              <p className="text-uasc-text leading-relaxed whitespace-pre-wrap" dir="auto">
                {result.answer}
              </p>
            </div>

            {/* Limitations */}
            {result.limitations.length > 0 && (
              <div className="bg-uasc-card border border-uasc-border rounded px-4 py-3 text-sm text-uasc-sub space-y-1">
                <p className="font-semibold">Limitations</p>
                <ul className="list-disc list-inside space-y-0.5">
                  {result.limitations.map((l, i) => (
                    <li key={i}>{l}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Citations panel */}
          <div className="space-y-3">
            <h2 className="text-xs font-semibold text-uasc-sub uppercase tracking-widest">
              Sources ({result.citations.length})
            </h2>
            {result.citations.length === 0 ? (
              <p className="text-sm text-uasc-muted">No sources retrieved.</p>
            ) : (
              result.citations.map((c, i) => (
                <CitationCard key={c.chunk_id} citation={c} index={i} />
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
