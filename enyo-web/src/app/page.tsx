import Link from 'next/link';
import {
  CreditCard,
  Bitcoin,
  Coins,
  DollarSign,
  QrCode,
  Landmark,
  Banknote,
  Wallet,
  Download,
  ShoppingBag,
  CheckCircle,
  Shield,
  Zap,
  Heart,
  ArrowRight,
} from 'lucide-react';
import { PAYMENT_METHOD_REGISTRY } from '@/lib/constants';
import { Navbar } from '@/components/storefront/navbar';
import { Footer } from '@/components/storefront/footer';

const ICON_MAP: Record<string, React.ElementType> = {
  CreditCard,
  Bitcoin,
  Coins,
  DollarSign,
  QrCode,
  Landmark,
  Banknote,
  Wallet,
};

const STEPS = [
  {
    icon: Download,
    title: 'Install Extension',
    description: 'Add the free EnyoCart browser extension to Chrome, Firefox, or Edge in one click.',
  },
  {
    icon: ShoppingBag,
    title: 'Add Products',
    description: 'Browse any supported store and click "Add to Enyo Cart" on products you love.',
  },
  {
    icon: CheckCircle,
    title: 'Checkout Once',
    description: 'Review your aggregated cart and pay once with your preferred payment method.',
  },
];

const BENEFITS = [
  {
    icon: Heart,
    title: 'Easier',
    description: 'No more juggling tabs, carts, and checkouts across different stores. One cart for everything.',
  },
  {
    icon: Zap,
    title: 'Faster',
    description: 'Skip repetitive address and payment entry. Save your details once and reuse them everywhere.',
  },
  {
    icon: Shield,
    title: 'Safer',
    description: 'Your payment info stays with ShopEnyo. We handle vendor payments so you never share card details with unknown stores.',
  },
];

export default function LandingPage() {
  const enabledMethods = Object.values(PAYMENT_METHOD_REGISTRY).filter(
    (m) => m.enabledByDefault,
  );

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary via-primary/95 to-accent py-24 sm:py-32">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(46,117,182,0.3),transparent_70%)]" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight">
            Shop Anywhere.{' '}
            <span className="text-accent-foreground/90">Checkout Once.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-white/80">
            Aggregate products from any online store into a single cart. Pay once with
            credit card, crypto, or local payment methods — we handle the rest.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="https://chromewebstore.google.com/detail/lhoapedkalbdndadogkiiegndiknpnjg"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg bg-white px-8 py-3 text-sm font-semibold text-primary shadow-lg transition hover:bg-white/90"
            >
              <Download className="h-4 w-4" />
              Get EnyoCart Extension
            </a>
            <a
              href="#how-it-works"
              className="inline-flex items-center gap-2 rounded-lg border border-white/30 px-8 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Learn More
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 sm:py-28 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              How It Works
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Three simple steps to a unified shopping experience.
            </p>
          </div>
          <div className="mt-16 grid grid-cols-1 gap-12 md:grid-cols-3">
            {STEPS.map((step, idx) => (
              <div key={step.title} className="relative text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-accent/10">
                  <step.icon className="h-8 w-8 text-accent" />
                </div>
                <span className="absolute -top-2 -left-2 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-white md:left-auto md:-top-3 md:right-1/2 md:translate-x-[calc(50%+2.5rem)]">
                  {idx + 1}
                </span>
                <h3 className="mt-6 text-xl font-semibold">{step.title}</h3>
                <p className="mt-2 text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Supported Payment Methods */}
      <section className="py-20 sm:py-28 bg-surface">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Supported Payment Methods
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Pay with the method that works best for you.
            </p>
          </div>
          <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {enabledMethods.map((method) => {
              const Icon = ICON_MAP[method.icon] ?? Wallet;
              return (
                <div
                  key={method.key}
                  className="flex items-center gap-3 rounded-lg border bg-white p-4 transition hover:shadow-md"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent/10">
                    <Icon className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{method.label}</p>
                    {method.supportedCurrencies.length > 0 && (
                      <p className="text-xs text-muted-foreground">
                        {method.supportedCurrencies.join(', ')}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 sm:py-28 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Why ShopEnyo?
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              A better way to shop online across every store.
            </p>
          </div>
          <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-3">
            {BENEFITS.map((benefit) => (
              <div
                key={benefit.title}
                className="rounded-xl border p-8 text-center transition hover:shadow-lg"
              >
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-accent/10">
                  <benefit.icon className="h-7 w-7 text-accent" />
                </div>
                <h3 className="mt-6 text-xl font-semibold">{benefit.title}</h3>
                <p className="mt-3 text-muted-foreground">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-primary to-accent py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            Ready to simplify your shopping?
          </h2>
          <p className="mt-4 text-lg text-white/80">
            Join thousands of shoppers who use EnyoCart to save time and money.
          </p>
          <a
            href="https://chromewebstore.google.com/detail/lhoapedkalbdndadogkiiegndiknpnjg"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-flex items-center gap-2 rounded-lg bg-white px-8 py-3 text-sm font-semibold text-primary shadow-lg transition hover:bg-white/90"
          >
            <Download className="h-4 w-4" />
            Install EnyoCart Free
          </a>
        </div>
      </section>

      <Footer />
    </div>
  );
}
