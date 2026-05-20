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
  const content = (
    <Card className="hover:shadow-md transition-shadow">
      <CardBody>
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="font-medium text-gray-900 text-sm">{card.displayName ?? 'Stamp Card'}</p>
            <p className="text-xs text-gray-400">{card.cardNumber}</p>
          </div>
          <Badge color={statusColor(card.status)}>{card.status}</Badge>
        </div>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-2xl font-bold text-indigo-600">{card.currentStampCount}</span>
          <span className="text-gray-400 text-sm">/ {card.totalSlotsRequired} stamps</span>
        </div>
        <ProgressBar value={card.currentStampCount} max={card.totalSlotsRequired} />
        <p className="text-xs text-gray-400 mt-2">
          Expires {new Date(card.expiresAt).toLocaleDateString()}
        </p>
      </CardBody>
    </Card>
  );

  if (showLink) return <Link to={`/customer/stamp-cards/${card.id}`}>{content}</Link>;
  return content;
}
