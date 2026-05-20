import { useState } from 'react';
import { useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { issueStamps } from '../../api/merchant';
import { AppShell } from '../../components/layout/AppShell';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { Badge, statusColor } from '../../components/ui/Badge';
import type { StampCardDetail } from '../../types/api';

const schema = z.object({
  lookupType:   z.enum(['phone', 'customerId']),
  phone:        z.string().optional(),
  customerId:   z.string().uuid('Invalid UUID').optional(),
  count:        z.coerce.number().int().min(1, 'Min 1').max(10, 'Max 10'),
  notes:        z.string().max(500).optional(),
  isBonus:      z.boolean().optional(),
}).refine(d => d.lookupType === 'phone' ? !!d.phone : !!d.customerId, {
  message: 'Customer identifier required',
  path: ['phone'],
});

type FormData = {
  lookupType: 'phone' | 'customerId';
  phone?: string;
  customerId?: string;
  count: number;
  notes?: string;
  isBonus?: boolean;
};

export default function IssueStampsPage() {
  const [result, setResult] = useState<StampCardDetail | null>(null);

  const { register, handleSubmit, watch, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema) as unknown as Resolver<FormData>,
    defaultValues: { lookupType: 'phone', count: 1, isBonus: false },
  });

  const lookupType = watch('lookupType');

  const { mutate: issue } = useMutation({
    mutationFn: (data: FormData) => issueStamps({
      count: data.count,
      notes: data.notes,
      isBonus: data.isBonus,
      ...(data.lookupType === 'phone'
        ? { customerPhone: data.phone }
        : { customerId: data.customerId }),
    }),
    onSuccess: (data) => {
      setResult(data);
      toast.success(`${data.stamps.length} stamp(s) issued!`);
      reset();
    },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? 'Failed to issue stamps'),
  });

  return (
    <AppShell title="Issue Stamps">
      <div className="max-w-lg space-y-6">
        <Card>
          <CardHeader><p className="font-medium text-gray-700">Issue stamps to customer</p></CardHeader>
          <CardBody>
            <form onSubmit={handleSubmit(d => issue(d))} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Find customer by</label>
                <div className="flex gap-4 mt-1">
                  <label className="flex items-center gap-2 text-sm">
                    <input type="radio" value="phone" {...register('lookupType')} /> Phone
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input type="radio" value="customerId" {...register('lookupType')} /> Customer ID
                  </label>
                </div>
              </div>

              {lookupType === 'phone'
                ? <Input label="Phone number" placeholder="+919876543210" {...register('phone')} error={errors.phone?.message} />
                : <Input label="Customer UUID" {...register('customerId')} error={errors.customerId?.message} />
              }

              <Input label="Number of stamps (1–10)" type="number" min={1} max={10} {...register('count')} error={errors.count?.message} />
              <Input label="Notes (optional)" {...register('notes')} />
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input type="checkbox" {...register('isBonus')} />
                Mark as bonus stamps
              </label>
              <Button type="submit" isLoading={isSubmitting} className="w-full">Issue stamps</Button>
            </form>
          </CardBody>
        </Card>

        {result && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <p className="font-medium text-gray-700">Stamps issued!</p>
                <Badge color={statusColor(result.stampCard.status)}>{result.stampCard.status}</Badge>
              </div>
            </CardHeader>
            <CardBody>
              <p className="text-sm text-gray-500 mb-3">{result.stampCard.cardNumber}</p>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-3xl font-bold text-indigo-600">{result.stampCard.currentStampCount}</span>
                <span className="text-gray-400">/ {result.stampCard.totalSlotsRequired} stamps</span>
              </div>
              <ProgressBar value={result.stampCard.currentStampCount} max={result.stampCard.totalSlotsRequired} />
              {result.stampCard.status === 'COMPLETED' && (
                <p className="text-sm text-green-600 font-medium mt-3">🎉 Card completed! Customer can now redeem a reward.</p>
              )}
            </CardBody>
          </Card>
        )}
      </div>
    </AppShell>
  );
}
