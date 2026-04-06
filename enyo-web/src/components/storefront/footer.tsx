import Link from 'next/link';
import { Logo } from '@/components/shared/logo';

/** Storefront footer with links and branding. */
export function Footer() {
  return (
    <footer className="border-t bg-surface">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-5">
          <div>
            <Logo />
            <p className="mt-2 text-sm text-muted-foreground">
              Shop Anywhere. Checkout Once.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold">Shopping</h3>
            <ul className="mt-3 space-y-2">
              <li><Link href="/orders" className="text-sm text-muted-foreground hover:text-accent">My Orders</Link></li>
              <li><Link href="/returns" className="text-sm text-muted-foreground hover:text-accent">Returns</Link></li>
              <li><Link href="/account" className="text-sm text-muted-foreground hover:text-accent">Account</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold">Extension</h3>
            <ul className="mt-3 space-y-2">
              <li>
                <a
                  href="https://chromewebstore.google.com/detail/lhoapedkalbdndadogkiiegndiknpnjg"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground hover:text-accent"
                >
                  Install EnyoCart
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold">Support</h3>
            <ul className="mt-3 space-y-2">
              <li><Link href="/support" className="text-sm text-muted-foreground hover:text-accent">Help Center</Link></li>
              <li><Link href="/support" className="text-sm text-muted-foreground hover:text-accent">Contact Us</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold">Legal</h3>
            <ul className="mt-3 space-y-2">
              <li><span className="text-sm text-muted-foreground">Privacy Policy</span></li>
              <li><span className="text-sm text-muted-foreground">Terms of Service</span></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} ShopEnyo. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
