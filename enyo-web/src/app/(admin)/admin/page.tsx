'use client';

import { useEffect, useState } from 'react';
import { StatsCard } from '@/components/admin/stats-card';
import { RevenueChart } from '@/components/admin/revenue-chart';
import { DataTable, type ColumnDef } from '@/components/shared/data-table';
import { StatusBadge } from '@/components/shared/status-badge';
import { CurrencyDisplay } from '@/components/shared/currency-display';
import { ShoppingCart, DollarSign, Clock, RotateCcw } from 'lucide-react';
import { apiGet } from '@/lib/api-client';
import { formatCurrency } from '@/lib/utils';
import { format } from 'date-fns';
import type { OrderSummary, OrderStatus } from '@/lib/types/order';
import type { PaginatedResponse } from '@/lib/types/api';

interface DashboardStats {
  todayOrders: number;
  todayRevenue: number;
  weekOrders: number;
  weekRevenue: number;
  monthOrders: number;
  monthRevenue: number;
  pendingOrders: number;
  activeReturns: number;
  totalCustomers: number;
}

const orderColumns: ColumnDef<OrderSummary>[] = [
  { key: 'orderNumber', header: 'Order #', cell: (row) => <span className="font-medium">{row.orderNumber}</span> },
  { key: 'status', header: 'Status', cell: (row) => <StatusBadge status={row.status as OrderStatus} size="sm" /> },
  { key: 'total', header: 'Total', cell: (row) => <CurrencyDisplay amount={row.total} currency={row.currency} /> },
  { key: 'createdAt', header: 'Date', cell: (row) => format(new Date(row.createdAt), 'MMM d, yyyy') },
];

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<OrderSummary[]>([]);
  const [chartData, setChartData] = useState<{ date: string; revenue: number }[]>([]);

  useEffect(() => {
    apiGet<DashboardStats>('/api/analytics').then(setStats).catch(() => {});
    apiGet<PaginatedResponse<OrderSummary>>('/api/orders', { page: '1', pageSize: '10' })
      .then((res) => setRecentOrders(res.data))
      .catch(() => {});
    apiGet<{ date: string; revenue: number }[]>('/api/analytics', { type: 'revenue' })
      .then(setChartData)
      .catch(() => {});
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Today's Orders" value={String(stats?.todayOrders ?? 0)} icon={<ShoppingCart className="h-5 w-5 text-accent" />} />
        <StatsCard title="Month Revenue" value={formatCurrency(stats?.monthRevenue ?? 0)} icon={<DollarSign className="h-5 w-5 text-success" />} />
        <StatsCard title="Pending Orders" value={String(stats?.pendingOrders ?? 0)} icon={<Clock className="h-5 w-5 text-warning" />} />
        <StatsCard title="Active Returns" value={String(stats?.activeReturns ?? 0)} icon={<RotateCcw className="h-5 w-5 text-error" />} />
      </div>

      <RevenueChart data={chartData} />

      <div>
        <h2 className="text-lg font-semibold mb-4">Recent Orders</h2>
        <DataTable
          columns={orderColumns}
          data={recentOrders}
          total={recentOrders.length}
          page={1}
          pageSize={10}
          onPageChange={() => {}}
          getRowId={(row) => row.id}
        />
      </div>
    </div>
  );
}
