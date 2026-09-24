import { useMemo, useState } from 'react';
import {
  User,
  AlarmClock,
  Plug,
  MessageCircle,
  HeartHandshake,
  Lock,
  ChevronRight,
  Calendar,
  Video,
  Mail,
  X,
  ThumbsUp,
  ThumbsDown,
  ArrowRight,
} from 'lucide-react';
import Button from '../components/Button';
import Card from '../components/Card';
import { useApp } from '../context/AppContext';

const MOOD_EMOJI = {
  good: '😊',
  'not-great': '😐',
  struggling: '😕',
};

const RETENTION_OPTIONS = [
  { id: '30d', label: '30 days' },
  { id: '90d', label: '90 days' },
  { id: '1y', label: '1 year' },
  { id: 'forever', label: 'Forever' },
];

const VISIBILITY_LABELS = {
  summary: 'AI summary',
  flaggedMoments: 'Flagged moments',
  transcript: 'Full transcripts',
};

const ACCOUNT_ROWS = [
  {
    key: 'calendar',
    label: 'Google Calendar',
    Icon: Calendar,
    description: 'Bookings appear in your calendar',
  },
  {
    key: 'meet',
    label: 'Google Meet',
    Icon: Video,
    description: 'Counselor sessions open in Meet',
  },
  {
    key: 'email',
    label: 'Email',
    Icon: Mail,
    description: 'Confirmations sent to your inbox',
  },
];

// ── Reusable row + collapsible section ───────────────────────────────────────
function MenuRow({ id, Icon, title, subtitle, open, onToggle, children }) {
  return (
    <Card hover={false} className="!p-0 overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        aria-controls={`${id}-body`}
        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-purple/10 transition-colors"
      >
        <span
          aria-hidden="true"
          className="shrink-0 h-10 w-10 rounded-xl bg-purple/20 border border-purple/30 flex items-center justify-center text-purple-light"
        >
          <Icon className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-sm">{title}</p>
          {subtitle && (
            <p className="text-[11px] text-textgray mt-0.5">{subtitle}</p>
          )}
        </div>
        <ChevronRight
          aria-hidden="true"
          className={[
            'h-4 w-4 shrink-0 text-textgray transition-transform',
            open ? 'rotate-90' : 'rotate-0',
          ].join(' ')}
        />
      </button>
      {open && (
        <div id={`${id}-body`} className="px-4 pb-4 pt-1 border-t border-purple/20">
          {children}
        </div>
      )}
    </Card>
  );
}

function Toggle({ on, onChange, label }) {
  return (
    <div className="flex items-center justify-between gap-3 py-2">
      <span className="text-sm">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={on}
        onClick={() => onChange(!on)}
        className={[
          'relative h-6 w-11 rounded-full transition-colors shrink-0',
          on ? 'bg-purple' : 'bg-navy-light border border-purple/40',
        ].join(' ')}
      >
        <span
          className={[
            'absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all',
            on ? 'left-[22px]' : 'left-0.5',
          ].join(' ')}
        />
      </button>
    </div>
  );
}

// ── Account (always visible, not collapsed) ──────────────────────────────────
function AccountSection() {
  const { user, updateUser, showToast } = useApp();
  const [form, setForm] = useState({
    name: user.name ?? '',
    email: user.email ?? '',
    phone: user.phone ?? '',
  });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const next = {};
    if (!form.name.trim()) next.name = 'Name is required';
    if (!form.email.trim()) next.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email))
      next.email = 'Please enter a valid email';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const save = (e) => {
    e.preventDefault();
    if (!validate()) return;
    updateUser({
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
    });
    showToast('Account saved.', 'success');
  };

  return (
    <form onSubmit={save} className="space-y-3">
      <div>
        <label className="text-xs text-textgray" htmlFor="name">Name</label>
        <input
          id="name"
          type="text"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          aria-invalid={!!errors.name}
          className="mt-1 w-full bg-navy-light border border-purple/40 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-light"
        />
        {errors.name && <p className="text-xs text-rose mt-1">{errors.name}</p>}
      </div>
      <div>
        <label className="text-xs text-textgray" htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          aria-invalid={!!errors.email}
          className="mt-1 w-full bg-navy-light border border-purple/40 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-light"
        />
        {errors.email && <p className="text-xs text-rose mt-1">{errors.email}</p>}
        <p className="text-[11px] text-textgray/80 mt-1">
          Booking confirmations are sent here.
        </p>
      </div>
      <div>
        <label className="text-xs text-textgray" htmlFor="phone">
          Phone <span className="text-textgray/60">(optional)</span>
        </label>
        <input
          id="phone"
          type="tel"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
          className="mt-1 w-full bg-navy-light border border-purple/40 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-light"
        />
      </div>
      <Button type="submit" variant="primary" size="md" className="w-full">
        Save
      </Button>
    </form>
  );
}

// ── AI Call Feedback ─────────────────────────────────────────────────────────
function FeedbackSection() {
  const { history, setFeedback, showToast } = useApp();
  const aiCalls = useMemo(
    () =>
      history
        .filter((h) => h.type === 'ai')
        .sort((a, b) => new Date(b.startTime) - new Date(a.startTime))
        .slice(0, 5),
    [history]
  );

  if (aiCalls.length === 0) {
    return (
      <p className="text-textgray text-sm">
        After your first AI calls, you'll be able to tell Buddy what helped.
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {aiCalls.map((call) => (
        <li key={call.id} className="border-t border-purple/20 pt-3 first:border-t-0 first:pt-0">
          <div className="flex items-center justify-between text-xs text-textgray">
            <span>
              {new Date(call.startTime).toLocaleString(undefined, {
                month: 'short',
                day: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
              })}
            </span>
            <span className="inline-flex items-center gap-1">
              {MOOD_EMOJI[call.moodBefore] ?? '—'}
              <ArrowRight className="h-3 w-3 text-textgray" aria-hidden="true" />
              {MOOD_EMOJI[call.moodAfter] ?? '—'}
            </span>
          </div>
          {call.title && (
            <p className="text-sm mt-1 font-medium truncate">{call.title}</p>
          )}
          <div className="flex gap-2 mt-2">
            {['helpful', 'not-helpful'].map((v) => {
              const active = call.feedback === v;
              return (
                <button
                  key={v}
                  type="button"
                  onClick={() => {
                    setFeedback(call.id, active ? null : v);
                    showToast('Thanks for the nudge.', 'success');
                  }}
                  aria-pressed={active}
                  className={[
                    'px-3 py-1.5 rounded-full text-xs border transition-colors',
                    active
                      ? v === 'helpful'
                        ? 'bg-success/30 border-success text-white'
                        : 'bg-rose/30 border-rose text-white'
                      : 'border-purple/40 text-textgray hover:border-purple hover:text-white',
                  ].join(' ')}
                >
                  {v === 'helpful' ? (
                    <span className="inline-flex items-center gap-1">
                      <ThumbsUp className="h-3 w-3" aria-hidden="true" /> Helpful
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1">
                      <ThumbsDown className="h-3 w-3" aria-hidden="true" /> Not helpful
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </li>
      ))}
    </ul>
  );
}

// ── Trusted contact ──────────────────────────────────────────────────────────
function EmergencySection() {
  const { emergencyContact, setEmergencyContact, showToast } = useApp();
  const [form, setForm] = useState({
    name: emergencyContact?.name ?? '',
    phone: emergencyContact?.phone ?? '',
  });
  const [consent, setConsent] = useState(!!emergencyContact);

  const save = (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim()) {
      showToast('Please add a name and phone.', 'error');
      return;
    }
    if (!consent) {
      showToast('Confirm consent first.', 'error');
      return;
    }
    setEmergencyContact({ name: form.name.trim(), phone: form.phone.trim() });
    showToast('Emergency contact saved.', 'success');
  };

  const remove = () => {
    setEmergencyContact(null);
    setForm({ name: '', phone: '' });
    setConsent(false);
    showToast('Emergency contact removed.', 'success');
  };

  return (
    <form onSubmit={save} className="space-y-3">
      <p className="text-xs text-textgray leading-relaxed">
        We'll only reach out to this person if something feels urgent and you
        agree at the moment. They will never be contacted silently.
      </p>
      <div>
        <label className="text-xs text-textgray" htmlFor="ec-name">Name</label>
        <input
          id="ec-name"
          type="text"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="mt-1 w-full bg-navy-light border border-purple/40 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-light"
        />
      </div>
      <div>
        <label className="text-xs text-textgray" htmlFor="ec-phone">Phone</label>
        <input
          id="ec-phone"
          type="tel"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
          className="mt-1 w-full bg-navy-light border border-purple/40 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-light"
        />
      </div>
      <Toggle
        on={consent}
        onChange={setConsent}
        label="I'm okay with 2AM Buddy contacting this person if I confirm in the moment."
      />
      <div className="flex gap-2">
        <Button type="submit" variant="primary" size="md" className="flex-1">
          Save
        </Button>
        {emergencyContact && (
          <Button type="button" variant="outline" size="md" onClick={remove}>
            Remove
          </Button>
        )}
      </div>
    </form>
  );
}

// ── Privacy & data ───────────────────────────────────────────────────────────
function PrivacySection() {
  const { privacy, updatePrivacy, history, deleteHistoryEntry, showToast } =
    useApp();

  const exportData = () => {
    const blob = new Blob(
      [JSON.stringify({ privacy, history }, null, 2)],
      { type: 'application/json' }
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `2am-buddy-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Export started.', 'success');
  };

  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm font-semibold">How long we keep your data</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {RETENTION_OPTIONS.map((opt) => {
            const active = privacy.retention === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => {
                  updatePrivacy({ retention: opt.id });
                  showToast(`Retention set to ${opt.label}.`, 'success');
                }}
                aria-pressed={active}
                className={[
                  'px-3 py-1.5 rounded-full text-xs border transition-colors',
                  active
                    ? 'bg-purple border-purple-light text-white'
                    : 'border-purple/40 text-textgray hover:text-white hover:border-purple',
                ].join(' ')}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <p className="text-sm font-semibold">What experts can see by default</p>
        <p className="text-xs text-textgray mt-0.5">
          You can still toggle items each time you tap Share.
        </p>
        <div className="mt-2">
          {Object.keys(VISIBILITY_LABELS).map((k) => (
            <Toggle
              key={k}
              on={!!privacy.expertVisibility?.[k]}
              onChange={(v) =>
                updatePrivacy({ expertVisibility: { [k]: v } })
              }
              label={VISIBILITY_LABELS[k]}
            />
          ))}
        </div>
      </div>

      <div>
        <p className="text-sm font-semibold">Delete a single conversation</p>
        <ul className="mt-2 space-y-2 max-h-48 overflow-y-auto">
          {history.filter((h) => h.type === 'ai').map((h) => (
            <li key={h.id} className="flex items-center justify-between gap-3 text-sm">
              <span className="truncate text-textgray">
                {new Date(h.startTime).toLocaleString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit',
                })}
              </span>
              <button
                type="button"
                onClick={() => {
                  deleteHistoryEntry(h.id);
                  showToast('Conversation deleted.', 'success');
                }}
                className="text-xs text-rose hover:text-rose-dark"
              >
                Delete
              </button>
            </li>
          ))}
          {history.filter((h) => h.type === 'ai').length === 0 && (
            <li className="text-xs text-textgray/70">Nothing to delete yet.</li>
          )}
        </ul>
      </div>

      <Button variant="outline" size="md" className="w-full" onClick={exportData}>
        Export my data (JSON)
      </Button>
    </div>
  );
}

// ── Reminders ────────────────────────────────────────────────────────────────
function RemindersSection() {
  const { reminders, addReminder, updateReminder, removeReminder, showToast } =
    useApp();
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState({ label: '', time: '21:00' });

  const handleAdd = (e) => {
    e.preventDefault();
    const label = draft.label.trim();
    if (!label) {
      showToast('Give the reminder a name.', 'error');
      return;
    }
    addReminder({
      id: `rem-${Date.now()}`,
      label,
      time: draft.time,
      enabled: true,
    });
    setDraft({ label: '', time: '21:00' });
    setAdding(false);
    showToast('Reminder added.', 'success');
  };

  return (
    <div className="space-y-3">
      <p className="text-[11px] text-textgray italic">
        Real notifications need a push backend (not yet wired). For now,
        your toggles persist in this session.
      </p>
      <ul className="space-y-2">
        {reminders.map((r) => (
          <li
            key={r.id}
            className="flex items-center gap-3 px-3 py-2 rounded-xl bg-navy/60 border border-purple/30"
          >
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium truncate">{r.label}</p>
              <input
                type="time"
                value={r.time}
                onChange={(e) => updateReminder(r.id, { time: e.target.value })}
                aria-label={`${r.label} time`}
                className="mt-1 bg-transparent text-xs text-textgray focus:outline-none focus:text-white"
              />
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={r.enabled}
              aria-label={`Toggle ${r.label}`}
              onClick={() =>
                updateReminder(r.id, { enabled: !r.enabled })
              }
              className={[
                'relative h-6 w-11 rounded-full transition-colors shrink-0',
                r.enabled ? 'bg-purple' : 'bg-navy-light border border-purple/40',
              ].join(' ')}
            >
              <span
                className={[
                  'absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all',
                  r.enabled ? 'left-[22px]' : 'left-0.5',
                ].join(' ')}
              />
            </button>
            <button
              type="button"
              onClick={() => removeReminder(r.id)}
              aria-label={`Remove ${r.label}`}
              className="text-textgray/70 hover:text-rose shrink-0"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </li>
        ))}
        {reminders.length === 0 && (
          <li className="text-xs text-textgray/70 italic">
            No reminders yet.
          </li>
        )}
      </ul>

      {adding ? (
        <form
          onSubmit={handleAdd}
          className="rounded-xl border border-purple/30 bg-navy/60 p-3 space-y-2"
        >
          <input
            type="text"
            value={draft.label}
            onChange={(e) => setDraft({ ...draft, label: e.target.value })}
            placeholder="Reminder name"
            className="w-full bg-navy-light border border-purple/40 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-light"
          />
          <input
            type="time"
            value={draft.time}
            onChange={(e) => setDraft({ ...draft, time: e.target.value })}
            className="w-full bg-navy-light border border-purple/40 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-light"
          />
          <div className="flex gap-2">
            <Button type="submit" variant="primary" size="sm" className="flex-1">
              Add
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setAdding(false)}
            >
              Cancel
            </Button>
          </div>
        </form>
      ) : (
        <Button
          variant="outline"
          size="md"
          className="w-full"
          onClick={() => setAdding(true)}
        >
          + Add custom reminder
        </Button>
      )}
    </div>
  );
}

// ── Connected accounts ───────────────────────────────────────────────────────
function ConnectedAccountsSection() {
  const {
    user,
    connectedAccounts,
    setConnectedAccount,
    unlinkAllAccounts,
    showToast,
  } = useApp();

  const toggle = (key) => {
    const next = !connectedAccounts[key];
    setConnectedAccount(key, next);
    showToast(next ? 'Connected.' : 'Disconnected.', 'success');
  };

  return (
    <div className="space-y-3">
      <ul className="space-y-2">
        {ACCOUNT_ROWS.map((row) => {
          const isEmail = row.key === 'email';
          const connected = isEmail
            ? !!user?.email && connectedAccounts.email
            : !!connectedAccounts[row.key];
          return (
            <li
              key={row.key}
              className="flex items-center gap-3 px-3 py-3 rounded-xl bg-navy/60 border border-purple/30"
            >
              <span
                aria-hidden="true"
                className="shrink-0 h-9 w-9 rounded-xl bg-purple/20 border border-purple/30 flex items-center justify-center text-purple-light"
              >
                <row.Icon className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">{row.label}</p>
                <p className="text-[11px] text-textgray">
                  {isEmail && user?.email
                    ? user.email
                    : row.description}
                </p>
              </div>
              <span
                className={[
                  'shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full border',
                  connected
                    ? 'bg-success/20 text-success border-success/40'
                    : 'bg-navy-light text-textgray border-purple/30',
                ].join(' ')}
              >
                {connected ? 'Connected' : 'Not connected'}
              </span>
              <button
                type="button"
                onClick={() => toggle(row.key)}
                disabled={isEmail && !user?.email}
                className="shrink-0 text-xs text-purple-light hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {connected ? 'Disconnect' : 'Connect'}
              </button>
            </li>
          );
        })}
      </ul>
      <Button
        variant="outline"
        size="md"
        className="w-full"
        onClick={() => {
          unlinkAllAccounts();
          showToast('All accounts unlinked.', 'success');
        }}
      >
        Unlink all accounts
      </Button>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────
const MENU_ITEMS = [
  {
    id: 'reminders',
    Icon: AlarmClock,
    title: 'Reminders',
    subtitle: 'Gentle nudges, on your schedule',
    body: <RemindersSection />,
  },
  {
    id: 'connected',
    Icon: Plug,
    title: 'Connected accounts',
    subtitle: 'Calendar, Meet, Email',
    body: <ConnectedAccountsSection />,
  },
  {
    id: 'feedback',
    Icon: MessageCircle,
    title: 'AI call feedback',
    subtitle: 'Tell Buddy what helped',
    body: <FeedbackSection />,
  },
  {
    id: 'emergency',
    Icon: HeartHandshake,
    title: 'Trusted contact',
    subtitle: 'Only with your consent, in the moment',
    body: <EmergencySection />,
  },
  {
    id: 'privacy',
    Icon: Lock,
    title: 'Privacy & data',
    subtitle: 'Export, delete, retention, visibility',
    body: <PrivacySection />,
  },
];

export default function Profile() {
  const { user } = useApp();
  const [openId, setOpenId] = useState(null);

  const initial = (user?.name || 'You').trim().charAt(0).toUpperCase();
  const subtitle = user?.name
    ? "Glad you're here tonight."
    : 'Add your name to get started.';

  return (
    <main className="min-h-[calc(100vh-3.5rem)] pb-28 px-5 pt-5 animate-fade-in max-w-md mx-auto">
      {/* Hero */}
      <header className="flex items-center gap-3 mb-5">
        <div
          className="h-14 w-14 rounded-full bg-gradient-to-br from-purple to-purple-dark flex items-center justify-center text-xl font-bold shadow-glow"
          aria-hidden="true"
        >
          {initial}
        </div>
        <div className="min-w-0">
          <h1 className="text-xl font-bold truncate">
            {user?.name || 'Welcome'}
          </h1>
          <p className="text-xs text-textgray">{subtitle}</p>
        </div>
      </header>

      {/* Always-visible Account */}
      <Card hover={false} className="mb-4">
        <div className="flex items-center gap-2 mb-3">
          <User className="h-5 w-5 text-purple-light" aria-hidden="true" />
          <p className="font-semibold">Account</p>
        </div>
        <AccountSection />
      </Card>

      {/* Menu rows */}
      <div className="space-y-2">
        {MENU_ITEMS.map((item) => (
          <MenuRow
            key={item.id}
            id={item.id}
            Icon={item.Icon}
            title={item.title}
            subtitle={item.subtitle}
            open={openId === item.id}
            onToggle={() => setOpenId(openId === item.id ? null : item.id)}
          >
            {item.body}
          </MenuRow>
        ))}
      </div>
    </main>
  );
}
