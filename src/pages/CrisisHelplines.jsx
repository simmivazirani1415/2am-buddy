import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Phone } from 'lucide-react';
import Card from '../components/Card';
import { CRISIS_HELPLINES } from '../lib/mockData';

export default function CrisisHelplines() {
  const navigate = useNavigate();

  return (
    <main className="min-h-[calc(100vh-3.5rem)] pb-28 px-5 pt-5 animate-fade-in max-w-md mx-auto">
      <header className="flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 text-white hover:text-purple-light transition-colors"
          aria-label="Back"
        >
          <ChevronLeft className="h-5 w-5" aria-hidden="true" />
          <span className="font-semibold">Crisis helplines</span>
        </button>
      </header>

      <p className="text-textgray text-sm leading-relaxed mb-5">
        These lines are stored on your device so they work offline.
        Tap to call. If this is a medical emergency, dial your local
        emergency services.
      </p>

      <ul className="space-y-3">
        {CRISIS_HELPLINES.map((h) => {
          const callable = !!h.number;
          const body = (
            <Card hover={callable} className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="font-semibold">{h.name}</p>
                <p className="text-xs text-textgray mt-0.5">{h.note}</p>
                <p className="text-xs text-textgray/80 mt-0.5">{h.hours}</p>
              </div>
              {callable ? (
                <div className="flex items-center gap-2 shrink-0 px-3 py-2 rounded-full bg-rose text-white text-sm font-semibold">
                  <Phone className="h-4 w-4" aria-hidden="true" />
                  Call
                </div>
              ) : (
                <div className="shrink-0 text-xs text-textgray italic">
                  Number coming soon
                </div>
              )}
            </Card>
          );
          return (
            <li key={h.id}>
              {callable ? (
                <a
                  href={`tel:${h.number}`}
                  className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-rose rounded-2xl"
                  aria-label={`Call ${h.name} at ${h.number}`}
                >
                  {body}
                </a>
              ) : (
                body
              )}
            </li>
          );
        })}
      </ul>

      <p className="text-textgray/70 text-xs text-center mt-6 leading-relaxed">
        Calls are between you and the helpline. 2AM Buddy doesn't record or
        listen in.
      </p>
    </main>
  );
}
