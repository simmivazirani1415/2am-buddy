import { useNavigate } from 'react-router-dom';
import { Check } from 'lucide-react';
import Button from '../components/Button';
import Card from '../components/Card';
import { useApp } from '../context/AppContext';

function formatNow() {
  const opts = {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  };
  return new Date().toLocaleString(undefined, opts);
}

export default function BookingConfirmed() {
  const navigate = useNavigate();
  const {
    selectedCounselor,
    defaultCounselor,
    selectedTimeSlot,
    resetConversation,
  } = useApp();
  const counselor = selectedCounselor ?? defaultCounselor;

  const handleGoHome = () => {
    resetConversation();
    navigate('/home');
  };

  return (
    <main className="min-h-screen pb-28 px-6 pt-10 flex flex-col items-center animate-fade-in max-w-md mx-auto">
      <div
        className="flex items-center justify-center w-[100px] h-[100px] rounded-full bg-purple animate-scale-in shadow-glow text-white"
        aria-hidden="true"
      >
        <Check className="h-14 w-14" strokeWidth={3} />
      </div>

      <h1 className="mt-8 text-3xl font-bold text-center animate-slide-up">
        Your session is booked!
      </h1>
      <p className="mt-2 text-textgray text-center animate-slide-up">
        We can't wait to support you.
      </p>

      <Card className="w-full mt-8 animate-slide-up">
        <ul className="space-y-3 text-sm">
          <li className="flex justify-between gap-3">
            <span className="text-textgray">Counselor</span>
            <span className="font-semibold text-right">{counselor.name}</span>
          </li>
          <li className="flex justify-between gap-3">
            <span className="text-textgray">When</span>
            <span className="font-semibold text-right">
              {selectedTimeSlot ?? formatNow()}
            </span>
          </li>
          <li className="flex justify-between gap-3">
            <span className="text-textgray">Mode</span>
            <span className="font-semibold text-right">
              Online · Google Meet
            </span>
          </li>
        </ul>
      </Card>

      <div className="mt-8 w-full flex flex-col gap-3 animate-slide-up">
        <Button
          variant="secondary"
          size="lg"
          className="w-full"
          onClick={() => navigate('/confirmation-sent')}
        >
          View Details
        </Button>
        <Button
          variant="primary"
          size="lg"
          className="w-full"
          onClick={handleGoHome}
        >
          Go to Home
        </Button>
      </div>
    </main>
  );
}
