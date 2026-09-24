import { useMemo } from 'react';
import { Sun, CloudSun, Sunset, Moon, Mic, Sparkles } from 'lucide-react';
import Button from '../components/Button';
import MoodSelector from '../components/MoodSelector';
import { useApp } from '../context/AppContext';
import useVapi from '../hooks/useVapi';
import { dlog } from '../lib/debugLog';

function getGreeting() {
  const h = new Date().getHours();
  if (h >= 5 && h < 12) return { text: 'Good morning', Icon: Sun };
  if (h >= 12 && h < 17) return { text: 'Good afternoon', Icon: CloudSun };
  if (h >= 17 && h < 21) return { text: 'Good evening', Icon: Sunset };
  return { text: 'Good night', Icon: Moon };
}

export default function Home() {
  const { callStatus, dailyThoughts } = useApp();
  const { startCall } = useVapi();
  const greeting = useMemo(getGreeting, []);
  // Pick a random thought once per Home mount.
  const thought = useMemo(() => {
    if (!dailyThoughts || dailyThoughts.length === 0) return null;
    return dailyThoughts[Math.floor(Math.random() * dailyThoughts.length)];
  }, [dailyThoughts]);
  const connecting = callStatus === 'connecting';

  return (
    <main className="min-h-screen pb-28 px-6 pt-10 animate-fade-in max-w-md mx-auto">
      {thought && (
        <aside
          aria-label="A thought"
          className="mb-6 rounded-2xl border border-purple/20 bg-navy-light/40 px-4 py-3 animate-fade-in"
        >
          <p className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.18em] text-textgray/70">
            <Sparkles className="h-3 w-3" aria-hidden="true" />
            A thought
          </p>
          <p className="mt-1 text-sm text-textgray italic leading-relaxed">
            {thought}
          </p>
        </aside>
      )}

      <header className="space-y-2 animate-slide-up">
        <p className="flex items-center gap-2 text-textgray text-sm uppercase tracking-wider">
          {greeting.text}
          <greeting.Icon className="h-4 w-4" aria-hidden="true" />
        </p>
        <h1 className="text-3xl font-bold leading-snug">
          How are you feeling today?
        </h1>
      </header>

      <section className="mt-8 animate-slide-up" aria-label="Mood selection">
        <MoodSelector />
      </section>

      <section className="mt-10 animate-slide-up">
        <Button
          variant="primary"
          size="md"
          className="w-full !py-3.5 !rounded-2xl text-base font-semibold tracking-tight"
          loading={connecting}
          disabled={connecting}
          onClick={() => {
            dlog('ui', 'Home: Talk button clicked');
            startCall();
          }}
          ariaLabel="Talk to 2AM Buddy"
        >
          <span className="inline-flex items-center gap-2.5 leading-none">
            <Mic className="h-5 w-5 shrink-0" aria-hidden="true" />
            <span>{connecting ? 'Connecting…' : 'Talk to 2AM Buddy'}</span>
          </span>
        </Button>
        <p className="mt-2.5 text-center text-xs text-textgray">
          Tap to start a private voice conversation
        </p>
      </section>

      <section className="mt-12 bg-navy-light/60 border border-purple/30 rounded-2xl p-5 animate-slide-up">
        <p className="text-sm text-textgray leading-relaxed">
          <span className="text-purple-light font-semibold">Tip:</span> You can
          talk about anything — stress, sleep, relationships. Everything stays
          private.
        </p>
      </section>
    </main>
  );
}
