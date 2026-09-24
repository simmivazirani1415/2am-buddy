import axios from 'axios';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Mail, Check } from 'lucide-react';
import Button from '../components/Button';
import Card from '../components/Card';
import LoadingSpinner from '../components/LoadingSpinner';
import { useApp } from '../context/AppContext';
import { ddlog, maskUrl, logRequestError } from '../lib/envDebug';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

function formatDate(iso) {
  try {
    return new Date(iso).toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

function ItemBody({ item }) {
  if (item.id === 'summary') {
    return <p className="text-sm text-textgray leading-relaxed">{item.body}</p>;
  }
  if (item.id === 'flaggedMoments') {
    const moments = item.body ?? [];
    if (moments.length === 0)
      return (
        <p className="text-sm text-textgray/70 italic">
          No flagged moments to share.
        </p>
      );
    return (
      <ul className="text-sm space-y-2">
        {moments.map((m) => (
          <li key={m.id} className="text-textgray">
            <span className="text-white">{formatDate(m.date)}</span> — {m.note}
          </li>
        ))}
      </ul>
    );
  }
  return null;
}

export default function Share() {
  const navigate = useNavigate();
  const { shareDraft, prepareShare, toggleShareItem, confirmShare, showToast } =
    useApp();
  const [status, setStatus] = useState('preview'); // preview | sending | sent | error
  const [errorMsg, setErrorMsg] = useState(null);

  // Build the draft on mount so direct nav to /share works.
  useEffect(() => {
    if (!shareDraft.items || shareDraft.items.length === 0) {
      prepareShare();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const items = shareDraft.items ?? [];
  const included = shareDraft.included ?? {};
  const anyIncluded = items.some((it) => included[it.id]);

  const handleShare = async () => {
    setStatus('sending');
    setErrorMsg(null);

    const payload = {
      kind: 'consent_share',
      timestamp: new Date().toISOString(),
      items: items
        .filter((it) => included[it.id])
        .map((it) => ({ id: it.id, label: it.label, body: it.body })),
    };

    try {
      if (API_BASE && !API_BASE.includes('your_webhook_id_here')) {
        ddlog('Share webhook: POST', { url: maskUrl(API_BASE) });
        const res = await axios.post(API_BASE, payload);
        ddlog('Share webhook: OK', { url: maskUrl(API_BASE), status: res?.status });
      } else {
        ddlog('Share webhook: SKIPPED (API base missing or placeholder) — using demo delay', {
          url: maskUrl(API_BASE),
        });
        await new Promise((r) => setTimeout(r, 1000));
      }
      confirmShare();
      setStatus('sent');
      showToast('Shared with your counselor.', 'success');
    } catch (e) {
      logRequestError('Share webhook', API_BASE, e);
      console.error(e);
      setErrorMsg(e?.message ?? 'Could not send');
      setStatus('error');
      showToast('Could not share. Tap retry.', 'error');
    }
  };

  if (status === 'sending') {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-6 pb-28 animate-fade-in">
        <LoadingSpinner variant="pulse" size="lg" color="#7C3AED">
          <Mail className="h-7 w-7 text-white" aria-hidden="true" />
        </LoadingSpinner>
        <p className="mt-8 text-lg">Sharing securely…</p>
      </main>
    );
  }

  if (status === 'sent') {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-6 pb-28 animate-fade-in max-w-md mx-auto text-center">
        <div className="w-[100px] h-[100px] rounded-full bg-purple flex items-center justify-center text-white animate-scale-in shadow-glow">
          <Check className="h-14 w-14" strokeWidth={3} aria-hidden="true" />
        </div>
        <h1 className="mt-6 text-2xl font-bold">Sent.</h1>
        <p className="mt-2 text-textgray">
          Your counselor will have what they need before your session.
        </p>
        <div className="mt-8 w-full flex flex-col gap-3">
          <Button
            variant="primary"
            size="lg"
            className="w-full"
            onClick={() => navigate('/home')}
          >
            Go to Home
          </Button>
          <Button
            variant="outline"
            size="md"
            className="w-full"
            onClick={() => navigate('/history')}
          >
            Back to History
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen pb-32 px-5 pt-6 animate-fade-in max-w-md mx-auto">
      <header className="flex items-center justify-between mb-5">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 text-white hover:text-purple-light transition-colors"
          aria-label="Back"
        >
          <ChevronLeft className="h-5 w-5" aria-hidden="true" />
          <span className="font-semibold">Share</span>
        </button>
      </header>

      <h1 className="text-2xl font-bold leading-snug">
        Here's what we'll share.
      </h1>
      <p className="mt-2 text-textgray text-sm leading-relaxed">
        Nothing is sent until you tap <em>Share with counselor.</em> Toggle off
        anything you'd rather keep private.
      </p>

      <ul className="mt-6 space-y-4">
        {items.map((item) => {
          const isOn = !!included[item.id];
          return (
            <li key={item.id}>
              <Card hover={false} className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold">{item.label}</p>
                    <p className="text-xs text-textgray mt-0.5">
                      {isOn ? 'Will be shared' : 'Hidden from counselor'}
                    </p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={isOn}
                    onClick={() => toggleShareItem(item.id)}
                    className={[
                      'relative h-7 w-12 rounded-full transition-colors shrink-0',
                      isOn ? 'bg-purple' : 'bg-navy-light border border-purple/40',
                    ].join(' ')}
                  >
                    <span
                      className={[
                        'absolute top-0.5 h-6 w-6 rounded-full bg-white transition-all',
                        isOn ? 'left-[22px]' : 'left-0.5',
                      ].join(' ')}
                    />
                  </button>
                </div>
                {isOn && (
                  <div className="pt-2 border-t border-purple/20">
                    <ItemBody item={item} />
                  </div>
                )}
              </Card>
            </li>
          );
        })}
      </ul>

      {status === 'error' && (
        <p className="mt-4 text-sm text-rose">
          Something went wrong: {errorMsg}. You can retry.
        </p>
      )}

      <div className="fixed bottom-20 left-0 right-0 px-5">
        <div className="max-w-md mx-auto flex flex-col gap-2">
          <Button
            variant="primary"
            size="lg"
            className="w-full"
            disabled={!anyIncluded}
            onClick={handleShare}
          >
            {status === 'error' ? 'Retry share' : 'Share with counselor'}
          </Button>
          <Button
            variant="outline"
            size="md"
            className="w-full"
            onClick={() => navigate(-1)}
          >
            Cancel
          </Button>
        </div>
      </div>
    </main>
  );
}
