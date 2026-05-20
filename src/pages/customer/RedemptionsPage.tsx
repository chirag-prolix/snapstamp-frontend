import { useQuery } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { getCustomerRedemptions } from '../../api/customer';
import { AppShell } from '../../components/layout/AppShell';
import { Card, CardBody } from '../../components/ui/Card';
import { Badge, statusColor } from '../../components/ui/Badge';
import { PageSpinner } from '../../components/ui/Spinner';
import { Button } from '../../components/ui/Button';

export default function RedemptionsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['customerRedemptions'],
    queryFn: getCustomerRedemptions,
  });

  const copy = (text: string) => {
    navigator.clipboard.writeText(text).then(() => toast.success('Code copied!'));
  };

  return (
    <AppShell title="My Redemptions">
      {isLoading ? <PageSpinner /> : (
        (data?.length ?? 0) === 0
          ? <p className="text-gray-400 text-sm">No redemptions yet.</p>
          : (
            <div className="space-y-3">
              {data!.map(r => (
                <Card key={r.id}>
                  <CardBody>
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900 truncate">{r.reward.title}</p>
                        <p className="text-sm text-gray-500">{r.reward.rewardType.replace('_', ' ')}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          Redeemed {new Date(r.redeemedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-2 shrink-0">
                        <Badge color={statusColor(r.status)}>{r.status}</Badge>
                        <div className="flex items-center gap-1">
                          <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono">{r.redeemCode}</code>
                          <Button variant="ghost" size="sm" onClick={() => copy(r.redeemCode)}>📋</Button>
                        </div>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              ))}
            </div>
          )
      )}
    </AppShell>
  );
}
