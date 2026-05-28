import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { getStampCardDetail } from '../../api/customer';
import { AppShell } from '../../components/layout/AppShell';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import { Badge, statusColor } from '../../components/ui/Badge';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { PageSpinner } from '../../components/ui/Spinner';

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

export default function StampCardDetailPage() {
  const { id } = useParams<{ id: string }>();

  const { data, isLoading } = useQuery({
    queryKey: ['stampCard', id],
    queryFn: () => getStampCardDetail(id!),
    enabled: !!id,
  });

  if (isLoading) return <AppShell title="Stamp Card"><PageSpinner /></AppShell>;
  if (!data) return <AppShell title="Stamp Card"><p className="text-gray-400">Not found.</p></AppShell>;

  const { stampCard, stamps } = data;
  const total = stampCard.totalSlotsRequired;
  const filled = stampCard.currentStampCount;

  return (
    <AppShell title={stampCard.displayName ?? 'Stamp Card'}>
      <div className="max-w-2xl space-y-6">
        <Link to="/customer/stamp-cards" className="text-sm text-indigo-600 hover:underline">← Back to cards</Link>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-gray-900">{stampCard.displayName ?? 'Stamp Card'}</p>
                <p className="text-xs text-gray-400">{stampCard.cardNumber}</p>
              </div>
              <Badge color={statusColor(stampCard.status)}>{stampCard.status}</Badge>
            </div>
          </CardHeader>
          <CardBody>
            <div className="flex items-baseline gap-2 mb-3">
              <span className="text-4xl font-bold text-indigo-600">{filled}</span>
              <span className="text-gray-400">/ {total} stamps</span>
            </div>
            <ProgressBar value={filled} max={total} className="mb-4" />

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-400">Expires</p>
                <p className="font-medium">{formatDate(stampCard.expiresAt)}</p>
              </div>
              {stampCard.completedAt && (
                <div>
                  <p className="text-gray-400">Completed</p>
                  <p className="font-medium">{formatDate(stampCard.completedAt)}</p>
                </div>
              )}
              {stampCard.bonusStamps > 0 && (
                <div>
                  <p className="text-gray-400">Bonus stamps</p>
                  <p className="font-medium">{stampCard.bonusStamps}</p>
                </div>
              )}
            </div>
          </CardBody>
        </Card>

        {/* Stamp grid */}
        <Card>
          <CardHeader><p className="font-medium text-gray-700">Stamps</p></CardHeader>
          <CardBody>
            <div className="grid grid-cols-5 gap-3">
              {Array.from({ length: total }, (_, i) => {
                const stamp = stamps[i];
                return (
                  <div
                    key={i}
                    title={stamp ? `Stamp ${stamp.stampSequence} — ${new Date(stamp.collectedAt).toLocaleDateString()}` : 'Empty'}
                    className={`aspect-square rounded-full border-2 flex items-center justify-center text-lg
                      ${stamp
                        ? 'bg-indigo-600 border-indigo-600 text-white'
                        : 'border-gray-200 bg-gray-50'}`}
                  >
                    {stamp ? '⭐' : <span className="text-gray-300 text-sm">{i + 1}</span>}
                  </div>
                );
              })}
            </div>
          </CardBody>
        </Card>
      </div>
    </AppShell>
  );
}
