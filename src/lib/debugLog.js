// Tiny in-memory ring buffer + pub/sub so the DebugPanel can render live events.
// Also mirrors every entry to the browser console with a [2AM] prefix so the
// user can copy/paste from devtools.

const MAX = 200;
const buffer = [];
const subs = new Set();

function notify() {
  subs.forEach((fn) => {
    try {
      fn(buffer);
    } catch (e) {
      // ignore subscriber errors
    }
  });
}

export function dlog(scope, message, data) {
  const entry = {
    t: new Date().toISOString(),
    scope,
    message,
    data: safeData(data),
  };
  buffer.push(entry);
  if (buffer.length > MAX) buffer.shift();
  // Mirror to console
  // eslint-disable-next-line no-console
  console.log(`[2AM][${scope}]`, message, data ?? '');
  notify();
}

export function getLog() {
  return buffer.slice();
}

export function subscribe(fn) {
  subs.add(fn);
  fn(buffer);
  return () => subs.delete(fn);
}

export function clearLog() {
  buffer.length = 0;
  notify();
}

function safeData(d) {
  if (d === undefined) return undefined;
  try {
    // shallow clone; strip functions
    return JSON.parse(
      JSON.stringify(d, (_k, v) => (typeof v === 'function' ? '[fn]' : v))
    );
  } catch {
    try {
      return String(d);
    } catch {
      return '[unserializable]';
    }
  }
}
