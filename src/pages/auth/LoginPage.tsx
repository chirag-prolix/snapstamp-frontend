import { useEffect, useRef, useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { requestPhoneLoginOtp, verifyPhoneLoginOtp, googleLogin } from '../../api/auth';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/Button';

export default function LoginPage() {
  console.log('I\'m here');
  const { login: authLogin } = useAuth();
  console.log('auth', authLogin);
  const navigate = useNavigate();

  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpError, setOtpError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resendSeconds, setResendSeconds] = useState(0);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (resendSeconds <= 0) return;
    const t = setTimeout(() => setResendSeconds(s => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resendSeconds]);

  const handleSendOtp = async () => {
    const trimmed = phone.trim();
    if (!trimmed) { setPhoneError('Phone number is required'); return; }
    if (!/^\+?[1-9]\d{7,14}$/.test(trimmed)) { setPhoneError('Enter a valid phone number'); return; }
    setPhoneError('');
    setIsLoading(true);
    try {
      await requestPhoneLoginOtp(trimmed);
      setStep('otp');
      setResendSeconds(30);
      setTimeout(() => otpRefs.current[0]?.focus(), 50);
      toast.success('OTP sent to your phone');
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? 'Failed to send OTP';
      setPhoneError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async () => {
    const code = otp.join('');
    if (code.length < 6) { setOtpError('Enter the 6-digit OTP'); return; }
    setOtpError('');
    setIsLoading(true);
    try {
      const res = await verifyPhoneLoginOtp(phone.trim(), code);
      authLogin(res);
      const r = res.user.roles[0];
      if (r === 'ROLE_MERCHANT') navigate('/merchant');
      else if (r === 'ROLE_ADMIN') navigate('/admin');
      else navigate('/customer');
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? 'Invalid OTP';
      setOtpError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendSeconds > 0) return;
    setIsLoading(true);
    try {
      await requestPhoneLoginOtp(phone.trim());
      setOtp(['', '', '', '', '', '']);
      setOtpError('');
      setResendSeconds(30);
      otpRefs.current[0]?.focus();
      toast.success('OTP resent');
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Failed to resend OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return;
    const next = [...otp];
    next[index] = value.slice(-1);
    setOtp(next);
    setOtpError('');
    if (value && index < 5) otpRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    const digits = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (digits.length === 6) {
      setOtp(digits.split(''));
      otpRefs.current[5]?.focus();
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
          <div className="h-1 w-full bg-linear-to-r from-indigo-500 via-violet-500 to-purple-500" />

          <div className="p-8">
            {step === 'phone' ? (
              <>
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Welcome back</h2>
                  <p className="text-sm text-gray-500 mt-1">Enter your mobile number to receive an OTP</p>
                </div>

                <form onSubmit={e => { e.preventDefault(); handleSendOtp(); }} className="space-y-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-gray-700">Mobile number</label>
                    <div className={`flex items-center rounded-lg border transition focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500 ${phoneError ? 'border-red-500' : 'border-gray-300'}`}>
                      <span className="pl-3 pr-2 text-sm text-gray-500 select-none border-r border-gray-300 py-2 font-medium">+91</span>
                      <input
                        type="tel"
                        inputMode="numeric"
                        placeholder="98765 43210"
                        value={phone.startsWith('+91') ? phone.slice(3) : phone}
                        onChange={e => {
                          const raw = e.target.value.replace(/\D/g, '').slice(0, 10);
                          setPhone(raw ? `+91${raw}` : '');
                        }}
                        className="flex-1 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 outline-none bg-transparent rounded-r-lg"
                        autoFocus
                      />
                    </div>
                    {phoneError && <p className="text-xs text-red-600">{phoneError}</p>}
                  </div>

                  <div className="pt-1">
                    <Button
                      type="submit"
                      isLoading={isLoading}
                      size="lg"
                      className="w-full relative overflow-hidden group hover:shadow-xl hover:shadow-indigo-500/40 hover:scale-[1.02] active:scale-[0.98]"
                    >
                      {!isLoading && (
                        <span aria-hidden className="absolute inset-0 -translate-x-full -skew-x-12 bg-white/20 group-hover:translate-x-[200%] transition-transform duration-700 ease-in-out" />
                      )}
                      Send OTP
                    </Button>
                  </div>
                </form>
              </>
            ) : (
              <>
                <div className="mb-6">
                  <button
                    type="button"
                    onClick={() => { setStep('phone'); setOtp(['', '', '', '', '', '']); setOtpError(''); }}
                    className="flex items-center gap-1.5 text-sm text-indigo-600 hover:text-indigo-800 mb-4 font-medium"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                      <path d="M19 12H5M12 5l-7 7 7 7" />
                    </svg>
                    Change number
                  </button>
                  <h2 className="text-xl font-semibold text-gray-900">Enter OTP</h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Sent to <span className="font-medium text-gray-700">{phone}</span>
                  </p>
                </div>

                <form onSubmit={e => { e.preventDefault(); handleVerify(); }} className="space-y-5">
                  <div className="flex flex-col gap-2">
                    <div className="flex gap-2 justify-between" onPaste={handleOtpPaste}>
                      {otp.map((digit, i) => (
                        <input
                          key={i}
                          ref={el => { otpRefs.current[i] = el; }}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          onChange={e => handleOtpChange(i, e.target.value)}
                          onKeyDown={e => handleOtpKeyDown(i, e)}
                          className={`w-12 h-14 text-center text-xl font-bold rounded-xl border-2 outline-none transition-all
                            focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200
                            ${otpError ? 'border-red-400 bg-red-50' : digit ? 'border-indigo-400 bg-indigo-50' : 'border-gray-200 bg-gray-50'}
                          `}
                        />
                      ))}
                    </div>
                    {otpError && <p className="text-xs text-red-600">{otpError}</p>}
                  </div>

                  <Button
                    type="submit"
                    isLoading={isLoading}
                    size="lg"
                    className="w-full relative overflow-hidden group hover:shadow-xl hover:shadow-indigo-500/40 hover:scale-[1.02] active:scale-[0.98]"
                  >
                    {!isLoading && (
                      <span aria-hidden className="absolute inset-0 -translate-x-full -skew-x-12 bg-white/20 group-hover:translate-x-[200%] transition-transform duration-700 ease-in-out" />
                    )}
                    Verify & Sign in
                  </Button>

                  <p className="text-center text-sm text-gray-500">
                    Didn't receive it?{' '}
                    {resendSeconds > 0 ? (
                      <span className="text-gray-400">Resend in {resendSeconds}s</span>
                    ) : (
                      <button type="button" onClick={handleResend} className="text-indigo-600 font-medium hover:underline">
                        Resend OTP
                      </button>
                    )}
                  </p>
                </form>
              </>
            )}

            {step === 'phone' && (
              <div className="mt-6">
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-gray-200" />
                  <span className="text-xs text-gray-400 font-medium">or continue with</span>
                  <div className="flex-1 h-px bg-gray-200" />
                </div>
                <div className="mt-4 flex justify-center">
                  <GoogleLogin
                    onSuccess={async ({ credential }) => {
                      if (!credential) return;
                      try {
                        const res = await googleLogin(credential);
                        authLogin(res);
                        if (!res.user.phone) { navigate('/complete-profile'); return; }
                        const r = res.user.roles[0];
                        if (r === 'ROLE_MERCHANT') navigate('/merchant');
                        else if (r === 'ROLE_ADMIN') navigate('/admin');
                        else navigate('/customer');
                      } catch (err) {
                        const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
                        toast.error(msg ?? 'Google sign-in failed');
                      }
                    }}
                    onError={() => toast.error('Google sign-in failed')}
                    theme="outline"
                    size="large"
                    shape="rectangular"
                    text="continue_with"
                    width="320"
                  />
                </div>
              </div>
            )}

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
