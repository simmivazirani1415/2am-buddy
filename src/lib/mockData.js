// ─────────────────────────────────────────────────────────────────────────────
// mockData.js
//
// Mock data for the "tabs" build (History, Resources, Profile, Share).
// Shapes match the BuildSpec §7 so every screen renders immediately with no
// backend. In production these are replaced by VAPI summaries + the Make.com
// booking flow. Dates are computed relative to "now" at import time so the
// History filters (recent = last 7 days, upcoming vs. past sessions) always
// have something sensible to show.
// ─────────────────────────────────────────────────────────────────────────────

const NOW = Date.now();
const MIN = 60 * 1000;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;

const ago = (ms) => new Date(NOW - ms).toISOString();
const ahead = (ms) => new Date(NOW + ms).toISOString();

// ── User / account ───────────────────────────────────────────────────────────
export const MOCK_USER = {
  name: 'Aarav',
  email: 'aarav@example.com',
  phone: '',
};

export const MOCK_EMERGENCY_CONTACT = {
  name: 'Meera (sister)',
  phone: '+91 98200 12345',
};

export const MOCK_PRIVACY = {
  retention: '90d',
  expertVisibility: {
    summary: true,
    flaggedMoments: true,
    transcript: false,
  },
};

export const MOCK_REMINDERS = [
  { id: 'rem-winddown', label: 'Wind-down check-in', time: '22:30', enabled: true },
  { id: 'rem-breathe', label: 'Evening breathing', time: '21:00', enabled: false },
];

export const MOCK_CONNECTED_ACCOUNTS = {
  calendar: true,
  meet: true,
  email: true,
};

export const DAILY_THOUGHTS = [
  'You made it through today. That counts.',
  "Rest is not a reward you earn — it's something you're allowed.",
  'Whatever tonight feels like, it is not the whole story.',
  'You can be a work in progress and still be worthy of care.',
  'Breathing slowly tells your body it is safe to settle.',
  "It's okay to need help. Reaching out is a kind of strength.",
];

// ── Counselors (for booked/human sessions) ───────────────────────────────────
const COUNSELOR_AISHA = {
  id: 'dr-aisha',
  name: 'Dr. Aisha Verma',
  title: 'Clinical Psychologist',
  image:
    'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=200&q=80',
};

const COUNSELOR_ROHAN = {
  id: 'dr-rohan',
  name: 'Rohan Mehta',
  title: 'Counselling Therapist',
  image:
    'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=200&q=80',
};

// ── History ──────────────────────────────────────────────────────────────────
// type 'ai'        → late-night calls with Buddy (Recent + Critical tabs)
// type 'counselor' → booked human sessions (Counselor tab, past + upcoming)
export const MOCK_HISTORY = [
  {
    id: 'call-1',
    type: 'ai',
    startTime: ago(6 * HOUR),
    durationSec: 8 * 60 + 12,
    moodBefore: 'struggling',
    moodAfter: 'not-great',
    title: 'Couldn’t switch off after work',
    summary:
      'You’d been lying awake replaying a hard day at work. We named the worry, slowed your breathing together, and by the end your mind felt a little quieter.',
    topics: ['Work stress', 'Sleep', 'Racing thoughts'],
    riskLevel: 'low',
    flagged: false,
    feedback: 'helpful',
    note: null,
  },
  {
    id: 'call-2',
    type: 'ai',
    startTime: ago(2 * DAY + 3 * HOUR),
    durationSec: 12 * 60 + 40,
    moodBefore: 'struggling',
    moodAfter: 'good',
    title: 'A panic wave at 2am',
    summary:
      'A wave of panic woke you. We grounded with a 5-4-3-2-1 exercise and steady breathing until your heart rate came down. You felt steadier before we said goodnight.',
    topics: ['Panic', 'Grounding', 'Breathing'],
    riskLevel: 'medium',
    flagged: true,
    feedback: null,
    note: 'The counting thing actually worked.',
  },
  {
    id: 'call-3',
    type: 'ai',
    startTime: ago(4 * DAY + 5 * HOUR),
    durationSec: 5 * 60 + 3,
    moodBefore: 'not-great',
    moodAfter: 'good',
    title: 'Feeling lonely',
    summary:
      'You felt far from the people you care about. We talked about small ways to reconnect and wrote down one person you might message tomorrow.',
    topics: ['Loneliness', 'Connection'],
    riskLevel: 'low',
    flagged: false,
    feedback: 'helpful',
    note: null,
  },
  {
    id: 'call-4',
    type: 'ai',
    startTime: ago(6 * DAY + 1 * HOUR),
    durationSec: 15 * 60 + 27,
    moodBefore: 'struggling',
    moodAfter: 'not-great',
    title: 'A really heavy night',
    summary:
      'Everything felt like too much and some dark thoughts showed up. We stayed with it together, made sure you were safe for the night, and lined up support for the next day.',
    topics: ['Overwhelm', 'Safety', 'Support'],
    riskLevel: 'high',
    flagged: true,
    feedback: null,
    note: null,
  },
  // ── Booked human sessions ──────────────────────────────────────────────────
  {
    id: 'session-upcoming',
    type: 'counselor',
    startTime: ahead(2 * DAY + 4 * HOUR),
    slot: 'In 2 days · 6:00 PM',
    mode: 'Video · Google Meet',
    counselor: COUNSELOR_AISHA,
    riskLevel: 'low',
    flagged: false,
    summary:
      'Upcoming session with Dr. Aisha to talk through the last couple of weeks and build on what’s been helping.',
    notes: null,
    note: null,
  },
  {
    id: 'session-past-1',
    type: 'counselor',
    startTime: ago(9 * DAY),
    slot: '9 days ago · 5:00 PM',
    mode: 'Video · Google Meet',
    counselor: COUNSELOR_AISHA,
    riskLevel: 'low',
    flagged: false,
    summary:
      'First session. We mapped your sleep patterns and agreed on a gentle wind-down routine to try.',
    notes: 'Try the wind-down routine; revisit sleep in two weeks.',
    note: null,
  },
  {
    id: 'session-past-2',
    type: 'counselor',
    startTime: ago(23 * DAY),
    slot: '3 weeks ago · 7:30 PM',
    mode: 'Phone call',
    counselor: COUNSELOR_ROHAN,
    riskLevel: 'low',
    flagged: false,
    summary:
      'Talked through work pressure and practised naming feelings before they build up.',
    notes: 'Keep a short evening journal.',
    note: null,
  },
];

// ── Share flow ───────────────────────────────────────────────────────────────
// Builds the consent-gated share draft from current history (BuildSpec §3.2):
// an editable AI summary + the list of flagged moments. `included` seeds each
// toggle to "on" so the user redacts rather than hunts for what to add.
export function buildShareDraft(history = []) {
  const aiCalls = history
    .filter((h) => h.type === 'ai')
    .sort((a, b) => new Date(b.startTime) - new Date(a.startTime));

  const latest = aiCalls[0];
  const summaryText = latest
    ? latest.summary
    : 'No recent conversations to summarise yet.';

  const flaggedMoments = history
    .filter((h) => h.flagged || h.riskLevel === 'high' || h.riskLevel === 'medium')
    .sort((a, b) => new Date(b.startTime) - new Date(a.startTime))
    .map((h) => ({
      id: h.id,
      date: h.startTime,
      note: h.title ?? h.summary ?? 'A harder moment',
    }));

  const items = [
    { id: 'summary', label: 'AI summary', body: summaryText },
    { id: 'flaggedMoments', label: 'Flagged moments', body: flaggedMoments },
  ];

  const included = items.reduce((acc, it) => ({ ...acc, [it.id]: true }), {});

  return { items, included };
}

// ── Crisis helplines (India-appropriate, offline-first) ──────────────────────
// `number` set → one-tap tel:. Omit `number` to show a "coming soon" row.
export const CRISIS_HELPLINES = [
  {
    id: 'tele-manas',
    name: 'Tele-MANAS (Govt. of India)',
    number: '14416',
    hours: 'Available 24×7',
    note: 'National mental health support line.',
  },
  {
    id: 'kiran',
    name: 'KIRAN Mental Health Helpline',
    number: '1800-599-0019',
    hours: 'Available 24×7 · Toll-free',
    note: 'Government helpline in 13 languages.',
  },
  {
    id: 'vandrevala',
    name: 'Vandrevala Foundation',
    number: '18602662345',
    hours: 'Available 24×7',
    note: 'Free counselling and crisis intervention.',
  },
  {
    id: 'aasra',
    name: 'AASRA',
    number: '9820466726',
    hours: 'Available 24×7',
    note: 'Support for those feeling distressed or suicidal.',
  },
  {
    id: 'icall',
    name: 'iCall (TISS)',
    number: '9152987821',
    hours: 'Mon–Sat · 8am–10pm',
    note: 'Free telephone and email counselling.',
  },
  {
    id: 'local-emergency',
    name: 'Local emergency services',
    number: '112',
    hours: 'Always',
    note: 'For medical emergencies, dial 112.',
  },
];

// ── Guided practices (Resources tab) ─────────────────────────────────────────
export const FEELINGS = [
  { id: 'cant-sleep', label: "Can't sleep" },
  { id: 'panic', label: 'Panic right now' },
  { id: 'lonely', label: 'Lonely' },
  { id: 'overwhelmed', label: 'Overwhelmed' },
];

export const KIND_LABEL = {
  exercise: 'Breathing',
  story: 'Sleep story',
  meditation: 'Meditation',
  music: 'Calming sound',
};

// Sub-tabs under Guided Practices. A tab with no `kinds` matches everything
// (the "All" tab); otherwise it filters practices by their `kind`.
export const PRACTICE_TABS = [
  { id: 'all', label: 'All' },
  { id: 'exercises', label: 'Breathing', kinds: ['exercise'] },
  { id: 'stories', label: 'Sleep stories', kinds: ['story'] },
  { id: 'meditation', label: 'Meditation', kinds: ['meditation'] },
  { id: 'music', label: 'Sounds', kinds: ['music'] },
];

export const PRACTICES = [
  {
    id: 'p-box-breathing',
    title: 'Box breathing (4-4-4-4)',
    kind: 'exercise',
    source: 'Calm',
    durationSec: 5 * 60,
    url: 'https://www.youtube.com/watch?v=tEmt1Znux58',
    feelings: ['panic', 'overwhelmed', 'cant-sleep'],
  },
  {
    id: 'p-478-breathing',
    title: '4-7-8 breathing to fall asleep',
    kind: 'exercise',
    source: 'Headspace',
    durationSec: 6 * 60,
    url: 'https://www.youtube.com/watch?v=LiUnFJ8P4gM',
    feelings: ['cant-sleep', 'panic'],
  },
  {
    id: 'p-54321',
    title: '5-4-3-2-1 grounding',
    kind: 'exercise',
    source: 'Mindful',
    durationSec: 4 * 60,
    url: 'https://www.youtube.com/watch?v=30VMIEmA114',
    feelings: ['panic', 'overwhelmed'],
  },
  {
    id: 'p-sleep-story-train',
    title: 'The Night Train — a slow sleep story',
    kind: 'story',
    source: 'Calm',
    durationSec: 30 * 60,
    url: 'https://www.youtube.com/watch?v=1ZYbU82GVz4',
    feelings: ['cant-sleep'],
  },
  {
    id: 'p-sleep-story-garden',
    title: 'A walk through a quiet garden',
    kind: 'story',
    source: 'Insight Timer',
    durationSec: 25 * 60,
    url: 'https://www.youtube.com/watch?v=inpok4MKVLM',
    feelings: ['cant-sleep', 'lonely'],
  },
  {
    id: 'p-loving-kindness',
    title: 'Loving-kindness meditation',
    kind: 'meditation',
    source: 'UCLA Health',
    durationSec: 10 * 60,
    url: 'https://www.youtube.com/watch?v=sz7cpV7ERsM',
    feelings: ['lonely', 'overwhelmed'],
  },
  {
    id: 'p-body-scan',
    title: 'Body scan to release tension',
    kind: 'meditation',
    source: 'Headspace',
    durationSec: 12 * 60,
    url: 'https://www.youtube.com/watch?v=ihO02wUzgkc',
    feelings: ['cant-sleep', 'overwhelmed'],
  },
  {
    id: 'p-rain-sounds',
    title: 'Gentle rain for sleep',
    kind: 'music',
    source: 'Nature sounds',
    durationSec: 8 * 60 * 60,
    url: 'https://www.youtube.com/watch?v=mPZkdNFkNps',
    feelings: ['cant-sleep', 'lonely'],
  },
  {
    id: 'p-calm-piano',
    title: 'Calm piano to settle the mind',
    kind: 'music',
    source: 'Soothing Relaxation',
    durationSec: 60 * 60,
    url: 'https://www.youtube.com/watch?v=lFcSrYw-ARY',
    feelings: ['overwhelmed', 'panic'],
  },
];
