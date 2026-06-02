import { forwardRef, type InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', id, style, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s/g, '-');
    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label
            htmlFor={inputId}
            className="text-xs font-semibold uppercase tracking-wide"
            style={{ color: 'var(--text-secondary)' }}
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          style={{
            background: 'var(--bg-elevated)',
            borderColor: error ? 'var(--danger)' : 'var(--border)',
            color: 'var(--text-primary)',
            ...style,
          }}
          className={`w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition-all min-h-11
            placeholder-(--text-muted)
            focus:ring-2 focus:ring-(--accent)/30 focus:border-(--accent)
            ${className}`}
          {...props}
        />
        {error && <p className="text-xs" style={{ color: 'var(--danger)' }}>{error}</p>}
      </div>
    );
  }
);
Input.displayName = 'Input';
