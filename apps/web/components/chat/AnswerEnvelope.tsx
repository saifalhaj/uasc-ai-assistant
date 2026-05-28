import { cn } from '@/lib/cn';
import { Badge } from '@/components/ui/Badge';
import { InstrumentTile } from './InstrumentTile';
import type { AnswerEnvelopeData, EscalationFlag, Risk } from '@/lib/types';
import type { ReactNode } from 'react';

export function AnswerEnvelope({
  data,
  onCiteClick,
  focusedCitation,
}: {
  data: AnswerEnvelopeData;
  onCiteClick?: (n: number) => void;
  focusedCitation?: number;
}) {
  return (
    <article className="flex flex-col gap-3">
      <div className="font-mono text-[10px] tracking-[0.1em] text-text-hi uppercase">
        Assistant
      </div>

      <div className="text-[14.5px] leading-relaxed text-text-hi">
        {renderBody(data.body, onCiteClick)}
      </div>

      <div className="flex gap-1.5 flex-wrap">
        <Badge tone={riskTone(data.risk)}>RISK · {data.risk.toUpperCase()}</Badge>
        <Badge tone={recencyTone(data.recencyHealth)}>RECENCY · {data.recency}</Badge>
        <Badge tone="bright">CONFIDENCE · {(data.confidence * 100).toFixed(0)}%</Badge>
        <Badge tone={escTone(data.escalation)}>{escLabel(data.escalation)}</Badge>
        {data.spatial && <Badge tone="bright">SPATIAL · MAP ATTACHED</Badge>}
      </div>

      <div className="grid grid-cols-4 gap-px bg-border-base border border-border-base rounded mt-1">
        <InstrumentTile
          label="Confidence"
          value={`${(data.confidence * 100).toFixed(0)}%`}
          fill={data.confidence}
        />
        <InstrumentTile
          label="Recency"
          value={data.recency}
          tone={data.recencyHealth === 'green' ? 'green' : data.recencyHealth === 'amber' ? 'amber' : 'red'}
          fill={data.recencyHealth === 'green' ? 0.85 : data.recencyHealth === 'amber' ? 0.5 : 0.15}
        />
        <InstrumentTile
          label="Risk"
          value={shortRisk(data.risk)}
          tone={data.risk === 'high' ? 'red' : data.risk === 'elevated' ? 'amber' : 'green'}
          fill={data.risk === 'high' ? 0.85 : data.risk === 'elevated' ? 0.6 : 0.25}
        />
        <InstrumentTile
          label="Escalation"
          value={data.escalation === 'none' ? '—' : data.escalation.toUpperCase()}
          tone={data.escalation === 'escalated' ? 'red' : data.escalation === 'flagged' ? 'amber' : 'neutral'}
          fill={data.escalation === 'none' ? 0 : data.escalation === 'flagged' ? 0.5 : 0.9}
        />
      </div>

      <div
        className={cn(
          'pt-2 border-t border-dashed border-border-base',
          'font-mono text-[10px] tracking-[0.04em] text-text-dim',
        )}
      >
        Limitations · {data.limitations || '—'}
      </div>
    </article>
  );
}

function renderBody(body: string, onCite?: (n: number) => void): ReactNode {
  const parts: ReactNode[] = [];
  const re = /\[(\d+)\]/g;
  let last = 0;
  let match: RegExpExecArray | null;
  while ((match = re.exec(body)) !== null) {
    if (match.index > last) parts.push(body.slice(last, match.index));
    const n = Number(match[1]);
    parts.push(
      <button
        key={`c-${match.index}`}
        type="button"
        onClick={() => onCite?.(n)}
        className={cn(
          'inline-flex items-center justify-center min-w-[18px] h-[16px] px-1 mx-px',
          'bg-surf-2 border border-border-hi rounded-sm',
          'font-mono text-[10px] text-text-hi align-[2px]',
          'hover:bg-surf-3 hover:border-text-hi',
        )}
      >
        {n}
      </button>,
    );
    last = re.lastIndex;
  }
  if (last < body.length) parts.push(body.slice(last));
  return parts;
}

function riskTone(r: Risk) { return r === 'high' ? 'red' : r === 'elevated' ? 'amber' : 'green'; }
function recencyTone(h: 'green' | 'amber' | 'red') { return h; }
function escTone(e: EscalationFlag) { return e === 'escalated' ? 'red' : e === 'flagged' ? 'amber' : 'muted'; }
function escLabel(e: EscalationFlag) { return e === 'none' ? 'NO ESCALATION' : e === 'flagged' ? 'FLAGGED' : 'ESCALATED'; }
function shortRisk(r: Risk) { return r === 'elevated' ? 'ELEV' : r === 'high' ? 'HIGH' : 'LOW'; }
