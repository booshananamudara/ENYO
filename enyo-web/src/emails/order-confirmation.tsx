interface OrderConfirmationProps {
  orderNumber: string;
  total: string;
  items: { title: string; quantity: number; price: string }[];
}

export function OrderConfirmationEmail({ orderNumber, total, items }: OrderConfirmationProps) {
  return (
    <div style={{ fontFamily: 'sans-serif', maxWidth: 600, margin: '0 auto' }}>
      <div style={{ backgroundColor: '#1B3A5C', padding: '24px', textAlign: 'center' as const }}>
        <h1 style={{ color: '#fff', margin: 0 }}>ShopEnyo</h1>
      </div>
      <div style={{ padding: '24px' }}>
        <h2>Order Confirmed!</h2>
        <p>Your order <strong>{orderNumber}</strong> has been placed successfully.</p>
        <table style={{ width: '100%', borderCollapse: 'collapse' as const }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #eee' }}>
              <th style={{ textAlign: 'left' as const, padding: 8 }}>Item</th>
              <th style={{ textAlign: 'right' as const, padding: 8 }}>Qty</th>
              <th style={{ textAlign: 'right' as const, padding: 8 }}>Price</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, i) => (
              <tr key={i} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: 8 }}>{item.title}</td>
                <td style={{ padding: 8, textAlign: 'right' as const }}>{item.quantity}</td>
                <td style={{ padding: 8, textAlign: 'right' as const }}>{item.price}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p style={{ fontSize: 18, fontWeight: 'bold', marginTop: 16 }}>Total: {total}</p>
      </div>
      <div style={{ backgroundColor: '#F5F8FB', padding: 16, textAlign: 'center' as const, fontSize: 12, color: '#888' }}>
        ShopEnyo — Shop Anywhere. Checkout Once.
      </div>
    </div>
  );
}
