'use client';

import { PAYMENT_METHOD_REGISTRY } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { CreditCard, Bitcoin, Coins, DollarSign, QrCode, Landmark, Banknote, Wallet } from 'lucide-react';
import type { PaymentMethod } from '@/lib/types/payment';

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  CreditCard,
  Bitcoin,
  Coins,
  DollarSign,
  QrCode,
  Landmark,
  Banknote,
  Wallet,
};

interface PaymentMethodSelectorProps {
  selected: PaymentMethod | null;
  onSelect: (method: PaymentMethod) => void;
}

/** Payment method selector dynamically rendered from the registry. */
export function PaymentMethodSelector({ selected, onSelect }: PaymentMethodSelectorProps) {
  const methods = Object.values(PAYMENT_METHOD_REGISTRY).filter((m) => m.enabledByDefault);
  const grouped = methods.reduce<Record<string, typeof methods>>((acc, m) => {
    if (!acc[m.category]) acc[m.category] = [];
    acc[m.category].push(m);
    return acc;
  }, {});

  const categoryLabels: Record<string, string> = {
    card: 'Card Payments',
    crypto: 'Cryptocurrency',
    bank_transfer: 'Bank Transfer',
    cash: 'Cash',
    other: 'Other',
  };

  return (
    <div className="space-y-4">
      {Object.entries(grouped).map(([category, methods]) => (
        <div key={category}>
          <h3 className="text-sm font-medium text-muted-foreground mb-2">
            {categoryLabels[category] ?? category}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {methods.map((method) => {
              const Icon = ICON_MAP[method.icon] ?? Wallet;
              const isSelected = selected === method.key;
              return (
                <button
                  key={method.key}
                  type="button"
                  onClick={() => onSelect(method.key)}
                  className={cn(
                    'flex items-center gap-3 rounded-lg border p-3 text-left transition-colors',
                    isSelected
                      ? 'border-accent bg-accent/5 ring-2 ring-accent'
                      : 'border-input hover:border-accent/50',
                  )}
                >
                  <Icon className="h-5 w-5 shrink-0 text-accent" />
                  <div>
                    <p className="text-sm font-medium">{method.label}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
