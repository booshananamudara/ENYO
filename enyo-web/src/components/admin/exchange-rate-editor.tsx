'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ExchangeRate {
  id: string;
  currency: string;
  baseRate: number;
  surchargePercent: number;
  isActive: boolean;
}

interface ExchangeRateEditorProps {
  rates: ExchangeRate[];
  onSave: (id: string, data: { baseRate: number; surchargePercent: number; isActive: boolean }) => void;
  isLoading?: boolean;
}

/** Editable table of exchange rates with surcharge controls. */
export function ExchangeRateEditor({ rates, onSave, isLoading }: ExchangeRateEditorProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState({ baseRate: 0, surchargePercent: 0, isActive: true });

  function handleEdit(rate: ExchangeRate) {
    setEditingId(rate.id);
    setEditData({ baseRate: rate.baseRate, surchargePercent: rate.surchargePercent, isActive: rate.isActive });
  }

  function handleSave(id: string) {
    onSave(id, editData);
    setEditingId(null);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Exchange Rates & Surcharges</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <table className="w-full text-sm">
            <thead className="bg-surface">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Currency</th>
                <th className="px-4 py-3 text-left font-medium">Base Rate</th>
                <th className="px-4 py-3 text-left font-medium">Surcharge %</th>
                <th className="px-4 py-3 text-left font-medium">Active</th>
                <th className="px-4 py-3 text-left font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rates.map((rate) => (
                <tr key={rate.id} className="border-t">
                  <td className="px-4 py-3 font-medium">{rate.currency}</td>
                  <td className="px-4 py-3">
                    {editingId === rate.id ? (
                      <Input
                        type="number"
                        step="0.00000001"
                        value={editData.baseRate}
                        onChange={(e) => setEditData({ ...editData, baseRate: parseFloat(e.target.value) })}
                        className="w-32"
                      />
                    ) : (
                      rate.baseRate
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {editingId === rate.id ? (
                      <Input
                        type="number"
                        step="0.01"
                        value={editData.surchargePercent}
                        onChange={(e) => setEditData({ ...editData, surchargePercent: parseFloat(e.target.value) })}
                        className="w-24"
                      />
                    ) : (
                      `${rate.surchargePercent}%`
                    )}
                  </td>
                  <td className="px-4 py-3">{rate.isActive ? 'Yes' : 'No'}</td>
                  <td className="px-4 py-3">
                    {editingId === rate.id ? (
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => handleSave(rate.id)} disabled={isLoading}>Save</Button>
                        <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>Cancel</Button>
                      </div>
                    ) : (
                      <Button size="sm" variant="outline" onClick={() => handleEdit(rate)}>Edit</Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
