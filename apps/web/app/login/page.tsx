'use client';

import { useState, useRef, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';

// ── Role redirect map ─────────────────────────────────────────────────────────
const ROLE_REDIRECT: Record<string, string> = {
  L4: '/',
  L3: '/library',
  L2: '/',
};

// ── Default export wraps inner form in Suspense (required for useSearchParams) ─
export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}

// ── Inner form component (uses useSearchParams) ───────────────────────────────
function LoginForm() {
  const params = useSearchParams();
  const [suffix, setSuffix]         = useState('');
  const [passphrase, setPassphrase] = useState('');
  const [showPass, setShowPass]     = useState(false);
  const [error, setError]           = useState('');
  const [submitting, setSubmitting] = useState(false);
  const suffixRef = useRef<HTMLInputElement>(null);

  useEffect(() => { suffixRef.current?.focus(); }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!suffix || !passphrase || submitting) return;
    setSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stationId: `uasc-${suffix}`, passphrase }),
      });
      const data = await res.json();

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        if (res.status >= 500) {
          setError(`AUTH-500 · Server error. Check Vercel env vars (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY).`);
        } else {
          setError(body.detail ?? 'AUTH-403 · Invalid station ID or passphrase.');
        }
        return;
      }

      const level: string = data.user?.level ?? 'L2';
      const dest = params.get('from') || ROLE_REDIRECT[level] || '/';
      // Full page load so the middleware sees the new session cookie
      window.location.href = dest;
    } catch {
      setError('AUTH-500 · Network error. Check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
      {/* ── FX layer ────────────────────────────────────────────────────── */}
      <FxLayer />

      {/* ── Login card ─────────────────────────────────────────────────── */}
      <form
        onSubmit={handleSubmit}
        className="relative z-10 w-full max-w-[380px] mx-4 bg-surf-1 border border-border-base rounded shadow-[0_32px_80px_rgba(0,0,0,0.7)]"
        style={{ padding: '36px 36px 30px' }}
      >
        {/* Logo block */}
        <div className="flex flex-col items-center gap-3 pb-5 mb-5 border-b border-border-base">
          <Image
            src="/UASCLogoWhite.png"
            alt="UASC"
            width={160}
            height={80}
            className="h-auto"
            priority
            unoptimized
          />
          <div className="text-center">
            <div className="text-[15px] font-medium text-text-hi tracking-[-0.01em]">
              UASC Operational Intelligence
            </div>
            <div className="mt-1 font-mono text-[10px] text-text-dim tracking-[0.14em] uppercase">
              Sign in to your station
            </div>
          </div>
        </div>

        {/* Fields */}
        <div className="flex flex-col gap-3.5">
          {/* Station ID */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] text-text-dim uppercase tracking-[0.1em]">Station ID</span>
              <span className="font-mono text-[10px] text-text-faint tracking-[0.04em]">uasc-L##</span>
            </div>
            <div className="flex items-center bg-bg-deep border border-border-base rounded transition-[border-color,box-shadow] duration-120 focus-within:border-text-hi focus-within:shadow-[0_0_0_3px_rgba(240,243,246,0.06)]">
              <span className="font-mono text-[13px] text-text-dim px-3 py-2 tracking-[0.02em] select-none">
                uasc-
              </span>
              <input
                ref={suffixRef}
                type="text"
                value={suffix}
                onChange={e => setSuffix(e.target.value)}
                placeholder="L02"
                maxLength={8}
                className="flex-1 bg-transparent border-none outline-none font-mono text-[13px] text-text-hi tracking-[0.02em] pr-3 py-2 placeholder-text-faint"
              />
            </div>
          </div>

          {/* Passphrase */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] text-text-dim uppercase tracking-[0.1em]">Passphrase</span>
              <a
                href="/help/reset"
                className="font-mono text-[10px] text-text-faint hover:text-text-mid tracking-[0.04em] no-underline transition-colors duration-120"
              >
                forgot ›
              </a>
            </div>
            <div className="flex items-center bg-bg-deep border border-border-base rounded transition-[border-color,box-shadow] duration-120 focus-within:border-text-hi focus-within:shadow-[0_0_0_3px_rgba(240,243,246,0.06)]">
              <input
                type={showPass ? 'text' : 'password'}
                value={passphrase}
                onChange={e => setPassphrase(e.target.value)}
                placeholder="passphrase"
                className="flex-1 bg-transparent border-none outline-none font-mono text-[13px] text-text-hi tracking-[0.02em] px-3 py-2 placeholder-text-faint"
              />
              <button
                type="button"
                onClick={() => setShowPass(v => !v)}
                className="font-mono text-[10px] text-text-faint hover:text-text-mid pr-3 py-2 bg-transparent border-none cursor-pointer transition-colors duration-120 uppercase tracking-[0.06em]"
              >
                {showPass ? 'hide' : 'show'}
              </button>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mt-4 px-3 py-2.5 bg-[rgba(217,117,112,0.06)] border-l-2 border-uasc-red font-mono text-[11px] text-uasc-red tracking-[0.02em] leading-relaxed">
            {error}
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={!suffix || !passphrase || submitting}
          className="mt-4 w-full flex items-center justify-between bg-text-hi text-bg-base font-medium text-[13px] px-4 py-[11px] rounded border border-text-hi transition-all duration-120 hover:bg-white hover:border-white disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        >
          <span>{submitting ? 'Authenticating…' : 'Sign in to UASC'}</span>
          <span className="font-mono text-[10px] border border-current opacity-50 px-[5px] py-px rounded-[2px] tracking-[0.04em]">
            ↵
          </span>
        </button>

        {/* Footer */}
        <div className="mt-5 text-center font-mono text-[10px] text-text-faint tracking-[0.04em] flex flex-col gap-1">
          <span>Access is monitored and logged.</span>
          <span>
            <a href="/help" className="hover:text-text-dim transition-colors duration-120 no-underline">Help</a>
            {' · '}
            <a href="/help/reset" className="hover:text-text-dim transition-colors duration-120 no-underline">Report a problem</a>
          </span>
        </div>
      </form>
    </div>
  );
}

// ── Seal component (CSS-only geometric seal) ─────────────────────────────────
function Seal() {
  return (
    <div
      className="relative flex items-center justify-center border border-border-hi"
      style={{ width: 44, height: 44 }}
    >
      {/* Horizontal hairline */}
      <div className="absolute inset-x-0 top-1/2 h-px bg-border-hi -translate-y-px" />
      {/* Vertical hairline */}
      <div className="absolute inset-y-0 left-1/2 w-px bg-border-hi -translate-x-px" />
      {/* Diamond */}
      <div
        className="relative z-10 border border-text-dim bg-bg-deep"
        style={{ width: 15, height: 15, transform: 'rotate(45deg)' }}
      />
    </div>
  );
}

// ── FX layer ──────────────────────────────────────────────────────────────────
function FxLayer() {
  return (
    <div aria-hidden className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {/* Grid background */}
      <div className="grid-bg absolute inset-0" />

      {/* RF spectrum strip — top left */}
      <div
        className="absolute opacity-55"
        style={{ top: '16%', left: '4%', width: 380 }}
      >
        <svg viewBox="0 0 360 80" preserveAspectRatio="none" width="380" height="80">
          <defs>
            <linearGradient id="rf-fade" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%"   stopColor="#0a0d12" stopOpacity="1" />
              <stop offset="12%"  stopColor="#0a0d12" stopOpacity="0" />
              <stop offset="88%"  stopColor="#0a0d12" stopOpacity="0" />
              <stop offset="100%" stopColor="#0a0d12" stopOpacity="1" />
            </linearGradient>
            <mask id="rf-mask">
              <rect width="360" height="80" fill="white" />
              <rect width="360" height="80" fill="url(#rf-fade)" />
            </mask>
          </defs>
          {/* Baseline + grid lines */}
          <line x1="0" y1="60" x2="360" y2="60" stroke="#b8c0c8" strokeOpacity="0.12" strokeWidth="0.8" />
          <line x1="0" y1="40" x2="360" y2="40" stroke="#b8c0c8" strokeOpacity="0.07" strokeWidth="0.6" strokeDasharray="4 6" />
          <line x1="0" y1="20" x2="360" y2="20" stroke="#b8c0c8" strokeOpacity="0.07" strokeWidth="0.6" strokeDasharray="4 6" />

          {/* Waveform — longer than viewbox, animated */}
          <g mask="url(#rf-mask)">
            <polyline
              className="rf-trace"
              points="0,58 10,55 20,52 30,48 40,42 50,38 55,34 60,30 65,26 70,22 75,28 80,36 90,44 100,50 110,54 120,22 125,18 130,14 135,18 140,26 150,44 160,52 170,55 180,50 190,44 200,40 210,36 220,32 230,38 240,46 250,50 260,52 270,48 280,42 290,38 300,34 310,40 320,48 330,54 340,57 350,58 360,58 370,55 380,50 390,44 400,40 410,36 420,32"
              fill="none"
              stroke="#7aae7a"
              strokeWidth="1.2"
              strokeOpacity="0.55"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          </g>

          {/* Peak marker at x=120 */}
          <line x1="120" y1="10" x2="120" y2="62" stroke="#d8a957" strokeWidth="1" strokeDasharray="3 3" strokeOpacity="0.6" />
          <circle cx="120" cy="14" r="2.2" fill="#d8a957" fillOpacity="0.7" />
        </svg>
        <div className="font-mono text-[9px] text-text-dim tracking-[0.04em] mt-1">
          rf · 2.40–2.48 ghz · peak{' '}
          <span style={{ color: '#d8a957', opacity: 0.8 }}>+14 dBm · 2.443 · cuas-08</span>
        </div>
      </div>

      {/* Tactical readout — top right */}
      <div
        className="absolute text-right font-mono text-[9px] uppercase tracking-[0.14em]"
        style={{ top: '14%', right: '6%', color: 'rgba(184,192,200,0.22)', lineHeight: 1.8 }}
      >
        <div><span style={{ color: 'rgba(240,243,246,0.42)' }}>25°16′04″N · 55°18′12″E</span></div>
        <div>sector dxb-04 · ops-room-3</div>
        <div>threat elevated · posture <span style={{ color: 'rgba(216,169,87,0.7)' }}>amber</span></div>
      </div>

      {/* Tactical readout — bottom left */}
      <div
        className="absolute font-mono text-[9px] uppercase tracking-[0.14em]"
        style={{ bottom: '12%', left: '5%', color: 'rgba(184,192,200,0.22)', lineHeight: 1.8 }}
      >
        <div>scope · prf 1.2 khz · range 25km</div>
        <div><span style={{ color: 'rgba(240,243,246,0.42)' }}>4 contacts tracked · 1 unknown</span></div>
        <div>last sweep · 13:42:08 gst</div>
      </div>

      {/* Radar scope — bottom right */}
      <div
        className="absolute"
        style={{ right: '-22%', bottom: '-28%', width: 'min(1200px,130vmin)', height: 'min(1200px,130vmin)' }}
      >
        <RadarScope />
      </div>

      {/* CSS animations */}
      <style>{`
        @keyframes scope-spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes blip-pulse {
          0%,30%,100% { opacity: .85; }
          60%          { opacity: .25; }
        }
        @keyframes blip-ring {
          0%   { r: 4;  opacity: .55; }
          100% { r: 28; opacity: 0;   }
        }
        @keyframes rf-shift {
          from { transform: translateX(0); }
          to   { transform: translateX(-60px); }
        }
        .sweep-group {
          transform-origin: 600px 600px;
          animation: scope-spin 7.5s linear infinite;
        }
        .rf-trace {
          animation: rf-shift 6s linear infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .sweep-group, .rf-trace,
          [class*="blip-"] { animation: none !important; }
        }
      `}</style>
    </div>
  );
}

// ── Radar scope SVG ───────────────────────────────────────────────────────────
function RadarScope() {
  const cx = 600, cy = 600;
  const rings = [540, 430, 320, 210, 100];
  const green = '#7aae7a';
  const textMid = '#b8c0c8';

  // Bearing ticks (12 × 30°)
  const ticks = Array.from({ length: 12 }, (_, i) => {
    const a = (i * 30 * Math.PI) / 180;
    const r1 = 545, r2 = 560;
    return {
      x1: cx + r1 * Math.cos(a), y1: cy + r1 * Math.sin(a),
      x2: cx + r2 * Math.cos(a), y2: cy + r2 * Math.sin(a),
    };
  });

  // Cardinal labels
  const cardinals = [
    { label: 'N', x: cx,       y: cy - 580 },
    { label: 'E', x: cx + 580, y: cy       },
    { label: 'S', x: cx,       y: cy + 590 },
    { label: 'W', x: cx - 595, y: cy       },
  ];

  // Range labels (along east axis)
  const rangeLabels = [
    { label: '5 km',  x: cx + 100, y: cy - 12 },
    { label: '10',    x: cx + 210, y: cy - 12 },
    { label: '15',    x: cx + 320, y: cy - 12 },
    { label: '20',    x: cx + 430, y: cy - 12 },
  ];

  // Blips
  const blips = [
    { id: 'UAS-04', x: cx + 140, y: cy - 220, color: '#d8a957', delay: '0s',   ringDelay: '0s' },
    { id: 'UNK-07', x: cx + 290, y: cy + 80,  color: '#d97570', delay: '0.4s', ringDelay: '1.1s' },
    { id: '',        x: cx - 160, y: cy - 130, color: green,     delay: '0.8s', ringDelay: '2.0s' },
    { id: '',        x: cx - 80,  y: cy + 240, color: green,     delay: '0.2s', ringDelay: '0.6s' },
  ];

  return (
    <svg
      viewBox="0 0 1200 1200"
      width="100%"
      height="100%"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Core glow */}
        <radialGradient id="scope-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor={green} stopOpacity="0.10" />
          <stop offset="100%" stopColor={green} stopOpacity="0" />
        </radialGradient>
        {/* Sweep wedge gradient */}
        <linearGradient id="sweep-grad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor="transparent" />
          <stop offset="70%"  stopColor={green}       stopOpacity="0.05" />
          <stop offset="100%" stopColor="white"       stopOpacity="0.22" />
        </linearGradient>
      </defs>

      {/* Glow */}
      <circle cx={cx} cy={cy} r="540" fill="url(#scope-glow)" />

      {/* Rings */}
      {rings.map((r, i) => (
        <circle
          key={r}
          cx={cx} cy={cy} r={r}
          fill="none"
          stroke={green}
          strokeOpacity={0.10}
          strokeWidth={i === 0 ? 1.2 : 0.8}
          strokeDasharray={i === 0 ? undefined : '3 6'}
        />
      ))}

      {/* Crosshair */}
      <line x1={cx} y1={cy - 545} x2={cx} y2={cy + 545} stroke={green} strokeOpacity={0.10} strokeWidth={0.8} />
      <line x1={cx - 545} y1={cy} x2={cx + 545} y2={cy} stroke={green} strokeOpacity={0.10} strokeWidth={0.8} />

      {/* Bearing ticks */}
      {ticks.map((t, i) => (
        <line key={i} x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2} stroke={textMid} strokeOpacity={0.18} strokeWidth={1} />
      ))}

      {/* Cardinal labels */}
      {cardinals.map(c => (
        <text key={c.label} x={c.x} y={c.y} textAnchor="middle" dominantBaseline="middle"
          fill={textMid} fillOpacity={0.34} fontSize={20} fontFamily="'JetBrains Mono',monospace">
          {c.label}
        </text>
      ))}

      {/* Range labels */}
      {rangeLabels.map(r => (
        <text key={r.label} x={r.x} y={r.y} textAnchor="middle"
          fill={green} fillOpacity={0.30} fontSize={11} fontFamily="'JetBrains Mono',monospace">
          {r.label}
        </text>
      ))}

      {/* Sweep wedge */}
      <g className="sweep-group">
        {/* Wedge: 33° arc from east (0°), forward */}
        <path
          d={`M ${cx} ${cy} L ${cx + 540} ${cy} A 540 540 0 0 1 ${cx + 540 * Math.cos((33 * Math.PI) / 180)} ${cy + 540 * Math.sin((33 * Math.PI) / 180)} Z`}
          fill="url(#sweep-grad)"
        />
        {/* Leading edge line */}
        <line
          x1={cx} y1={cy}
          x2={cx + 540 * Math.cos((33 * Math.PI) / 180)}
          y2={cy + 540 * Math.sin((33 * Math.PI) / 180)}
          stroke="white" strokeOpacity={0.35} strokeWidth={1.2}
        />
      </g>

      {/* Blips */}
      {blips.map((b, i) => (
        <g key={i} style={{ animation: `blip-pulse 2.8s ${b.delay} infinite` }}>
          <circle cx={b.x} cy={b.y} r={4} fill={b.color} fillOpacity={0.9} />
          <circle cx={b.x} cy={b.y} r={4} fill="none" stroke={b.color} strokeOpacity={0.55}
            style={{ animation: `blip-ring 2.8s ${b.ringDelay} ease-out infinite` }} />
          {b.id && (
            <text x={b.x + 10} y={b.y + 4} fill={b.color} fontSize={9} fillOpacity={0.85}
              fontFamily="'JetBrains Mono',monospace">
              {b.id}
            </text>
          )}
        </g>
      ))}

      {/* Track trajectory (dashed curve UNK-07 → UAS-04) */}
      <path
        d={`M ${cx + 290} ${cy + 80} Q ${cx + 240} ${cy - 80} ${cx + 140} ${cy - 220}`}
        fill="none" stroke="#d8a957" strokeOpacity={0.18} strokeWidth={1} strokeDasharray="4 5"
      />

      {/* Centre reticle */}
      <circle cx={cx} cy={cy} r={6} fill="none" stroke="white" strokeOpacity={0.5} strokeWidth={1} />
      <line x1={cx - 14} y1={cy} x2={cx + 14} y2={cy} stroke="white" strokeOpacity={0.5} strokeWidth={1} />
      <line x1={cx} y1={cy - 14} x2={cx} y2={cy + 14} stroke="white" strokeOpacity={0.5} strokeWidth={1} />
    </svg>
  );
}
