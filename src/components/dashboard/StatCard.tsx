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
  default: 'bg-card',
  primary: 'bg-primary text-primary-foreground',
  accent: 'bg-accent text-accent-foreground',
  success: 'bg-success/10 border-success/20',
  warning: 'bg-warning/10 border-warning/20',
};

export function StatCard({ title, value, subtitle, icon: Icon, variant = 'default', className }: StatCardProps) {
  return (
    <div className={cn('stat-card animate-fade-in', variantStyles[variant], className)}>
      <div className="flex items-start justify-between">
        <div>
          <p className={cn(
            'metric-label mb-2',
            variant === 'primary' && 'text-primary-foreground/80',
            variant === 'accent' && 'text-accent-foreground/80'
          )}>
            {title}
          </p>
          <p className={cn(
            'metric-value',
            variant === 'primary' && 'text-primary-foreground',
            variant === 'accent' && 'text-accent-foreground',
            variant === 'success' && 'text-success',
            variant === 'warning' && 'text-warning'
          )}>
            {value}
          </p>
          {subtitle && (
            <p className={cn(
              'text-sm text-muted-foreground mt-1',
              variant === 'primary' && 'text-primary-foreground/70',
              variant === 'accent' && 'text-accent-foreground/70'
            )}>
              {subtitle}
            </p>
          )}
        </div>
        {Icon && (
          <div className={cn(
            'p-2 rounded-lg',
            variant === 'default' && 'bg-primary/10',
            variant === 'primary' && 'bg-primary-foreground/10',
            variant === 'accent' && 'bg-accent-foreground/10',
            variant === 'success' && 'bg-success/20',
            variant === 'warning' && 'bg-warning/20'
          )}>
            <Icon className={cn(
              'h-5 w-5',
              variant === 'default' && 'text-primary',
              variant === 'primary' && 'text-primary-foreground',
              variant === 'accent' && 'text-accent-foreground',
              variant === 'success' && 'text-success',
              variant === 'warning' && 'text-warning'
            )} />
          </div>
        )}
      </div>
    </div>
  );
}
