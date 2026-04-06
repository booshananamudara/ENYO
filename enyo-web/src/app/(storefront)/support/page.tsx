'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const FAQ_ITEMS = [
  { q: 'How does ShopEnyo work?', a: 'Install the EnyoCart Chrome extension, browse any online store, add products to your cart, then checkout once on ShopEnyo.com. We handle purchasing from each vendor and ship everything to you.' },
  { q: 'What payment methods are accepted?', a: 'We accept credit/debit cards (Visa, Mastercard, Amex), cryptocurrencies (Bitcoin, Ethereum, USDT), PromptPay, Giropay, iDEAL, and cash payments.' },
  { q: 'How long does shipping take?', a: 'Shipping times vary by vendor and destination. Typically 5-15 business days for international orders. You can track your order status in real-time from your orders page.' },
  { q: 'What is the service fee?', a: 'We charge a 5% service fee on the order subtotal. This covers our purchasing, quality assurance, and customer support services.' },
  { q: 'How do returns work?', a: 'You can request a return within 30 days of delivery. Go to your order detail page and click "Request Return". We\'ll provide a shipping label and process your refund once we receive the items.' },
  { q: 'Is my payment information secure?', a: 'Absolutely. All payments are processed through Bankful.com, a PCI-DSS compliant payment gateway. We never store your card details on our servers.' },
];

export default function SupportPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <h1 className="text-3xl font-bold mb-2">Help & Support</h1>
      <p className="text-muted-foreground mb-8">Find answers or get in touch with our team.</p>

      <div className="space-y-8">
        <Card>
          <CardHeader><CardTitle>Frequently Asked Questions</CardTitle></CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {FAQ_ITEMS.map((item, i) => (
                <AccordionItem key={i} value={`faq-${i}`}>
                  <AccordionTrigger>{item.q}</AccordionTrigger>
                  <AccordionContent>{item.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Contact Us</CardTitle></CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" required />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" required />
                </div>
              </div>
              <div>
                <Label htmlFor="subject">Subject</Label>
                <Input id="subject" required />
              </div>
              <div>
                <Label htmlFor="message">Message</Label>
                <Textarea id="message" rows={5} required />
              </div>
              <Button type="submit">Send Message</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
