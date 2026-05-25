"use client";

import { useState } from "react";
import type { AnswerEnvelope, Citation } from "@uasc/shared";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const CLASSIFICATION_BADGE: Record<string, string> = {
  public: "bg-green-900 text-green-300 border-green-700",
  internal: "bg-yellow-900 text-yellow-300 border-yellow-700",
  restricted: "bg-red-900 text-red-300 border-red-700",
};

const TIER_BADGE: Record<string, string> = {
  authoritative: "bg-blue-900 text-blue-300",
  vetted: "bg-indigo-900 text-indigo-300",
  open: "bg-slate-700 text-slate-300",
};

const RISK_BADGE: Record<string, string> = {
  low: "bg-green-900 text-green-300",
  medium: "bg-yellow-900 text-yellow-300",
  high: "bg-red-900 text-red-300",
};

function CitationCard({ citation, index }: { citation: Citation; index: number }) {
  return (
    <div className="border border-uasc-border bg-uasc-card rounded-lg p-3 space-y-2 text-sm">
      <div className="flex items-start justify-between gap-2">
        <span className="font-medium text-uasc-gold truncate">{citation.source_name}</span>
        <span className="text-xs text-slate-500 shrink-0">#{index + 1}</span>
      </div>
      <div className="flex flex-wrap gap-1">
        <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${CLASSIFICATION_BADGE[citation.classification] || "bg-slate-700 text-slate-300 border-slate-600"}`}>
          {citation.classification}
        </span>
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${TIER_BADGE[citation.source_tier] || "bg-slate-700 text-slate-300"}`}>
          {citation.source_tier}
        </span>
        <span className="text-xs px-2 py-0.5 rounded-full bg-slate-700 text-slate-300">
          {citation.language}
        </span>
        {citation.page_or_section && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-slate-700 text-slate-300">
            {citation.page_or_section}
          </span>
        )}
      </div>
      <p className="text-slate-400 text-xs leading-relaxed line-clamp-3">{citation.text_excerpt}</p>
      {citation.link && (
        <a
          href={citation.link}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-uasc-gold underline hover:brightness-110"
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
      <h1 className="text-2xl font-bold text-white">Ask the UASC Agent</h1>

      <form onSubmit={ask} className="flex gap-3">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask in English or Arabic..."
          dir="auto"
          disabled={loading}
          className="flex-1 bg-slate-800 border border-slate-600 text-slate-100 placeholder-slate-500 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-uasc-gold outline-none disabled:bg-slate-900 disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={loading || !question.trim()}
          className="px-6 py-2.5 bg-uasc-gold text-uasc-dark rounded-lg font-medium hover:brightness-110 transition disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
        >
          {loading ? "Thinking..." : "Ask"}
        </button>
      </form>

      {error && (
        <div className="bg-red-950 border border-red-800 text-red-400 text-sm rounded-lg px-4 py-3">
          {error}
        </div>
      )}

      {result && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Answer panel */}
          <div className="lg:col-span-2 space-y-4">
            {/* Status bar */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className={`px-2 py-0.5 rounded-full font-medium ${RISK_BADGE[result.risk_level] || "bg-slate-700 text-slate-300"}`}>
                Risk: {result.risk_level}
              </span>
              <span className="bg-slate-700 text-slate-300 px-2 py-0.5 rounded-full">
                Confidence: {(result.confidence * 100).toFixed(0)}%
              </span>
              {result.escalation_flag && (
                <span className="bg-red-100 text-red-700 border border-red-200 px-2 py-0.5 rounded-full font-semibold">
                  RESTRICTED SOURCE
                </span>
              )}
            </div>

            {/* Answer text */}
            <div className="bg-uasc-card rounded-xl border border-uasc-border p-5">
              <p className="text-slate-100 leading-relaxed whitespace-pre-wrap" dir="auto">
                {result.answer}
              </p>
            </div>

            {/* Limitations */}
            {result.limitations.length > 0 && (
              <div className="bg-amber-950 border border-amber-800 rounded-lg px-4 py-3 text-sm text-amber-400 space-y-1">
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
            <h2 className="text-sm font-semibold text-slate-300">
              Sources ({result.citations.length})
            </h2>
            {result.citations.length === 0 ? (
              <p className="text-sm text-slate-500">No sources retrieved.</p>
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
