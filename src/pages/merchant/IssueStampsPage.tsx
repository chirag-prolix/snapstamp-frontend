import { useState } from 'react';
import { useForm, Controller, type Resolver } from 'react-hook-form';
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
  phone:        z.string().regex(/^\+91[0-9]{10}$/, 'Enter a valid 10-digit mobile number').optional(),
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

  const { register, handleSubmit, watch, reset, control, formState: { errors, isSubmitting } } = useForm<FormData>({
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

              {lookupType === 'phone' ? (
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-gray-700">Phone number</label>
                  <Controller
                    name="phone"
                    control={control}
                    render={({ field }) => (
                      <div className={`flex items-center rounded-lg border transition focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500 ${errors.phone ? 'border-red-500' : 'border-gray-300'}`}>
                        <span className="pl-3 pr-2 text-sm text-gray-500 select-none border-r border-gray-300 py-2 font-medium whitespace-nowrap">+91</span>
                        <input
                          type="tel"
                          inputMode="numeric"
                          maxLength={10}
                          placeholder="98765 43210"
                          value={field.value ? field.value.replace(/^\+91/, '') : ''}
                          onChange={e => {
                            const digits = e.target.value.replace(/\D/g, '').slice(0, 10);
                            field.onChange(digits ? `+91${digits}` : '');
                          }}
                          className="flex-1 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 outline-none bg-transparent rounded-r-lg"
                        />
                        {field.value && field.value.replace(/^\+91/, '').length > 0 && (
                          <span className={`pr-3 text-xs font-medium ${field.value.replace(/^\+91/, '').length === 10 ? 'text-green-500' : 'text-gray-400'}`}>
                            {field.value.replace(/^\+91/, '').length}/10
                          </span>
                        )}
                      </div>
                    )}
                  />
                  {errors.phone && <p className="text-xs text-red-600">{errors.phone.message}</p>}
                </div>
              ) : (
                <Input label="Customer UUID" {...register('customerId')} error={errors.customerId?.message} />
              )}

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
