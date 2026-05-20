import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { getAdminStats } from '../../api/admin';
import { AppShell } from '../../components/layout/AppShell';
import { StatCard } from '../../components/shared/StatCard';
import { PageSpinner } from '../../components/ui/Spinner';

export default function AdminDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['adminStats'],
    queryFn: getAdminStats,
  });

  if (isLoading) return <AppShell title="Admin Dashboard"><PageSpinner /></AppShell>;

  return (
    <AppShell title="Admin Dashboard">
      <div className="space-y-6">
        <section>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Platform totals</h2>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <StatCard label="Customers" value={data?.totals.customers ?? 0} icon="👥" />
            <StatCard label="Merchants" value={data?.totals.merchants ?? 0} icon="🏬" />
            <StatCard label="Active rewards" value={data?.totals.activeRewards ?? 0} icon="🎁" />
            <StatCard label="Stamps issued" value={data?.totals.stampsIssued ?? 0} icon="⭐" />
            <StatCard label="Redeemed" value={data?.totals.rewardsRedeemed ?? 0} icon="✅" />
          </div>
        </section>

        <section>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Last 30 days</h2>
          <div className="grid grid-cols-2 gap-4 max-w-sm">
            <StatCard label="New customers" value={data?.last30Days.newCustomers ?? 0} icon="🙋" />
            <StatCard label="New merchants" value={data?.last30Days.newMerchants ?? 0} icon="🏪" />
          </div>
        </section>

        <div>
          <Link
            to="/admin/merchants"
            className="inline-flex items-center gap-2 text-sm text-indigo-600 hover:underline font-medium"
          >
            Manage merchants →
          </Link>
        </div>
      </div>
    </AppShell>
  );
}
