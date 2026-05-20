import { useQuery } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { getReferralStats } from '../../api/customer';
import { AppShell } from '../../components/layout/AppShell';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { StatCard } from '../../components/shared/StatCard';
import { PageSpinner } from '../../components/ui/Spinner';

export default function ReferralPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['referralStats'],
    queryFn: getReferralStats,
  });

  const copy = () => {
    if (data?.referralCode) {
      navigator.clipboard.writeText(data.referralCode).then(() => toast.success('Code copied!'));
    }
  };

  return (
    <AppShell title="Referral Programme">
      {isLoading ? <PageSpinner /> : (
        <div className="max-w-2xl space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <StatCard label="Your referral code" value={data?.referralCode ?? '—'} icon="🔗" />
            <StatCard label="Total referrals" value={data?.referralCount ?? 0} icon="👥" />
          </div>

          {data?.referralCode && (
            <Card>
              <CardBody>
                <p className="text-sm text-gray-600 mb-3">
                  Share this code with friends. When they sign up using your code, you'll earn a referral bonus!
                </p>
                <div className="flex items-center gap-3">
                  <code className="flex-1 text-center text-2xl font-bold tracking-widest bg-indigo-50 text-indigo-700 px-6 py-3 rounded-lg">
                    {data.referralCode}
                  </code>
                  <Button onClick={copy}>Copy</Button>
                </div>
              </CardBody>
            </Card>
          )}

          {(data?.referrals?.length ?? 0) > 0 && (
            <Card>
              <CardHeader><p className="font-medium text-gray-700">People you've referred</p></CardHeader>
              <div className="divide-y divide-gray-100">
                {data!.referrals.map(r => (
                  <div key={r.id} className="px-6 py-3 flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900">{r.firstName} {r.lastName}</p>
                    <p className="text-xs text-gray-400">{new Date(r.joinedAt).toLocaleDateString()}</p>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      )}
    </AppShell>
  );
}
