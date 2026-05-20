import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { getAdminMerchants, approveMerchant, rejectMerchant } from '../../api/admin';
import { AppShell } from '../../components/layout/AppShell';
import { Card, CardBody } from '../../components/ui/Card';
import { Badge, statusColor } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { PageSpinner } from '../../components/ui/Spinner';

type StatusFilter = 'ALL' | 'PENDING' | 'ACTIVE' | 'REJECTED';

export default function AdminMerchantsPage() {
  const [filter, setFilter] = useState<StatusFilter>('PENDING');
  const [rejectTarget, setRejectTarget] = useState<string | null>(null);
  const [reason, setReason] = useState('');
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['adminMerchants', filter],
    queryFn: () => getAdminMerchants(filter === 'ALL' ? undefined : filter),
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['adminMerchants'] });

  const { mutate: approve, isPending: approving, variables: approveId } = useMutation({
    mutationFn: approveMerchant,
    onSuccess: () => { toast.success('Merchant approved'); invalidate(); },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? 'Failed'),
  });

  const { mutate: reject, isPending: rejecting } = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => rejectMerchant(id, reason),
    onSuccess: () => {
      toast.success('Merchant rejected');
      setRejectTarget(null);
      setReason('');
      invalidate();
    },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? 'Failed'),
  });

  const tabs: StatusFilter[] = ['PENDING', 'ACTIVE', 'REJECTED', 'ALL'];

  return (
    <AppShell title="Merchants">
      {/* Filter tabs */}
      <div className="flex gap-2 mb-6">
        {tabs.map(t => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors cursor-pointer
              ${filter === t ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            {t}
          </button>
        ))}
      </div>

      {isLoading ? <PageSpinner /> : (
        (data?.length ?? 0) === 0
          ? <p className="text-gray-400 text-sm">No merchants with status {filter}.</p>
          : (
            <div className="space-y-3">
              {data!.map(m => (
                <Card key={m.id}>
                  <CardBody>
                    <div className="flex items-center gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900">{m.businessName}</p>
                        <p className="text-sm text-gray-500">{m.email} · {m.city}, {m.state}</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          Joined {new Date(m.createdAt).toLocaleDateString()} · {m.phone}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <Badge color={statusColor(m.onboardingStatus)}>{m.onboardingStatus}</Badge>
                        {m.onboardingStatus === 'PENDING' && (
                          <>
                            <Button
                              size="sm"
                              isLoading={approving && approveId === m.id}
                              onClick={() => approve(m.id)}
                            >
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="danger"
                              onClick={() => setRejectTarget(m.id)}
                            >
                              Reject
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </CardBody>
                </Card>
              ))}
            </div>
          )
      )}

      <Modal
        isOpen={!!rejectTarget}
        onClose={() => { setRejectTarget(null); setReason(''); }}
        title="Reject merchant"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">Provide a reason for rejection (sent to the merchant).</p>
          <Input label="Reason" value={reason} onChange={e => setReason(e.target.value)} />
          <div className="flex gap-3 justify-end">
            <Button variant="secondary" onClick={() => { setRejectTarget(null); setReason(''); }}>Cancel</Button>
            <Button
              variant="danger"
              isLoading={rejecting}
              disabled={!reason.trim()}
              onClick={() => rejectTarget && reject({ id: rejectTarget, reason })}
            >
              Reject
            </Button>
          </div>
        </div>
      </Modal>
    </AppShell>
  );
}
