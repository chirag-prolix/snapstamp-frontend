import { useQuery } from '@tanstack/react-query';
import { getMerchantPayments } from '../../api/merchant';
import { AppShell } from '../../components/layout/AppShell';
import { Card, CardBody } from '../../components/ui/Card';
import { Badge, statusColor } from '../../components/ui/Badge';
import { PageSpinner } from '../../components/ui/Spinner';

function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
  }).format(amount / 100); // Razorpay stores amounts in paise
}

export default function PaymentHistoryPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['merchantPayments'],
    queryFn: getMerchantPayments,
  });

  if (isLoading) return <AppShell title="Payment History"><PageSpinner /></AppShell>;

  return (
    <AppShell title="Payment History">
      <div className="space-y-3 max-w-3xl">
        {(data?.length ?? 0) === 0 ? (
          <p className="text-gray-400 text-sm">No payments yet.</p>
        ) : (
          data!.map((payment) => (
            <Card key={payment.id}>
              <CardBody>
                <div className="flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <code className="text-xs bg-gray-100 px-2 py-0.5 rounded font-mono">
                        {payment.transactionId}
                      </code>
                      <span className="text-xs text-gray-400">
                        {new Date(payment.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric', month: 'short', year: 'numeric',
                        })}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1 capitalize">
                      {payment.paymentType.toLowerCase()} plan
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="font-semibold text-gray-900">
                      {formatCurrency(parseFloat(payment.amount), payment.currency)}
                    </span>
                    <Badge color={statusColor(payment.status)}>{payment.status}</Badge>
                  </div>
                </div>
              </CardBody>
            </Card>
          ))
        )}
      </div>
    </AppShell>
  );
}
