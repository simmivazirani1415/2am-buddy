import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Check } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import { useApp } from '../context/AppContext';

const STEPS = [
  'Checking availability',
  'Matching preferences',
  'Preparing summary',
];

export default function FindingCounselor() {
  const navigate = useNavigate();
  const { selectCounselor } = useApp();
  const [visible, setVisible] = useState(0);

  useEffect(() => {
    const intervals = STEPS.map((_, i) =>
      setTimeout(() => setVisible(i + 1), 700 * (i + 1))
    );
    const finalTimer = setTimeout(() => {
      selectCounselor();
      navigate('/counselor-match');
    }, 3500);
    return () => {
      intervals.forEach(clearTimeout);
      clearTimeout(finalTimer);
    };
  }, [navigate, selectCounselor]);

  return (
    <main className="min-h-screen pb-28 px-6 pt-10 flex flex-col items-center justify-center animate-fade-in max-w-md mx-auto">
      <LoadingSpinner variant="spin" size="lg" color="#A78BFA">
        <Search className="h-8 w-8" aria-hidden="true" />
      </LoadingSpinner>

      <h1 className="mt-10 text-2xl font-semibold text-center leading-snug max-w-sm">
        Finding the right counselor for you...
      </h1>

      <ul className="mt-10 space-y-3 w-full max-w-sm" aria-live="polite">
        {STEPS.map((step, i) => (
          <li
            key={step}
            className={[
              'flex items-center gap-3 px-4 py-3 rounded-xl border transition-all duration-500',
              i < visible
                ? 'border-success/40 bg-success/10 opacity-100 translate-y-0'
                : 'border-purple/20 bg-navy-light/40 opacity-40 translate-y-2',
            ].join(' ')}
          >
            <span
              className={[
                'flex h-7 w-7 items-center justify-center rounded-full text-sm font-bold',
                i < visible
                  ? 'bg-success text-navy'
                  : 'bg-navy-light text-textgray',
              ].join(' ')}
              aria-hidden="true"
            >
              {i < visible ? <Check className="h-4 w-4" /> : i + 1}
            </span>
            <span className="text-white">{step}</span>
          </li>
        ))}
      </ul>
    </main>
  );
}
