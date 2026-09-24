import { useNavigate } from 'react-router-dom';
import { ChevronLeft, AlertTriangle } from 'lucide-react';
import Button from '../components/Button';
import { useApp } from '../context/AppContext';

export default function RiskAlert() {
  const navigate = useNavigate();
  const { resetConversation } = useApp();

  const handleOkay = () => {
    resetConversation();
    navigate('/home');
  };

  return (
    <main className="min-h-screen flex flex-col px-6 pt-6 pb-10 animate-fade-in">
      <header>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 text-white hover:text-purple-light transition-colors"
          aria-label="Back"
        >
          <ChevronLeft className="h-5 w-5" aria-hidden="true" />
          <span className="font-semibold">2AM Buddy</span>
        </button>
      </header>

      <section className="flex-1 flex flex-col items-center justify-center gap-8 text-center max-w-md mx-auto">
        <div
          className="flex items-center justify-center w-[100px] h-[100px] rounded-full bg-rose/20 border-2 border-rose animate-scale-in shadow-glow-rose text-rose"
          aria-hidden="true"
        >
          <AlertTriangle className="h-12 w-12" />
        </div>

        <div className="space-y-3 animate-slide-up">
          <h1 className="text-3xl font-bold leading-tight">
            I'm a little concerned about you.
          </h1>
          <p className="text-textgray text-base leading-relaxed">
            Let's get you the right help. You don't have to go through this
            alone.
          </p>
        </div>
      </section>

      <footer className="flex flex-col gap-3 max-w-sm mx-auto w-full">
        <Button
          variant="danger"
          size="lg"
          className="w-full"
          onClick={() => navigate('/finding-counselor')}
        >
          Get Help Now
        </Button>
        <Button
          variant="outline"
          size="lg"
          className="w-full"
          onClick={handleOkay}
        >
          I'm okay
        </Button>
      </footer>
    </main>
  );
}
