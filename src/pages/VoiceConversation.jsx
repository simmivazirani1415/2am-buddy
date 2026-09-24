import { useNavigate } from 'react-router-dom';
import { ChevronLeft, MoreVertical, Mic } from 'lucide-react';
import Button from '../components/Button';
import LoadingSpinner from '../components/LoadingSpinner';
import useVapi from '../hooks/useVapi';

export default function VoiceConversation() {
  const navigate = useNavigate();
  const { stopCall } = useVapi();

  const handleStop = () => {
    stopCall();
    navigate('/home');
  };

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
        <button
          type="button"
          aria-label="More options"
          className="text-white hover:text-purple-light transition-colors"
        >
          <MoreVertical className="h-5 w-5" aria-hidden="true" />
        </button>
      </header>

      <section className="flex-1 flex flex-col items-center justify-center gap-10">
        <LoadingSpinner variant="pulse" size="lg" color="#7C3AED">
          <Mic className="h-7 w-7" aria-hidden="true" />
        </LoadingSpinner>

        <div className="text-center space-y-2 animate-fade-in">
          <h1 className="text-3xl font-semibold">Listening...</h1>
          <p className="text-textgray text-lg">I'm here for you</p>
        </div>
      </section>

      <footer className="flex flex-col items-center gap-4">
        <Button
          variant="danger"
          size="lg"
          onClick={handleStop}
          className="w-full max-w-xs"
        >
          Tap to stop
        </Button>
        <p className="text-xs text-textgray">Your conversation is private</p>
      </footer>
    </main>
  );
}
