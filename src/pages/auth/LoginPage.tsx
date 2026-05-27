import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { login } from '../../api/auth';
import { useAuth } from '../../contexts/AuthContext';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';

const schema = z.object({
  email:    z.string().email('Invalid email'),
  password: z.string().min(1, 'Password required'),
});
type FormData = z.infer<typeof schema>;

function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ) : (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const { login: authLogin } = useAuth();
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      const res = await login(data.email, data.password);
      authLogin(res);
      const r = res.user.roles[0];
      if (r === 'ROLE_MERCHANT') navigate('/merchant');
      else if (r === 'ROLE_ADMIN') navigate('/admin');
      else navigate('/customer');
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Login failed');
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-linear-to-br from-indigo-950 via-slate-900 to-purple-950 flex items-center justify-center p-4">

      {/* Background orbs */}
      <div className="absolute -top-52 -left-52 w-125 h-125 rounded-full bg-indigo-600/25 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-52 -right-52 w-150 h-150 rounded-full bg-purple-700/25 blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-violet-500/10 blur-3xl pointer-events-none" />

      {/* Dot grid overlay */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)', backgroundSize: '28px 28px' }}
      />

      <div className="relative w-full max-w-md">

        {/* Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-sm mb-5 shadow-lg shadow-black/20">
            <svg viewBox="0 0 32 32" className="w-8 h-8" fill="none">
              <circle cx="16" cy="16" r="13" stroke="white" strokeWidth="1.5" strokeDasharray="3 2.5" opacity="0.6" />
              <circle cx="16" cy="16" r="8.5" fill="white" fillOpacity="0.12" stroke="white" strokeWidth="1.5" />
              <path d="M11.5 16.5l3 3 6-7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-white tracking-tight">snapstamp</h1>
          <p className="text-indigo-300/80 mt-2 text-sm">Your loyalty rewards platform</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl shadow-black/40 overflow-hidden">

          {/* Card top accent bar */}
          <div className="h-1 w-full bg-linear-to-r from-indigo-500 via-violet-500 to-purple-500" />

          <div className="p-8">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Welcome back</h2>
              <p className="text-sm text-gray-500 mt-1">Enter your credentials to continue</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input label="Email" type="email" {...register('email')} error={errors.email?.message} />

              <div className="relative">
                <Input
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  {...register('password')}
                  error={errors.password?.message}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3 top-8.5 text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  <EyeIcon open={showPassword} />
                </button>
              </div>

              <div className="pt-1">
                <Button
                  type="submit"
                  isLoading={isSubmitting}
                  size="lg"
                  className="w-full relative overflow-hidden group hover:shadow-xl hover:shadow-indigo-500/40 hover:scale-[1.02] active:scale-[0.98]"
                >
                  {!isSubmitting && (
                    <span
                      aria-hidden
                      className="absolute inset-0 -translate-x-full -skew-x-12 bg-white/20 group-hover:translate-x-[200%] transition-transform duration-700 ease-in-out"
                    />
                  )}
                  Sign in
                </Button>
              </div>
            </form>

            <div className="mt-6 pt-6 border-t border-gray-100 text-center">
              <p className="text-sm text-gray-500">
                New customer?{' '}
                <Link to="/register/customer" className="text-indigo-600 font-medium hover:underline">
                  Register here
                </Link>
                <span className="mx-2 text-gray-300">·</span>
                <Link to="/register/merchant" className="text-indigo-600 font-medium hover:underline">
                  Merchant signup
                </Link>
              </p>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-indigo-400/50 mt-6">
          © 2025 Snapstamp · All rights reserved
        </p>
      </div>
    </div>
  );
}
