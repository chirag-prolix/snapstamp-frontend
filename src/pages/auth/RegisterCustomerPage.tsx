import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { registerCustomer } from '../../api/auth';
import { useAuth } from '../../contexts/AuthContext';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';

const schema = z.object({
  firstName:    z.string().min(1, 'Required').max(100),
  lastName:     z.string().min(1, 'Required').max(100),
  email:        z.string().email('Invalid email'),
  phone:        z.string().regex(/^\+[1-9]\d{1,14}$/, 'Phone must start with country code (e.g. +919876543210)'),
  password:     z.string().min(8, 'Minimum 8 characters'),
  referralCode: z.string().max(20).optional().or(z.literal('')),
});
type FormData = z.infer<typeof schema>;

export default function RegisterCustomerPage() {
  const { login: authLogin } = useAuth();
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      const res = await registerCustomer({ ...data, referralCode: data.referralCode || undefined });
      authLogin(res);
      navigate('/customer');
      toast.success('Welcome to snapstamp!');
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden" style={{ background: 'var(--bg-primary)' }}>
      {/* Ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-150 h-75 rounded-full opacity-20 blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, #F59E0B 0%, transparent 70%)' }} />

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div
            className="inline-flex items-center justify-center w-12 h-12 rounded-xl mb-4"
            style={{ background: 'var(--accent-dim)', border: '1px solid var(--accent)' }}
          >
            <svg viewBox="0 0 32 32" className="w-6 h-6" fill="none">
              <circle cx="16" cy="16" r="13" stroke="#F59E0B" strokeWidth="1.5" strokeDasharray="3 2.5" opacity="0.7" />
              <path d="M11.5 16.5l3 3 6-7" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Create your account</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Join snapstamp and start earning rewards</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl p-6 sm:p-8" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Input label="First name" {...register('firstName')} error={errors.firstName?.message} />
              <Input label="Last name"  {...register('lastName')}  error={errors.lastName?.message} />
            </div>
            <Input label="Email" type="email" {...register('email')} error={errors.email?.message} />
            <Input label="Phone" placeholder="+919876543210" {...register('phone')} error={errors.phone?.message} />
            <Input label="Password" type="password" {...register('password')} error={errors.password?.message} />
            <Input label="Referral code (optional)" {...register('referralCode')} error={errors.referralCode?.message} />
            <Button type="submit" isLoading={isSubmitting} className="w-full mt-2" size="lg">
              Create account
            </Button>
          </form>

          <p className="text-center text-sm mt-6" style={{ color: 'var(--text-secondary)' }}>
            Already have an account?{' '}
            <Link to="/login" className="font-semibold hover:opacity-80 transition-opacity" style={{ color: 'var(--accent)' }}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
