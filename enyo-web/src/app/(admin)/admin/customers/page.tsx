'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { apiGet } from '@/lib/api-client';
import { DataTable, type ColumnDef } from '@/components/shared/data-table';
import { CurrencyDisplay } from '@/components/shared/currency-display';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { format } from 'date-fns';
import type { UserSummary } from '@/lib/types/user';
import type { PaginatedResponse } from '@/lib/types/api';

const columns: ColumnDef<UserSummary>[] = [
  { key: 'name', header: 'Name', cell: (row) => (
    <Link href={`/admin/customers/${row.id}`} className="font-medium text-accent hover:underline">{row.name}</Link>
  )},
  { key: 'email', header: 'Email', cell: (row) => row.email },
  { key: 'totalOrders', header: 'Orders', cell: (row) => row.totalOrders },
  { key: 'lifetimeSpend', header: 'Lifetime Spend', cell: (row) => <CurrencyDisplay amount={row.lifetimeSpend} /> },
  { key: 'createdAt', header: 'Joined', cell: (row) => format(new Date(row.createdAt), 'MMM d, yyyy') },
  { key: 'actions', header: '', cell: (row) => (
    <Link href={`/admin/customers/${row.id}`}><Button size="sm" variant="outline">View</Button></Link>
  )},
];

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<UserSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const fetchCustomers = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: Record<string, string> = { page: String(page), pageSize: '20' };
      if (search) params.search = search;
      const res = await apiGet<PaginatedResponse<UserSummary>>('/api/customers', params);
      setCustomers(res.data);
      setTotal(res.total);
    } catch { /* empty */ } finally {
      setIsLoading(false);
    }
  }, [page, search]);

  useEffect(() => { fetchCustomers(); }, [fetchCustomers]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Customers</h1>
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search customers..." className="pl-10" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
      </div>
      <DataTable columns={columns} data={customers} total={total} page={page} pageSize={20} onPageChange={setPage} isLoading={isLoading} emptyMessage="No customers found" getRowId={(row) => row.id} />
    </div>
  );
}
