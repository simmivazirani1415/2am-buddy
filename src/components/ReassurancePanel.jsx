import { Lock, HeartHandshake, Stethoscope, Siren } from 'lucide-react';
import Card from './Card';

const ITEMS = [
  { Icon: Lock,           label: 'Confidential & Private' },
  { Icon: HeartHandshake, label: 'Non-judgmental Support' },
  { Icon: Stethoscope,    label: 'Professional Help' },
  { Icon: Siren,          label: 'Crisis Support 24/7' },
];

export default function ReassurancePanel({ className = '' }) {
  return (
    <Card
      hover={false}
      className={[
        'bg-gradient-to-br from-purple/20 to-navy-light/80 border-purple/40',
        className,
      ].join(' ')}
    >
      <div className="text-center">
        <p className="font-semibold">We're here for you, 24/7</p>
        <p className="text-xs text-textgray mt-1">
          However the night feels, you don't have to face it alone.
        </p>
      </div>
      <ul className="mt-4 grid grid-cols-2 gap-2">
        {ITEMS.map(({ Icon, label }) => (
          <li
            key={label}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-navy/60 border border-purple/30"
          >
            <Icon className="h-5 w-5 text-purple-light shrink-0" aria-hidden="true" />
            <span className="text-xs leading-tight">{label}</span>
          </li>
        ))}
      </ul>
    </Card>
  );
}
