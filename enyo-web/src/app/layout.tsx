import type { Metadata } from 'next';
import { Providers } from '@/app/providers';
import './globals.css';

export const metadata: Metadata = {
  title: 'ShopEnyo — Shop Anywhere, Checkout Once',
  description:
    'ShopEnyo aggregates products from any online store into a single cart. Install the EnyoCart extension, add products from anywhere, and checkout once with your preferred payment method.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background text-foreground antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
