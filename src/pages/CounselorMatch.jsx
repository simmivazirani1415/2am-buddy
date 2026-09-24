import axios from 'axios';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Star, Check } from 'lucide-react';
import Button from '../components/Button';
import Card from '../components/Card';
import { useApp } from '../context/AppContext';
import { ddlog, maskUrl, logRequestError } from '../lib/envDebug';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

export default function CounselorMatch() {
  const navigate = useNavigate();
  const {
    user,
    selectedCounselor,
    defaultCounselor,
    availableSlots,
    selectedTimeSlot,
    selectTimeSlot,
    confirmBooking,
    showToast,
    setLoading,
    loading,
  } = useApp();

  const counselor = selectedCounselor ?? defaultCounselor;
  const [submitting, setSubmitting] = useState(false);

  const handleBook = async () => {
    if (!selectedTimeSlot) return;

    // Block booking if the user hasn't set an email — that's where the
    // confirmation has to go. Send them to Profile to add it.
    const email = (user?.email ?? '').trim();
    if (!email) {
      showToast('Add your email in Profile before booking.', 'error');
      navigate('/profile');
      return;
    }

    setSubmitting(true);
    setLoading(true);
    showToast('Booking your session...', 'info');

    try {
      if (API_BASE && !API_BASE.includes('your_webhook_id_here')) {
        ddlog('CounselorMatch webhook: POST', { url: maskUrl(API_BASE) });
        const res = await axios.post(API_BASE, {
          counselorId: counselor.id,
          counselorName: counselor.name,
          slot: selectedTimeSlot,
          timestamp: new Date().toISOString(),
          // Confirmation email recipient — sourced from Profile (user.email).
          email,
          userName: user?.name ?? null,
        });
        ddlog('CounselorMatch webhook: OK', { url: maskUrl(API_BASE), status: res?.status });
      } else {
        ddlog('CounselorMatch webhook: SKIPPED (API base missing or placeholder) — using demo delay', {
          url: maskUrl(API_BASE),
        });
        await new Promise((r) => setTimeout(r, 1200));
      }
      confirmBooking();
      showToast('Session booked!', 'success');
      navigate('/booking-confirmed');
    } catch (e) {
      logRequestError('CounselorMatch webhook', API_BASE, e);
      console.error(e);
      showToast('Booking failed. Please try again.', 'error');
    } finally {
      setSubmitting(false);
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen pb-32 px-6 pt-8 animate-fade-in max-w-md mx-auto">
      <header className="flex items-center justify-between mb-6">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 text-white hover:text-purple-light transition-colors"
          aria-label="Back"
        >
          <ChevronLeft className="h-5 w-5" aria-hidden="true" />
          <span className="font-semibold">Counselor Match</span>
        </button>
      </header>

      <Card className="flex items-center gap-4 animate-slide-up">
        <img
          src={counselor.image}
          alt={counselor.name}
          className="h-20 w-20 rounded-full object-cover border-2 border-purple-light"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
        <div className="flex-1">
          <h2 className="text-xl font-bold">{counselor.name}</h2>
          <p className="text-textgray text-sm">{counselor.title}</p>
          <p className="text-sm mt-1 flex items-center gap-1">
            <Star className="h-3.5 w-3.5 fill-amber-300 text-amber-300" aria-hidden="true" />
            <span className="font-semibold">{counselor.rating}</span>
            <span className="text-textgray">({counselor.reviews} reviews)</span>
          </p>
        </div>
      </Card>

      <section className="mt-8 animate-slide-up">
        <h3 className="text-lg font-semibold mb-3">Next Available Slots</h3>
        <div className="grid grid-cols-1 gap-3">
          {availableSlots.map((slot) => {
            const isSelected = selectedTimeSlot === slot.label;
            return (
              <button
                key={slot.id}
                type="button"
                onClick={() => selectTimeSlot(slot.label)}
                aria-pressed={isSelected}
                className={[
                  'flex items-center justify-between px-4 py-3 rounded-xl border-2 transition-all duration-200 text-left',
                  isSelected
                    ? 'bg-purple border-purple-light shadow-glow'
                    : 'bg-navy-light/60 border-purple/30 hover:border-purple',
                ].join(' ')}
              >
                <span className="font-medium">{slot.label}</span>
                {slot.recommended && !isSelected && (
                  <span className="text-xs bg-success/20 text-success px-2 py-0.5 rounded-full">
                    Recommended
                  </span>
                )}
                {isSelected && (
                  <Check className="h-4 w-4 text-white" aria-hidden="true" />
                )}
              </button>
            );
          })}
        </div>
      </section>

      <div className="fixed bottom-20 left-0 right-0 px-6">
        <div className="max-w-md mx-auto">
          <Button
            variant="primary"
            size="lg"
            className="w-full"
            disabled={!selectedTimeSlot || submitting}
            loading={submitting || loading}
            onClick={handleBook}
          >
            Book This Slot
          </Button>
        </div>
      </div>
    </main>
  );
}
