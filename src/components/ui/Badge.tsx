import type { ReactNode } from 'react';

type BadgeColor = 'green' | 'yellow' | 'red' | 'gray' | 'blue' | 'purple' | 'indigo';

interface BadgeProps {
  color?: BadgeColor;
  children: ReactNode;
  className?: string;
}

const colorStyles: Record<BadgeColor, React.CSSProperties> = {
  green:  { background: 'rgba(16,185,129,0.15)', color: '#34D399' },
  yellow: { background: 'rgba(245,158,11,0.15)', color: '#F59E0B' },
  red:    { background: 'rgba(239,68,68,0.15)',  color: '#F87171' },
  gray:   { background: 'rgba(156,163,175,0.15)',color: '#9CA3AF' },
  blue:   { background: 'rgba(59,130,246,0.15)', color: '#60A5FA' },
  purple: { background: 'rgba(139,92,246,0.15)', color: '#A78BFA' },
  indigo: { background: 'rgba(99,102,241,0.15)', color: '#818CF8' },
};

export function Badge({ color = 'gray', children, className = '' }: BadgeProps) {
  return (
    <span
      style={colorStyles[color]}
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${className}`}
    >
      {children}
    </span>
  );
}

export function statusColor(status: string): BadgeColor {
  switch (status) {
    case 'ACTIVE':    return 'green';
    case 'COMPLETED': return 'blue';
    case 'PENDING':
    case 'INITIATED': return 'yellow';
    case 'APPROVED':
    case 'VERIFIED':  return 'green';
    case 'REJECTED':
    case 'EXPIRED':
    case 'FAILED':
    case 'CANCELLED': return 'red';
    case 'BRONZE':    return 'gray';
    case 'SILVER':    return 'gray';
    case 'GOLD':      return 'yellow';
    case 'PLATINUM':  return 'purple';
    default:          return 'gray';
  }
}
