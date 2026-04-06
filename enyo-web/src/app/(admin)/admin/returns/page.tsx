'use client';

import { useEffect, useState, useCallback } from 'react';
import { apiGet } from '@/lib/api-client';
import { DataTable, type ColumnDef } from '@/components/shared/data-table';
import { StatusBadge } from '@/components/shared/status-badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import type { ReturnSummary, ReturnStatus } from '@/lib/types/return';
import type { PaginatedResponse } from '@/lib/types/api';

const columns: ColumnDef<ReturnSummary>[] = [
  { key: 'returnNumber', header: 'Return #', cell: (row) => <span className="font-medium">{row.returnNumber}</span> },
  { key: 'orderNumber', header: 'Order #', cell: (row) => row.orderNumber },
  { key: 'reason', header: 'Reason', cell: (row) => <span className="truncate max-w-[200px] inline-block">{row.reason}</span> },
  { key: 'itemCount', header: 'Items', cell: (row) => row.itemCount },
  { key: 'status', header: 'Status', cell: (row) => <StatusBadge status={row.status as ReturnStatus} size="sm" /> },
  { key: 'createdAt', header: 'Date', cell: (row) => format(new Date(row.createdAt), 'MMM d, yyyy') },
];

export default function AdminReturnsPage() {
  const [returns, setReturns] = useState<ReturnSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  const fetchReturns = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await apiGet<PaginatedResponse<ReturnSummary>>('/api/returns', { page: String(page), pageSize: '20' });
      setReturns(res.data);
      setTotal(res.total);
    } catch { /* empty */ } finally {
      setIsLoading(false);
    }
  }, [page]);

  useEffect(() => { fetchReturns(); }, [fetchReturns]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Returns</h1>
      <DataTable columns={columns} data={returns} total={total} page={page} pageSize={20} onPageChange={setPage} isLoading={isLoading} emptyMessage="No returns found" getRowId={(row) => row.id} />
    </div>
  );
}
