'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { apiGet } from '@/lib/api-client';
import { DataTable, type ColumnDef } from '@/components/shared/data-table';
import { StatusBadge } from '@/components/shared/status-badge';
import { CurrencyDisplay } from '@/components/shared/currency-display';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { format } from 'date-fns';
import { ORDER_STATUSES, type OrderStatus, type OrderSummary } from '@/lib/types/order';
import { STATUS_CONFIG } from '@/lib/constants';
import type { PaginatedResponse } from '@/lib/types/api';

const columns: ColumnDef<OrderSummary>[] = [
  { key: 'orderNumber', header: 'Order #', cell: (row) => (
    <Link href={`/admin/orders/${row.id}`} className="font-medium text-accent hover:underline">{row.orderNumber}</Link>
  )},
  { key: 'itemCount', header: 'Items', cell: (row) => row.itemCount },
  { key: 'total', header: 'Total', cell: (row) => <CurrencyDisplay amount={row.total} currency={row.currency} /> },
  { key: 'status', header: 'Status', cell: (row) => <StatusBadge status={row.status as OrderStatus} size="sm" /> },
  { key: 'createdAt', header: 'Date', cell: (row) => format(new Date(row.createdAt), 'MMM d, yyyy'), sortable: true },
  { key: 'actions', header: '', cell: (row) => (
    <Link href={`/admin/orders/${row.id}`}><Button size="sm" variant="outline">View</Button></Link>
  )},
];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const fetchOrders = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: Record<string, string> = { page: String(page), pageSize: '20' };
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      const res = await apiGet<PaginatedResponse<OrderSummary>>('/api/orders', params);
      setOrders(res.data);
      setTotal(res.total);
    } catch { /* empty */ } finally {
      setIsLoading(false);
    }
  }, [page, search, statusFilter]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Orders</h1>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search orders..." className="pl-10" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
        </div>
        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v === 'ALL' ? '' : v); setPage(1); }}>
          <SelectTrigger className="w-48"><SelectValue placeholder="All Statuses" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Statuses</SelectItem>
            {ORDER_STATUSES.map((s) => <SelectItem key={s} value={s}>{STATUS_CONFIG[s].label}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <DataTable columns={columns} data={orders} total={total} page={page} pageSize={20} onPageChange={setPage} isLoading={isLoading} emptyMessage="No orders found" getRowId={(row) => row.id} />
    </div>
  );
}
