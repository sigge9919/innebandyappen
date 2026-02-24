import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  variant?: 'default' | 'primary' | 'accent' | 'success' | 'warning';
  className?: string;
}

const variantStyles = {
  default: '',
  primary: '',
  accent: '',
  success: '',
  warning: '',
};

export function StatCard({ title, value, subtitle, variant = 'default', className }: StatCardProps) {
  return (
    <div className={cn('stat-card', variantStyles[variant], className)}>
      <p className="metric-label mb-1">{title}</p>
      <p className={cn(
        'metric-value',
        variant === 'success' && 'text-success',
        variant === 'warning' && 'text-warning'
      )}>
        {value}
      </p>
      {subtitle && (
        <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
      )}
    </div>
  );
}
