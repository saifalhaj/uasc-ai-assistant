"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import type { AnswerEnvelope, Citation } from "@uasc/shared";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const CLASSIFICATION_BADGE: Record<string, string> = {
  public:     "bg-uasc-card text-uasc-sub border-uasc-border",
  internal:   "bg-uasc-card text-uasc-sub border-uasc-border",
  restricted: "bg-uasc-border text-uasc-text border-uasc-border",
};

const TIER_BADGE: Record<string, string> = {
  authoritative: "bg-uasc-card text-uasc-text",
  vetted:        "bg-uasc-card text-uasc-sub",
  open:          "bg-uasc-card text-uasc-muted",
};

const RISK_BADGE: Record<string, string> = {
  low:    "bg-uasc-card text-uasc-muted",
  medium: "bg-uasc-border text-uasc-sub",
  high:   "bg-uasc-border text-uasc-text",
};

function CitationCard({ citation, index }: { citation: Citation; index: number }) {
  return (
    <div className="border border-uasc-border bg-uasc-card rounded-lg p-3 space-y-2">
      <div className="flex items-start justify-between gap-2">
        <span className="font-medium text-uasc-text text-xs truncate">{citation.source_name}</span>
        <span className="text-[10px] text-uasc-muted shrink-0 tabular-nums">#{index + 1}</span>
      </div>
      <div className="flex flex-wrap gap-1">
        <span className={`text-[10px] px-1.5 py-0.5 rounded border font-medium ${CLASSIFICATION_BADGE[citation.classification] || "bg-uasc-card text-uasc-muted border-uasc-border"}`}>
          {citation.classification}
        </span>
        <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${TIER_BADGE[citation.source_tier] || "bg-uasc-card text-uasc-muted"}`}>
          {citation.source_tier}
        </span>
        <span className="text-[10px] px-1.5 py-0.5 rounded bg-uasc-border text-uasc-muted">
          {citation.language}
        </span>
        {citation.page_or_section && (
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-uasc-border text-uasc-muted">
            {citation.page_or_section}
          </span>
        )}
      </div>
      <p className="text-uasc-muted text-[11px] leading-relaxed line-clamp-3">{citation.text_excerpt}</p>
      {citation.link && (
        <a href={citation.link} target="_blank" rel="noopener noreferrer"
           className="text-[11px] text-uasc-sub underline hover:text-uasc-text transition-colors">
          View source
        </a>
      )}
    </div>
  );
}

function InputBar({
  question, loading, textareaRef, onChange, onKeyDown, onSubmit,
}: {
  question: string; loading: boolean;
  textareaRef: React.RefObject<HTMLTextAreaElement>;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
}) {
  return (
    <form onSubmit={onSubmit} className="w-full">
      <div className="relative flex items-end gap-3 rounded-2xl px-4 py-3"
           style={{ background: "rgba(7,10,15,0.85)", border: "1px solid rgba(196,212,228,0.1)" }}>
        <textarea
          ref={textareaRef}
          value={question}
          onChange={onChange}
          onKeyDown={onKeyDown}
          placeholder="Ask in English or Arabic…"
          dir="auto"
          rows={1}
          disabled={loading}
          className="flex-1 bg-transparent text-uasc-text placeholder:text-uasc-muted resize-none focus:outline-none text-sm leading-6 py-0.5 min-h-[24px] max-h-40 disabled:opacity-50"
          style={{ scrollbarWidth: "none" }}
        />
        <button
          type="submit"
          disabled={loading || !question.trim()}
          className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-150 disabled:opacity-25 disabled:cursor-not-allowed"
          style={{
            background: question.trim() && !loading ? "rgba(196,212,228,0.12)" : "transparent",
            border: "1px solid rgba(196,212,228,0.15)",
          }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M7 11V3M3 7l4-4 4 4" stroke="#C4D4E4" strokeWidth="1.4"
                  strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
      <p className="text-center text-[9px] tracking-[0.18em] uppercase text-uasc-muted mt-2 opacity-50">
        Enter to send · Shift+Enter for new line
      </p>
    </form>
  );
}

export default function ChatPage() {
  const [question, setQuestion] = useState("");
  const [submitted, setSubmitted] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnswerEnvelope | null>(null);
  const [error, setError] = useState<string>("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const autoResize = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 160) + "px";
  };

  const handleSubmit = async () => {
    if (!question.trim() || loading) return;
    const q = question.trim();
    setSubmitted(q);
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await fetch(`${API_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q, top_k: 5 }),
      });
      if (!res.ok) {
        const detail = await res.json();
        throw new Error(detail.detail || `HTTP ${res.status}`);
      }
      setResult(await res.json());
    } catch (err: any) {
      setError(err.message || "Request failed");
    } finally {
      setLoading(false);
    }
  };

  const onFormSubmit = (e: React.FormEvent) => { e.preventDefault(); handleSubmit(); };
  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSubmit(); }
  };
  const onChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setQuestion(e.target.value); autoResize();
  };

  const showWelcome = !result && !loading && !error;

  const inputProps = { question, loading, textareaRef, onChange, onKeyDown, onSubmit: onFormSubmit };

  return (
    <div className="flex flex-col" style={{ height: "calc(100vh - 52px)" }}>

      {/* ── Welcome: logo + label + input, all centred on screen ── */}
      {showWelcome && (
        <div className="flex-1 flex flex-col items-center justify-center px-6"
             style={{ paddingBottom: "14vh" }}>
          <Image
            src="/UASCLogoWhite.png"
            alt="UASC"
            width={148}
            height={148}
            unoptimized
            className="opacity-88 mb-6"
          />
          <p className="text-[11px] tracking-[0.22em] uppercase text-uasc-sub mb-10">
            UASC Operational Intelligence Assistant
          </p>
          <div className="w-full max-w-2xl">
            <InputBar {...inputProps} />
          </div>
        </div>
      )}

      {/* ── Active state: scrollable results, input pinned to bottom ── */}
      {!showWelcome && (
        <>
          <div className="flex-1 overflow-y-auto px-6">

            {/* Loading */}
            {loading && (
              <div className="flex flex-col items-center justify-center min-h-[360px] gap-4">
                <Image src="/UASCLogoWhite.png" alt="UASC" width={52} height={52}
                       unoptimized className="opacity-55" />
                <div className="flex items-center gap-2 text-uasc-sub">
                  <span className="w-1.5 h-1.5 rounded-full bg-uasc-teal animate-pulse" />
                  <span className="text-xs tracking-[0.2em] uppercase">Processing</span>
                </div>
                {submitted && (
                  <p className="text-xs text-uasc-muted max-w-md text-center" dir="auto">
                    &ldquo;{submitted}&rdquo;
                  </p>
                )}
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="max-w-3xl mx-auto mt-8">
                <div className="bg-uasc-card border border-uasc-border text-uasc-sub text-sm rounded-lg px-4 py-3">
                  {error}
                </div>
              </div>
            )}

            {/* Results */}
            {result && (
              <div className="max-w-4xl mx-auto py-8 space-y-6">
                {/* User question */}
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-uasc-border flex items-center justify-center shrink-0 mt-0.5">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <circle cx="6" cy="4" r="2.5" stroke="#95ADBF" strokeWidth="1"/>
                      <path d="M1.5 11c0-2.485 2.015-4.5 4.5-4.5s4.5 2.015 4.5 4.5"
                            stroke="#95ADBF" strokeWidth="1" strokeLinecap="round"/>
                    </svg>
                  </div>
                  <p className="text-uasc-sub text-sm leading-relaxed pt-0.5" dir="auto">{submitted}</p>
                </div>

                {/* UASC response */}
                <div className="flex items-start gap-3">
                  <Image src="/UASCLogoWhite.png" alt="UASC" width={28} height={28}
                         unoptimized className="opacity-75 shrink-0 mt-0.5" />
                  <div className="flex-1 space-y-4 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`text-[10px] px-2 py-0.5 rounded font-medium border border-uasc-border ${RISK_BADGE[result.risk_level] || "bg-uasc-card text-uasc-muted"}`}>
                        Risk · {result.risk_level}
                      </span>
                      <span className="bg-uasc-card border border-uasc-border text-uasc-muted text-[10px] px-2 py-0.5 rounded">
                        Confidence · {(result.confidence * 100).toFixed(0)}%
                      </span>
                      {result.escalation_flag && (
                        <span className="bg-uasc-border text-uasc-text border border-uasc-border text-[10px] px-2 py-0.5 rounded font-semibold tracking-wider uppercase">
                          Restricted Source
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                      <div className="lg:col-span-2 space-y-3">
                        <div className="bg-uasc-card border border-uasc-border rounded-lg px-5 py-4">
                          <p className="text-uasc-text text-sm leading-7 whitespace-pre-wrap" dir="auto">
                            {result.answer}
                          </p>
                        </div>
                        {result.limitations.length > 0 && (
                          <div className="bg-uasc-card border border-uasc-border rounded-lg px-4 py-3 space-y-1.5">
                            <p className="text-[10px] font-semibold tracking-[0.15em] uppercase text-uasc-sub">Limitations</p>
                            <ul className="list-disc list-inside space-y-0.5">
                              {result.limitations.map((l, i) => (
                                <li key={i} className="text-xs text-uasc-muted">{l}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                      <div className="space-y-2">
                        <p className="text-[10px] font-semibold tracking-[0.18em] uppercase text-uasc-sub">
                          Sources · {result.citations.length}
                        </p>
                        {result.citations.length === 0 ? (
                          <p className="text-xs text-uasc-muted">No sources retrieved.</p>
                        ) : (
                          result.citations.map((c, i) => (
                            <CitationCard key={c.chunk_id} citation={c} index={i} />
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input pinned to bottom */}
          <div className="flex-shrink-0 border-t border-uasc-border px-6 py-4"
               style={{ background: "rgba(2,4,6,0.94)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)" }}>
            <div className="max-w-3xl mx-auto">
              <InputBar {...inputProps} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
