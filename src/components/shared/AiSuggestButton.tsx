import { Button } from '../ui/Button';

interface AiSuggestButtonProps {
  onClick: () => void;
  isLoading?: boolean;
  label?: string;
  disabled?: boolean;
  className?: string;
}

export function AiSuggestButton({
  onClick,
  isLoading = false,
  label = 'Suggest with AI',
  disabled = false,
  className = '',
}: AiSuggestButtonProps) {
  return (
    <Button
      type="button"
      variant="secondary"
      size="sm"
      isLoading={isLoading}
      disabled={disabled || isLoading}
      onClick={onClick}
      className={`gap-1.5 ${className}`}
    >
      {!isLoading && (
        <svg
          className="h-3.5 w-3.5 text-indigo-500"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M12 2l2.09 6.26L20 10l-5.91 1.74L12 18l-2.09-6.26L4 10l5.91-1.74L12 2z" />
        </svg>
      )}
      {label}
    </Button>
  );
}
