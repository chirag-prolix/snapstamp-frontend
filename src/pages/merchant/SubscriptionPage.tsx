import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { createSubscriptionOrder, getMerchantPayments, verifyPayment } from '../../api/merchant';
import { AppShell } from '../../components/layout/AppShell';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { useAuth } from '../../contexts/AuthContext';
import type { MerchantUser } from '../../types/api';

const PLANS = [
  {
    key: 'monthly' as const,
    label: 'Monthly',
    price: '₹999',
    period: '/month',
    description: 'Full access, billed every month.',
    savings: null,
  },
  {
    key: 'annual' as const,
    label: 'Annual',
    price: '₹9,588',
    period: '/year',
    description: 'Full access, billed annually.',
    savings: '2 months free',
  },
];

function AccessStatusCard({ merchant }: { merchant: MerchantUser }) {
  const [now] = useState(Date.now);
  const trialEndsAt = new Date(merchant.trialEndsAt);
  const trialDaysLeft = Math.ceil((trialEndsAt.getTime() - now) / 86_400_000);
  const inTrial = trialDaysLeft > 0;

  if (inTrial && !merchant.subscriptionExpiresAt) {
    return (
      <Card>
        <CardBody>
          <div className="flex items-center gap-3">
            <span className="text-2xl">🎁</span>
            <div>
              <p className="font-semibold text-gray-900">Free trial active</p>
              <p className="text-sm text-gray-500">
                {trialDaysLeft} day{trialDaysLeft !== 1 ? 's' : ''} remaining — expires {trialEndsAt.toLocaleDateString()}
              </p>
            </div>
            <Badge color="indigo" className="ml-auto">Trial</Badge>
          </div>
        </CardBody>
      </Card>
    );
  }

  if (merchant.subscriptionExpiresAt) {
    const expiresAt = new Date(merchant.subscriptionExpiresAt);
    const subDaysLeft = Math.ceil((expiresAt.getTime() - now) / 86_400_000);
    return (
      <Card>
        <CardBody>
          <div className="flex items-center gap-3">
            <span className="text-2xl">✅</span>
            <div>
              <p className="font-semibold text-gray-900">Active subscription</p>
              <p className="text-sm text-gray-500">
                {subDaysLeft} day{subDaysLeft !== 1 ? 's' : ''} remaining — renews {expiresAt.toLocaleDateString()}
              </p>
            </div>
            <Badge color="green" className="ml-auto">Active</Badge>
          </div>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card>
      <CardBody>
        <div className="flex items-center gap-3">
          <span className="text-2xl">⚠️</span>
          <div>
            <p className="font-semibold text-red-700">Trial expired</p>
            <p className="text-sm text-gray-500">Subscribe below to restore access to all features.</p>
          </div>
          <Badge color="red" className="ml-auto">Expired</Badge>
        </div>
      </CardBody>
    </Card>
  );
}

export default function SubscriptionPage() {
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'annual'>('monthly');
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const merchant = user as MerchantUser;

  const { data: payments } = useQuery({
    queryKey: ['merchantPayments'],
    queryFn: getMerchantPayments,
  });

  const activePlans = new Set(
    payments
      ?.filter(p => p.status === 'COMPLETED')
      .map(p => (p.metadata as Record<string, string>)?.plan)
      .filter(Boolean) ?? []
  );

  const { mutate: subscribe, isPending } = useMutation({
    mutationFn: () => createSubscriptionOrder(selectedPlan),
    onSuccess: (order) => {
      const rzp = new (window as any).Razorpay({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        order_id: order.orderId,
        receipt: order.receipt,
        name: 'Snapstamp',
        description: `${selectedPlan.charAt(0).toUpperCase() + selectedPlan.slice(1)} Subscription`,
        theme: { color: '#4f46e5' },
        handler: async (response: { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string }) => {
          try {
            await verifyPayment({
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
            });
            toast.success('Payment successful! Subscription activated.');
          } catch {
            toast.error('Payment verification failed. Please contact support.');
          }
          queryClient.invalidateQueries({ queryKey: ['merchantPayments'] });
        },
        modal: {
          ondismiss: () => toast('Payment cancelled'),
        },
      });
      rzp.open();
    },
    onError: (e: any) =>
      toast.error(e?.response?.data?.message ?? 'Failed to initiate payment'),
  });

  return (
    <AppShell title="Subscription">
      <div className="space-y-6 max-w-2xl">
        <AccessStatusCard merchant={merchant} />
        <Card>
          <CardHeader>
            <p className="font-medium text-gray-700">Choose a plan</p>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              {PLANS.map((plan) => {
                const isActive = activePlans.has(plan.key);
                return (
                  <button
                    key={plan.key}
                    type="button"
                    onClick={() => !isActive && setSelectedPlan(plan.key)}
                    disabled={isActive}
                    className={`text-left rounded-xl border-2 p-5 transition-colors focus:outline-none
                      ${isActive
                        ? 'border-green-500 bg-green-50 cursor-default'
                        : selectedPlan === plan.key
                          ? 'border-indigo-500 bg-indigo-50'
                          : 'border-gray-200 bg-white hover:border-gray-300'}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-gray-900">{plan.label}</span>
                      <div className="flex items-center gap-2">
                        {isActive && <Badge color="green">Active</Badge>}
                        {plan.savings && <Badge color="indigo">{plan.savings}</Badge>}
                      </div>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">
                      {plan.price}
                      <span className="text-sm font-normal text-gray-500">{plan.period}</span>
                    </p>
                    <p className="text-sm text-gray-500 mt-1">{plan.description}</p>
                  </button>
                );
              })}
            </div>
            <Button
              size="lg"
              className="w-full"
              isLoading={isPending}
              disabled={activePlans.has(selectedPlan)}
              onClick={() => subscribe()}
            >
              {activePlans.has(selectedPlan) ? 'Already Subscribed' : 'Subscribe Now'}
            </Button>
          </CardBody>
        </Card>
      </div>
    </AppShell>
  );
}
