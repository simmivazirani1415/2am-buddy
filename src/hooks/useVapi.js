import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as VapiNS from '@vapi-ai/web';

// CJS interop: depending on the bundler, the class can live on .default,
// .default.default, or be the module itself. Resolve once.
const Vapi =
  (typeof VapiNS === 'function' && VapiNS) ||
  VapiNS.default?.default ||
  VapiNS.default ||
  VapiNS.Vapi ||
  VapiNS;
import { useApp } from '../context/AppContext';
import { dlog } from '../lib/debugLog';

const PUBLIC_KEY = import.meta.env.VITE_VAPI_PUBLIC_KEY;
const DEFAULT_ASSISTANT_ID = import.meta.env.VITE_VAPI_ASSISTANT_ID;

// Module-level singleton so all hook callers share the same client
// and we don't bind duplicate listeners.
let sharedClient = null;
let listenersBound = false;

function maskId(s) {
  if (!s || typeof s !== 'string') return '(none)';
  if (s.length <= 4) return `***${s}`;
  return `***${s.slice(-4)}`;
}

function isMissing(v) {
  if (!v) return true;
  if (v === 'your_public_key_here') return true;
  if (v === 'your_assistant_id_here') return true;
  return false;
}

function getClient() {
  if (sharedClient) return sharedClient;
  if (isMissing(PUBLIC_KEY)) {
    console.warn('[VAPI] VITE_VAPI_PUBLIC_KEY missing — cannot construct client');
    dlog('vapi', 'VITE_VAPI_PUBLIC_KEY missing — demo mode');
    return null;
  }
  try {
    console.log('[VAPI] Constructing with publicKey:', maskId(PUBLIC_KEY));
    dlog('vapi', 'Constructing Vapi client', {
      publicKey: maskId(PUBLIC_KEY),
    });
    sharedClient = new Vapi(PUBLIC_KEY);
    // EXACT line requested:
    console.log('VAPI init →', typeof Vapi, Vapi?.name);
    dlog('vapi', 'VAPI init', {
      type: typeof Vapi,
      name: Vapi?.name,
      isFunction: typeof Vapi === 'function',
    });
    dlog('vapi', 'Vapi client constructed');
  } catch (e) {
    console.error('[VAPI] constructor threw:', e);
    dlog('vapi', 'Vapi constructor threw', { error: e?.message });
    sharedClient = null;
  }
  return sharedClient;
}

async function ensureMicPermission() {
  if (!navigator?.mediaDevices?.getUserMedia) {
    dlog('mic', 'navigator.mediaDevices.getUserMedia unavailable');
    return false;
  }
  try {
    if (navigator.permissions?.query) {
      const status = await navigator.permissions.query({ name: 'microphone' });
      dlog('mic', 'permissions.query', { state: status.state });
      if (status.state === 'granted') return true;
    }
    dlog('mic', 'Requesting getUserMedia({audio:true})');
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    stream.getTracks().forEach((t) => t.stop());
    dlog('mic', 'getUserMedia granted');
    return true;
  } catch (e) {
    dlog('mic', 'getUserMedia denied/failed', {
      name: e?.name,
      message: e?.message,
    });
    return false;
  }
}

export default function useVapi() {
  const navigate = useNavigate();
  const {
    setCallStatus: setGlobalCallStatus,
    addToConversation,
    setRiskDetected,
    showToast,
  } = useApp();

  const [callStatus, setCallStatus] = useState('idle');
  const [error, setError] = useState(null);
  const client = getClient();
  const isReady = !!client;

  useEffect(() => {
    if (!client) {
      dlog('vapi', 'Hook mounted without client (demo/missing-env mode)');
      return;
    }
    if (listenersBound) {
      dlog('vapi', 'Listeners already bound — skipping');
      return;
    }
    listenersBound = true;
    dlog('vapi', 'Binding event listeners');

    const onStart = (payload) => {
      console.log('[VAPI] event: call-start', payload);
      dlog('vapi:event', 'call-start', payload);
      setCallStatus('connected');
      setGlobalCallStatus('connected');
      navigate('/voice');
    };
    const onEnd = (payload) => {
      console.log('[VAPI] event: call-end', payload);
      dlog('vapi:event', 'call-end', payload);
      setCallStatus('idle');
      setGlobalCallStatus('idle');
      navigate('/home');
    };
    const onMessage = (msg) => {
      console.log('[VAPI] event: message', msg);
      dlog('vapi:event', 'message', {
        type: msg?.type,
        role: msg?.role,
        transcriptType: msg?.transcriptType,
      });
      try {
        if (msg?.type === 'tool-calls' || msg?.type === 'tool_call') {
          handleToolCall(msg);
          return;
        }
        if (msg?.type === 'transcript' && msg?.transcriptType === 'final') {
          addToConversation(msg.role ?? 'user', msg.transcript ?? '');
        }
      } catch (e) {
        dlog('vapi', 'onMessage handler threw', { error: e?.message });
      }
    };
    const onError = (err) => {
      console.error('[VAPI] event: error', err);
      dlog('vapi:event', 'error', {
        message: err?.message,
        name: err?.name,
        type: err?.type,
        stage: err?.stage,
        raw: typeof err === 'string' ? err : undefined,
      });
      setError(err?.message ?? 'Unknown VAPI error');
      showToast('Connection issue. Check debug panel.', 'error');
    };
    const onSpeechStart = (payload) => {
      console.log('[VAPI] event: speech-start', payload);
      dlog('vapi:event', 'speech-start (assistant speaking)', payload);
    };
    const onSpeechEnd = (payload) => {
      console.log('[VAPI] event: speech-end', payload);
      dlog('vapi:event', 'speech-end (assistant stopped)', payload);
    };
    const onVolume = (level) => {
      if (level > 0.5) {
        console.log('[VAPI] event: volume', level);
        dlog('vapi:event', 'volume (peak)', { level });
      }
    };

    const handleToolCall = (msg) => {
      const calls = msg.toolCalls ?? msg.tool_calls ?? [];
      dlog('vapi:tool', 'tool-call received', { count: calls.length });
      calls.forEach((call) => {
        const name = call?.function?.name ?? call?.name;
        dlog('vapi:tool', `dispatch ${name}`);
        if (name === 'escalateToCounselor') {
          setRiskDetected(true, 'high');
          navigate('/risk-alert');
        } else if (name === 'continueConversation') {
          const args = parseArgs(call);
          if (args?.content) addToConversation('assistant', args.content);
        } else if (name === 'endConversation') {
          client?.stop?.();
          navigate('/confirmation-sent');
        }
      });
    };

    client.on('call-start', onStart);
    client.on('call-end', onEnd);
    client.on('message', onMessage);
    client.on('error', onError);
    client.on('speech-start', onSpeechStart);
    client.on('speech-end', onSpeechEnd);
    client.on('volume-level', onVolume);
    dlog('vapi', 'Listeners bound: call-start, call-end, message, error, speech-start, speech-end, volume-level');

    return () => {
      // Listeners persist across unmounts — singleton lifetime.
    };
  }, [client, navigate, setGlobalCallStatus, addToConversation, setRiskDetected, showToast]);

  const startCall = useCallback(
    async (assistantId = DEFAULT_ASSISTANT_ID) => {
      setError(null);
      setCallStatus('connecting');
      setGlobalCallStatus('connecting');

      // Env-var guard with visible feedback
      if (isMissing(PUBLIC_KEY)) {
        console.error('[VAPI] Missing env var: VITE_VAPI_PUBLIC_KEY');
        dlog('vapi', 'Missing env var', { variable: 'VITE_VAPI_PUBLIC_KEY' });
        showToast('Missing env var: VITE_VAPI_PUBLIC_KEY', 'error');
        setCallStatus('idle');
        setGlobalCallStatus('idle');
        return;
      }
      if (isMissing(assistantId)) {
        console.error('[VAPI] Missing env var: VITE_VAPI_ASSISTANT_ID');
        dlog('vapi', 'Missing env var', { variable: 'VITE_VAPI_ASSISTANT_ID' });
        showToast('Missing env var: VITE_VAPI_ASSISTANT_ID', 'error');
        setCallStatus('idle');
        setGlobalCallStatus('idle');
        return;
      }

      console.log('[VAPI] env →', {
        publicKey: maskId(PUBLIC_KEY),
        assistantId: maskId(assistantId),
      });
      dlog('vapi', 'startCall invoked', {
        publicKey: maskId(PUBLIC_KEY),
        assistantId: maskId(assistantId),
      });

      if (!client) {
        dlog('vapi', 'Client unavailable after env check — aborting');
        showToast('VAPI client failed to initialize.', 'error');
        setCallStatus('idle');
        setGlobalCallStatus('idle');
        return;
      }

      const micOk = await ensureMicPermission();
      if (!micOk) {
        dlog('vapi', 'Aborting startCall — mic permission denied');
        setError('Microphone permission denied');
        setCallStatus('idle');
        setGlobalCallStatus('idle');
        showToast('Microphone permission denied.', 'error');
        return;
      }

      // EXACT line requested:
      console.log('Calling vapi.start with:', assistantId);
      dlog('vapi', 'Calling client.start()', { assistantId: maskId(assistantId) });
      try {
        const res = await client.start(assistantId);
        console.log('[VAPI] start resolved', res);
        dlog('vapi', 'client.start() resolved', {
          hasResult: !!res,
          resultType: typeof res,
        });
      } catch (err) {
        // EXACT line requested:
        console.error('vapi.start failed:', err);
        dlog('vapi', 'client.start() threw', {
          message: err?.message,
          name: err?.name,
        });
        setError(err?.message ?? 'Could not start call');
        setCallStatus('idle');
        setGlobalCallStatus('idle');
        showToast('Could not start call. Check debug panel.', 'error');
      }
    },
    [client, navigate, setGlobalCallStatus, showToast]
  );

  const stopCall = useCallback(() => {
    dlog('vapi', 'stopCall invoked');
    try {
      client?.stop?.();
    } catch (e) {
      dlog('vapi', 'client.stop() threw', { message: e?.message });
    } finally {
      setCallStatus('idle');
      setGlobalCallStatus('idle');
    }
  }, [client, setGlobalCallStatus]);

  const sendMessage = useCallback(
    (text) => {
      if (!text) return;
      dlog('vapi', 'sendMessage', { len: text.length });
      try {
        client?.send?.({
          type: 'add-message',
          message: { role: 'user', content: text },
        });
      } catch (e) {
        dlog('vapi', 'send() threw', { message: e?.message });
      }
    },
    [client]
  );

  return {
    vapiClient: client,
    callStatus,
    startCall,
    stopCall,
    sendMessage,
    error,
    isReady,
  };
}

function parseArgs(call) {
  try {
    const raw = call?.function?.arguments ?? call?.arguments;
    if (!raw) return null;
    if (typeof raw === 'string') return JSON.parse(raw);
    return raw;
  } catch {
    return null;
  }
}
