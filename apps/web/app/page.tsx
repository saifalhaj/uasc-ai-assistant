import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="relative min-h-[calc(100vh-52px)] overflow-hidden">

      {/* ── Background ──────────────────────────────────────────── */}
      <div className="absolute inset-0 pointer-events-none select-none" aria-hidden="true">

        {/* Ambient glow blobs */}
        <div
          className="absolute left-[12%] top-[20%] w-[700px] h-[700px] rounded-full opacity-[0.032] animate-ambient-pulse"
          style={{ background: "radial-gradient(circle, #00C9B1 0%, transparent 65%)", filter: "blur(90px)" }}
        />
        <div
          className="absolute right-[8%] bottom-[15%] w-[550px] h-[550px] rounded-full opacity-[0.038]"
          style={{ background: "radial-gradient(circle, #1B4A7A 0%, transparent 65%)", filter: "blur(110px)" }}
        />

        {/* SVG background layer */}
        <svg
          viewBox="0 0 1440 860"
          xmlns="http://www.w3.org/2000/svg"
          className="absolute inset-0 w-full h-full"
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            <pattern id="grid-sm" x="0" y="0" width="48" height="48" patternUnits="userSpaceOnUse"
                     patternTransform="rotate(-6 720 430)">
              <path d="M 48 0 L 0 0 0 48" fill="none" stroke="#C8D6E5" strokeWidth="0.2" />
            </pattern>
            <pattern id="grid-lg" x="0" y="0" width="192" height="192" patternUnits="userSpaceOnUse"
                     patternTransform="rotate(-6 720 430)">
              <path d="M 192 0 L 0 0 0 192" fill="none" stroke="#C8D6E5" strokeWidth="0.45" />
            </pattern>
            <linearGradient id="btmFade" x1="0" y1="0" x2="0" y2="1">
              <stop offset="50%" stopColor="#05070A" stopOpacity="0" />
              <stop offset="100%" stopColor="#05070A" stopOpacity="1" />
            </linearGradient>
          </defs>

          {/* City grid overlay */}
          <rect width="1440" height="860" fill="url(#grid-sm)" opacity="0.14" />
          <rect width="1440" height="860" fill="url(#grid-lg)" opacity="0.18" />

          {/* Topographic contour lines */}
          <g fill="none" stroke="#00C9B1" strokeWidth="0.4" opacity="0.05">
            <ellipse cx="720" cy="430" rx="640" ry="330" />
            <ellipse cx="720" cy="430" rx="500" ry="256" />
            <ellipse cx="720" cy="430" rx="365" ry="184" />
            <ellipse cx="720" cy="430" rx="238" ry="120" />
            <ellipse cx="720" cy="430" rx="122" ry="60" />
          </g>

          {/* Autonomous flight path traces */}
          <g fill="none" stroke="#00C9B1" strokeWidth="0.75" opacity="0.048">
            <path d="M -60,680 C 200,555 360,310 680,288" strokeDasharray="9 5" />
            <path d="M 1340,20 C 1160,190 940,310 640,385" strokeDasharray="9 5" />
            <path d="M 80,860 C 265,700 530,590 878,514" strokeDasharray="9 5" />
            <path d="M -60,345 C 320,330 760,395 1500,348" strokeDasharray="14 8" />
            {/* Waypoint nodes */}
            <circle cx="680" cy="288" r="3.5" fill="#00C9B1" opacity="0.55">
              <animate attributeName="opacity" values="0.35;0.85;0.35" dur="3s" repeatCount="indefinite" />
            </circle>
            <circle cx="640" cy="385" r="3" fill="#00C9B1" opacity="0.5">
              <animate attributeName="opacity" values="0.25;0.75;0.25" dur="4.3s" repeatCount="indefinite" />
            </circle>
            <circle cx="878" cy="514" r="3" fill="#00C9B1" opacity="0.45">
              <animate attributeName="opacity" values="0.2;0.65;0.2" dur="5.6s" repeatCount="indefinite" />
            </circle>
            <circle cx="378" cy="338" r="2" fill="#00C9B1" opacity="0.3">
              <animate attributeName="opacity" values="0.1;0.5;0.1" dur="6.2s" repeatCount="indefinite" />
            </circle>
          </g>

          {/* Geofence polygons */}
          <g fill="none" stroke="#00C9B1" strokeWidth="0.5" opacity="0.042">
            <polygon points="1055,55 1175,95 1235,205 1185,325 1055,352 935,312 895,195 945,80" />
            <polygon points="118,575 258,545 328,625 293,752 158,784 68,720 50,612" />
          </g>
          <g fill="#00C9B1" opacity="0.035" fontSize="6.5" fontFamily="monospace" letterSpacing="1.2">
            <text x="940" y="48">GEO-04  RESTRICTED AIRSPACE</text>
            <text x="52" y="568">GEO-11  BUFFER ZONE</text>
          </g>

          {/* Radar display — top-right */}
          <g transform="translate(1292,138)">
            <g fill="none" stroke="#7A98B5" strokeWidth="0.4" opacity="0.065">
              <circle r="62" />
              <circle r="98" />
              <circle r="134" />
              <circle r="168" />
            </g>
            <g stroke="#7A98B5" strokeWidth="0.3" opacity="0.045">
              <line x1="-180" y1="0" x2="180" y2="0" />
              <line x1="0" y1="-180" x2="0" y2="180" />
              <line x1="-127" y1="-127" x2="127" y2="127" />
              <line x1="127" y1="-127" x2="-127" y2="127" />
            </g>
            {/* Rotating sweep sector */}
            <path
              d="M0,0 L168,0 A168,168 0 0,1 118.8,-118.8 Z"
              fill="#00C9B1"
              fillOpacity="0.045"
              stroke="#00C9B1"
              strokeWidth="0.5"
              strokeOpacity="0.12"
            >
              <animateTransform
                attributeName="transform"
                type="rotate"
                from="0 0 0"
                to="360 0 0"
                dur="10s"
                repeatCount="indefinite"
              />
            </path>
            {/* Contact blips */}
            <circle cx="44" cy="-52" r="2.2" fill="#00C9B1" opacity="0.45">
              <animate attributeName="opacity" values="0.45;1;0.45" dur="2.5s" repeatCount="indefinite" />
            </circle>
            <circle cx="-78" cy="32" r="1.8" fill="#00C9B1" opacity="0.35">
              <animate attributeName="opacity" values="0.2;0.75;0.2" dur="3.8s" repeatCount="indefinite" />
            </circle>
            <circle cx="112" cy="58" r="1.8" fill="#00C9B1" opacity="0.3">
              <animate attributeName="opacity" values="0.1;0.6;0.1" dur="5.2s" repeatCount="indefinite" />
            </circle>
          </g>

          {/* Bottom-edge fade */}
          <rect width="1440" height="860" fill="url(#btmFade)" />
        </svg>

        {/* UASC logo — large faint watermark */}
        <div className="absolute inset-0 flex items-center justify-center">
          <Image
            src="/UASCLogoWhite.png"
            alt=""
            width={640}
            height={640}
            unoptimized
            className="opacity-[0.02]"
          />
        </div>
      </div>

      {/* ── Hero Content ────────────────────────────────────────── */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-52px)] px-6 py-20">

        {/* Status badge */}
        <div
          className="flex items-center gap-2 mb-10 px-4 py-1.5 rounded-full"
          style={{
            background: "rgba(14,20,27,0.72)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            border: "1px solid rgba(22,32,48,0.9)",
          }}
        >
          <span
            className="block w-1.5 h-1.5 rounded-full animate-pulse"
            style={{ backgroundColor: "#00C9B1", boxShadow: "0 0 5px #00C9B1" }}
          />
          <span className="text-[9px] tracking-[0.22em] uppercase text-uasc-sub">
            Operational System · Dubai Police UASC
          </span>
        </div>

        {/* Main glass panel */}
        <div className="glass-panel relative max-w-2xl w-full text-center px-10 py-14 rounded-lg">

          {/* Corner brackets */}
          <span className="absolute top-3 left-3 w-5 h-5 border-t border-l border-uasc-teal opacity-20" />
          <span className="absolute top-3 right-3 w-5 h-5 border-t border-r border-uasc-teal opacity-20" />
          <span className="absolute bottom-3 left-3 w-5 h-5 border-b border-l border-uasc-teal opacity-20" />
          <span className="absolute bottom-3 right-3 w-5 h-5 border-b border-r border-uasc-teal opacity-20" />

          <h1 className="text-[2.5rem] font-light tracking-[0.07em] text-uasc-text leading-tight mb-5">
            UASC AI{" "}
            <span className="font-semibold">Operational</span>
            {" "}Assistant
          </h1>

          <div className="flex items-center justify-center gap-3 mb-5">
            <div className="h-px w-14 bg-uasc-border" />
            <div className="w-1 h-1 rounded-full bg-uasc-teal opacity-50" />
            <div className="h-px w-14 bg-uasc-border" />
          </div>

          <p className="text-[11px] tracking-[0.25em] uppercase text-uasc-teal mb-5 opacity-75">
            Operational Intelligence Platform
          </p>

          <p className="text-sm text-uasc-sub leading-relaxed mb-10 max-w-md mx-auto">
            Advanced autonomous systems intelligence for regulatory compliance,
            operational doctrine, and mission-critical knowledge synthesis.
          </p>

          <div className="flex items-center justify-center gap-4">
            <Link
              href="/chat"
              className="btn-primary flex items-center gap-2 px-7 py-3 text-[11px] tracking-[0.15em] uppercase font-medium rounded"
            >
              Launch Assistant
              <svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                <path d="M2 6h8M7 3l3 3-3 3" stroke="currentColor" strokeWidth="1.3"
                      strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
            <Link
              href="/upload"
              className="btn-secondary px-7 py-3 text-[11px] tracking-[0.15em] uppercase font-medium rounded"
            >
              Open Operations Dashboard
            </Link>
          </div>
        </div>

        {/* Capability cards */}
        <div className="grid grid-cols-4 gap-3 max-w-3xl w-full mt-6">
          {[
            {
              label: "Multilingual",
              tag: "AR · EN",
              desc: "Arabic and English via advanced multilingual embeddings.",
            },
            {
              label: "Source Attribution",
              tag: "CITED",
              desc: "Classification badges and tier levels on every citation.",
            },
            {
              label: "Audit Compliance",
              tag: "LOGGED",
              desc: "Immutable query and retrieval log for regulatory review.",
            },
            {
              label: "Intel Synthesis",
              tag: "ACTIVE",
              desc: "Cross-document reasoning across the regulatory knowledge base.",
            },
          ].map((cap) => (
            <div key={cap.label} className="glass-card rounded px-4 py-4">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-[9px] tracking-[0.18em] uppercase text-uasc-sub">{cap.label}</span>
                <span className="text-[8px] tracking-widest text-uasc-teal opacity-55">{cap.tag}</span>
              </div>
              <div className="h-px bg-uasc-border mb-2.5" />
              <p className="text-[10px] text-uasc-muted leading-relaxed">{cap.desc}</p>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
