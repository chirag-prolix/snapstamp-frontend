import { Card, CardBody } from '../ui/Card';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  icon?: LucideIcon;
  trend?: number;
}

export function StatCard({ label, value, sub, icon: Icon, trend }: StatCardProps) {
  return (
    <Card
      className="relative overflow-hidden"
      style={{ borderLeft: '3px solid var(--accent)' }}
    >
      <CardBody>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p
              className="text-xs font-semibold uppercase tracking-widest truncate"
              style={{ color: 'var(--text-secondary)' }}
            >
              {label}
            </p>
            <p className="text-3xl font-bold mt-1 leading-none" style={{ color: 'var(--text-primary)' }}>
              {value}
            </p>
            {sub && (
              <p className="text-xs mt-1.5" style={{ color: 'var(--text-muted)' }}>{sub}</p>
            )}
          </div>
          <div className="flex flex-col items-end gap-2 shrink-0">
            {Icon && (
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center"
                style={{ background: 'var(--accent-dim)' }}
              >
                <Icon size={18} style={{ color: 'var(--accent)' }} strokeWidth={1.75} />
              </div>
            )}
            {trend !== undefined && (
              <span
                className="text-xs font-semibold px-1.5 py-0.5 rounded"
                style={trend >= 0
                  ? { color: 'var(--success)', background: 'rgba(16,185,129,0.12)' }
                  : { color: 'var(--danger)', background: 'var(--danger-dim)' }
                }
              >
                {trend >= 0 ? '+' : ''}{trend}%
              </span>
            )}
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
