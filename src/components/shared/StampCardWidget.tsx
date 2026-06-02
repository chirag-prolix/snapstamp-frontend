import { Link } from 'react-router-dom';
import { Card, CardBody } from '../ui/Card';
import { Badge, statusColor } from '../ui/Badge';
import { ProgressBar } from '../ui/ProgressBar';
import type { StampCard } from '../../types/api';

interface StampCardWidgetProps {
  card: StampCard;
  showLink?: boolean;
}

export function StampCardWidget({ card, showLink = true }: StampCardWidgetProps) {
  const pct = Math.round((card.currentStampCount / card.totalSlotsRequired) * 100);

  const content = (
    <Card className="transition-all duration-200 hover:border-(--accent)/40">
      <CardBody>
        <div className="flex items-start justify-between mb-3">
          <div className="min-w-0">
            <p className="font-semibold text-sm truncate" style={{ color: 'var(--text-primary)' }}>
              {card.displayName ?? 'Stamp Card'}
            </p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{card.cardNumber}</p>
          </div>
          <Badge color={statusColor(card.status)}>{card.status}</Badge>
        </div>

        <div className="flex items-end gap-1.5 mb-2">
          <span className="text-3xl font-bold leading-none" style={{ color: 'var(--accent)' }}>
            {card.currentStampCount}
          </span>
          <span className="text-sm mb-0.5" style={{ color: 'var(--text-muted)' }}>
            / {card.totalSlotsRequired} stamps
          </span>
        </div>

        <ProgressBar value={card.currentStampCount} max={card.totalSlotsRequired} />

        <div className="flex items-center justify-between mt-2.5">
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Expires {new Date(card.expiresAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
          </p>
          <span className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>{pct}%</span>
        </div>
      </CardBody>
    </Card>
  );

  if (showLink) return <Link to={`/customer/stamp-cards/${card.id}`}>{content}</Link>;
  return content;
}
