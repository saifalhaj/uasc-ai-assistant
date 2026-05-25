"use client";

import { useState, useRef } from "react";
import type { UploadResponse } from "@uasc/shared";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const CLASSIFICATIONS = ["public", "internal", "restricted"] as const;
const SOURCE_TIERS = ["authoritative", "vetted", "open"] as const;
const LANGUAGES = ["en", "ar", "mixed"] as const;

const BADGE_COLORS: Record<string, string> = {
  public: "bg-green-900 text-green-300",
  internal: "bg-yellow-900 text-yellow-300",
  restricted: "bg-red-900 text-red-300",
  authoritative: "bg-blue-900 text-blue-300",
  vetted: "bg-indigo-900 text-indigo-300",
  open: "bg-slate-700 text-slate-300",
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
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-6">Upload Document</h1>

      {status === "done" && result ? (
        <div className="bg-green-950 border border-green-800 rounded-xl p-6 space-y-3">
          <h2 className="text-green-400 font-semibold text-lg">Document Indexed</h2>
          <dl className="text-sm space-y-1">
            <div className="flex gap-2">
              <dt className="text-slate-500 w-32">Document ID:</dt>
              <dd className="font-mono text-xs text-slate-300">{result.document_id}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="text-slate-500 w-32">Status:</dt>
              <dd>
                <span className="bg-green-900 text-green-300 text-xs px-2 py-0.5 rounded-full font-medium">
                  {result.status}
                </span>
              </dd>
            </div>
            {result.chunk_count !== undefined && (
              <div className="flex gap-2">
                <dt className="text-slate-500 w-32">Chunks created:</dt>
                <dd className="font-medium text-slate-200">{result.chunk_count}</dd>
              </div>
            )}
          </dl>
          <div className="flex gap-3 pt-2">
            <button onClick={reset} className="px-4 py-2 bg-uasc-gold text-uasc-dark rounded-lg text-sm hover:brightness-110 transition">
              Upload Another
            </button>
            <a href="/chat" className="px-4 py-2 border border-uasc-gold text-uasc-gold rounded-lg text-sm hover:bg-uasc-gold hover:text-uasc-dark transition">
              Ask a Question
            </a>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-uasc-card rounded-xl border border-uasc-border p-6 space-y-5">
          {/* File picker */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              File <span className="text-slate-500">(PDF, DOCX, TXT)</span>
            </label>
            <input
              ref={fileRef}
              type="file"
              accept=".pdf,.docx,.doc,.txt"
              required
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="block w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:bg-uasc-gold file:text-uasc-dark hover:file:brightness-110 cursor-pointer"
            />
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={file?.name || "Document title"}
              className="w-full bg-slate-800 border border-slate-600 text-slate-100 placeholder-slate-500 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-uasc-gold focus:border-transparent outline-none"
            />
          </div>

          {/* Metadata row */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Classification</label>
              <select
                value={classification}
                onChange={(e) => setClassification(e.target.value)}
                className="w-full bg-slate-800 border border-slate-600 text-slate-100 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-uasc-gold outline-none"
              >
                {CLASSIFICATIONS.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Source Tier</label>
              <select
                value={sourceTier}
                onChange={(e) => setSourceTier(e.target.value)}
                className="w-full bg-slate-800 border border-slate-600 text-slate-100 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-uasc-gold outline-none"
              >
                {SOURCE_TIERS.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Language</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full bg-slate-800 border border-slate-600 text-slate-100 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-uasc-gold outline-none"
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
              className="w-full bg-slate-800 border border-slate-600 text-slate-100 placeholder-slate-500 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-uasc-gold outline-none"
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
              <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-slate-700 text-slate-300">
                {language}
              </span>
            </div>
          )}

          {error && (
            <div className="bg-red-950 border border-red-800 text-red-400 text-sm rounded-lg px-4 py-3">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={!file || status === "uploading"}
            className="w-full py-2.5 bg-uasc-gold text-uasc-dark rounded-lg font-medium hover:brightness-110 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {status === "uploading" ? "Indexing..." : "Upload & Index"}
          </button>
        </form>
      )}
    </div>
  );
}
