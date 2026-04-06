'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { apiGet } from '@/lib/api-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CurrencyDisplay } from '@/components/shared/currency-display';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft } from 'lucide-react';
import type { UserProfile } from '@/lib/types/user';

export default function AdminCustomerDetailPage() {
  const params = useParams();
  const [customer, setCustomer] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    apiGet<UserProfile>(`/api/customers/${params.customerId}`)
      .then(setCustomer)
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [params.customerId]);

  if (isLoading || !customer) {
    return <div className="space-y-4"><Skeleton className="h-8 w-64" /><Skeleton className="h-64 w-full" /></div>;
  }

  return (
    <div className="space-y-6">
      <Link href="/admin/customers" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-accent">
        <ArrowLeft className="h-4 w-4" /> Back to Customers
      </Link>
      <h1 className="text-2xl font-bold">{customer.name}</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Profile</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p><span className="text-muted-foreground">Email:</span> {customer.email}</p>
            <p><span className="text-muted-foreground">Phone:</span> {customer.phone ?? 'N/A'}</p>
            <p><span className="text-muted-foreground">Role:</span> {customer.role}</p>
            <p><span className="text-muted-foreground">ENYO Credit:</span> <CurrencyDisplay amount={customer.enyoCredit} /></p>
            <p><span className="text-muted-foreground">Joined:</span> {new Date(customer.createdAt).toLocaleDateString()}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
