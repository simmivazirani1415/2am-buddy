import { useNavigate } from 'react-router-dom';
import { Mail, Moon } from 'lucide-react';
import Button from '../components/Button';
import { useApp } from '../context/AppContext';

export default function ConfirmationSent() {
  const navigate = useNavigate();
  const { resetConversation } = useApp();

  const handleThanks = () => {
    resetConversation();
    navigate('/home');
  };

  return (
    <main className="min-h-screen pb-28 px-6 pt-10 flex flex-col items-center animate-fade-in max-w-md mx-auto">
      <div
        className="flex h-28 w-28 items-center justify-center rounded-full bg-purple/30 border border-purple-light text-purple-light animate-float shadow-glow"
        aria-hidden="true"
      >
        <Mail className="h-14 w-14" />
      </div>

      <h1 className="mt-8 text-2xl font-bold text-center leading-snug animate-slide-up">
        Confirmation & summary have been sent to your email.
      </h1>
      <p className="mt-3 text-textgray text-center animate-slide-up">
        We've also shared the report with the support team.
      </p>

      <div className="mt-10 w-full max-w-sm animate-slide-up">
        <Button
          variant="primary"
          size="lg"
          className="w-full"
          onClick={handleThanks}
        >
          Okay, Thank you
        </Button>
      </div>

      <p className="mt-auto pt-12 text-center text-textgray text-sm animate-fade-in inline-flex items-center justify-center gap-1.5">
        You're not alone. We're here, always.
        <Moon className="h-3.5 w-3.5" aria-hidden="true" />
      </p>
    </main>
  );
}
