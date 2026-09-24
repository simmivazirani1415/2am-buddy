import { useNavigate } from 'react-router-dom';
import { Moon } from 'lucide-react';
import Button from '../components/Button';
import ReassurancePanel from '../components/ReassurancePanel';

export default function Welcome() {
  const navigate = useNavigate();

  return (
    <main className="min-h-screen flex flex-col items-center justify-between px-6 py-12 animate-fade-in">
      <div className="flex-1 flex flex-col items-center justify-center gap-8 text-center max-w-md">
        <div
          className="relative flex items-center justify-center w-44 h-44 animate-float"
          aria-label="2AM Buddy moon illustration"
        >
          <span className="flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-purple to-purple-dark text-white shadow-glow">
            <Moon className="h-16 w-16" aria-hidden="true" />
          </span>
          <span className="absolute inset-0 rounded-full bg-purple/20 blur-3xl -z-10" />
        </div>

        <div className="space-y-3 animate-slide-up">
          <h1 className="text-4xl sm:text-5xl font-bold leading-tight">
            Welcome to <span className="text-purple-light">2AM Buddy</span>
          </h1>
          <p className="text-lg text-textgray">
            Your AI Mental Health Companion
          </p>
        </div>

        <p className="text-textgray text-base max-w-sm leading-relaxed">
          Late nights can feel heavy. We're here whenever you need to talk —
          gentle, private, and judgement-free.
        </p>

        <ReassurancePanel className="w-full mt-2" />
      </div>

      <div className="w-full max-w-sm flex flex-col items-center gap-6">
        <Button
          variant="primary"
          size="lg"
          className="w-full"
          onClick={() => navigate('/home')}
        >
          Let's Talk
        </Button>

        <div
          className="flex items-center gap-2"
          aria-label="Onboarding progress"
        >
          {[0, 1, 2, 3, 4].map((i) => (
            <span
              key={i}
              className={[
                'h-2 rounded-full transition-all duration-300',
                i === 0 ? 'w-6 bg-purple-light' : 'w-2 bg-white/30',
              ].join(' ')}
              aria-hidden="true"
            />
          ))}
        </div>
      </div>
    </main>
  );
}
