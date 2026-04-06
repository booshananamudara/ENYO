interface ShippingUpdateProps {
  orderNumber: string;
  status: string;
  trackingNumber?: string;
}

export function ShippingUpdateEmail({ orderNumber, status, trackingNumber }: ShippingUpdateProps) {
  return (
    <div style={{ fontFamily: 'sans-serif', maxWidth: 600, margin: '0 auto' }}>
      <div style={{ backgroundColor: '#1B3A5C', padding: '24px', textAlign: 'center' as const }}>
        <h1 style={{ color: '#fff', margin: 0 }}>ShopEnyo</h1>
      </div>
      <div style={{ padding: '24px' }}>
        <h2>Shipping Update</h2>
        <p>Your order <strong>{orderNumber}</strong> has a new status:</p>
        <div style={{ backgroundColor: '#F5F8FB', padding: 16, borderRadius: 8, textAlign: 'center' as const }}>
          <p style={{ fontSize: 18, fontWeight: 'bold', color: '#2E75B6' }}>{status}</p>
        </div>
        {trackingNumber && <p style={{ marginTop: 16 }}>Tracking Number: <strong>{trackingNumber}</strong></p>}
      </div>
      <div style={{ backgroundColor: '#F5F8FB', padding: 16, textAlign: 'center' as const, fontSize: 12, color: '#888' }}>
        ShopEnyo — Shop Anywhere. Checkout Once.
      </div>
    </div>
  );
}
