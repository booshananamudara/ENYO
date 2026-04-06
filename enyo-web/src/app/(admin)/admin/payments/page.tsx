'use client';

import { useEffect, useState, useCallback } from 'react';
import { apiGet } from '@/lib/api-client';
import { DataTable, type ColumnDef } from '@/components/shared/data-table';
import { StatusBadge } from '@/components/shared/status-badge';
import { CurrencyDisplay } from '@/components/shared/currency-display';
import { StatsCard } from '@/components/admin/stats-card';
import { DollarSign, Clock, CreditCard } from 'lucide-react';
import { format } from 'date-fns';
import { formatCurrency } from '@/lib/utils';
import type { PaymentSummary, PaymentStatus, PaymentMethod } from '@/lib/types/payment';
import type { PaginatedResponse } from '@/lib/types/api';

const columns: ColumnDef<PaymentSummary>[] = [
  { key: 'id', header: 'TX ID', cell: (row) => <span className="font-mono text-xs">{row.id.slice(0, 8)}...</span> },
  { key: 'orderNumber', header: 'Order #', cell: (row) => row.orderNumber },
  { key: 'amount', header: 'Amount', cell: (row) => <CurrencyDisplay amount={row.amount} currency={row.currency} /> },
  { key: 'method', header: 'Method', cell: (row) => row.method },
  { key: 'status', header: 'Status', cell: (row) => <StatusBadge status={row.status as PaymentStatus} size="sm" /> },
  { key: 'createdAt', header: 'Date', cell: (row) => format(new Date(row.createdAt), 'MMM d, yyyy') },
];

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<PaymentSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [stats, setStats] = useState({ totalProcessed: 0, feesCollected: 0, pendingAmount: 0 });
  const [isLoading, setIsLoading] = useState(true);

  const fetchPayments = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await apiGet<PaginatedResponse<PaymentSummary>>('/api/payments', { page: String(page), pageSize: '20' });
      setPayments(res.data);
      setTotal(res.total);
    } catch { /* empty */ } finally {
      setIsLoading(false);
    }
  }, [page]);

  useEffect(() => { fetchPayments(); }, [fetchPayments]);
  useEffect(() => {
    apiGet<typeof stats>('/api/payments', { type: 'stats' }).then(setStats).catch(() => {});
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Payments</h1>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatsCard title="Total Processed" value={formatCurrency(stats.totalProcessed)} icon={<DollarSign className="h-5 w-5 text-success" />} />
        <StatsCard title="Fees Collected" value={formatCurrency(stats.feesCollected)} icon={<CreditCard className="h-5 w-5 text-accent" />} />
        <StatsCard title="Pending Amount" value={formatCurrency(stats.pendingAmount)} icon={<Clock className="h-5 w-5 text-warning" />} />
      </div>
      <DataTable columns={columns} data={payments} total={total} page={page} pageSize={20} onPageChange={setPage} isLoading={isLoading} emptyMessage="No payments found" getRowId={(row) => row.id} />
    </div>
  );
}
