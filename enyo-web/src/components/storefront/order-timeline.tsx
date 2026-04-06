import { format } from 'date-fns';
import { StatusBadge } from '@/components/shared/status-badge';
import type { OrderStatusHistoryEntry } from '@/lib/types/order';

interface OrderTimelineProps {
  history: OrderStatusHistoryEntry[];
}

/** Visual timeline of order status changes. */
export function OrderTimeline({ history }: OrderTimelineProps) {
  return (
    <div className="space-y-0">
      {history.map((entry, idx) => (
        <div key={entry.id} className="flex gap-4">
          <div className="flex flex-col items-center">
            <div className="h-3 w-3 rounded-full bg-accent mt-1.5" />
            {idx < history.length - 1 && <div className="w-0.5 flex-1 bg-border" />}
          </div>
          <div className="pb-6">
            <div className="flex items-center gap-2">
              <StatusBadge status={entry.status} size="sm" />
              <span className="text-xs text-muted-foreground">
                {format(new Date(entry.createdAt), 'MMM d, yyyy h:mm a')}
              </span>
            </div>
            {entry.note && (
              <p className="text-sm text-muted-foreground mt-1">{entry.note}</p>
            )}
            {entry.changedBy && (
              <p className="text-xs text-muted-foreground mt-0.5">by {entry.changedBy}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
