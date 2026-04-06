import { cn } from '@/lib/utils';
import { STATUS_CONFIG, PAYMENT_STATUS_CONFIG, RETURN_STATUS_CONFIG } from '@/lib/constants';
import type { OrderStatus } from '@/lib/types/order';
import type { PaymentStatus } from '@/lib/types/payment';
import type { ReturnStatus } from '@/lib/types/return';

type AnyStatus = OrderStatus | PaymentStatus | ReturnStatus;

interface StatusBadgeProps {
  status: AnyStatus;
  size?: 'sm' | 'md';
}

/** Lookup the display config for any status value. */
function getStatusConfig(status: AnyStatus) {
  if (status in STATUS_CONFIG) return STATUS_CONFIG[status as OrderStatus];
  if (status in PAYMENT_STATUS_CONFIG) return PAYMENT_STATUS_CONFIG[status as PaymentStatus];
  if (status in RETURN_STATUS_CONFIG) return RETURN_STATUS_CONFIG[status as ReturnStatus];
  return { label: status, color: 'bg-gray-100 text-gray-800', icon: 'Circle' };
}

/** Generic status badge used everywhere for order, payment, and return statuses. */
export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const config = getStatusConfig(status);
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-medium',
        config.color,
        sizeClasses,
      )}
    >
      {config.label}
    </span>
  );
}
