"use client";

import { useState, useRef } from "react";
import type { UploadResponse } from "@uasc/shared";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const CLASSIFICATIONS = ["public", "internal", "restricted"] as const;
const SOURCE_TIERS = ["authoritative", "vetted", "open"] as const;
const LANGUAGES = ["en", "ar", "mixed"] as const;

const BADGE_COLORS: Record<string, string> = {
  public: "bg-uasc-card text-uasc-sub border border-uasc-border",
  internal: "bg-uasc-card text-uasc-sub border border-uasc-border",
  restricted: "bg-uasc-card text-uasc-text border border-uasc-border",
  authoritative: "bg-uasc-card text-uasc-sub border border-uasc-border",
  vetted: "bg-uasc-card text-uasc-sub border border-uasc-border",
  open: "bg-uasc-card text-uasc-muted border border-uasc-border",
};

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [classification, setClassification] = useState<string>("public");
  const [sourceTier, setSourceTier] = useState<string>("open");
  const [language, setLanguage] = useState<string>("en");
  const [tags, setTags] = useState("");
  const [status, setStatus] = useState<"idle" | "uploading" | "done" | "error">("idle");
  const [result, setResult] = useState<UploadResponse | null>(null);
  const [error, setError] = useState<string>("");
  const fileRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setStatus("uploading");
    setError("");

    const form = new FormData();
    form.append("file", file);
    form.append("title", title || file.name);
    form.append("classification", classification);
    form.append("source_tier", sourceTier);
    form.append("language", language);
    form.append("tags", tags);

    try {
      const res = await fetch(`${API_URL}/upload`, {
        method: "POST",
        body: form,
      });

      if (!res.ok) {
        const detail = await res.json();
        throw new Error(detail.detail || `HTTP ${res.status}`);
      }

      const data: UploadResponse = await res.json();
      setResult(data);
      setStatus("done");
    } catch (err: any) {
      setError(err.message || "Upload failed");
      setStatus("error");
    }
  };

  const reset = () => {
    setFile(null);
    setTitle("");
    setTags("");
    setStatus("idle");
    setResult(null);
    setError("");
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-6">
      <h1 className="text-xl font-semibold text-uasc-text mb-6 tracking-wide">Upload Document</h1>

      {status === "done" && result ? (
        <div className="bg-uasc-card border border-uasc-border rounded p-6 space-y-3">
          <h2 className="text-uasc-text font-semibold">Document Indexed</h2>
          <dl className="text-sm space-y-1">
            <div className="flex gap-2">
              <dt className="text-uasc-muted w-32">Document ID:</dt>
              <dd className="font-mono text-xs text-uasc-sub">{result.document_id}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="text-uasc-muted w-32">Status:</dt>
              <dd>
                <span className="bg-uasc-border text-uasc-text text-xs px-2 py-0.5 rounded font-medium">
                  {result.status}
                </span>
              </dd>
            </div>
            {result.chunk_count !== undefined && (
              <div className="flex gap-2">
                <dt className="text-uasc-muted w-32">Chunks created:</dt>
                <dd className="font-medium text-uasc-text">{result.chunk_count}</dd>
              </div>
            )}
          </dl>
          <div className="flex gap-3 pt-2">
            <button onClick={reset} className="px-4 py-2 bg-uasc-text text-uasc-bg rounded text-sm hover:opacity-90 transition">
              Upload Another
            </button>
            <a href="/chat" className="px-4 py-2 border border-uasc-border text-uasc-sub rounded text-sm hover:text-uasc-text hover:border-uasc-sub transition">
              Ask a Question
            </a>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-uasc-card border border-uasc-border rounded p-6 space-y-5">
          {/* File picker */}
          <div>
            <label className="block text-xs font-medium text-uasc-sub mb-1 uppercase tracking-widest">
              File <span className="text-uasc-muted normal-case tracking-normal">(PDF, DOCX, TXT)</span>
            </label>
            <input
              ref={fileRef}
              type="file"
              accept=".pdf,.docx,.doc,.txt"
              required
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="block w-full text-sm text-uasc-muted file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-xs file:bg-uasc-border file:text-uasc-text hover:file:opacity-80 cursor-pointer"
            />
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-medium text-uasc-sub mb-1 uppercase tracking-widest">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={file?.name || "Document title"}
              className="w-full bg-uasc-bg border border-uasc-border text-uasc-text placeholder-uasc-muted rounded px-3 py-2 text-sm focus:outline-none focus:border-uasc-sub"
            />
          </div>

          {/* Metadata row */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-uasc-sub mb-1 uppercase tracking-widest">Classification</label>
              <select
                value={classification}
                onChange={(e) => setClassification(e.target.value)}
                className="w-full bg-uasc-bg border border-uasc-border text-uasc-text rounded px-3 py-2 text-sm focus:outline-none focus:border-uasc-sub"
              >
                {CLASSIFICATIONS.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-uasc-sub mb-1 uppercase tracking-widest">Source Tier</label>
              <select
                value={sourceTier}
                onChange={(e) => setSourceTier(e.target.value)}
                className="w-full bg-uasc-bg border border-uasc-border text-uasc-text rounded px-3 py-2 text-sm focus:outline-none focus:border-uasc-sub"
              >
                {SOURCE_TIERS.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-uasc-sub mb-1 uppercase tracking-widest">Language</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full bg-uasc-bg border border-uasc-border text-uasc-text rounded px-3 py-2 text-sm focus:outline-none focus:border-uasc-sub"
              >
                {LANGUAGES.map((l) => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tags <span className="text-gray-400">(comma-separated)</span>
            </label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="uav, regulation, safety"
              className="w-full bg-uasc-bg border border-uasc-border text-uasc-text placeholder-uasc-muted rounded px-3 py-2 text-sm focus:outline-none focus:border-uasc-sub"
            />
          </div>

          {/* Preview badges */}
          {(classification || sourceTier) && (
            <div className="flex gap-2 flex-wrap">
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${BADGE_COLORS[classification]}`}>
                {classification}
              </span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${BADGE_COLORS[sourceTier]}`}>
                {sourceTier}
              </span>
              <span className="text-xs px-2 py-0.5 rounded font-medium bg-uasc-border text-uasc-muted">
                {language}
              </span>
            </div>
          )}

          {error && (
            <div className="bg-uasc-card border border-uasc-border text-uasc-sub text-sm rounded px-4 py-3">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={!file || status === "uploading"}
            className="w-full py-2.5 bg-uasc-text text-uasc-bg rounded font-medium text-sm hover:opacity-90 transition disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {status === "uploading" ? "Indexing..." : "Upload & Index"}
          </button>
        </form>
      )}
    </div>
  );
}
