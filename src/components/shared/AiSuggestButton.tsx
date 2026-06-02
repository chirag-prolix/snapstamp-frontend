import { Sparkles } from 'lucide-react';
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
        <Sparkles size={13} style={{ color: 'var(--accent)' }} strokeWidth={1.75} />
      )}
      {label}
    </Button>
  );
}
