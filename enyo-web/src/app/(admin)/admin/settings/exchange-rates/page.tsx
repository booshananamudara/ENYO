'use client';

import { useEffect, useState } from 'react';
import { apiGet, apiPut } from '@/lib/api-client';
import { ExchangeRateEditor } from '@/components/admin/exchange-rate-editor';

interface ExchangeRate {
  id: string;
  currency: string;
  baseRate: number;
  surchargePercent: number;
  isActive: boolean;
}

export default function ExchangeRatesPage() {
  const [rates, setRates] = useState<ExchangeRate[]>([]);

  useEffect(() => {
    apiGet<ExchangeRate[]>('/api/exchange-rates').then(setRates).catch(() => {});
  }, []);

  async function handleSave(id: string, data: { baseRate: number; surchargePercent: number; isActive: boolean }) {
    try {
      await apiPut(`/api/exchange-rates`, { id, ...data });
      setRates((prev) => prev.map((r) => (r.id === id ? { ...r, ...data } : r)));
    } catch { /* empty */ }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Exchange Rates</h1>
      <ExchangeRateEditor rates={rates} onSave={handleSave} />
    </div>
  );
}
