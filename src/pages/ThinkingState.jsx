import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Brain } from 'lucide-react';
import Button from '../components/Button';
import LoadingSpinner from '../components/LoadingSpinner';

export default function ThinkingState() {
  const navigate = useNavigate();

  useEffect(() => {
    const t = setTimeout(() => navigate('/conversation'), 4000);
    return () => clearTimeout(t);
  }, [navigate]);

  return (
    <main className="min-h-screen flex flex-col px-6 pt-6 pb-10 animate-fade-in">
      <header className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 text-white hover:text-purple-light transition-colors"
          aria-label="Back"
        >
          <ChevronLeft className="h-5 w-5" aria-hidden="true" />
          <span className="font-semibold">2AM Buddy</span>
        </button>
        <span className="text-textgray text-sm">Thinking</span>
      </header>

      <section className="flex-1 flex flex-col items-center justify-center gap-10">
        <LoadingSpinner variant="pulse" size="lg" color="#A78BFA">
          <Brain className="h-7 w-7" aria-hidden="true" />
        </LoadingSpinner>

        <div className="text-center space-y-3 animate-fade-in max-w-sm">
          <h1 className="text-2xl font-semibold">Thinking</h1>
          <p className="text-textgray text-base">
            Analyzing how to support you best
          </p>
          <LoadingSpinner variant="dots" color="#A78BFA" className="justify-center mt-2" />
        </div>
      </section>

      <footer className="flex justify-center">
        <Button variant="outline" size="md" onClick={() => navigate('/home')}>
          Cancel
        </Button>
      </footer>
    </main>
  );
}
