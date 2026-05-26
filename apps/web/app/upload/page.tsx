"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import type { UploadResponse } from "@uasc/shared";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const CLASSIFICATIONS = ["public", "internal", "restricted"] as const;
const SOURCE_TIERS = ["authoritative", "vetted", "open"] as const;
const LANGUAGES = ["en", "ar", "mixed"] as const;

const BADGE_COLORS: Record<string, string> = {
  public:        "bg-uasc-card text-uasc-sub border border-uasc-border",
  internal:      "bg-uasc-card text-uasc-sub border border-uasc-border",
  restricted:    "bg-uasc-card text-uasc-text border border-uasc-border",
  authoritative: "bg-uasc-card text-uasc-sub border border-uasc-border",
  vetted:        "bg-uasc-card text-uasc-sub border border-uasc-border",
  open:          "bg-uasc-card text-uasc-muted border border-uasc-border",
};

export default function InsightManagementPage() {
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
      const res = await fetch(`${API_URL}/upload`, { method: "POST", body: form });
      if (!res.ok) {
        const detail = await res.json();
        throw new Error(detail.detail || `HTTP ${res.status}`);
      }
      setResult(await res.json());
      setStatus("done");
    } catch (err: any) {
      setError(err.message || "Import failed");
      setStatus("error");
    }
  };

  const reset = () => {
    setFile(null); setTitle(""); setTags("");
    setStatus("idle"); setResult(null); setError("");
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <div className="relative min-h-[calc(100vh-52px)] overflow-hidden">

      {/* ── Background ── */}
      <div className="absolute inset-0 pointer-events-none select-none" aria-hidden="true">

        {/* Ambient glow */}
        <div className="absolute right-[15%] top-[10%] w-[500px] h-[500px] rounded-full opacity-[0.02] animate-ambient-pulse"
             style={{ background: "radial-gradient(circle, #8090A0 0%, transparent 65%)", filter: "blur(100px)" }} />
        <div className="absolute left-[5%] bottom-[15%] w-[400px] h-[400px] rounded-full opacity-[0.022]"
             style={{ background: "radial-gradient(circle, #1C2530 0%, transparent 65%)", filter: "blur(120px)" }} />

        <svg viewBox="0 0 1440 900" xmlns="http://www.w3.org/2000/svg"
             className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid slice">
          <defs>
            <pattern id="im-grid-sm" x="0" y="0" width="48" height="48" patternUnits="userSpaceOnUse"
                     patternTransform="rotate(-6 720 450)">
              <path d="M 48 0 L 0 0 0 48" fill="none" stroke="#C8D0DA" strokeWidth="0.2" />
            </pattern>
            <pattern id="im-grid-lg" x="0" y="0" width="192" height="192" patternUnits="userSpaceOnUse"
                     patternTransform="rotate(-6 720 450)">
              <path d="M 192 0 L 0 0 0 192" fill="none" stroke="#C8D0DA" strokeWidth="0.4" />
            </pattern>
            <linearGradient id="im-btmFade" x1="0" y1="0" x2="0" y2="1">
              <stop offset="40%" stopColor="#020406" stopOpacity="0" />
              <stop offset="100%" stopColor="#020406" stopOpacity="1" />
            </linearGradient>
          </defs>

          {/* City grid */}
          <rect width="1440" height="900" fill="url(#im-grid-sm)" opacity="0.1" />
          <rect width="1440" height="900" fill="url(#im-grid-lg)" opacity="0.13" />

          {/* Topographic contours — offset right so they don't clash with form */}
          <g fill="none" stroke="#6A7A8A" strokeWidth="0.4" opacity="0.04">
            <ellipse cx="1080" cy="450" rx="580" ry="300" />
            <ellipse cx="1080" cy="450" rx="440" ry="225" />
            <ellipse cx="1080" cy="450" rx="310" ry="158" />
            <ellipse cx="1080" cy="450" rx="190" ry="96" />
          </g>

          {/* Geofence polygon — top right corner */}
          <g fill="none" stroke="#7A8A9A" strokeWidth="0.5" opacity="0.04">
            <polygon points="1180,30 1340,75 1410,200 1360,340 1200,370 1060,320 1010,195 1070,55" />
          </g>
          <g fill="#8A9AAA" opacity="0.028" fontSize="6.5" fontFamily="monospace" letterSpacing="1.2">
            <text x="1060" y="26">GEO-04  RESTRICTED AIRSPACE</text>
          </g>

          {/* Radar — bottom right */}
          <g transform="translate(1340,780)">
            <g fill="none" stroke="#566474" strokeWidth="0.35" opacity="0.06">
              <circle r="55"/><circle r="88"/><circle r="120"/>
            </g>
            <g stroke="#566474" strokeWidth="0.25" opacity="0.04">
              <line x1="-130" y1="0" x2="130" y2="0"/>
              <line x1="0" y1="-130" x2="0" y2="130"/>
            </g>
            <path d="M0,0 L120,0 A120,120 0 0,1 84.8,-84.8 Z"
                  fill="#8C9BAA" fillOpacity="0.035" stroke="#8C9BAA" strokeWidth="0.4" strokeOpacity="0.09">
              <animateTransform attributeName="transform" type="rotate"
                                from="0 0 0" to="360 0 0" dur="12s" repeatCount="indefinite" />
            </path>
          </g>

          {/* Subtle flight trace */}
          <g fill="none" stroke="#7A8A9A" strokeWidth="0.6" opacity="0.035">
            <path d="M 1500,180 C 1250,220 1050,320 820,380" strokeDasharray="8 5" />
            <circle cx="820" cy="380" r="3" fill="#9AAABB" opacity="0.4">
              <animate attributeName="opacity" values="0.2;0.6;0.2" dur="4s" repeatCount="indefinite"/>
            </circle>
          </g>

          <rect width="1440" height="900" fill="url(#im-btmFade)" />
        </svg>

        {/* UASC watermark */}
        <div className="absolute inset-0 flex items-center justify-center">
          <Image src="/UASCLogoWhite.png" alt="" width={560} height={560}
                 unoptimized className="opacity-[0.018]" />
        </div>
      </div>

      {/* ── Content ── */}
      <div className="relative z-10 max-w-2xl mx-auto px-6 py-10">

        {/* Logo + heading */}
        <div className="text-center mb-10">
          <div className="flex justify-center mb-5">
            <Image src="/UASCLogoWhite.png" alt="UASC" width={72} height={72}
                   unoptimized className="opacity-82" />
          </div>
          <h1 className="text-xl font-light tracking-[0.06em] text-uasc-text mb-1">
            Insight Management
          </h1>
          <p className="text-[11px] tracking-[0.2em] uppercase text-uasc-sub">
            Import operational documents into the knowledge base
          </p>
        </div>

        {/* Form / Success */}
        {status === "done" && result ? (
          <div className="glass-panel rounded-lg p-6 space-y-4">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-uasc-teal" />
              <h2 className="text-uasc-text font-medium text-sm tracking-wide">Insight Imported</h2>
            </div>
            <dl className="text-sm space-y-2">
              <div className="flex gap-3">
                <dt className="text-uasc-muted text-xs uppercase tracking-widest w-32 pt-0.5">Document ID</dt>
                <dd className="font-mono text-xs text-uasc-sub">{result.document_id}</dd>
              </div>
              <div className="flex gap-3">
                <dt className="text-uasc-muted text-xs uppercase tracking-widest w-32 pt-0.5">Status</dt>
                <dd>
                  <span className="bg-uasc-border text-uasc-text text-[10px] px-2 py-0.5 rounded font-medium tracking-widest uppercase">
                    {result.status}
                  </span>
                </dd>
              </div>
              {result.chunk_count !== undefined && (
                <div className="flex gap-3">
                  <dt className="text-uasc-muted text-xs uppercase tracking-widest w-32 pt-0.5">Chunks</dt>
                  <dd className="text-uasc-text text-sm font-medium">{result.chunk_count}</dd>
                </div>
              )}
            </dl>
            <div className="flex gap-3 pt-2">
              <button onClick={reset}
                      className="btn-primary px-4 py-2 rounded text-[11px] tracking-[0.12em] uppercase font-medium">
                Import Another
              </button>
              <a href="/chat"
                 className="btn-secondary px-4 py-2 rounded text-[11px] tracking-[0.12em] uppercase font-medium">
                Open Assistant
              </a>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="glass-panel rounded-lg p-6 space-y-5">

            <div>
              <label className="block text-xs font-medium text-uasc-sub mb-2 uppercase tracking-widest">
                File <span className="text-uasc-muted normal-case tracking-normal font-normal">(PDF, DOCX, TXT)</span>
              </label>
              <input ref={fileRef} type="file" accept=".pdf,.docx,.doc,.txt" required
                     onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                     className="block w-full text-xs text-uasc-muted file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-xs file:bg-uasc-border file:text-uasc-text hover:file:opacity-80 cursor-pointer" />
            </div>

            <div>
              <label className="block text-xs font-medium text-uasc-sub mb-2 uppercase tracking-widest">Title</label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
                     placeholder={file?.name || "Document title"}
                     className="w-full bg-uasc-bg border border-uasc-border text-uasc-text placeholder:text-uasc-muted rounded px-3 py-2 text-sm focus:outline-none focus:border-uasc-sub" />
            </div>

            <div className="grid grid-cols-3 gap-4">
              {[
                { label: "Classification", value: classification, setter: setClassification, options: CLASSIFICATIONS },
                { label: "Source Tier",    value: sourceTier,     setter: setSourceTier,     options: SOURCE_TIERS },
                { label: "Language",       value: language,        setter: setLanguage,        options: LANGUAGES },
              ].map(({ label, value, setter, options }) => (
                <div key={label}>
                  <label className="block text-xs font-medium text-uasc-sub mb-2 uppercase tracking-widest">{label}</label>
                  <select value={value} onChange={(e) => setter(e.target.value)}
                          className="w-full bg-uasc-bg border border-uasc-border text-uasc-text rounded px-3 py-2 text-sm focus:outline-none focus:border-uasc-sub">
                    {options.map((o) => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
              ))}
            </div>

            <div>
              <label className="block text-xs font-medium text-uasc-sub mb-2 uppercase tracking-widest">
                Tags <span className="text-uasc-muted normal-case tracking-normal font-normal">(comma-separated)</span>
              </label>
              <input type="text" value={tags} onChange={(e) => setTags(e.target.value)}
                     placeholder="uav, regulation, safety"
                     className="w-full bg-uasc-bg border border-uasc-border text-uasc-text placeholder:text-uasc-muted rounded px-3 py-2 text-sm focus:outline-none focus:border-uasc-sub" />
            </div>

            {(classification || sourceTier) && (
              <div className="flex gap-2 flex-wrap">
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${BADGE_COLORS[classification]}`}>{classification}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${BADGE_COLORS[sourceTier]}`}>{sourceTier}</span>
                <span className="text-[10px] px-2 py-0.5 rounded font-medium bg-uasc-border text-uasc-muted">{language}</span>
              </div>
            )}

            {error && (
              <div className="bg-uasc-card border border-uasc-border text-uasc-sub text-sm rounded px-4 py-3">{error}</div>
            )}

            <button type="submit" disabled={!file || status === "uploading"}
                    className="w-full py-2.5 btn-primary rounded font-medium text-[11px] tracking-[0.15em] uppercase disabled:opacity-30 disabled:cursor-not-allowed">
              {status === "uploading" ? "Importing…" : "Import Insight"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
