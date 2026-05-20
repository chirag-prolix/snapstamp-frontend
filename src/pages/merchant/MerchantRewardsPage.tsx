import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-hot-toast';
import { getMerchantRewards, createReward } from '../../api/merchant';
import { AppShell } from '../../components/layout/AppShell';
import { Card, CardBody } from '../../components/ui/Card';
import { Badge, statusColor } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { PageSpinner } from '../../components/ui/Spinner';

const schema = z.object({
  title:           z.string().min(5, 'At least 5 characters').max(255),
  description:     z.string().min(1, 'Required').max(2000),
  rewardType:      z.enum(['DISCOUNT', 'FREE_ITEM', 'CASHBACK', 'EXPERIENCE']),
  value:           z.string().regex(/^\d+(\.\d{1,2})?$/, 'Valid amount required'),
  stampRequirement:z.coerce.number().int().min(1).max(100).optional(),
  maxRedemptions:  z.coerce.number().int().positive().optional().or(z.literal('')),
  expiresAt:       z.string().min(1, 'Required'),
  terms:           z.string().max(1000).optional(),
});
type FormData = {
  title: string;
  description: string;
  rewardType: 'DISCOUNT' | 'FREE_ITEM' | 'CASHBACK' | 'EXPERIENCE';
  value: string;
  stampRequirement?: number;
  maxRedemptions?: number | '';
  expiresAt: string;
  terms?: string;
};

export default function MerchantRewardsPage() {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: rewards, isLoading } = useQuery({
    queryKey: ['merchantRewards'],
    queryFn: getMerchantRewards,
  });

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema) as unknown as Resolver<FormData>,
    defaultValues: { stampRequirement: 10 },
  });

  const { mutate: create } = useMutation({
    mutationFn: (data: FormData) => createReward({
      ...data,
      maxRedemptions: data.maxRedemptions === '' ? undefined : Number(data.maxRedemptions),
    }),
    onSuccess: () => {
      toast.success('Reward created!');
      queryClient.invalidateQueries({ queryKey: ['merchantRewards'] });
      reset();
      setOpen(false);
    },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? 'Failed to create reward'),
  });

  return (
    <AppShell title="Rewards">
      <div className="flex justify-end mb-4">
        <Button onClick={() => setOpen(true)}>+ New reward</Button>
      </div>

      {isLoading ? <PageSpinner /> : (
        (rewards?.length ?? 0) === 0
          ? <p className="text-gray-400 text-sm">No rewards yet. Create your first reward!</p>
          : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {rewards!.map(r => (
                <Card key={r.id}>
                  <CardBody>
                    <div className="flex items-start justify-between mb-2">
                      <Badge color={statusColor(r.status)}>{r.status}</Badge>
                      <span className="text-xs text-gray-400">{r.currentRedemptions} redeemed</span>
                    </div>
                    <p className="font-semibold text-gray-900">{r.title}</p>
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">{r.description}</p>
                    <p className="text-xs text-indigo-600 mt-2">{r.stampRequirement} stamps · {r.rewardType}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Expires {new Date(r.expiresAt).toLocaleDateString()}
                    </p>
                  </CardBody>
                </Card>
              ))}
            </div>
          )
      )}

      <Modal isOpen={open} onClose={() => { setOpen(false); reset(); }} title="Create new reward" size="lg">
        <form onSubmit={handleSubmit(d => create(d))} className="space-y-4">
          <Input label="Title" {...register('title')} error={errors.title?.message} />
          <div>
            <label className="text-sm font-medium text-gray-700">Description</label>
            <textarea
              {...register('description')}
              rows={3}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {errors.description && <p className="text-xs text-red-600">{errors.description.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Type</label>
              <select {...register('rewardType')} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500">
                {['DISCOUNT', 'FREE_ITEM', 'CASHBACK', 'EXPERIENCE'].map(t => (
                  <option key={t} value={t}>{t.replace('_', ' ')}</option>
                ))}
              </select>
            </div>
            <Input label="Value (₹)" {...register('value')} placeholder="99.00" error={errors.value?.message} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Stamps required" type="number" {...register('stampRequirement')} error={errors.stampRequirement?.message} />
            <Input label="Max redemptions (optional)" type="number" {...register('maxRedemptions')} error={errors.maxRedemptions?.message} />
          </div>
          <Input label="Expires at" type="datetime-local" {...register('expiresAt')} error={errors.expiresAt?.message} />
          <div>
            <label className="text-sm font-medium text-gray-700">Terms (optional)</label>
            <textarea
              {...register('terms')}
              rows={2}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" type="button" onClick={() => { setOpen(false); reset(); }}>Cancel</Button>
            <Button type="submit" isLoading={isSubmitting}>Create reward</Button>
          </div>
        </form>
      </Modal>
    </AppShell>
  );
}
