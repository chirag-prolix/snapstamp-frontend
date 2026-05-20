import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { getMerchantRedemptions, approveRedemption } from '../../api/merchant';
import { AppShell } from '../../components/layout/AppShell';
import { Card, CardBody } from '../../components/ui/Card';
import { Badge, statusColor } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { PageSpinner } from '../../components/ui/Spinner';

export default function MerchantRedemptionsPage() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['merchantRedemptions'],
    queryFn: getMerchantRedemptions,
  });

  const { mutate: approve, isPending, variables } = useMutation({
    mutationFn: approveRedemption,
    onSuccess: () => {
      toast.success('Redemption approved!');
      queryClient.invalidateQueries({ queryKey: ['merchantRedemptions'] });
    },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? 'Failed to approve'),
  });

  return (
    <AppShell title="Redemptions">
      {isLoading ? <PageSpinner /> : (
        (data?.length ?? 0) === 0
          ? <p className="text-gray-400 text-sm">No redemptions yet.</p>
          : (
            <div className="space-y-3">
              {data!.map(r => (
                <Card key={r.id}>
                  <CardBody>
                    <div className="flex items-center gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900">{r.reward.title}</p>
                        {r.customer && (
                          <p className="text-sm text-gray-500">
                            {r.customer.firstName} {r.customer.lastName} · {r.customer.phone}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-1">
                          <code className="text-xs bg-gray-100 px-2 py-0.5 rounded font-mono">{r.redeemCode}</code>
                          <span className="text-xs text-gray-400">
                            {new Date(r.redeemedAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <Badge color={statusColor(r.status)}>{r.status}</Badge>
                        {r.status === 'PENDING' && (
                          <Button
                            size="sm"
                            isLoading={isPending && variables === r.redeemCode}
                            onClick={() => approve(r.redeemCode)}
                          >
                            Approve
                          </Button>
                        )}
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
