# 2AM Buddy — Build Spec: History, Resources & Profile Tabs

> **FOR CLAUDE CODE.** This is a build spec. Implement the three bottom-nav tabs described below into the existing 2AM Buddy React app. Build in the order given in §8. Use mock data so every screen renders before real data is wired. Ask before deviating from anything marked **MUST**.

---

## 0. Mission

Build three tabs — **History**, **Resources**, **Profile** — plus two shared features (persistent crisis access, consent-gated share flow). The core voice experience (screens 1–10) already exists and is working. You are adding around it.

**MUST NOT change:** the voice flow, `useVapi` hook, VAPI integration, Make.com webhooks, the theme, or screens 1–10. Reuse existing components and routing.

---

## 1. Existing App Context (you are extending this)

- **Stack:** React + Vite, React Router (BrowserRouter), AppContext using `useReducer`, custom `useVapi` hook, Make.com webhooks for booking/escalation.
- **Theme (reuse, do not redefine):** navy bg `#0F1B3F`, primary purple `#7C3AED`, hover `#A78BFA`, rose/alert `#F87171`, success `#34D399`, text white `#FFFFFF`, gray `#D1D5DB`. Animations: pulse, spin, fadeIn, slideUp.
- **Existing components (reuse):** `Button`, `Card`, `BottomNav`, `Toast`, `LoadingSpinner`, `MoodSelector`.
- **BottomNav** already has 4 tabs: Home, History, Resources, Profile. Home and the voice/risk screens are done. History/Resources/Profile currently point to placeholders — replace those.
- **Mobile-first.** Target a phone viewport.

---

## 2. Design Principles (apply everywhere)

1. **Crisis help is always one tap away**, on every screen, and works **offline**.
2. **Consent & transparency surface at the moment data moves** — not buried in settings.
3. **Gentle, non-clinical copy.** No scores, streaks, or "performance" framing. A hard day must never read as failure.
4. Two equally-weighted product goals: **bridging the 2am gap** (immediate support) and **continuity of care** (tell your story once; summary travels to the expert).

---

## 3. Shared Features (build first — other tabs depend on them)

### 3.1 Persistent "Get Help Now"
- **MUST** be visible on every screen **except** `/voice`, `/thinking`, `/risk-alert` (those have their own).
- Small floating/header affordance. Tapping → Crisis Helplines view (§5.1).
- **MUST** render and dial with no network (numbers cached locally).

### 3.2 Consent-Gated Share Flow — `/share`
The trust-defining moment (this is screen 7's "Preparing summary," made explicit).
- Title: "Here's what we'll share."
- Preview of the exact expert payload: AI summary, mood trend, flagged moments.
- Each item individually **toggleable / redactable**.
- Primary: "Share with counselor" → POST approved payload to existing Make.com webhook. Secondary: "Cancel."
- **Nothing sends until the user taps Share.**
- States: preview → sending (LoadingSpinner) → sent (success Toast) → error (retry).

---

## 4. History Tab — `/history`

**Purpose:** Revisit past conversations gently; source of the expert summary (continuity).

**Layout:** Top segmented control, 3 sub-views. **Default = Recent.**

**A. Recent (last 7 days)** — list newest-first. Each card: date/time, duration, mood before → after (emoji), short **AI summary** (not raw transcript). Tap → detail (`/history/:id`): full summary, optional "view transcript" expand, "Share with counselor" → `/share`.

**B. Critical calls** — flagged/high-risk only. **MUST NOT** be the default tab. Calm framing. Card: date/time, gentle one-line note, "Share with counselor."

**C. Mentor / counselor calls** — booked human sessions (past + upcoming). Card: counselor name, photo, date/time, mode, notes if any. Actions: **Rebook same counselor**, "View details."

**States:** empty (warm illustration + "Your conversations will appear here," per sub-tab), loading (LoadingSpinner), error (Toast + retry).

---

## 5. Resources Tab — `/resources`

**Purpose:** Immediate in-the-moment support. Minimal browsing.

**5.1 Crisis Helplines** — pinned at top, India-appropriate, one-tap `tel:` call. Also reachable via §3.1. **MUST work offline.** Quiet confidentiality note; doesn't replace emergency services.

**5.2 Guided content by feeling** — categories by state: "Can't sleep," "Panic right now," "Lonely," "Overwhelmed" (extensible). Each → breathing exercises, grounding techniques, **sleep stories**, short meditations. Simple play + timer UI for timed content. Route: `/resources/:category`.

**5.3 Quick Relief** — one prominent tap → immediate breathing/calming exercise (for when scrolling is too much).

**5.4 Spiritual / Faith guidance** — user picks a tradition or **none** (respect none). Multilingual-friendly.

Quiet disclaimer: content is vetted, doesn't replace human help. Offline-first where possible.

---

## 6. Profile Tab — `/profile`

**Purpose:** Identity + control + private trust center. **No personalization section. No sex/gender field. No scores/streaks.**

**6.1 Account info (top):** Name (**required**), Email (**required**), Phone (**optional**). Inline validation; save → success Toast.

**6.2 AI Call Feedback:** quick reactions on past calls (helpful / not helpful) + Buddy's gentle reflections.

**6.3 Trusted / Emergency Contact:** one contact, notified **with consent** if things escalate. Name + phone + plain explanation of when they'd be contacted.

**6.4 Privacy & Data Hub:** export data; delete an individual call; set retention preference; control what experts can see. Each control states plainly what it does.

**6.5 Safety Plan:** user-authored coping strategies, anchors that help, who to contact. Private; optionally shareable via §3.2.

**6.6 Mood Trends / Your Journey:** patterns over time (mood before/after, what helps). **Reflective, not evaluative — no scores/streaks.** Lightweight chart + plain-language reflections.

---

## 7. State & Data (extend existing AppContext)

```js
user: { name, email, phone },
emergencyContact: { name, phone } | null,
safetyPlan: { strategies: [], anchors: [], contacts: [] },
privacy: { retention, expertVisibility },
history: [
  // { id, startTime, durationSec, moodBefore, moodAfter,
  //   summary, riskLevel: 'low'|'medium'|'high', flagged: bool,
  //   type: 'ai'|'counselor', counselor?, slot?, notes? }
],
shareDraft: { items: [], included: {} }
```

Actions: `updateUser`, `setEmergencyContact`, `updateSafetyPlan`, `updatePrivacy`, `addHistoryEntry`, `deleteHistoryEntry`, `prepareShare`, `confirmShare`.

**Data source:** AI summaries from VAPI conversation; booking data from existing Make.com flow. **For this build, use mock data matching the shapes above** so screens render immediately.

---

## 8. Build Order

1. State/context additions (§7) + mock data.
2. Shared features (§3): Get Help Now + `/share`.
3. History tab (§4) incl. `/history/:id`.
4. Resources tab (§5) incl. `/resources/:category`.
5. Profile tab (§6).
6. Wire BottomNav routes; verify Get Help Now visibility rules.

---

## 9. Routes to Add

`/history`, `/history/:id`, `/resources`, `/resources/:category`, `/profile`, `/share`. All show BottomNav. Get Help Now on all except `/voice`, `/thinking`, `/risk-alert`.

---

## 10. Done Criteria

- [ ] All three tabs render with mock data, no console errors.
- [ ] Get Help Now appears on the correct screens and dials offline.
- [ ] Consent share flow previews, redacts per item, and only sends on confirm.
- [ ] Profile fields validate (name/email required, phone optional); no sex/gender field; no personalization.
- [ ] Mood trends show patterns with no scores/streaks.
- [ ] Existing voice flow, `useVapi`, Make.com, theme, and screens 1–10 untouched.
- [ ] Mobile-first layout; reuses existing components and theme.

---

## 11. Out of Scope (this build)

Real auth backend, live counselor-availability beyond current Make.com flow, push notifications, full multilingual translation (design for it, don't implement).
