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

export function StatCard({ title, value, subtitle, icon: Icon, variant = 'default', className }: StatCardProps) {
  return (
    <div className={cn('stat-card', variantStyles[variant], className)}>
      <div className="flex items-start justify-between mb-1">
        <p className="metric-label">{title}</p>
        {Icon && <Icon className="h-4 w-4 text-primary/70" />}
      </div>
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
