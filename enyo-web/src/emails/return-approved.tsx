interface ReturnApprovedProps {
  returnNumber: string;
  shippingLabelUrl?: string;
}

export function ReturnApprovedEmail({ returnNumber, shippingLabelUrl }: ReturnApprovedProps) {
  return (
    <div style={{ fontFamily: 'sans-serif', maxWidth: 600, margin: '0 auto' }}>
      <div style={{ backgroundColor: '#1B3A5C', padding: '24px', textAlign: 'center' as const }}>
        <h1 style={{ color: '#fff', margin: 0 }}>ShopEnyo</h1>
      </div>
      <div style={{ padding: '24px' }}>
        <h2>Return Approved</h2>
        <p>Your return <strong>{returnNumber}</strong> has been approved.</p>
        {shippingLabelUrl && (
          <p>
            <a href={shippingLabelUrl} style={{ color: '#2E75B6' }}>Download Shipping Label</a>
          </p>
        )}
        <p>Please ship your items back within 14 days.</p>
      </div>
      <div style={{ backgroundColor: '#F5F8FB', padding: 16, textAlign: 'center' as const, fontSize: 12, color: '#888' }}>
        ShopEnyo — Shop Anywhere. Checkout Once.
      </div>
    </div>
  );
}
