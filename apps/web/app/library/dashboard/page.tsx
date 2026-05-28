'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth, hasLevel } from '@/app/AuthProvider';

// ── Mock data ─────────────────────────────────────────────────────────────────

const CITES: [number, number, number][] = [
  [80,40,28],[70,38,22],[64,30,18],[58,24,16],[62,32,18],[78,34,28],[88,42,30],
  [120,58,38],[140,62,42],[112,54,36],[96,46,30],[108,52,34],[124,60,38],[136,64,44],
  [148,72,48],[160,78,52],[172,82,58],[156,72,50],[140,68,42],[152,74,46],
  [188,88,56],[220,98,64],[244,108,72],[268,118,80],[290,128,86],[256,114,76],
  [228,102,68],[212,96,64],[244,110,74],[298,132,92],
];
const MAX_CITE = 540;

const UPLOADS = [4,3,5,6,4,2,5,8,12,9,7,4,6,11,14,16,18,10,7,9,24,22,16,14,11,8,6,10,18,15];
const MAX_UPLOAD = 26;

const DAYS = ['SUN','MON','TUE','WED','THU','FRI','SAT'];

function heatLevel(day: number, hr: number): number {
  const base = Math.exp(-Math.pow((hr - 14) / 4.5, 2)) * 6;
  let v = base;
  if (day >= 1 && day <= 4) v *= 1.0;
  else if (day === 5) v *= 0.55;
  else v *= 0.4;
  const r = ((day * 31 + hr * 17) % 100) / 100;
  v += (r - 0.5) * 1.4;
  return Math.max(0, Math.min(6, Math.round(v)));
}

const HM_COLORS = ['#0f1419','#1c2128','#232932','#3a4250','#6e7681','#b8c0c8','#f0f3f6'];

// ── Shared sub-components ─────────────────────────────────────────────────────

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-surf-1 border border-border-base rounded p-[16px_18px] min-w-0 ${className}`}>
      {children}
    </div>
  );
}

function CardHead({ title, sub, right }: { title: string; sub?: string; right?: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-3 mb-[14px]">
      <h3 className="m-0 text-[13px] font-medium text-text-hi tracking-[0.01em]">{title}</h3>
      <div className="flex items-baseline gap-3">
        {sub && <span className="font-mono text-[10px] text-text-dim tracking-[0.06em] uppercase">{sub}</span>}
        {right}
      </div>
    </div>
  );
}

function StackBar({ segs }: { segs: { pct: number; color: string; title: string }[] }) {
  return (
    <div className="flex h-[14px] rounded-[2px] overflow-hidden bg-bg-deep border border-border-base">
      {segs.map((s, i) => (
        <div key={i} style={{ width: `${s.pct}%`, background: s.color }} title={s.title} />
      ))}
    </div>
  );
}

function LegRow({ dot, label, value, pct }: { dot: string; label: string; value: string; pct: string }) {
  return (
    <div className="grid items-center gap-2 font-mono text-[11px] text-text-mid tracking-[0.04em]"
         style={{ gridTemplateColumns: '12px 1fr auto auto' }}>
      <span className="w-2 h-2 rounded-[1px] flex-shrink-0" style={{ background: dot }} />
      <span>{label}</span>
      <span className="text-text-hi font-medium">{value}</span>
      <span className="text-text-dim text-[10px] min-w-[36px] text-right">{pct}</span>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function LibraryDashboardPage() {
  const [range, setRange] = useState('30d');
  const { user } = useAuth();
  const canSeeRestricted = hasLevel(user, 'L4');

  return (
    <div className="overflow-auto h-full">
      <div className="relative px-8 py-7 pb-16 max-w-[1480px] mx-auto">

        {/* Arabic watermark */}
        <div aria-hidden dir="rtl" className="fixed bottom-[60px] right-[5%] pointer-events-none z-0 font-ar text-[76px] tracking-[0.05em] select-none" style={{ color: 'rgba(240,243,246,0.025)' }}>
          مكتبة الرؤى
        </div>

        {/* ── Header ───────────────────────────────────────────────────────── */}
        <div className="flex items-end gap-4 pb-4 border-b border-border-base mb-[18px]">
          <div>
            <h1 className="m-0 text-[24px] font-medium text-text-hi tracking-[-0.01em]">Library Dashboard</h1>
            <div className="mt-1 font-mono text-[11px] text-text-dim tracking-[0.04em]">
              corpus health · upload activity · reference signals · audit feed
            </div>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <div className="flex border border-border-base rounded-sm overflow-hidden">
              {[
                { label: 'Dashboard', href: '/library/dashboard', active: true },
                { label: 'Documents', href: '/library',           active: false },
                { label: 'Upload',    href: '/upload',            active: false },
              ].map(t => (
                <Link key={t.label} href={t.href}
                  className={`px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.06em] no-underline border-r border-border-base last:border-r-0 transition-all duration-120 ${t.active ? 'text-text-hi bg-surf-1' : 'text-text-dim bg-bg-deep hover:text-text-mid hover:bg-surf-1'}`}>
                  {t.label}
                </Link>
              ))}
            </div>
            <div className="flex border border-border-base rounded-sm overflow-hidden">
              {['7d','30d','90d','YTD','All'].map(r => (
                <button key={r} onClick={() => setRange(r)}
                  className={`px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.06em] bg-transparent border-r border-border-base last:border-r-0 transition-all duration-120 cursor-pointer ${range === r ? 'text-text-hi bg-surf-1' : 'text-text-dim bg-bg-deep hover:text-text-mid'}`}>
                  {r}
                </button>
              ))}
            </div>
            <button className="flex items-center gap-2 px-3 py-[7px] border border-border-bri bg-transparent text-text-mid text-[12px] font-medium rounded-sm cursor-pointer transition-all duration-120 hover:text-text-hi hover:bg-[rgba(240,243,246,0.05)] hover:border-text-hi">
              Export ↓
            </button>
          </div>
        </div>

        {/* ── KPI tiles ──────────────────────────────────────────────────── */}
        <div className="grid grid-cols-5 gap-px bg-border-base border border-border-base mb-[18px]">
          {([
            { k: 'Total documents',  v: '12 442', unit: '',         delta: '↑ +148 · last 30d',  dir: 'up'   },
            { k: 'Citations · 30d',  v: '8 314',  unit: '',         delta: '↑ +12.4% vs prior',  dir: 'up'   },
            { k: 'Active uploaders', v: '17',      unit: 'of 24',    delta: '→ ±0 vs prior',      dir: 'flat' },
            { k: 'Avg cites / doc',  v: '0.67',   unit: '',         delta: '↓ −0.04 · cold tail', dir: 'down' },
            { k: 'Storage used',     v: '214',     unit: 'GB / 500', delta: '↑ +6.2 GB · 30d',    dir: 'up'   },
          ] as const).map(kpi => (
            <div key={kpi.k} className="bg-surf-1 p-[14px_16px] flex flex-col gap-1.5">
              <div className="font-mono text-[10px] text-text-dim uppercase tracking-[0.08em]">{kpi.k}</div>
              <div className="font-mono text-[26px] text-text-hi font-medium leading-none tracking-[-0.02em]">
                {kpi.v}{kpi.unit && <span className="text-text-dim text-[12px] ml-[5px] tracking-normal font-normal"> {kpi.unit}</span>}
              </div>
              <div className={`font-mono text-[10px] tracking-[0.04em] ${kpi.dir === 'up' ? 'text-uasc-green' : kpi.dir === 'down' ? 'text-uasc-red' : 'text-text-dim'}`}>
                {kpi.delta}
              </div>
            </div>
          ))}
        </div>

        {/* ── Breakdown row ──────────────────────────────────────────────── */}
        <div className="grid gap-[14px] mb-[14px]" style={{ gridTemplateColumns: '1.1fr 1fr 1fr 1.1fr' }}>

          <Card>
            <CardHead title="Classification mix" sub={canSeeRestricted ? '12 442 docs' : '10 178 docs · L4-only segments hidden'} />
            {canSeeRestricted ? (
              <>
                <StackBar segs={[{ pct: 18.2, color: '#d97570', title: 'Restricted' }, { pct: 54.4, color: '#d8a957', title: 'Internal' }, { pct: 27.4, color: '#7aae7a', title: 'Public' }]} />
                <div className="flex flex-col gap-2 mt-[14px]">
                  <LegRow dot="#d97570" label="Restricted" value="2 264" pct="18.2%" />
                  <LegRow dot="#d8a957" label="Internal"   value="6 769" pct="54.4%" />
                  <LegRow dot="#7aae7a" label="Public"     value="3 409" pct="27.4%" />
                </div>
              </>
            ) : (
              <>
                <StackBar segs={[{ pct: 66.5, color: '#d8a957', title: 'Internal' }, { pct: 33.5, color: '#7aae7a', title: 'Public' }]} />
                <div className="flex flex-col gap-2 mt-[14px]">
                  <LegRow dot="#d8a957" label="Internal" value="6 769" pct="66.5%" />
                  <LegRow dot="#7aae7a" label="Public"   value="3 409" pct="33.5%" />
                </div>
              </>
            )}
          </Card>

          <Card>
            <CardHead title="Source tier" sub="9 active sources" />
            <div className="grid grid-cols-3 gap-px bg-border-base border border-border-base rounded-sm overflow-hidden">
              {[{ nm:'AUTH', ct:'5 218', pc:'41.9%', w:'84%' }, { nm:'REF', ct:'4 740', pc:'38.1%', w:'76%' }, { nm:'EXT', ct:'2 484', pc:'20.0%', w:'40%' }].map(t => (
                <div key={t.nm} className="bg-bg-deep p-3 flex flex-col gap-1.5 items-center">
                  <div className="font-mono text-[10px] text-text-dim uppercase tracking-[0.08em]">{t.nm}</div>
                  <div className="font-mono text-[22px] font-medium text-text-hi tracking-[-0.01em] leading-none">{t.ct}</div>
                  <div className="font-mono text-[10px] text-text-dim tracking-[0.04em]">{t.pc}</div>
                  <div className="w-full h-1 bg-surf-3 mt-1 rounded-[1px] overflow-hidden"><div className="h-full bg-text-hi" style={{ width: t.w }} /></div>
                </div>
              ))}
            </div>
            <div className="flex flex-col gap-2 mt-[10px]">
              <LegRow dot="#f0f3f6" label="Authoritative"     value="5 218" pct="41.9%" />
              <LegRow dot="#b8c0c8" label="Reference"         value="4 740" pct="38.1%" />
              <LegRow dot="#6e7681" label="External / public" value="2 484" pct="20.0%" />
            </div>
          </Card>

          <Card>
            <CardHead title="Language" sub="bilingual corpus" />
            <StackBar segs={[{ pct: 62, color: '#b8c0c8', title: 'EN' }, { pct: 31, color: '#6e7681', title: 'AR' }, { pct: 7, color: '#4a5058', title: 'Bilingual' }]} />
            <div className="flex flex-col gap-2 mt-[14px]">
              <LegRow dot="#b8c0c8" label="English"   value="7 714" pct="62.0%" />
              <LegRow dot="#6e7681" label="العربية"   value="3 858" pct="31.0%" />
              <LegRow dot="#4a5058" label="Bilingual"  value="870"   pct="7.0%"  />
            </div>
          </Card>

          <Card>
            <CardHead title="Index pipeline" sub="live status" />
            <StackBar segs={[{ pct: 98.6, color: '#7aae7a', title: 'Indexed' }, { pct: 1.1, color: '#d8a957', title: 'Processing' }, { pct: 0.3, color: '#d97570', title: 'Failed' }]} />
            <div className="flex flex-col gap-2 mt-[14px]">
              <LegRow dot="#7aae7a" label="Indexed"    value="12 271" pct="98.6%" />
              <LegRow dot="#d8a957" label="Processing" value="133"    pct="1.1%"  />
              <LegRow dot="#d97570" label="Failed"     value="38"     pct="0.3%"  />
            </div>
            <div className="mt-3 font-mono text-[10px] text-text-dim tracking-[0.04em]">
              avg embedding latency · 4.8s · p95 11.2s
            </div>
          </Card>
        </div>

        {/* ── Chart row ──────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-[14px] mb-[14px]">

          <Card>
            <CardHead title="Citations · last 30 days" sub="stacked by source tier" />
            <div className="relative flex items-end gap-[3px] h-[130px] border-b border-border-base pb-px">
              <div className="absolute inset-x-0 border-t border-dashed border-border-base opacity-50" style={{ top: '33%' }} />
              <div className="absolute inset-x-0 border-t border-dashed border-border-base opacity-50" style={{ top: '66%' }} />
              {CITES.map((d, i) => {
                const total = d[0] + d[1] + d[2];
                const h = total / MAX_CITE * 100;
                return (
                  <div key={i} title={`day ${i+1} · ${total} cites`} className="flex-1 flex flex-col justify-end h-full min-w-0 cursor-default">
                    <div className="flex flex-col gap-px" style={{ height: `${h}%` }}>
                      <div style={{ flex: d[2], background: '#d97570', minHeight: 1 }} />
                      <div style={{ flex: d[1], background: '#d8a957', minHeight: 1 }} />
                      <div style={{ flex: d[0], background: '#7aae7a', minHeight: 1 }} />
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex mt-2">
              {CITES.map((_, i) => { const d = i+1; const show = d%5===0||d===1; return <span key={i} className={`flex-1 text-center font-mono text-[9px] uppercase tracking-[0.04em] ${show?'text-text-dim':'text-text-faint'}`}>{show?d:''}</span>; })}
            </div>
            <div className="flex gap-[18px] mt-3 items-center">
              {[{ c:'#7aae7a', l:'AUTH' }, { c:'#d8a957', l:'REF' }, { c:'#d97570', l:'EXT' }].map(x => (
                <div key={x.l} className="flex items-center gap-1.5 font-mono text-[10px] text-text-mid tracking-[0.04em]">
                  <span className="w-2.5 h-2.5 block flex-shrink-0" style={{ background: x.c }} />{x.l}
                </div>
              ))}
              <span className="ml-auto font-mono text-[11px] text-text-hi">Σ 8 314 cites</span>
            </div>
          </Card>

          <Card>
            <CardHead title="Uploads · last 30 days" sub="daily volume" />
            <div className="relative flex items-end gap-[3px] h-[130px] border-b border-border-base pb-px">
              <div className="absolute inset-x-0 border-t border-dashed border-border-base opacity-50" style={{ top: '33%' }} />
              <div className="absolute inset-x-0 border-t border-dashed border-border-base opacity-50" style={{ top: '66%' }} />
              {UPLOADS.map((v, i) => {
                const h = Math.max(2, Math.round(v / MAX_UPLOAD * 100));
                const bg = v >= 20 ? '#f0f3f6' : v <= 4 ? '#6e7681' : '#b8c0c8';
                return (
                  <div key={i} title={`day ${i+1} · ${v} uploads`} className="flex-1 flex flex-col justify-end h-full min-w-0 cursor-default">
                    <div style={{ height: `${h}%`, background: bg, minHeight: 1 }} />
                  </div>
                );
              })}
            </div>
            <div className="flex mt-2">
              {UPLOADS.map((_, i) => { const d = i+1; const show = d%5===0||d===1; return <span key={i} className={`flex-1 text-center font-mono text-[9px] ${show?'text-text-dim':'text-text-faint'}`}>{show?d:''}</span>; })}
            </div>
            <div className="flex gap-[18px] mt-3 font-mono text-[11px] text-text-mid tracking-[0.04em]">
              <span>peak <b className="text-text-hi font-medium">24</b> · 21 May</span>
              <span>quiet <b className="text-text-hi font-medium">2</b> · Fri</span>
              <span className="ml-auto">Σ <b className="text-text-hi font-medium">148</b> uploads</span>
            </div>
          </Card>
        </div>

        {/* ── Leaderboard row ───────────────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-[14px] mb-[14px]">

          <Card>
            <CardHead title="Top referenced documents" sub="last 30 days" />
            <div className="flex flex-col gap-2">
              {[
                { rk:'01', nm:'SOP — Night-Ops Handoff Procedure (v4)',    id:'DOC-2934', pct:100, v:156 },
                { rk:'02', nm:'Sensor Maintenance Manual — DJI M30',        id:'DOC-2920', pct:57,  v:89  },
                { rk:'03', nm:'GCAA UAS Regulation — 2026 Amendments',      id:'DOC-2918', pct:45,  v:71  },
                { rk:'04', nm:'NOTAM A0743 — Jamming Authorisation',        id:'DOC-2941', pct:30,  v:47  },
                { rk:'05', nm:'Threat Report 2026-052 — Marina Perimeter',  id:'DOC-2929', pct:24,  v:38  },
                { rk:'06', nm:'Daily Operations Brief — 22 May 2026',       id:'DOC-2908', pct:20,  v:31  },
                { rk:'07', nm:'CUAS Readiness Report — Sites 04/07/09',     id:'DOC-2938', pct:15,  v:23  },
                { rk:'08', nm:'Air Corridor Map — Dubai Operations Zone',   id:'DOC-2904', pct:12,  v:18  },
              ].map(r => (
                <div key={r.rk} className="grid items-center gap-3 text-[12px]" style={{ gridTemplateColumns: '18px 1fr 1fr 60px' }}>
                  <span className="font-mono text-[10px] text-text-faint text-right tracking-[0.04em]">{r.rk}</span>
                  <span className="text-text-hi text-[12.5px] overflow-hidden text-ellipsis whitespace-nowrap">
                    {r.nm} <span className="font-mono text-[10px] text-text-dim ml-1 tracking-[0.04em]">{r.id}</span>
                  </span>
                  <div className="bg-bg-deep h-1.5 border border-border-base rounded-[1px] overflow-hidden">
                    <div className="h-full bg-text-hi" style={{ width: `${r.pct}%` }} />
                  </div>
                  <span className="font-mono text-[12px] text-text-hi text-right tracking-[-0.01em] font-medium">{r.v}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <CardHead title="Top uploaders" sub="90-day window · 24 personnel" />
            <div className="flex flex-col gap-2">
              {[
                { init:'MH',  nm:'M. Al-Haji',      cl:'L4 · OPS-LEAD', lvl:'l4', pct:100, v:42 },
                { init:'HK',  nm:'H. Khalifa',      cl:'L3 · ANALYST',  lvl:'l3', pct:71,  v:30 },
                { init:'KM',  nm:'K. Mansoor',      cl:'L3 · TECH',     lvl:'l3', pct:55,  v:23 },
                { init:'SR',  nm:'S. Rahimi',       cl:'L3 · ANALYST',  lvl:'l3', pct:45,  v:19 },
                { init:'AS',  nm:'A. Suleiman',     cl:'L2 · OPERATOR', lvl:'l2', pct:26,  v:11 },
                { init:'FN',  nm:'F. Nazari',       cl:'L2 · OPERATOR', lvl:'l2', pct:19,  v:8  },
                { init:'RA',  nm:'R. Al-Mansoori',  cl:'L3 · ANALYST',  lvl:'l3', pct:12,  v:5  },
                { init:'+17', nm:'17 others',       cl:'L2–L4 · field', lvl:'',   pct:22,  v:10 },
              ].map(u => (
                <div key={u.init} className="grid items-center gap-2.5" style={{ gridTemplateColumns: '28px 1fr 1.4fr 70px' }}>
                  <div className="w-7 h-7 bg-surf-2 border border-border-hi rounded-[2px] grid place-items-center font-mono text-[10px] text-text-mid tracking-[0.04em] flex-shrink-0">
                    {u.init}
                  </div>
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <span className="text-text-hi text-[12.5px] font-medium">{u.nm}</span>
                    <span className={`font-mono text-[9px] uppercase tracking-[0.06em] ${u.lvl==='l4'?'text-uasc-red':u.lvl==='l3'?'text-uasc-amber':u.lvl==='l2'?'text-uasc-green':'text-text-dim'}`}>{u.cl}</span>
                  </div>
                  <div className="bg-bg-deep h-1.5 border border-border-base rounded-[1px] overflow-hidden">
                    <div className="h-full bg-text-hi" style={{ width: `${u.pct}%` }} />
                  </div>
                  <span className="font-mono text-[12px] text-text-hi text-right font-medium">
                    {u.v}<span className="text-text-dim text-[10px] ml-0.5"> docs</span>
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* ── Tags + Heatmap row (2:3) ──────────────────────────────────── */}
        <div className="grid gap-[14px] mb-[14px]" style={{ gridTemplateColumns: '2fr 3fr' }}>

          <Card>
            <CardHead title="Top tags" sub="size ∝ frequency" />
            <div className="flex flex-wrap gap-1.5">
              {[
                { t:'cuas',       ct:412, sz:'xl' }, { t:'sop',        ct:388, sz:'xl' },
                { t:'night-ops',  ct:301, sz:'l'  }, { t:'threat',     ct:268, sz:'l'  },
                { t:'notam',      ct:241, sz:'l'  }, { t:'marina',     ct:184, sz:'m'  },
                { t:'perimeter',  ct:172, sz:'m'  }, { t:'jamming',    ct:158, sz:'m'  },
                { t:'handoff',    ct:144, sz:'m'  }, { t:'regulation', ct:139, sz:'m'  },
                { t:'gcaa',       ct:124, sz:'s'  }, { t:'training',   ct:112, sz:'s'  },
                { t:'incident',   ct:98,  sz:'s'  }, { t:'escalation', ct:87,  sz:'s'  },
                { t:'telemetry',  ct:82,  sz:'s'  }, { t:'sensor',     ct:74,  sz:'s'  },
                { t:'readiness',  ct:69,  sz:'s'  }, { t:'compliance', ct:58,  sz:'xs' },
                { t:'corridors',  ct:52,  sz:'xs' }, { t:'audit',      ct:47,  sz:'xs' },
                { t:'inventory',  ct:44,  sz:'xs' }, { t:'brief',      ct:41,  sz:'xs' },
                { t:'curriculum', ct:38,  sz:'xs' }, { t:'ab-12',      ct:34,  sz:'xs' },
                { t:'hardware',   ct:31,  sz:'xs' }, { t:'daily',      ct:17,  sz:'xs' },
              ].map(tag => {
                const szCls: Record<string, string> = {
                  xl: 'text-[14px] text-text-hi border-border-hi',
                  l:  'text-[13px] text-text-hi',
                  m:  'text-[12px] text-text-hi',
                  s:  'text-[11px]',
                  xs: 'text-[10px]',
                };
                return (
                  <span key={tag.t} className={`inline-flex items-center gap-[5px] bg-bg-deep border border-border-base rounded-[2px] px-[7px] py-[3px] font-mono text-text-mid tracking-[0.02em] cursor-default transition-all duration-120 hover:text-text-hi hover:border-border-hi ${szCls[tag.sz]}`}>
                    {tag.t}<span className="text-text-dim text-[9px] ml-0.5">·{tag.ct}</span>
                  </span>
                );
              })}
            </div>
          </Card>

          <Card>
            <CardHead title="Citation activity · hour × weekday" sub="last 14 days · GST" />
            <div className="grid gap-[4px_6px]" style={{ gridTemplateColumns: '32px 1fr', gridTemplateRows: 'auto auto' }}>
              <div />
              <div className="grid gap-0.5 font-mono text-[9px] text-text-faint tracking-[0.04em] text-center" style={{ gridTemplateColumns: 'repeat(24, 1fr)' }}>
                {Array.from({ length: 24 }, (_, h) => (
                  <span key={h}>{h===0?'00':h===6?'06':h===12?'12':h===18?'18':h===23?'23':''}</span>
                ))}
              </div>
              <div className="grid gap-0.5 font-mono text-[9px] text-text-faint tracking-[0.04em] text-right pt-px" style={{ gridAutoRows: '14px' }}>
                {DAYS.map(d => <span key={d} style={{ lineHeight: '14px' }}>{d}</span>)}
              </div>
              <div className="grid gap-0.5" style={{ gridTemplateColumns: 'repeat(24, 1fr)', gridAutoRows: '14px' }}>
                {DAYS.map((_, day) =>
                  Array.from({ length: 24 }, (__, hr) => {
                    const lv = heatLevel(day, hr);
                    return (
                      <div key={`${day}-${hr}`}
                        className="rounded-[1px] transition-[filter] duration-120 hover:brightness-150"
                        style={{ background: HM_COLORS[lv] }}
                        title={`${DAYS[day]} ${String(hr).padStart(2,'0')}:00 · level ${lv}`}
                      />
                    );
                  })
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 mt-2.5 font-mono text-[9px] text-text-faint tracking-[0.04em]">
              <span>less</span>
              <div className="flex gap-0.5">
                {HM_COLORS.map((c, i) => <div key={i} className="w-3 h-3 rounded-[1px]" style={{ background: c }} />)}
              </div>
              <span>more</span>
              <span className="ml-auto">peak 14:00–16:00 GST · 28 cites/hr</span>
            </div>
          </Card>
        </div>

        {/* ── Access matrix + Recents + Audit feed ─────────────────────── */}
        <div className="grid grid-cols-3 gap-[14px]">

          <Card>
            <CardHead title="Role access matrix" sub="24 personnel · 3 levels" />
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  {['Level','Personnel','Upload','Query','Delete','Escalate'].map(h => (
                    <th key={h} className="text-left font-mono text-[10px] text-text-dim uppercase tracking-[0.08em] font-medium px-2 py-2 border-b border-border-base">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { lvl:'L4 · OPS-LEAD',     cls:'text-uasc-red',   users:'3',  perms:['full','full','full','full']              },
                  { lvl:'L3 · ANALYST/TECH',  cls:'text-uasc-amber', users:'9',  perms:['full','restricted','—','—']             },
                  { lvl:'L2 · OPERATOR',      cls:'text-uasc-green', users:'12', perms:['—','internal+public','—','—']           },
                ].map(row => (
                  <tr key={row.lvl} className="border-b border-border-base last:border-none">
                    <td className={`px-2 py-2 font-mono text-[11px] tracking-[0.06em] ${row.cls}`}>{row.lvl}</td>
                    <td className="px-2 py-2 font-mono text-[11px] text-text-hi">
                      {row.users}<span className="text-text-mid text-[10px] ml-1">people</span>
                    </td>
                    {row.perms.map((p, pi) => (
                      <td key={pi} className={`px-2 py-2 text-[12px] ${p!=='—'?'text-text-hi':'text-text-faint'}`}>
                        <span className="inline-block w-[7px] h-[7px] rounded-full mr-1.5 align-middle"
                          style={{ background: p!=='—'?'#7aae7a':'#0f1419', border: p==='—'?'1px solid #4a5058':'none' }} />
                        {p}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-2.5 font-mono text-[10px] text-text-faint tracking-[0.04em] leading-relaxed">
              Restricted documents (L4-classified) are filtered from L3/L2 query results. Delete + escalate actions are L4-only and always write to the audit ledger.
            </div>
          </Card>

          <Card>
            <CardHead title="Recent uploads" right={<Link href="/library" className="font-mono text-[10px] text-text-dim no-underline hover:text-text-mid cursor-pointer transition-colors duration-120">View all →</Link>} />
            <div className="flex flex-col gap-0.5">
              {[
                { ext:'PDF',  nm:'NOTAM A0743 — Jamming Authorisation',    id:'DOC-2941', cls:'amber', when:'14m ago' },
                { ext:'DOCX', nm:'CUAS Readiness Report — Sites 04/07/09', id:'DOC-2938', cls:'red',   when:'2h ago'  },
                { ext:'PDF',  nm:'SOP — Night-Ops Handoff Procedure (v4)', id:'DOC-2934', cls:'amber', when:'22h ago' },
                { ext:'DOCX', nm:'Threat Report 2026-052 — Marina',        id:'DOC-2929', cls:'red',   when:'1d ago'  },
                { ext:'PDF',  nm:'Incident Escalation Log — IR-2026-0511', id:'DOC-2925', cls:'amber', when:'1d ago'  },
                { ext:'PDF',  nm:'Sensor Maintenance Manual — DJI M30',    id:'DOC-2920', cls:'green', when:'2d ago'  },
                { ext:'PDF',  nm:'GCAA UAS Regulation — 2026 Amend.',      id:'DOC-2918', cls:'green', when:'3d ago'  },
              ].filter(r => canSeeRestricted || r.cls !== 'red').map(r => (
                <div key={r.id} className="grid items-center gap-2.5 py-[6px] border-b border-dashed border-border-base last:border-none" style={{ gridTemplateColumns: '28px 1fr auto auto' }}>
                  <div className="w-6 h-7 border border-border-hi rounded-[2px] grid place-items-center font-mono text-[8px] text-text-mid tracking-[0.04em] bg-bg-deep flex-shrink-0">{r.ext}</div>
                  <span className="text-text-hi text-[12.5px] overflow-hidden text-ellipsis whitespace-nowrap min-w-0">
                    {r.nm}<span className="font-mono text-[10px] text-text-dim ml-1.5 tracking-[0.04em]">{r.id}</span>
                  </span>
                  <div className={`w-[7px] h-[7px] rounded-full flex-shrink-0 ${r.cls==='red'?'bg-uasc-red':r.cls==='amber'?'bg-uasc-amber':'bg-uasc-green'}`} />
                  <span className="font-mono text-[10px] text-text-dim tracking-[0.04em] whitespace-nowrap">{r.when}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <CardHead title="Audit feed · live" sub="last 24h · all stations" />
            <div className="flex flex-col gap-0.5 max-h-[320px] overflow-auto pr-1">
              {[
                { t:'13:38', type:'q',   by:'A. Suleiman', lvl:'l2', msg:'Query cited DOC-2934 · "night handoff procedure"' },
                { t:'13:28', type:'up',  by:'M. Al-Haji',  lvl:'l4', msg:'Upload DOC-2941 · NOTAM A0743' },
                { t:'12:42', type:'q',   by:'K. Mansoor',  lvl:'l3', msg:'Query cited DOC-2920 · "M30 sensor recalibration"' },
                { t:'12:11', type:'esc', by:'M. Al-Haji',  lvl:'l4', msg:'Escalate doc DOC-2911 · internal → restricted' },
                { t:'11:18', type:'up',  by:'H. Khalifa',  lvl:'l3', msg:'Upload DOC-2938 · CUAS Readiness' },
                { t:'10:55', type:'q',   by:'A. Suleiman', lvl:'l2', msg:'Query denied · restricted doc, L2 caller' },
                { t:'10:21', type:'del', by:'M. Al-Haji',  lvl:'l4', msg:'Delete doc DOC-2716 · superseded SOP v3' },
                { t:'09:14', type:'up',  by:'S. Rahimi',   lvl:'l3', msg:'Upload DOC-2929 · Threat Report 2026-052' },
                { t:'08:40', type:'up',  by:'K. Mansoor',  lvl:'l3', msg:'Upload DOC-2915 · AB-12 Q1 telemetry' },
                { t:'07:02', type:'q',   by:'M. Al-Haji',  lvl:'l4', msg:'Query cited 4 docs · "morning brief 22 May"' },
              ].filter(row => canSeeRestricted || !/restricted/i.test(row.msg)).map((row, i) => (
                <div key={i} className="grid items-start gap-2.5 py-[7px] border-b border-dashed border-border-base last:border-none text-[12px]" style={{ gridTemplateColumns: '46px 10px 1fr auto' }}>
                  <span className="font-mono text-[10px] text-text-dim tracking-[0.04em]">{row.t}</span>
                  <span className={`w-1.5 h-1.5 rounded-full mt-[5px] flex-shrink-0 ${row.type==='up'?'bg-uasc-green':row.type==='del'?'bg-uasc-red':row.type==='esc'?'bg-uasc-amber':'bg-text-mid'}`} />
                  <span className="text-text-mid leading-[1.4] text-[11.5px]">{row.msg}</span>
                  <span className="font-mono text-[10px] text-text-dim tracking-[0.04em] text-right whitespace-nowrap">
                    {row.by} · <span className={row.lvl==='l4'?'text-uasc-red':row.lvl==='l3'?'text-uasc-amber':'text-uasc-green'}>{row.lvl.toUpperCase()}</span>
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>

      </div>
    </div>
  );
}
