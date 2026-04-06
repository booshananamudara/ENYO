'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getAllowedTransitions } from '@/lib/order-state-machine';
import { STATUS_CONFIG } from '@/lib/constants';
import type { OrderStatus } from '@/lib/types/order';

interface OrderFulfillmentPanelProps {
  orderId: string;
  currentStatus: OrderStatus;
  onStatusChange: (newStatus: OrderStatus, note: string) => void;
  onSaveNotes: (notes: string) => void;
  adminNotes: string | null;
  isLoading?: boolean;
}

/** Admin panel for managing order fulfillment status transitions. */
export function OrderFulfillmentPanel({
  currentStatus,
  onStatusChange,
  onSaveNotes,
  adminNotes,
  isLoading,
}: OrderFulfillmentPanelProps) {
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [note, setNote] = useState('');
  const [notes, setNotes] = useState(adminNotes ?? '');
  const allowedTransitions = getAllowedTransitions(currentStatus);

  function handleStatusChange() {
    if (!selectedStatus) return;
    onStatusChange(selectedStatus as OrderStatus, note);
    setSelectedStatus('');
    setNote('');
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Update Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label>New Status</Label>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Select status..." />
              </SelectTrigger>
              <SelectContent>
                {allowedTransitions.map((status) => (
                  <SelectItem key={status} value={status}>
                    {STATUS_CONFIG[status].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Note (optional)</Label>
            <Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Add a note..." />
          </div>
          <Button onClick={handleStatusChange} disabled={!selectedStatus || isLoading}>
            {isLoading ? 'Updating...' : 'Update Status'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Admin Notes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Internal notes..." rows={4} />
          <Button variant="outline" onClick={() => onSaveNotes(notes)} disabled={isLoading}>
            Save Notes
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
