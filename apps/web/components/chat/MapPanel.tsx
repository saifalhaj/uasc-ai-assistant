'use client';

import { cn } from '@/lib/cn';
import { Button } from '@/components/ui/Button';

export interface MapZone {
  id: string;
  active: boolean;
  points: string;
  labelX: number;
  labelY: number;
  status: string;
}

export interface MapMarker {
  id: string;
  x: number;
  y: number;
  tone?: 'green' | 'amber' | 'red' | 'neutral';
}

export interface MapPanelProps {
  title?: string;
  zones: MapZone[];
  detectionSites?: MapMarker[];
  airborne?: MapMarker[];
  stats?: { label: string; value: string }[];
  onClose?: () => void;
}

const markerColor: Record<NonNullable<MapMarker['tone']>, string> = {
  green:   '#7aae7a',
  amber:   '#d8a957',
  red:     '#d97570',
  neutral: '#f0f3f6',
};

export function MapPanel({
  title = 'SPATIAL VIEW · DUBAI',
  zones,
  detectionSites = [],
  airborne = [],
  stats = [],
  onClose,
}: MapPanelProps) {
  return (
    <section className="relative border-l border-border-base bg-bg-deep overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse at 45% 55%, rgba(240,243,246,0.05), transparent 60%),
            repeating-linear-gradient(0deg, rgba(255,255,255,0.025) 0 1px, transparent 1px 56px),
            repeating-linear-gradient(90deg, rgba(255,255,255,0.025) 0 1px, transparent 1px 56px),
            #0a0d12
          `,
        }}
        aria-hidden
      />
      <svg viewBox="0 0 400 600" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 w-full h-full">
        <path d="M 0 90 Q 60 80, 120 110 T 240 130 Q 320 145, 400 110" stroke="#3a4250" strokeWidth="1.2" fill="none" strokeDasharray="3 4"/>
        <path d="M 0 460 Q 80 440, 160 470 T 320 480 Q 380 472, 400 488" stroke="#3a4250" strokeWidth="1.2" fill="none" strokeDasharray="3 4"/>
        <path d="M 300 60 Q 240 180, 200 280 T 140 460" stroke="#3a4250" strokeWidth="1" fill="none"/>
        {zones.map(z => (
          <g key={z.id}>
            <polygon
              points={z.points}
              fill={z.active ? 'rgba(216,169,87,0.10)' : 'rgba(240,243,246,0.04)'}
              stroke={z.active ? '#d8a957' : '#6e7681'}
              strokeWidth="1.5"
              strokeDasharray={z.active ? undefined : '4 3'}
            />
            <text x={z.labelX} y={z.labelY} fontFamily="JetBrains Mono" fontSize="11" fill="#f0f3f6" fontWeight="500">{z.id}</text>
            <text x={z.labelX} y={z.labelY + 14} fontFamily="JetBrains Mono" fontSize="8" fill={z.active ? '#d8a957' : '#6e7681'} letterSpacing="0.5">{z.status}</text>
          </g>
        ))}
        {detectionSites.map(m => (
          <g key={m.id}>
            <circle cx={m.x} cy={m.y} r="3" fill={markerColor[m.tone ?? 'green']} opacity={m.tone === 'amber' ? 0.7 : 1} />
            <text x={m.x + 8} y={m.y + 4} fontFamily="JetBrains Mono" fontSize="8" fill="#b8c0c8">{m.id}</text>
          </g>
        ))}
        {airborne.map(m => (
          <g key={m.id}>
            <circle cx={m.x} cy={m.y} r="4" fill="none" stroke={markerColor[m.tone ?? 'neutral']} strokeWidth="1" />
            <circle cx={m.x} cy={m.y} r="1.5" fill={markerColor[m.tone ?? 'neutral']} />
            <text x={m.x + 8} y={m.y + 3} fontFamily="JetBrains Mono" fontSize="8" fill="#f0f3f6">{m.id}</text>
          </g>
        ))}
        <g opacity="0.4">
          <path d="M 200 0 L 200 600" stroke="#3a4250" strokeWidth="0.5" strokeDasharray="2 6" />
          <path d="M 0 300 L 400 300" stroke="#3a4250" strokeWidth="0.5" strokeDasharray="2 6" />
        </g>
      </svg>
      <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
        <span className={cn('font-mono text-[11px] tracking-[0.08em] text-text-hi', 'bg-bg-deep/85 border border-border-base rounded-sm px-2 py-1')}>
          {title}
        </span>
        {onClose && (
          <Button variant="tertiary" size="sm" onClick={onClose} className="bg-bg-deep/85">
            × Hide map
          </Button>
        )}
      </div>
      {stats.length > 0 && (
        <div className="absolute bottom-3 right-3 flex gap-1.5 z-10">
          {stats.map(s => (
            <div key={s.label} className={cn('bg-bg-deep/85 border border-border-base rounded-sm px-2.5 py-1', 'font-mono text-[10px] text-text-hi tracking-[0.06em]')}>
              <span className="text-text-dim mr-1.5">{s.label}</span>{s.value}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
