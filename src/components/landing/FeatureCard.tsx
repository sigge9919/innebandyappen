import { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

export function FeatureCard({ icon: Icon, title, description }: FeatureCardProps) {
  return (
    <Card className="bg-sidebar-accent/40 border-sidebar-border hover:border-primary/60 transition-colors group">
      <CardContent className="p-6">
        <div className="w-11 h-11 rounded-md bg-primary/15 border border-primary/30 flex items-center justify-center mb-4 group-hover:glow-cyan transition-shadow">
          <Icon className="text-primary" />
        </div>
        <h3 className="text-base font-semibold text-sidebar-foreground mb-2">{title}</h3>
        <p className="text-sm text-sidebar-foreground/70 leading-relaxed">{description}</p>
      </CardContent>
    </Card>
  );
}