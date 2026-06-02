import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { registerMerchant } from '../../api/auth';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';

const schema = z.object({
  firstName:             z.string().min(1, 'Required'),
  lastName:              z.string().min(1, 'Required'),
  email:                 z.string().email('Invalid email'),
  phone:                 z.string().regex(/^\+[1-9]\d{1,14}$/, 'Phone must start with country code (e.g. +919876543210)'),
  password:              z.string().min(8, 'Minimum 8 characters'),
  businessName:          z.string().min(1, 'Required'),
  city:                  z.string().min(1, 'Required'),
  state:                 z.string().min(1, 'Required'),
  address:               z.string().min(1, 'Required'),
  phoneForBusiness:      z.string().regex(/^\+[1-9]\d{1,14}$/, 'Phone must start with country code (e.g. +919876543210)'),
  taxId:                 z.string().min(1, 'Required'),
  bankAccountNumber:     z.string().min(1, 'Required'),
  bankIfscCode:          z.string().regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, 'Invalid IFSC (e.g. HDFC0001234)'),
  bankAccountHolderName: z.string().min(1, 'Required'),
  termsAccepted:         z.literal(true, { message: 'You must accept the terms' }),
});
type FormData = z.infer<typeof schema>;

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-xs font-bold uppercase tracking-widest mb-4 pb-2 border-b"
      style={{ color: 'var(--accent)', borderColor: 'var(--border)' }}>
      {children}
    </h2>
  );
}

export default function RegisterMerchantPage() {
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      await registerMerchant(data);
      toast.success('Registration submitted! Your account is pending admin approval.');
      navigate('/login');
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen p-4 relative overflow-hidden" style={{ background: 'var(--bg-primary)' }}>
      {/* Ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-150 h-75 rounded-full opacity-20 blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, #F59E0B 0%, transparent 70%)' }} />

      <div className="relative max-w-2xl mx-auto py-8">
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
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Merchant registration</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Set up your business on snapstamp</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl p-6 sm:p-8" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            <section>
              <SectionHeader>Personal details</SectionHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input label="First name" {...register('firstName')} error={errors.firstName?.message} />
                  <Input label="Last name"  {...register('lastName')}  error={errors.lastName?.message} />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input label="Email" type="email" {...register('email')} error={errors.email?.message} />
                  <Input label="Phone" placeholder="+919876543210" {...register('phone')} error={errors.phone?.message} />
                </div>
                <Input label="Password" type="password" {...register('password')} error={errors.password?.message} />
              </div>
            </section>

            <section>
              <SectionHeader>Business details</SectionHeader>
              <div className="space-y-4">
                <Input label="Business name" {...register('businessName')} error={errors.businessName?.message} />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input label="City"  {...register('city')}  error={errors.city?.message} />
                  <Input label="State" {...register('state')} error={errors.state?.message} />
                </div>
                <Input label="Address" {...register('address')} error={errors.address?.message} />
                <Input label="Business phone" placeholder="+919876543210" {...register('phoneForBusiness')} error={errors.phoneForBusiness?.message} />
                <Input label="Tax ID / GST" {...register('taxId')} error={errors.taxId?.message} />
              </div>
            </section>

            <section>
              <SectionHeader>Bank details</SectionHeader>
              <div className="space-y-4">
                <Input label="Account holder name" {...register('bankAccountHolderName')} error={errors.bankAccountHolderName?.message} />
                <Input label="Account number" {...register('bankAccountNumber')} error={errors.bankAccountNumber?.message} />
                <Input label="IFSC code" placeholder="HDFC0001234" {...register('bankIfscCode')} error={errors.bankIfscCode?.message} />
              </div>
            </section>

            <div>
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  {...register('termsAccepted')}
                  className="mt-0.5 w-4 h-4 rounded accent-[#F59E0B] cursor-pointer"
                />
                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  I accept the terms and conditions and confirm all details are accurate.
                </span>
              </label>
              {errors.termsAccepted && (
                <p className="text-xs mt-1" style={{ color: 'var(--danger)' }}>{errors.termsAccepted.message}</p>
              )}
            </div>

            <Button type="submit" isLoading={isSubmitting} className="w-full" size="lg">
              Submit registration
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
