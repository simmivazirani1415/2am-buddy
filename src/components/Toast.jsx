import { CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { useApp } from '../context/AppContext';

const TYPE_STYLES = {
  success: 'bg-success text-navy',
  error: 'bg-rose text-white',
  info: 'bg-info text-navy',
};

const TYPE_ICONS = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
};

export default function Toast() {
  const { toastMessage, toastType } = useApp();
  if (!toastMessage) return null;

  const Icon = TYPE_ICONS[toastType] ?? TYPE_ICONS.info;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed top-4 left-1/2 z-50 -translate-x-1/2 animate-slide-down"
    >
      <div
        className={[
          'flex items-center gap-3 px-5 py-3 rounded-xl shadow-2xl font-medium',
          TYPE_STYLES[toastType] ?? TYPE_STYLES.info,
        ].join(' ')}
      >
        <Icon className="h-5 w-5" aria-hidden="true" />
        <span>{toastMessage}</span>
      </div>
    </div>
  );
}
