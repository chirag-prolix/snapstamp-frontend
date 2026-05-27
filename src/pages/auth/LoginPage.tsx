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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-indigo-600">snapstamp</h1>
          <p className="text-gray-500 mt-2">Sign in to your account</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
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
                className="absolute right-3 top-8.5 text-gray-400 hover:text-gray-600"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                <EyeIcon open={showPassword} />
              </button>
            </div>
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
          </form>
          <p className="text-center text-sm text-gray-500 mt-6">
            New customer?{' '}
            <Link to="/register/customer" className="text-indigo-600 font-medium hover:underline">
              Register here
            </Link>
            {' · '}
            <Link to="/register/merchant" className="text-indigo-600 font-medium hover:underline">
              Merchant signup
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
