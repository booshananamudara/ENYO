import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

/** ENYO brand logo component. */
export function Logo({ className, size = 'md' }: LogoProps) {
  const sizeClasses = {
    sm: 'text-xl',
    md: 'text-2xl',
    lg: 'text-4xl',
  };

  return (
    <span className={cn('font-bold tracking-tight', sizeClasses[size], className)}>
      <span className="text-primary">Shop</span>
      <span className="text-accent">Enyo</span>
    </span>
  );
}
