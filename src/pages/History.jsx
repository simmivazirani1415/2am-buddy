import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronRight, ArrowDown, Video, Moon, Heart } from 'lucide-react';
import Card from '../components/Card';
import Button from '../components/Button';
import { useApp } from '../context/AppContext';

const TABS = [
  { id: 'recent', label: 'Recent' },
  { id: 'critical', label: 'Critical' },
  { id: 'counselor', label: 'Counselor' },
];

const MOOD_EMOJI = {
  good: '😊',
  'not-great': '😐',
  struggling: '😕',
};

const RISK_BADGE = {
  high: { label: 'High Risk', cls: 'bg-rose/25 text-rose border-rose/50' },
  medium: { label: 'Medium Risk', cls: 'bg-amber-500/20 text-amber-300 border-amber-500/40' },
  low: { label: 'Low Risk', cls: 'bg-success/20 text-success border-success/40' },
};

function formatDate(iso) {
  try {
    return new Date(iso).toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

function formatDuration(sec) {
  if (!sec) return '—';
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}m ${s.toString().padStart(2, '0')}s`;
}

function MoodPair({ before, after }) {
  return (
    <div
      className="flex flex-col items-center justify-center shrink-0 w-14"
      aria-label={`Mood ${before} to ${after}`}
    >
      <span className="text-xl leading-none" aria-hidden="true">
        {MOOD_EMOJI[before] ?? '—'}
      </span>
      <ArrowDown className="h-3 w-3 text-textgray my-0.5" aria-hidden="true" />
      <span className="text-xl leading-none" aria-hidden="true">
        {MOOD_EMOJI[after] ?? '—'}
      </span>
    </div>
  );
}

function Empty({ Icon, message }) {
  return (
    <div className="mt-10 flex flex-col items-center text-center gap-3 px-6">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-purple/15 text-purple-light">
        <Icon className="h-7 w-7" aria-hidden="true" />
      </span>
      <p className="text-textgray leading-relaxed max-w-xs">{message}</p>
    </div>
  );
}

function RecentCard({ entry }) {
  return (
    <Link
      to={`/history/${entry.id}`}
      className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-light rounded-2xl"
    >
      <Card hover className="flex items-center gap-3">
        <MoodPair before={entry.moodBefore} after={entry.moodAfter} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <p className="font-semibold text-sm truncate">
              {entry.title ?? 'Conversation'}
            </p>
            <span className="text-[10px] text-textgray shrink-0">
              {formatDuration(entry.durationSec)}
            </span>
          </div>
          <p className="text-xs text-textgray mt-0.5 line-clamp-2 leading-snug">
            {entry.summary ?? 'No summary yet.'}
          </p>
          <p className="text-[10px] text-textgray/70 mt-1">
            {formatDate(entry.startTime)}
          </p>
        </div>
        <ChevronRight className="h-5 w-5 text-textgray shrink-0" aria-hidden="true" />
      </Card>
    </Link>
  );
}

function CriticalCard({ entry }) {
  const badge = RISK_BADGE[entry.riskLevel] ?? RISK_BADGE.medium;
  return (
    <Link
      to={`/history/${entry.id}`}
      className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-light rounded-2xl"
    >
      <Card hover className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <span
            className={[
              'text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border',
              badge.cls,
            ].join(' ')}
          >
            {badge.label}
          </span>
          <span className="text-[10px] text-textgray">{formatDate(entry.startTime)}</span>
        </div>
        <p className="font-semibold text-sm">{entry.title ?? 'A heavy moment'}</p>
        <p className="text-xs text-textgray leading-relaxed">
          That night felt harder than usual. Sharing it with a counselor can
          help them understand what's going on.
        </p>
        <Link to="/share">
          <Button variant="primary" size="sm" className="w-full">
            Share with counselor
          </Button>
        </Link>
      </Card>
    </Link>
  );
}

function UpcomingSessionCard({ entry, onRebook }) {
  return (
    <Card hover={false} className="space-y-4 bg-gradient-to-br from-purple/20 to-navy-light/80 border-purple/40">
      <div className="flex items-start justify-between gap-2">
        <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-success/20 text-success border border-success/40">
          Upcoming session
        </span>
        <span className="text-[10px] text-textgray">{entry.slot}</span>
      </div>
      <div className="flex items-center gap-3">
        <img
          src={entry.counselor?.image}
          alt={entry.counselor?.name}
          className="h-14 w-14 rounded-full object-cover border-2 border-purple-light"
          onError={(e) => (e.currentTarget.style.display = 'none')}
        />
        <div className="min-w-0">
          <p className="font-semibold truncate">{entry.counselor?.name}</p>
          <p className="text-xs text-textgray truncate">{entry.counselor?.title}</p>
          <p className="text-xs text-textgray mt-0.5 flex items-center gap-1">
            <Video className="h-3.5 w-3.5" aria-hidden="true" /> Google Meet
          </p>
        </div>
      </div>
      <div className="flex gap-2">
        <Link to={`/history/${entry.id}`} className="flex-1">
          <Button variant="secondary" size="sm" className="w-full">
            Session details
          </Button>
        </Link>
        <Button variant="primary" size="sm" className="flex-1" onClick={onRebook}>
          Rebook
        </Button>
      </div>
    </Card>
  );
}

function PastCounselorRow({ entry }) {
  return (
    <Card hover className="flex items-center gap-3 py-3">
      <img
        src={entry.counselor?.image}
        alt={entry.counselor?.name}
        className="h-10 w-10 rounded-full object-cover border border-purple-light shrink-0"
        onError={(e) => (e.currentTarget.style.display = 'none')}
      />
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-sm truncate">{entry.counselor?.name}</p>
        <p className="text-[11px] text-textgray truncate">{entry.slot}</p>
        {entry.notes && (
          <p className="text-[11px] text-textgray/80 mt-0.5 italic truncate">"{entry.notes}"</p>
        )}
      </div>
      <Link
        to={`/history/${entry.id}`}
        className="shrink-0 text-xs text-purple-light hover:text-white"
      >
        View notes
      </Link>
    </Card>
  );
}

export default function History() {
  const { history, showToast } = useApp();
  const navigate = useNavigate();
  const [tab, setTab] = useState('recent');

  const sevenDaysAgo = useMemo(() => Date.now() - 7 * 24 * 60 * 60 * 1000, []);

  const recent = useMemo(
    () =>
      history
        .filter(
          (h) =>
            h.type === 'ai' &&
            new Date(h.startTime).getTime() >= sevenDaysAgo &&
            new Date(h.startTime).getTime() <= Date.now()
        )
        .sort((a, b) => new Date(b.startTime) - new Date(a.startTime)),
    [history, sevenDaysAgo]
  );

  const critical = useMemo(
    () =>
      history
        .filter((h) => h.flagged || h.riskLevel === 'high' || h.riskLevel === 'medium')
        .sort((a, b) => new Date(b.startTime) - new Date(a.startTime)),
    [history]
  );

  const counselorEntries = useMemo(
    () =>
      history
        .filter((h) => h.type === 'counselor')
        .sort((a, b) => new Date(a.startTime) - new Date(b.startTime)),
    [history]
  );
  const upcoming = counselorEntries.find(
    (e) => new Date(e.startTime).getTime() > Date.now()
  );
  const past = counselorEntries
    .filter((e) => new Date(e.startTime).getTime() <= Date.now())
    .sort((a, b) => new Date(b.startTime) - new Date(a.startTime));

  const handleRebook = () => {
    showToast('Bringing you to booking…', 'info');
    navigate('/counselor-match');
  };

  return (
    <main className="min-h-[calc(100vh-3.5rem)] pb-28 px-5 pt-5 animate-fade-in max-w-md mx-auto">
      <header className="mb-4">
        <h1 className="text-2xl font-bold">History</h1>
        <p className="text-textgray text-sm mt-1">
          Look back gently. Nothing here is judged.
        </p>
      </header>

      <div
        role="tablist"
        aria-label="History sections"
        className="grid grid-cols-3 gap-1 bg-navy-light/60 border border-purple/30 rounded-2xl p-1 mb-5"
      >
        {TABS.map((t) => {
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setTab(t.id)}
              className={[
                'py-2 rounded-xl text-sm font-medium transition-colors',
                active
                  ? 'bg-purple text-white shadow-glow'
                  : 'text-textgray hover:text-white',
              ].join(' ')}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {tab === 'recent' && (
        <section className="space-y-3" aria-label="Recent conversations">
          <p className="text-sm font-semibold mb-2">Recent Conversations</p>
          {recent.length === 0 ? (
            <Empty Icon={Moon} message="Your conversations will appear here." />
          ) : (
            recent.map((entry) => <RecentCard key={entry.id} entry={entry} />)
          )}
        </section>
      )}

      {tab === 'critical' && (
        <section className="space-y-3" aria-label="Critical conversations">
          <p className="text-sm font-semibold">Critical Conversations</p>
          <p className="text-xs text-textgray leading-relaxed mb-1">
            Flagged due to higher distress. These aren't judged — they're noted
            so a counselor can support you faster.
          </p>
          {critical.length === 0 ? (
            <Empty Icon={Heart} message="Nothing flagged. We'll only put things here if a conversation felt heavy." />
          ) : (
            critical.map((entry) => <CriticalCard key={entry.id} entry={entry} />)
          )}
        </section>
      )}

      {tab === 'counselor' && (
        <section className="space-y-4" aria-label="Counselor sessions">
          {upcoming ? (
            <UpcomingSessionCard entry={upcoming} onRebook={handleRebook} />
          ) : (
            <Card hover={false} className="text-center py-6">
              <p className="text-textgray text-sm">No upcoming session.</p>
              <Button
                variant="primary"
                size="sm"
                className="mt-3"
                onClick={() => navigate('/counselor-match')}
              >
                Book a session
              </Button>
            </Card>
          )}

          <div>
            <p className="text-sm font-semibold mb-2">Past Sessions</p>
            <div className="space-y-2">
              {past.length === 0 ? (
                <p className="text-xs text-textgray/70">No past sessions yet.</p>
              ) : (
                past.map((entry) => <PastCounselorRow key={entry.id} entry={entry} />)
              )}
            </div>
          </div>

          {past[0] && (
            <Button
              variant="outline"
              size="md"
              className="w-full"
              onClick={handleRebook}
            >
              Rebook same counselor
            </Button>
          )}
        </section>
      )}
    </main>
  );
}
