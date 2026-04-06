interface WelcomeEmailProps {
  name: string;
}

export function WelcomeEmail({ name }: WelcomeEmailProps) {
  return (
    <div style={{ fontFamily: 'sans-serif', maxWidth: 600, margin: '0 auto' }}>
      <div style={{ backgroundColor: '#1B3A5C', padding: '24px', textAlign: 'center' as const }}>
        <h1 style={{ color: '#fff', margin: 0 }}>ShopEnyo</h1>
      </div>
      <div style={{ padding: '24px' }}>
        <h2>Welcome, {name}!</h2>
        <p>Thanks for joining ShopEnyo. Here is how to get started:</p>
        <ol>
          <li style={{ marginBottom: 8 }}>Install the <a href="https://chromewebstore.google.com/detail/lhoapedkalbdndadogkiiegndiknpnjg" style={{ color: '#2E75B6' }}><strong>EnyoCart Chrome Extension</strong></a></li>
          <li style={{ marginBottom: 8 }}>Browse any online store and add products to your cart</li>
          <li style={{ marginBottom: 8 }}>Come back to <strong>ShopEnyo.com</strong> and checkout once</li>
        </ol>
        <p>We support 10+ payment methods including credit cards, crypto, and local payment options.</p>
      </div>
      <div style={{ backgroundColor: '#F5F8FB', padding: 16, textAlign: 'center' as const, fontSize: 12, color: '#888' }}>
        ShopEnyo — Shop Anywhere. Checkout Once.
      </div>
    </div>
  );
}
