'use client';

import { useEffect, useState } from 'react';
import { DataTable, type ColumnDef } from '@/components/shared/data-table';
import { CurrencyDisplay } from '@/components/shared/currency-display';

interface ProductLog {
  vendorName: string;
  productTitle: string;
  productUrl: string;
  timesPurchased: number;
  totalRevenue: number;
}

const columns: ColumnDef<ProductLog>[] = [
  { key: 'productTitle', header: 'Product', cell: (row) => (
    <a href={row.productUrl} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">{row.productTitle}</a>
  )},
  { key: 'vendorName', header: 'Vendor', cell: (row) => row.vendorName },
  { key: 'timesPurchased', header: 'Purchases', cell: (row) => row.timesPurchased, sortable: true },
  { key: 'totalRevenue', header: 'Revenue', cell: (row) => <CurrencyDisplay amount={row.totalRevenue} /> },
];

export default function AdminProductsPage() {
  const [products] = useState<ProductLog[]>([]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Products</h1>
      <p className="text-muted-foreground">Log of all purchased products across orders.</p>
      <DataTable columns={columns} data={products} total={products.length} page={1} pageSize={20} onPageChange={() => {}} emptyMessage="No products purchased yet" />
    </div>
  );
}
