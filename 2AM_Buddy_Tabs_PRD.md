# 2AM Buddy — PRD: History, Resources & Profile Tabs

**Product:** 2AM Buddy — AI Mental Health Companion
**Scope of this document:** The three bottom-nav tabs beyond the core voice flow — **History**, **Resources**, and **Profile**.
**Status:** Ready to build
**Stack (unchanged):** React + Vite, React Router, AppContext (useReducer), `useVapi` hook, Make.com webhooks. Dark navy/purple theme. Bottom nav already exists.

---

## 1. Context & Product Goals

The core experience ("Talk to 2AM Buddy") and screens 1–10 already exist. These three tabs wrap supporting experiences around that core.

Two pain points are weighted **equally** and shape every tab:

1. **Bridging the 2am gap** — giving someone immediate, calming support and one-tap crisis access in the moment human help isn't reachable.
2. **Continuity of care** — the user tells their story once. Buddy remembers, and a clean summary travels to the human expert so nothing has to be re-explained.

**Design principles**
- **Consent & transparency are surfaced at the moment data moves**, not buried in a settings page.
- **Gentle, non-clinical framing.** No scores, streaks, or "performance." A hard day must never feel like failing.
- **Crisis help is always one tap away**, reachable from every screen, and works offline.
- Reuse the existing design system (navy `#0F1B3F`, purple `#7C3AED`, rose `#F87171`, success `#34D399`, white/gray text), components, and animations. No new visual language.

---

## 2. Shared / Cross-Cutting Features

These are referenced by multiple tabs; build once.

### 2.1 Persistent "Get Help Now"
- A small, always-visible crisis affordance (floating button or header action) present on **every** screen except the active voice/risk screens (which already have their own).
- Tapping opens the **Crisis Helplines** view (see Resources 4.1) directly.
- Must render and dial even with no network (numbers cached locally).

### 2.2 Consent-Gated Share Flow
The trust-defining moment. Triggered when the user or Buddy initiates connecting to an expert (this is the "Preparing summary" step from screen 7).
- A dedicated screen titled e.g. "Here's what we'll share."
- Shows a **preview** of exactly what the expert receives: the AI summary, mood trend, and any flagged moments.
- Each item is individually **toggleable / redactable**.
- Explicit **"Share with counselor"** primary action + "Cancel" secondary. Nothing is sent until tapped.
- On confirm: POST to the existing Make.com webhook with the approved payload.
- States: preview, sending (loading), sent (success toast), error (retry).

---

## 3. History Tab

**Route:** `/history`
**Purpose:** Let the user revisit past conversations gently, and serve as the source of the summary shared with experts (continuity of care).

### 3.1 Structure — three sub-tabs
Top segmented control with three views. **Default = Recent.**

**A. Recent (last 7 days)**
- List of conversation entries, newest first.
- Each entry card: date/time, duration, **mood before → after** (emoji), and a short **AI-generated summary** (not a raw transcript by default).
- Tapping a card opens detail: full summary, optional "view transcript" expand, and a "Share with counselor" action (→ Consent-Gated Share Flow 2.2).
- Framing is calm; avoid alarming language.

**B. Critical calls**
- Flagged / high-risk conversations only.
- **Not the default tab.** Calm, supportive framing — these exist primarily so a counselor has context, softly surfaced to the user.
- Each entry: date/time, a gentle one-line note, and "Share with counselor."

**C. Mentor / counselor calls**
- Booked human sessions (past and upcoming).
- Each entry: counselor name, photo, date/time, mode (e.g. Google Meet), session notes if available.
- Actions: **Rebook same counselor** (continuity), "View details."

### 3.2 Data
- `conversationHistory` entries extended with: `id`, `startTime`, `durationSec`, `moodBefore`, `moodAfter`, `summary`, `riskLevel ('low'|'medium'|'high')`, `flagged (bool)`, `type ('ai'|'counselor')`.
- Counselor sessions reference `selectedCounselor` + `selectedTimeSlot` from booking flow.
- **Source:** summaries generated from VAPI conversation; booking data from the existing Make.com flow. For first build, mock data is acceptable behind the same shape.

### 3.3 States
- **Empty:** warm illustration + "Your conversations will appear here." (per sub-tab).
- **Loading:** existing LoadingSpinner.
- **Error:** toast + retry.

---

## 4. Resources Tab

**Route:** `/resources`
**Purpose:** Immediate, in-the-moment support (2am gap). Optimized for acute states — minimal browsing.

### 4.1 Crisis Helplines (top, always prominent)
- India-appropriate helplines, **one-tap to call** (`tel:` links).
- Pinned at the top of Resources **and** reachable via the persistent "Get Help Now" (2.1).
- **Works offline** — numbers cached locally.
- Quiet line: support lines are confidential; this doesn't replace emergency services.

### 4.2 Guided content — organized by *how you feel*, not content type
- Entry categories matching the user's state: **"Can't sleep," "Panic right now," "Lonely," "Overwhelmed,"** (extensible).
- Each category opens a small set of: breathing exercises, grounding techniques, **sleep stories** (key for the 2am insomnia/anxiety audience), short meditations.
- Audio/timed content uses simple play + timer UI.

### 4.3 Quick Relief
- A single, prominent tap for an **immediate** calming/breathing exercise — for moments when scrolling a library is too much.

### 4.4 Spiritual / Faith guidance
- User can pick a tradition (or none) so content fits them. Respect "none."
- Multilingual-friendly where possible.

### 4.5 Notes
- All content professionally vetted; quiet disclaimer that it doesn't replace human help.
- **States:** content list always available offline-first where possible; loading/empty/error per section.

---

## 5. Profile Tab

**Route:** `/profile`
**Purpose:** Identity, control, and the user's private trust center. No "personalization" section. No sex/gender field. No scores/streaks.

### 5.1 Account info (top)
- **Name** — required (editable)
- **Email** — required (editable)
- **Phone number** — optional (editable)
- Inline validation; save on change with success toast.

### 5.2 AI Call Feedback
- Quick reactions on past calls (e.g. helpful / not helpful) so Buddy improves.
- Buddy's own gentle reflections surfaced here.

### 5.3 Trusted / Emergency Contact
- One contact the app may notify **with consent** if things escalate.
- Name + phone; clear explanation of when/if they'd be contacted.

### 5.4 Privacy & Data Hub (trust center)
- Export data.
- Delete an individual call.
- Set data **retention** preference.
- Control **what experts can see**.
- Each control states plainly what it does.

### 5.5 Safety Plan
- User-authored: coping strategies that help them, reasons/anchors that help, and who to contact.
- Established clinical tool; private to the user, optionally shareable via the consent flow.

### 5.6 Mood Trends / Your Journey
- Patterns over time (mood before/after across sessions, what tends to help).
- **No scores, no streaks, no pass/fail framing.** Reflective, not evaluative.
- Lightweight chart + plain-language reflections.

---

## 6. State / Data Additions (AppContext)

Extend the existing global state:

```
user: { name, email, phone },
emergencyContact: { name, phone } | null,
safetyPlan: { strategies: [], anchors: [], contacts: [] },
privacy: { retention, expertVisibility },
history: [ /* conversation + counselor entries, shape per 3.2 */ ],
resourcesProgress: { /* optional: last-used categories */ },
shareDraft: { items, included: {} } // for consent flow
```

Actions: `updateUser`, `setEmergencyContact`, `updateSafetyPlan`, `updatePrivacy`, `addHistoryEntry`, `prepareShare`, `confirmShare`, `deleteHistoryEntry`.

---

## 7. Routing & Navigation

- `/history`, `/resources`, `/profile` — all show the BottomNav (already configured).
- New sub-routes as needed: `/history/:id` (detail), `/share` (consent flow), `/resources/:category`.
- Persistent "Get Help Now" overlay available app-wide except active voice (`/voice`), thinking (`/thinking`), and risk (`/risk-alert`) screens.

---

## 8. Out of Scope (for this build)

- Real authentication / accounts backend (use local state + mock for now).
- Live counselor availability integration beyond existing Make.com flow.
- Push notifications.
- Full multilingual translation (design for it; don't fully implement yet).

---

## 9. Build Notes for Claude Code

- **Do not change** the existing voice flow, `useVapi`, Make.com webhooks, theme, or screens 1–10.
- Reuse existing components (Button, Card, BottomNav, Toast, LoadingSpinner, MoodSelector).
- Mobile-first; this app targets a phone-sized viewport.
- Crisis helpline numbers and the "Get Help Now" path must work offline.
- Use mock data matching the shapes above so screens render before real data is wired.
- All copy: warm, plain, non-clinical. Avoid evaluative or alarming language.
