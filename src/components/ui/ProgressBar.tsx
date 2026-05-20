interface ProgressBarProps {
  value: number;
  max?: number;
  className?: string;
  color?: 'indigo' | 'green' | 'yellow';
}

const colorClasses = {
  indigo: 'bg-indigo-600',
  green:  'bg-green-500',
  yellow: 'bg-yellow-500',
};

export function ProgressBar({ value, max = 100, className = '', color = 'indigo' }: ProgressBarProps) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  return (
    <div className={`w-full bg-gray-200 rounded-full h-2 ${className}`}>
      <div
        className={`h-2 rounded-full transition-all ${colorClasses[color]}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
