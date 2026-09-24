import { useApp } from '../context/AppContext';

const MOODS = [
  { id: 'good', emoji: '😊', label: 'Good' },
  { id: 'not-great', emoji: '😐', label: 'Not great' },
  { id: 'struggling', emoji: '😕', label: 'Struggling' },
];

export default function MoodSelector({ onMoodSelect }) {
  const { selectedMood, setMood } = useApp();

  const handleClick = (mood) => {
    setMood(mood.id);
    onMoodSelect?.(mood);
  };

  return (
    <div
      role="radiogroup"
      aria-label="How are you feeling?"
      className="grid grid-cols-3 gap-3 w-full"
    >
      {MOODS.map((mood) => {
        const isActive = selectedMood === mood.id;
        return (
          <button
            key={mood.id}
            type="button"
            role="radio"
            aria-checked={isActive}
            onClick={() => handleClick(mood)}
            className={[
              'flex flex-col items-center justify-center gap-2 px-3 py-4 rounded-2xl border-2 transition-all duration-200',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-light',
              isActive
                ? 'bg-purple border-purple-light shadow-glow scale-105'
                : 'bg-navy-light/60 border-purple/30 hover:border-purple hover:bg-purple/15',
            ].join(' ')}
          >
            <span className="text-3xl" aria-hidden="true">
              {mood.emoji}
            </span>
            <span className="text-sm font-medium text-white">{mood.label}</span>
          </button>
        );
      })}
    </div>
  );
}
