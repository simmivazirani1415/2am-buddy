import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, ArrowRight } from 'lucide-react';
import Button from '../components/Button';
import Card from '../components/Card';
import { useApp } from '../context/AppContext';

const MOOD_EMOJI = {
  good: '😊',
  'not-great': '😐',
  struggling: '😕',
};

const MOOD_LABEL = {
  good: 'Good',
  'not-great': 'Not great',
  struggling: 'Struggling',
};

function formatDate(iso) {
  try {
    return new Date(iso).toLocaleString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

function formatDuration(sec) {
  if (!sec) return '—';
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}m ${s.toString().padStart(2, '0')}s`;
}

// Mock transcript — production wires the VAPI-stored transcript here.
const MOCK_TRANSCRIPT = [
  { role: 'assistant', content: "Hey, I'm here. What's on your mind right now?" },
  { role: 'user', content: "I couldn't sleep. Work has been heavy." },
  { role: 'assistant', content: "That sounds exhausting. Want to try a breath together?" },
  { role: 'user', content: 'Okay.' },
  { role: 'assistant', content: 'Breathe in for four… and out for six. Twice more.' },
  { role: 'user', content: 'That helped a little.' },
];

function MoodPill({ value, label }) {
  return (
    <div className="flex-1 rounded-xl border border-purple/30 bg-navy-light/60 px-3 py-2 text-center">
      <p className="text-[10px] uppercase tracking-wider text-textgray">{label}</p>
      <div className="mt-1 flex items-center justify-center gap-2">
        <span className="text-xl" aria-hidden="true">{MOOD_EMOJI[value] ?? '—'}</span>
        <span className="text-sm">{MOOD_LABEL[value] ?? '—'}</span>
      </div>
    </div>
  );
}

export default function HistoryDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    history,
    deleteHistoryEntry,
    prepareShare,
    showToast,
    setHistoryNote,
  } = useApp();
  const entry = useMemo(() => history.find((h) => h.id === id), [history, id]);

  const [showTranscript, setShowTranscript] = useState(false);
  const [editingNote, setEditingNote] = useState(false);
  const [noteDraft, setNoteDraft] = useState(entry?.note ?? '');

  if (!entry) {
    return (
      <main className="min-h-[calc(100vh-3.5rem)] pb-28 px-5 pt-5 animate-fade-in max-w-md mx-auto">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 text-white hover:text-purple-light transition-colors"
          aria-label="Back"
        >
          <ChevronLeft className="h-5 w-5" aria-hidden="true" />
          <span className="font-semibold">History</span>
        </button>
        <Card className="mt-8 text-center">
          <p className="text-textgray">We couldn't find that conversation.</p>
        </Card>
      </main>
    );
  }

  const isCounselor = entry.type === 'counselor';

  const handleShare = () => {
    prepareShare();
    navigate('/share');
  };

  const handleDelete = () => {
    deleteHistoryEntry(entry.id);
    showToast('Conversation deleted.', 'success');
    navigate('/history');
  };

  const handleSaveNote = () => {
    setHistoryNote(entry.id, noteDraft.trim() || null);
    setEditingNote(false);
    showToast('Note saved.', 'success');
  };

  return (
    <main className="min-h-[calc(100vh-3.5rem)] pb-32 px-5 pt-5 animate-fade-in max-w-md mx-auto">
      <header className="flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 text-white hover:text-purple-light transition-colors"
          aria-label="Back"
        >
          <ChevronLeft className="h-5 w-5" aria-hidden="true" />
          <span className="font-semibold">
            {isCounselor ? 'Session details' : 'Conversation'}
          </span>
        </button>
      </header>

      {/* Time + duration */}
      <Card hover={false} className="flex items-center justify-between gap-3 py-3 mb-3">
        <div>
          <p className="text-xs text-textgray">When</p>
          <p className="text-sm font-semibold">{formatDate(entry.startTime)}</p>
        </div>
        {!isCounselor && (
          <div className="text-right">
            <p className="text-xs text-textgray">Duration</p>
            <p className="text-sm font-semibold">{formatDuration(entry.durationSec)}</p>
          </div>
        )}
      </Card>

      {/* Mood before/after */}
      {!isCounselor && (entry.moodBefore || entry.moodAfter) && (
        <div className="flex items-center gap-3 mb-4">
          <MoodPill label="Before" value={entry.moodBefore} />
          <ArrowRight className="h-5 w-5 text-textgray" aria-hidden="true" />
          <MoodPill label="After" value={entry.moodAfter} />
        </div>
      )}

      {/* Counselor block */}
      {isCounselor && entry.counselor && (
        <Card hover={false} className="flex items-center gap-3 mb-4">
          <img
            src={entry.counselor.image}
            alt={entry.counselor.name}
            className="h-14 w-14 rounded-full object-cover border-2 border-purple-light"
            onError={(e) => (e.currentTarget.style.display = 'none')}
          />
          <div>
            <p className="font-semibold">{entry.counselor.name}</p>
            <p className="text-xs text-textgray">{entry.counselor.title}</p>
            <p className="text-xs text-textgray mt-0.5">{entry.mode}</p>
          </div>
        </Card>
      )}

      {/* AI Summary */}
      {entry.summary && (
        <Card hover={false} className="mb-3">
          <p className="text-[10px] uppercase tracking-wider text-purple-light mb-2">
            AI Summary
          </p>
          {entry.title && (
            <p className="font-semibold mb-1">{entry.title}</p>
          )}
          <p className="text-sm leading-relaxed text-textgray">{entry.summary}</p>

          {!isCounselor && (
            <button
              type="button"
              onClick={() => setShowTranscript((v) => !v)}
              aria-expanded={showTranscript}
              className="mt-3 text-sm text-purple-light hover:text-white transition-colors"
            >
              {showTranscript ? 'Hide full transcript' : 'View full transcript'}
            </button>
          )}
        </Card>
      )}

      {showTranscript && !isCounselor && (
        <Card hover={false} className="mb-3 space-y-2">
          {MOCK_TRANSCRIPT.map((m, i) => (
            <div
              key={i}
              className={[
                'text-sm leading-relaxed',
                m.role === 'user' ? 'text-white' : 'text-textgray',
              ].join(' ')}
            >
              <span className="font-semibold mr-2">
                {m.role === 'user' ? 'You' : 'Buddy'}:
              </span>
              {m.content}
            </div>
          ))}
          <p className="text-[11px] text-textgray/60 pt-2 border-t border-purple/20">
            Transcript stored only on your device unless you choose to share it.
          </p>
        </Card>
      )}

      {/* Topic tags */}
      {entry.topics && entry.topics.length > 0 && (
        <Card hover={false} className="mb-3">
          <p className="text-[10px] uppercase tracking-wider text-purple-light mb-2">
            What we talked about
          </p>
          <div className="flex flex-wrap gap-2">
            {entry.topics.map((t) => (
              <span
                key={t}
                className="px-3 py-1 rounded-full text-xs bg-purple/20 border border-purple/40 text-white"
              >
                {t}
              </span>
            ))}
          </div>
        </Card>
      )}

      {entry.flagged && (
        <Card hover={false} className="mb-3 border-rose/40 bg-rose/10">
          <p className="text-xs text-rose leading-relaxed">
            Flagged as a harder night. Sharing with a counselor is encouraged.
          </p>
        </Card>
      )}

      {/* Personal note */}
      <Card hover={false} className="mb-4">
        <div className="flex items-center justify-between gap-2 mb-1">
          <p className="text-[10px] uppercase tracking-wider text-purple-light">
            Personal note
          </p>
          {!editingNote && (
            <button
              type="button"
              onClick={() => {
                setNoteDraft(entry.note ?? '');
                setEditingNote(true);
              }}
              className="text-xs text-purple-light hover:text-white"
            >
              {entry.note ? 'Edit' : 'Add'}
            </button>
          )}
        </div>
        {editingNote ? (
          <div className="space-y-2">
            <textarea
              value={noteDraft}
              onChange={(e) => setNoteDraft(e.target.value)}
              rows={3}
              placeholder="Something to remember from this conversation…"
              className="w-full bg-navy-light border border-purple/40 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-light resize-none"
            />
            <div className="flex gap-2">
              <Button variant="primary" size="sm" onClick={handleSaveNote}>Save</Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditingNote(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-textgray italic leading-relaxed">
            {entry.note ?? 'No note yet.'}
          </p>
        )}
      </Card>

      {/* Actions */}
      <div className="flex flex-col gap-2">
        <Button variant="primary" size="lg" onClick={handleShare}>
          Share with counselor
        </Button>
        {!isCounselor && (
          <button
            type="button"
            onClick={handleDelete}
            className="text-rose text-sm font-semibold py-2 hover:text-rose-dark transition-colors"
          >
            Delete conversation
          </button>
        )}
      </div>
    </main>
  );
}
