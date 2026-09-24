import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, MoreVertical, Mic, Send } from 'lucide-react';
import Button from '../components/Button';
import useVapi from '../hooks/useVapi';
import useConversation from '../hooks/useConversation';

const QUICK_REPLIES = ["Yes, let's talk", 'Not right now'];

export default function ActiveConversation() {
  const navigate = useNavigate();
  const { history, sendUserMessage, sendAssistantMessage, lastAssistantMessage } =
    useConversation();
  const { sendMessage } = useVapi();
  const [input, setInput] = useState('');
  const scrollRef = useRef(null);

  // Seed an opening message in demo mode
  useEffect(() => {
    if (history.length === 0) {
      sendAssistantMessage(
        "I'm here with you. What's on your mind right now?"
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: 'smooth',
    });
  }, [history.length]);

  const handleSend = (text) => {
    const trimmed = (text ?? input).trim();
    if (!trimmed) return;
    sendUserMessage(trimmed);
    sendMessage(trimmed);
    setInput('');
  };

  return (
    <main className="min-h-screen flex flex-col pb-28 animate-fade-in max-w-md mx-auto">
      <header className="flex items-center justify-between px-6 pt-6 pb-3 border-b border-purple/20">
        <button
          type="button"
          onClick={() => navigate('/home')}
          className="flex items-center gap-1 text-white hover:text-purple-light transition-colors"
          aria-label="Back"
        >
          <ChevronLeft className="h-5 w-5" aria-hidden="true" />
          <span className="font-semibold">2AM Buddy</span>
        </button>
        <button
          type="button"
          aria-label="More options"
          className="text-white hover:text-purple-light transition-colors"
        >
          <MoreVertical className="h-5 w-5" aria-hidden="true" />
        </button>
      </header>

      <section
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-6 space-y-3"
        aria-label="Conversation history"
      >
        {history.map((msg, idx) => (
          <div
            key={`${idx}-${msg.timestamp}`}
            className={[
              'flex animate-slide-up',
              msg.role === 'user' ? 'justify-end' : 'justify-start',
            ].join(' ')}
          >
            <div
              className={[
                'max-w-[80%] px-4 py-3 rounded-2xl leading-relaxed',
                msg.role === 'user'
                  ? 'bg-purple text-white rounded-br-sm'
                  : 'bg-navy-light border border-purple/30 text-white rounded-bl-sm',
              ].join(' ')}
            >
              {msg.content}
            </div>
          </div>
        ))}
      </section>

      {lastAssistantMessage && history.length <= 2 && (
        <div className="px-4 pb-2 flex flex-wrap gap-2">
          {QUICK_REPLIES.map((q) => (
            <Button
              key={q}
              variant="secondary"
              size="sm"
              onClick={() => handleSend(q)}
            >
              {q}
            </Button>
          ))}
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="px-4 pt-3 pb-4 flex items-center gap-2 border-t border-purple/20 bg-navy"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Share what's on your mind..."
          aria-label="Message"
          className="flex-1 bg-navy-light border border-purple/30 rounded-full px-4 py-3 text-white placeholder:text-textgray/60 focus:outline-none focus:border-purple-light"
        />
        <button
          type="button"
          aria-label="Voice input"
          className="h-11 w-11 rounded-full bg-navy-light border border-purple/30 flex items-center justify-center hover:bg-purple/20 transition-colors"
        >
          <Mic className="h-4 w-4" aria-hidden="true" />
        </button>
        <button
          type="submit"
          aria-label="Send message"
          disabled={!input.trim()}
          className="h-11 w-11 rounded-full bg-purple flex items-center justify-center text-white hover:bg-purple-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Send className="h-4 w-4" aria-hidden="true" />
        </button>
      </form>
    </main>
  );
}
