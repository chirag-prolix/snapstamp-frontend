import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  children: ReactNode;
}

const variantStyles: Record<string, string> = {
  primary:   'text-black font-semibold hover:opacity-90 disabled:opacity-40',
  secondary: 'border font-medium hover:opacity-80 disabled:opacity-40',
  danger:    'text-white font-semibold hover:opacity-90 disabled:opacity-40',
  ghost:     'font-medium hover:opacity-80 disabled:opacity-40',
};

const sizeClasses = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-5 py-2.5 text-sm',
};

export function Button({
  variant = 'primary',
  size = 'md',
  isLoading,
  disabled,
  children,
  className = '',
  style,
  ...props
}: ButtonProps) {
  const variantInlineStyle: Record<string, React.CSSProperties> = {
    primary:   { background: 'var(--accent)', color: '#0D0F14' },
    secondary: { background: 'var(--bg-elevated)', borderColor: 'var(--border)', color: 'var(--text-primary)' },
    danger:    { background: 'var(--danger)', color: '#fff' },
    ghost:     { background: 'transparent', color: 'var(--text-secondary)' },
  };

  return (
    <button
      disabled={disabled || isLoading}
      style={{ ...variantInlineStyle[variant], ...style }}
      className={`inline-flex items-center justify-center gap-2 rounded-lg transition-all duration-200 cursor-pointer min-h-11
        ${variantStyles[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {isLoading && (
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
      )}
      {children}
    </button>
  );
}
