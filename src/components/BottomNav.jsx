import { NavLink, useLocation } from 'react-router-dom';
import { Home, History, HeartHandshake, User } from 'lucide-react';

const TABS = [
  { to: '/home', label: 'Home', Icon: Home },
  { to: '/history', label: 'History', Icon: History },
  { to: '/resources', label: 'Resources', Icon: HeartHandshake },
  { to: '/profile', label: 'Profile', Icon: User },
];

const HIDDEN_ROUTES = ['/', '/voice', '/risk-alert'];

export default function BottomNav() {
  const { pathname } = useLocation();
  if (HIDDEN_ROUTES.includes(pathname)) return null;

  return (
    <nav
      aria-label="Primary"
      className="fixed bottom-0 left-0 right-0 z-40 bg-purple/90 backdrop-blur-md border-t border-purple-light/30"
    >
      <ul className="mx-auto flex max-w-md items-center justify-around px-3 py-2">
        {TABS.map(({ to, label, Icon }) => (
          <li key={to} className="flex-1">
            <NavLink
              to={to}
              className={({ isActive }) =>
                [
                  'flex flex-col items-center gap-1 py-2 rounded-xl transition-colors duration-200',
                  isActive
                    ? 'bg-purple-light/30 text-white'
                    : 'text-white/80 hover:text-white hover:bg-white/10',
                ].join(' ')
              }
              aria-label={label}
            >
              <Icon className="h-5 w-5" aria-hidden="true" />
              <span className="text-xs font-medium">{label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
