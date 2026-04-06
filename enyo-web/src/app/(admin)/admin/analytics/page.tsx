'use client';

import { useEffect, useState } from 'react';
import { apiGet } from '@/lib/api-client';
import { RevenueChart } from '@/components/admin/revenue-chart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { formatCurrency } from '@/lib/utils';

const COLORS = ['#2E75B6', '#1B3A5C', '#27AE60', '#F39C12', '#E74C3C', '#9B59B6'];

export default function AdminAnalyticsPage() {
  const [chartData, setChartData] = useState<{ date: string; revenue: number }[]>([]);
  const [vendorData, setVendorData] = useState<{ vendorName: string; totalRevenue: number }[]>([]);
  const [methodData, setMethodData] = useState<{ method: string; totalAmount: number }[]>([]);

  useEffect(() => {
    apiGet<{ date: string; revenue: number }[]>('/api/analytics', { type: 'revenue' }).then(setChartData).catch(() => {});
    apiGet<{ vendorName: string; totalRevenue: number }[]>('/api/analytics', { type: 'vendors' }).then(setVendorData).catch(() => {});
    apiGet<{ method: string; totalAmount: number }[]>('/api/analytics', { type: 'methods' }).then(setMethodData).catch(() => {});
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Analytics</h1>

      <Tabs defaultValue="30">
        <TabsList>
          <TabsTrigger value="30">30 Days</TabsTrigger>
          <TabsTrigger value="60">60 Days</TabsTrigger>
          <TabsTrigger value="90">90 Days</TabsTrigger>
        </TabsList>
        <TabsContent value="30">
          <RevenueChart data={chartData} title="Revenue (Last 30 Days)" />
        </TabsContent>
        <TabsContent value="60">
          <RevenueChart data={chartData} title="Revenue (Last 60 Days)" />
        </TabsContent>
        <TabsContent value="90">
          <RevenueChart data={chartData} title="Revenue (Last 90 Days)" />
        </TabsContent>
      </Tabs>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Top Vendors</CardTitle></CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={vendorData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="vendorName" fontSize={12} />
                  <YAxis fontSize={12} tickFormatter={(v) => `$${v}`} />
                  <Tooltip formatter={(value: number) => [formatCurrency(value), 'Revenue']} />
                  <Bar dataKey="totalRevenue" fill="#2E75B6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Payment Methods</CardTitle></CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={methodData} dataKey="totalAmount" nameKey="method" cx="50%" cy="50%" outerRadius={80} label>
                    {methodData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => [formatCurrency(value), 'Amount']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
