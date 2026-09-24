// -----------------------------------------------------------------------------
// [2am-debug] Diagnostics helpers
//
// Pure DIAGNOSTICS ONLY. Nothing here changes app behaviour — every export is
// read-only inspection + console logging. Flip DEBUG to false to silence ALL
// [2am-debug] output before going live.
// -----------------------------------------------------------------------------

export const DEBUG = true;

// Known placeholder values shipped in .env.example. If a real .env still holds
// one of these, the credential was never filled in.
//   - exact  : the whole value must equal the placeholder
//   - substr : the placeholder appearing anywhere in the value counts
const PLACEHOLDERS = {
  VITE_VAPI_PUBLIC_KEY: { kind: 'exact', value: 'your_public_key_here' },
  VITE_VAPI_ASSISTANT_ID: { kind: 'exact', value: 'your_assistant_id_here' },
  VITE_API_BASE_URL: { kind: 'substr', value: 'your_webhook_id_here' },
};

// Core console entry point. Always prefixed with [2am-debug]; no-ops when DEBUG
// is off so a single flag kills the whole block.
export function ddlog(...args) {
  if (!DEBUG) return;
  console.log('[2am-debug]', ...args);
}

// Mask a secret to first-4 + last-4 only. Never returns the full value; short
// values are fully redacted so we don't leak a whole short key.
export function maskPreview(v) {
  if (v == null) return '(undefined)';
  const s = String(v);
  if (s.length === 0) return '(empty)';
  if (s.length <= 8) return `${s.length}chars:****`; // too short to safely show
  return `${s.slice(0, 4)}…${s.slice(-4)}`;
}

// Mask a webhook/API URL: keep the scheme + host + a truncated path so you can
// confirm the endpoint, but redact the secret id segment(s).
export function maskUrl(u) {
  if (u == null || u === '') return '(empty)';
  const s = String(u);
  try {
    const url = new URL(s);
    const segs = url.pathname.split('/').filter(Boolean);
    const masked = segs
      .map((seg) => (seg.length <= 6 ? seg : `${seg.slice(0, 3)}…${seg.slice(-2)}`))
      .join('/');
    return `${url.protocol}//${url.host}/${masked}`;
  } catch {
    // Not a parseable URL — fall back to the generic secret mask.
    return maskPreview(s);
  }
}

// Classify an axios/fetch error into HTTP vs network/CORS and emit a
// [2am-debug] line. `where` names the call site (e.g. "Share webhook").
export function logRequestError(where, url, err) {
  if (!DEBUG) return;
  const base = { where, url: maskUrl(url) };
  if (err?.response) {
    // Server responded with a non-2xx status: a real HTTP error.
    ddlog(`${where}: HTTP ERROR`, {
      ...base,
      kind: 'http',
      status: err.response.status,
      statusText: err.response.statusText,
      responseBody: err.response.data,
    });
  } else if (err?.request) {
    // Request was made but no response arrived: network failure, CORS block,
    // DNS, or timeout. These never carry a status code.
    ddlog(`${where}: NETWORK/CORS ERROR (no HTTP response received)`, {
      ...base,
      kind: 'network-or-cors',
      name: err?.name,
      code: err?.code, // e.g. ERR_NETWORK, ECONNABORTED
      message: err?.message,
    });
  } else {
    // Error thrown before the request even left (config/setup).
    ddlog(`${where}: REQUEST SETUP ERROR`, {
      ...base,
      kind: 'setup',
      name: err?.name,
      message: err?.message,
    });
  }
}

// Inspect one env var and return a structured, secret-free diagnostic object.
export function analyzeEnvVar(name) {
  const raw = import.meta.env[name];
  const defined = raw !== undefined;
  const value = defined ? String(raw) : '';

  const hasLeadingSpace = /^\s/.test(value);
  const hasTrailingSpace = /\s$/.test(value);
  const hasTrailingNewline = /[\r\n]$/.test(value);
  const hasQuoteChars = /['"`]/.test(value);
  const isWrappedInQuotes =
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"));

  const ph = PLACEHOLDERS[name];
  let matchesPlaceholder = false;
  if (ph) {
    matchesPlaceholder =
      ph.kind === 'exact' ? value === ph.value : value.includes(ph.value);
  }

  // Determine the single most important reason this var is unusable, in
  // priority order. `null` reason == OK.
  let reason = null;
  if (!defined) reason = 'undefined (not in import.meta.env)';
  else if (value === '') reason = 'empty string';
  else if (matchesPlaceholder) reason = 'still set to placeholder value';
  else if (isWrappedInQuotes) reason = 'value is wrapped in quote characters';
  else if (hasQuoteChars) reason = 'contains quote character(s)';
  else if (hasLeadingSpace) reason = 'has leading whitespace';
  else if (hasTrailingSpace) reason = 'has trailing whitespace';
  else if (hasTrailingNewline) reason = 'has trailing newline';

  return {
    name,
    defined,
    length: value.length,
    preview: maskPreview(defined ? value : undefined),
    hasLeadingSpace,
    hasTrailingSpace,
    hasTrailingNewline,
    hasQuoteChars,
    isWrappedInQuotes,
    matchesPlaceholder,
    reason, // null when the var looks usable
    status: reason ? 'MISSING' : 'OK',
  };
}

// Replicates the app's OWN isMissing() logic (from useVapi.js) for the two Vapi
// vars, plus the Share/CounselorMatch usability check for the API base. This is
// what the *app* decides — reported alongside analyzeEnvVar's richer reasons so
// you can see whether the app itself considers the var missing.
export function appConsidersMissing(name) {
  const v = import.meta.env[name];
  if (name === 'VITE_API_BASE_URL') {
    // Share.jsx / CounselorMatch.jsx: usable when truthy AND not the webhook
    // placeholder. "Missing" is the negation.
    const usable = !!v && !String(v).includes('your_webhook_id_here');
    return { missing: !usable, condition: usable ? null : !v ? 'falsy value' : 'includes "your_webhook_id_here"' };
  }
  // useVapi.js isMissing(): falsy OR one of the two placeholder strings.
  if (!v) return { missing: true, condition: 'falsy value' };
  if (v === 'your_public_key_here') return { missing: true, condition: 'equals "your_public_key_here"' };
  if (v === 'your_assistant_id_here') return { missing: true, condition: 'equals "your_assistant_id_here"' };
  return { missing: false, condition: null };
}

// The full boot-time dump: per-var analysis, the raw key list (to catch typos),
// the Vite MODE, and a one-line SUMMARY. Safe to call more than once.
export function runEnvDiagnostics(context = 'boot') {
  if (!DEBUG) return null;

  ddlog(`===== ENV DIAGNOSTICS (${context}) =====`);
  ddlog('MODE:', import.meta.env.MODE, '| DEV:', import.meta.env.DEV, '| PROD:', import.meta.env.PROD);
  ddlog('import.meta.env keys (spot typos here):', Object.keys(import.meta.env));

  const names = ['VITE_VAPI_PUBLIC_KEY', 'VITE_VAPI_ASSISTANT_ID', 'VITE_API_BASE_URL'];
  const results = {};
  for (const name of names) {
    const a = analyzeEnvVar(name);
    const app = appConsidersMissing(name);
    results[name] = a;
    ddlog(`${name}:`, {
      defined: a.defined,
      length: a.length,
      preview: a.preview,
      leadingSpace: a.hasLeadingSpace,
      trailingSpace: a.hasTrailingSpace,
      trailingNewline: a.hasTrailingNewline,
      quoteChars: a.hasQuoteChars,
      wrappedInQuotes: a.isWrappedInQuotes,
      matchesPlaceholder: a.matchesPlaceholder,
      status: a.status,
      reason: a.reason ?? '(usable)',
      appIsMissing: app.missing,
      appMissingCondition: app.condition ?? '(none)',
    });
  }

  // One-line human summary, e.g.
  // [2am-debug] SUMMARY: publicKey=OK, assistantId=OK, apiBase=MISSING (reason: contains quotes)
  const fmt = (label, name) => {
    const a = results[name];
    return a.status === 'OK' ? `${label}=OK` : `${label}=MISSING (reason: ${a.reason})`;
  };
  ddlog(
    'SUMMARY:',
    [
      fmt('publicKey', 'VITE_VAPI_PUBLIC_KEY'),
      fmt('assistantId', 'VITE_VAPI_ASSISTANT_ID'),
      fmt('apiBase', 'VITE_API_BASE_URL'),
    ].join(', ')
  );
  ddlog('=======================================');

  return results;
}
