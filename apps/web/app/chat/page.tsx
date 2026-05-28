"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { ChatLayout, ChatMain, CitationsRail, UserMessage } from '@/components/chat/ChatLayout';
import { Sidebar } from '@/components/chat/Sidebar';
import { Composer } from '@/components/chat/Composer';
import { AnswerEnvelope } from '@/components/chat/AnswerEnvelope';
import { LoadingStages, type LoadingStage } from '@/components/chat/LoadingStages';
import { ErrorState } from '@/components/chat/ErrorState';
import { CitationCard } from '@/components/chat/CitationCard';
import { useAuth, hasLevel } from '@/app/AuthProvider';
import type { AnswerEnvelopeData, Citation, Risk, SourceTier } from '@/lib/types';
import type {
  AnswerEnvelope as ApiEnvelope,
  ChatSession as ApiChatSession,
  ChatThread as ApiChatThread,
} from '@uasc/shared';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// ── API → UI adapters ────────────────────────────────────────────────────────

function toSourceTier(t: string): SourceTier {
  if (t === 'vetted') return 'reference';
  if (t === 'open') return 'external';
  return 'authoritative';
}

function toRisk(level: string): Risk {
  if (level === 'medium') return 'elevated';
  if (level === 'high') return 'high';
  return 'low';
}

function toRecencyHealth(recency: string): 'green' | 'amber' | 'red' {
  const lower = recency.toLowerCase();
  if (lower.includes('stale') || lower.includes('old')) return 'red';
  if (lower.includes('day') || lower.includes('week')) return 'amber';
  return 'green';
}

function adaptApiEnvelope(api: ApiEnvelope, canSeeRestricted: boolean): AnswerEnvelopeData {
  const safeCitations = canSeeRestricted
    ? api.citations
    : api.citations.filter(c => c.classification !== 'restricted');
  const citations: Citation[] = safeCitations.map((c, i) => ({
    n: i + 1,
    title: c.source_name,
    classification: c.classification as Citation['classification'],
    sourceTier: toSourceTier(c.source_tier),
    issuedAt: new Date().toISOString(),
    excerpt: c.text_excerpt,
    excerptIsArabic: c.language === 'ar',
    docId: c.chunk_id,
  }));

  return {
    body: api.answer,
    citations,
    confidence: api.confidence,
    recency: api.recency,
    recencyHealth: toRecencyHealth(api.recency),
    risk: toRisk(api.risk_level),
    escalation: api.escalation_flag ? 'flagged' : 'none',
    limitations: Array.isArray(api.limitations) ? api.limitations.join(' ') : (api.limitations as string) || '',
  };
}

// ── Turn model ───────────────────────────────────────────────────────────────

type Turn =
  | { id: string; question: string; state: 'loading'; stageIdx: number }
  | { id: string; question: string; state: 'done'; data: AnswerEnvelopeData }
  | { id: string; question: string; state: 'error'; code: string; message: string };

function uid() {
  return Math.random().toString(36).slice(2);
}

// Relative time for sidebar — "14m", "2h", "3d", "12 May"
function relTime(iso: string): string {
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return '';
  const diff = Date.now() - t;
  const m = Math.floor(diff / 60_000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  return new Date(t).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
}

// ── Chat page ────────────────────────────────────────────────────────────────

export default function ChatPage() {
  const { user } = useAuth();
  const canSeeRestricted = hasLevel(user, 'L4');
  const [turns, setTurns] = useState<Turn[]>([]);
  const [focusedCitation, setFocusedCitation] = useState<number | null>(null);
  const [sessions, setSessions] = useState<ApiChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [loadingThread, setLoadingThread] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom on each new turn (but not when hydrating a past thread)
  useEffect(() => {
    if (!loadingThread) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [turns.length, loadingThread]);

  const isLoading = turns.at(-1)?.state === 'loading';

  // ── Load thread list ──────────────────────────────────────────────────────
  const refreshSessions = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/chats?limit=30`, { credentials: 'include' });
      if (!res.ok) return;
      const data: ApiChatSession[] = await res.json();
      setSessions(data);
    } catch {
      /* silent — empty sidebar is acceptable */
    }
  }, []);

  useEffect(() => {
    if (user) refreshSessions();
  }, [user, refreshSessions]);

  // ── Open a past thread ────────────────────────────────────────────────────
  async function handleOpenSession(id: string) {
    if (id === currentSessionId) return;
    setLoadingThread(true);
    setFocusedCitation(null);
    try {
      const res = await fetch(`${API_URL}/chats/${id}`, { credentials: 'include' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const thread: ApiChatThread = await res.json();
      const rebuilt: Turn[] = thread.turns.map(t => ({
        id: uid(),
        question: t.question,
        state: 'done',
        data: adaptApiEnvelope(t.envelope, canSeeRestricted),
      }));
      setTurns(rebuilt);
      setCurrentSessionId(id);
    } catch {
      /* fall through silently — keep current view */
    } finally {
      setLoadingThread(false);
    }
  }

  // ── Submit a new question ────────────────────────────────────────────────
  async function handleSubmit(question: string) {
    const id = uid();
    setFocusedCitation(null);
    setTurns(prev => [...prev, { id, question, state: 'loading', stageIdx: 0 }]);

    // Animate stages: 0→1 after 800ms, 1→2 after 1800ms
    const t1 = setTimeout(() => updateStage(id, 1), 800);
    const t2 = setTimeout(() => updateStage(id, 2), 1800);

    try {
      const res = await fetch(`${API_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, top_k: 5, session_id: currentSessionId ?? undefined }),
        credentials: 'include',
      });
      clearTimeout(t1);
      clearTimeout(t2);
      if (!res.ok) {
        const detail = await res.json().catch(() => ({}));
        throw new Error(detail.detail || `HTTP ${res.status}`);
      }
      const api: ApiEnvelope = await res.json();
      setTurns(prev =>
        prev.map(t =>
          t.id === id
            ? { id, question, state: 'done', data: adaptApiEnvelope(api, canSeeRestricted) }
            : t,
        ),
      );
      if (api.session_id && api.session_id !== currentSessionId) {
        setCurrentSessionId(api.session_id);
      }
      // Refresh sidebar so the just-touched thread bubbles to the top
      refreshSessions();
    } catch (err) {
      clearTimeout(t1);
      clearTimeout(t2);
      const msg = err instanceof Error ? err.message : 'Request failed';
      setTurns(prev =>
        prev.map(t =>
          t.id === id
            ? { id, question, state: 'error', code: 'ERR-5001', message: msg }
            : t,
        ),
      );
    }
  }

  function updateStage(id: string, stageIdx: number) {
    setTurns(prev =>
      prev.map(t =>
        t.id === id && t.state === 'loading' ? { ...t, stageIdx } : t,
      ),
    );
  }

  function handleNew() {
    setTurns([]);
    setCurrentSessionId(null);
    setFocusedCitation(null);
  }

  const recentItems = sessions.map(s => ({
    id: s.id,
    title: s.title,
    when: relTime(s.updated_at),
    active: s.id === currentSessionId,
  }));

  const lastDoneTurn = turns.filter(t => t.state === 'done').at(-1);
  const activeCitations = lastDoneTurn?.state === 'done' ? lastDoneTurn.data.citations : [];

  return (
    <ChatLayout
      sidebar={
        <Sidebar
          recent={recentItems}
          onNew={handleNew}
          onOpen={handleOpenSession}
          libraryHref="/upload"
        />
      }
      main={
        <ChatMain
          composer={
            <Composer
              onSubmit={handleSubmit}
              disabled={isLoading}
              stage={isLoading ? 'processing' : 'ready'}
            />
          }
        >
          {turns.length === 0 && (
            <div className="flex flex-col items-center justify-center min-h-[40vh] gap-3 text-center">
              <div className="font-mono text-[10px] uppercase tracking-[0.1em] text-text-dim">
                UASC Operational Intelligence
              </div>
              <p className="text-text-faint text-sm max-w-xs">
                Ask a question in English or Arabic to query the operational corpus.
              </p>
            </div>
          )}

          {turns.map(turn => (
            <div key={turn.id} className="flex flex-col gap-4">
              <UserMessage>
                <span dir="auto">{turn.question}</span>
              </UserMessage>

              {turn.state === 'loading' && (
                <LoadingStages stages={buildStages(turn.stageIdx)} />
              )}

              {turn.state === 'done' && (
                <AnswerEnvelope
                  data={turn.data}
                  onCiteClick={setFocusedCitation}
                  focusedCitation={focusedCitation ?? undefined}
                />
              )}

              {turn.state === 'error' && (
                <ErrorState
                  code={turn.code}
                  title="Query failed"
                  message={turn.message}
                  actions={[
                    { label: 'Try again', onClick: () => handleSubmit(turn.question) },
                    { label: 'Start a new query', onClick: handleNew },
                  ]}
                />
              )}
            </div>
          ))}

          <div ref={bottomRef} />
        </ChatMain>
      }
      citations={
        <CitationsRail
          title="Sources"
          count={activeCitations.length || undefined}
        >
          {activeCitations.length === 0 ? (
            <p className="font-mono text-[10px] text-text-faint mt-2">
              Sources appear here after a query.
            </p>
          ) : (
            activeCitations.map(c => (
              <CitationCard
                key={c.n}
                citation={c}
                focused={focusedCitation === c.n}
                onClick={() => setFocusedCitation(focusedCitation === c.n ? null : c.n)}
              />
            ))
          )}
        </CitationsRail>
      }
    />
  );
}

function buildStages(stageIdx: number): LoadingStage[] {
  return [
    {
      label: 'Retrieving from index',
      state: stageIdx === 0 ? 'active' : 'done',
    },
    {
      label: 'Calling model',
      state: stageIdx === 0 ? 'pending' : stageIdx === 1 ? 'active' : 'done',
    },
    {
      label: 'Generating citations',
      state: stageIdx < 2 ? 'pending' : 'active',
    },
  ];
}
