interface ProgressBarProps {
  value: number;
  max?: number;
  className?: string;
  color?: 'accent' | 'green' | 'yellow';
}

const colorStyles: Record<string, React.CSSProperties> = {
  accent: { background: 'var(--accent)' },
  green:  { background: 'var(--success)' },
  yellow: { background: '#F59E0B' },
};

export function ProgressBar({ value, max = 100, className = '', color = 'accent' }: ProgressBarProps) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  return (
    <div
      className={`w-full rounded-full h-1.5 ${className}`}
      style={{ background: 'var(--bg-elevated)' }}
    >
      <div
        className="h-1.5 rounded-full transition-all duration-500"
        style={{ width: `${pct}%`, ...colorStyles[color] }}
      />
    </div>
  );
}
