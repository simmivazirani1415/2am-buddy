import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Moon, LifeBuoy } from 'lucide-react';

// The voice-call screens have their own minimal chrome; everything else gets
// the persistent header with brand + Get Help Now.
const HIDDEN_ROUTES = ['/', '/voice', '/thinking', '/risk-alert'];

export default function AppHeader() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  if (HIDDEN_ROUTES.includes(pathname)) return null;

  return (
    <header
      role="banner"
      className="sticky top-0 z-40 bg-navy/95 backdrop-blur-md border-b border-purple/20"
    >
      <div className="max-w-md mx-auto flex items-center justify-between gap-2 px-4 py-2.5">
        <Link
          to="/home"
          aria-label="2AM Buddy — go to home"
          className="flex items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-light rounded-lg"
        >
          <span
            aria-hidden="true"
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-purple to-purple-dark shadow-glow text-white"
          >
            <Moon className="h-5 w-5" />
          </span>
          <span className="leading-tight">
            <span className="block font-bold text-sm">2AM Buddy</span>
            <span className="block text-[10px] text-textgray/80">
              Always here, day or night
            </span>
          </span>
        </Link>

        <button
          type="button"
          onClick={() => navigate('/crisis')}
          aria-label="Get help now — one tap for crisis support"
          className={[
            'group flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full',
            'bg-rose text-white shadow-lg shadow-rose/40',
            'hover:bg-rose-dark active:scale-95 transition-all',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-white',
          ].join(' ')}
        >
          <span
            aria-hidden="true"
            className="flex h-6 w-6 items-center justify-center rounded-full bg-white/15"
          >
            <LifeBuoy className="h-3.5 w-3.5" />
          </span>
          <span className="leading-tight text-left">
            <span className="block text-[11px] font-bold">Get Help Now</span>
            <span className="block text-[9px] text-white/80">
              One tap for crisis support
            </span>
          </span>
        </button>
      </div>
    </header>
  );
}
