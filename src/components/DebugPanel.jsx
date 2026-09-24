import { useEffect, useState } from 'react';
import { Bug } from 'lucide-react';
import { subscribe, clearLog } from '../lib/debugLog';

export default function DebugPanel() {
  const [open, setOpen] = useState(true);
  const [entries, setEntries] = useState([]);

  useEffect(() => subscribe(setEntries), []);

  const last = entries.slice(-50).reverse();

  return (
    <div className="fixed bottom-24 right-3 z-50 max-w-[92vw] sm:max-w-md">
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-purple text-white text-xs shadow-lg"
        >
          <Bug className="h-3.5 w-3.5" aria-hidden="true" />
          Debug ({entries.length})
        </button>
      )}
      {open && (
        <div className="rounded-xl border border-purple/50 bg-black/85 backdrop-blur text-white shadow-2xl overflow-hidden">
          <div className="flex items-center justify-between px-3 py-2 bg-purple/30 text-xs">
            <span className="font-semibold flex items-center gap-1.5">
              <Bug className="h-3.5 w-3.5" aria-hidden="true" /> Debug ({entries.length})
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={clearLog}
                className="px-2 py-0.5 rounded bg-white/10 hover:bg-white/20"
              >
                clear
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="px-2 py-0.5 rounded bg-white/10 hover:bg-white/20"
              >
                hide
              </button>
            </div>
          </div>
          <ol className="max-h-64 overflow-y-auto text-[11px] leading-tight font-mono">
            {last.length === 0 && (
              <li className="px-3 py-3 text-textgray">No events yet.</li>
            )}
            {last.map((e, i) => (
              <li
                key={`${e.t}-${i}`}
                className="px-3 py-1.5 border-b border-white/5"
              >
                <span className="text-purple-light">
                  {e.t.slice(11, 19)}
                </span>{' '}
                <span className="text-success">[{e.scope}]</span>{' '}
                <span>{e.message}</span>
                {e.data !== undefined && (
                  <pre className="mt-0.5 text-textgray whitespace-pre-wrap break-words">
                    {typeof e.data === 'string'
                      ? e.data
                      : JSON.stringify(e.data, null, 0)}
                  </pre>
                )}
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}
