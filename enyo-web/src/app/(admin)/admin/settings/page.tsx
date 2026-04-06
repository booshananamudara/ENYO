'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Settings</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>General</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Site Name</Label>
              <Input defaultValue="ShopEnyo" />
            </div>
            <div>
              <Label>Support Email</Label>
              <Input defaultValue="support@shopEnyo.com" />
            </div>
            <div>
              <Label>Default Currency</Label>
              <Input defaultValue="USD" />
            </div>
            <Button>Save Settings</Button>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Link href="/admin/settings/exchange-rates">
            <Card className="cursor-pointer hover:border-accent transition-colors">
              <CardContent className="p-6">
                <h3 className="font-semibold">Exchange Rates</h3>
                <p className="text-sm text-muted-foreground">Manage currency exchange rates and surcharges</p>
              </CardContent>
            </Card>
          </Link>
          <Link href="/admin/settings/payment-methods">
            <Card className="cursor-pointer hover:border-accent transition-colors">
              <CardContent className="p-6">
                <h3 className="font-semibold">Payment Methods</h3>
                <p className="text-sm text-muted-foreground">Toggle payment methods and configure fees</p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}
