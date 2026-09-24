import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Siren,
  Phone,
  Wind,
  Moon,
  Cloud,
  Heart,
  Waves,
  ExternalLink,
  Flower2,
  BookOpen,
  Music,
} from 'lucide-react';
import Card from '../components/Card';
import Button from '../components/Button';
import {
  CRISIS_HELPLINES,
  PRACTICES,
  FEELINGS,
  PRACTICE_TABS,
  KIND_LABEL,
} from '../lib/mockData';

const KIND_ICON_CMP = {
  exercise: Wind,
  story: BookOpen,
  meditation: Flower2,
  music: Music,
};

const FEELING_ICON_CMP = {
  'cant-sleep': Moon,
  panic: Cloud,
  lonely: Heart,
  overwhelmed: Waves,
};

function formatDuration(sec) {
  if (!sec) return '';
  if (sec >= 60 * 60) return `${Math.round(sec / 60 / 60)} hr`;
  return `${Math.round(sec / 60)} min`;
}

function PracticeRow({ item }) {
  const KindIcon = KIND_ICON_CMP[item.kind] ?? Wind;
  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-light rounded-2xl"
      aria-label={`Open ${item.title} in a new tab`}
    >
      <Card hover className="flex items-center gap-3 py-3">
        <span
          aria-hidden="true"
          className="shrink-0 h-10 w-10 rounded-xl bg-purple/20 border border-purple/30 flex items-center justify-center text-purple-light"
        >
          <KindIcon className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-sm truncate">{item.title}</p>
          <p className="text-[11px] text-textgray mt-0.5 truncate">
            {KIND_LABEL[item.kind] ?? ''} · {item.source}
          </p>
        </div>
        <div className="shrink-0 flex flex-col items-end gap-1">
          <span className="text-[11px] text-textgray">{formatDuration(item.durationSec)}</span>
          <span
            aria-hidden="true"
            className="h-7 w-7 rounded-full bg-purple text-white flex items-center justify-center"
          >
            <ExternalLink className="h-3.5 w-3.5" />
          </span>
        </div>
      </Card>
    </a>
  );
}

export default function Resources() {
  const [feeling, setFeeling] = useState(null);
  const [tab, setTab] = useState('all');

  // Only feelings with at least one working practice.
  const availableFeelings = useMemo(
    () =>
      FEELINGS.filter((f) =>
        PRACTICES.some((p) => p.feelings?.includes(f.id))
      ),
    []
  );

  // Only sub-tabs that have results (always keep 'all' if anything exists).
  const availableTabs = useMemo(
    () =>
      PRACTICE_TABS.filter((t) => {
        if (!t.kinds) return PRACTICES.length > 0;
        return PRACTICES.some((p) => t.kinds.includes(p.kind));
      }),
    []
  );

  const feelingPractices = useMemo(
    () =>
      feeling
        ? PRACTICES.filter((p) => p.feelings?.includes(feeling))
        : [],
    [feeling]
  );

  const tabbedPractices = useMemo(() => {
    const def = availableTabs.find((t) => t.id === tab) ?? availableTabs[0];
    if (!def) return [];
    if (!def.kinds) return PRACTICES;
    return PRACTICES.filter((p) => def.kinds.includes(p.kind));
  }, [tab, availableTabs]);

  // Only callable helpline rows (number is set).
  const callableHelplines = CRISIS_HELPLINES.filter((h) => !!h.number).slice(0, 2);

  return (
    <main className="min-h-[calc(100vh-3.5rem)] pb-28 px-5 pt-5 animate-fade-in max-w-md mx-auto">
      <header className="mb-5">
        <h1 className="text-2xl font-bold">Resources</h1>
        <p className="text-textgray text-sm mt-1">
          Support for any moment, day or night.
        </p>
      </header>

      {/* Crisis card */}
      <Card
        hover={false}
        className="mb-4 border-rose/50 bg-gradient-to-br from-rose/15 to-navy-light/80"
      >
        <div className="flex items-start gap-3">
          <span
            aria-hidden="true"
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose/20 text-rose shrink-0"
          >
            <Siren className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <p className="font-semibold">Crisis helplines</p>
            <p className="text-xs text-textgray mt-0.5">
              Reach a trained listener in seconds.
            </p>
          </div>
        </div>
        {callableHelplines.length > 0 && (
          <ul className="mt-3 space-y-2">
            {callableHelplines.map((h) => (
              <li key={h.id}>
                <a
                  href={`tel:${h.number}`}
                  aria-label={`Call ${h.name}`}
                  className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-rose rounded-xl"
                >
                  <div className="flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-navy/60 border border-purple/30">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold truncate">{h.name}</p>
                      <p className="text-[11px] text-textgray truncate">{h.hours}</p>
                    </div>
                    <span className="shrink-0 inline-flex items-center gap-1 px-3 py-1 rounded-full bg-rose text-white text-[11px] font-semibold">
                      <Phone className="h-3 w-3" aria-hidden="true" /> Call
                    </span>
                  </div>
                </a>
              </li>
            ))}
          </ul>
        )}
        <Link to="/crisis" className="block mt-3">
          <Button variant="danger" size="md" className="w-full">
            I need help now
          </Button>
        </Link>
      </Card>

      {/* Feeling chips — only render if at least one feeling has practices */}
      {availableFeelings.length > 0 && (
        <section aria-label="How do you feel right now?" className="mb-6">
          <p className="text-sm font-semibold mb-2">How do you feel right now?</p>
          <div className="grid grid-cols-2 gap-2 mb-3">
            {availableFeelings.map((f) => {
              const FeelingIcon = FEELING_ICON_CMP[f.id] ?? Heart;
              const active = feeling === f.id;
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setFeeling(active ? null : f.id)}
                  aria-pressed={active}
                  className={[
                    'flex items-center gap-2 px-3 py-3 rounded-xl border transition-all',
                    active
                      ? 'bg-purple border-purple-light text-white shadow-glow'
                      : 'bg-navy-light/60 border-purple/30 text-textgray hover:text-white hover:border-purple',
                  ].join(' ')}
                >
                  <FeelingIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <span className="text-sm font-medium">{f.label}</span>
                </button>
              );
            })}
          </div>
          {feeling && (
            <ul className="space-y-2 animate-fade-in">
              {feelingPractices.map((p) => (
                <li key={p.id}>
                  <PracticeRow item={p} />
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {/* Guided Practices — only show if there's anything to list */}
      {PRACTICES.length > 0 && (
        <section aria-label="Guided practices">
          <p className="text-sm font-semibold mb-2">Guided practices</p>
          {availableTabs.length > 1 && (
            <div
              role="tablist"
              aria-label="Practice categories"
              className={[
                'grid gap-1 bg-navy-light/60 border border-purple/30 rounded-2xl p-1 mb-3',
                availableTabs.length === 2
                  ? 'grid-cols-2'
                  : availableTabs.length === 3
                    ? 'grid-cols-3'
                    : 'grid-cols-4',
              ].join(' ')}
            >
              {availableTabs.map((t) => {
                const active = tab === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => setTab(t.id)}
                    className={[
                      'py-2 rounded-xl text-xs font-medium transition-colors',
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
          )}
          <ul className="space-y-2">
            {tabbedPractices.map((p) => (
              <li key={p.id}>
                <PracticeRow item={p} />
              </li>
            ))}
          </ul>
        </section>
      )}

      <p className="text-xs text-textgray/70 leading-relaxed mt-6">
        Content here is vetted but it doesn't replace human help. If you need
        someone to talk to, the helplines above are always there.
      </p>
    </main>
  );
}
