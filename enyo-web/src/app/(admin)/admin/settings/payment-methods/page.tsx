'use client';

import { useState } from 'react';
import { PAYMENT_METHOD_REGISTRY } from '@/lib/constants';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function PaymentMethodsPage() {
  const methods = Object.values(PAYMENT_METHOD_REGISTRY);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Payment Methods</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {methods.map((method) => (
          <Card key={method.key}>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="font-medium">{method.label}</p>
                <p className="text-sm text-muted-foreground">{method.category}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-xs px-2 py-1 rounded ${method.enabledByDefault ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                  {method.enabledByDefault ? 'Active' : 'Inactive'}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
