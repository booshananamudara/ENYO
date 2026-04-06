'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import type { OrderItemDetail } from '@/lib/types/order';

interface ReturnRequestFormProps {
  items: OrderItemDetail[];
  onSubmit: (data: { items: { orderItemId: string; quantity: number; reason?: string }[]; reason: string }) => void;
  isLoading?: boolean;
}

/** Form for requesting a return on delivered order items. */
export function ReturnRequestForm({ items, onSubmit, isLoading }: ReturnRequestFormProps) {
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [reason, setReason] = useState('');

  function handleToggleItem(itemId: string) {
    setSelectedItems((prev) => {
      const next = new Set(prev);
      if (next.has(itemId)) next.delete(itemId);
      else next.add(itemId);
      return next;
    });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (selectedItems.size === 0 || !reason.trim()) return;
    onSubmit({
      items: Array.from(selectedItems).map((id) => ({
        orderItemId: id,
        quantity: items.find((i) => i.id === id)?.quantity ?? 1,
      })),
      reason: reason.trim(),
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label className="mb-2 block">Select items to return</Label>
        <div className="space-y-2">
          {items.map((item) => (
            <label key={item.id} className="flex items-center gap-3 rounded border p-3 cursor-pointer hover:bg-surface/50">
              <Checkbox
                checked={selectedItems.has(item.id)}
                onCheckedChange={() => handleToggleItem(item.id)}
              />
              <span className="text-sm">{item.productTitle} (x{item.quantity})</span>
            </label>
          ))}
        </div>
      </div>
      <div>
        <Label htmlFor="reason">Reason for return *</Label>
        <Textarea
          id="reason"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Please explain why you'd like to return these items..."
          required
        />
      </div>
      <Button type="submit" disabled={isLoading || selectedItems.size === 0 || !reason.trim()}>
        {isLoading ? 'Submitting...' : 'Submit Return Request'}
      </Button>
    </form>
  );
}
