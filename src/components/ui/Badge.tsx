import type { ReactNode } from 'react';

type BadgeColor = 'green' | 'yellow' | 'red' | 'gray' | 'blue' | 'purple' | 'indigo';

interface BadgeProps {
  color?: BadgeColor;
  children: ReactNode;
  className?: string;
}

const colorClasses: Record<BadgeColor, string> = {
  green:  'bg-green-100 text-green-800',
  yellow: 'bg-yellow-100 text-yellow-800',
  red:    'bg-red-100 text-red-800',
  gray:   'bg-gray-100 text-gray-700',
  blue:   'bg-blue-100 text-blue-800',
  purple: 'bg-purple-100 text-purple-800',
  indigo: 'bg-indigo-100 text-indigo-800',
};

export function Badge({ color = 'gray', children, className = '' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium
      ${colorClasses[color]} ${className}`}>
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
