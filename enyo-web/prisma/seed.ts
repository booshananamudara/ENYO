import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Users
  const adminHash = await hash('admin123', 12);
  const staffHash = await hash('staff123', 12);
  const customerHash = await hash('customer123', 12);

  const superAdmin = await prisma.user.upsert({
    where: { email: 'admin@shopEnyo.com' },
    update: {},
    create: { email: 'admin@shopEnyo.com', passwordHash: adminHash, name: 'Super Admin', role: 'SUPER_ADMIN', emailVerified: new Date() },
  });

  const admin = await prisma.user.upsert({
    where: { email: 'staff@shopEnyo.com' },
    update: {},
    create: { email: 'staff@shopEnyo.com', passwordHash: staffHash, name: 'Staff Member', role: 'ADMIN', emailVerified: new Date() },
  });

  const customer1 = await prisma.user.upsert({
    where: { email: 'alice@example.com' },
    update: {},
    create: { email: 'alice@example.com', passwordHash: customerHash, name: 'Alice Johnson', phone: '+1234567890', emailVerified: new Date() },
  });

  const customer2 = await prisma.user.upsert({
    where: { email: 'bob@example.com' },
    update: {},
    create: { email: 'bob@example.com', passwordHash: customerHash, name: 'Bob Smith', phone: '+0987654321', emailVerified: new Date() },
  });

  const customer3 = await prisma.user.upsert({
    where: { email: 'carol@example.com' },
    update: {},
    create: { email: 'carol@example.com', passwordHash: customerHash, name: 'Carol Williams', emailVerified: new Date() },
  });

  // Addresses
  const addr1 = await prisma.address.create({
    data: { userId: customer1.id, fullName: 'Alice Johnson', line1: '123 Main St', city: 'New York', state: 'NY', postalCode: '10001', country: 'US', isDefault: true },
  });

  const addr2 = await prisma.address.create({
    data: { userId: customer2.id, fullName: 'Bob Smith', line1: '456 Oak Ave', city: 'Los Angeles', state: 'CA', postalCode: '90001', country: 'US', isDefault: true },
  });

  const addr3 = await prisma.address.create({
    data: { userId: customer3.id, fullName: 'Carol Williams', line1: '789 Pine Rd', city: 'London', postalCode: 'SW1A 1AA', country: 'GB', isDefault: true },
  });

  // Orders
  const orders = [
    { userId: customer1.id, addressId: addr1.id, orderNumber: 'ENYO-20260401-A1B2C', status: 'DELIVERED' as const, subtotal: 199.99, items: [
      { productTitle: 'Nike Air Max 90', productUrl: 'https://nike.com/air-max-90', vendorName: 'Nike', quantity: 1, unitPrice: 129.99, totalPrice: 129.99 },
      { productTitle: 'Nike Dri-FIT Tee', productUrl: 'https://nike.com/dri-fit', vendorName: 'Nike', quantity: 2, unitPrice: 35.00, totalPrice: 70.00 },
    ]},
    { userId: customer1.id, addressId: addr1.id, orderNumber: 'ENYO-20260402-D3E4F', status: 'SHIPPED' as const, subtotal: 89.99, items: [
      { productTitle: 'Amazon Echo Dot', productUrl: 'https://amazon.com/echo-dot', vendorName: 'Amazon', quantity: 1, unitPrice: 49.99, totalPrice: 49.99 },
      { productTitle: 'USB-C Cable Pack', productUrl: 'https://amazon.com/usb-c', vendorName: 'Amazon', quantity: 1, unitPrice: 12.99, totalPrice: 12.99 },
      { productTitle: 'Phone Case', productUrl: 'https://amazon.com/phone-case', vendorName: 'Amazon', quantity: 1, unitPrice: 27.01, totalPrice: 27.01 },
    ]},
    { userId: customer2.id, addressId: addr2.id, orderNumber: 'ENYO-20260403-G5H6I', status: 'PROCESSING' as const, subtotal: 349.50, items: [
      { productTitle: 'Sony WH-1000XM5', productUrl: 'https://amazon.com/wh1000xm5', vendorName: 'Amazon', quantity: 1, unitPrice: 349.50, totalPrice: 349.50 },
    ]},
    { userId: customer2.id, addressId: addr2.id, orderNumber: 'ENYO-20260404-J7K8L', status: 'PENDING_PAYMENT' as const, subtotal: 1299.00, items: [
      { productTitle: 'MacBook Air M3', productUrl: 'https://apple.com/macbook-air', vendorName: 'Apple', quantity: 1, unitPrice: 1299.00, totalPrice: 1299.00 },
    ]},
    { userId: customer3.id, addressId: addr3.id, orderNumber: 'ENYO-20260405-M9N0P', status: 'DELIVERED' as const, subtotal: 74.99, items: [
      { productTitle: 'Vintage Denim Jacket', productUrl: 'https://ebay.com/denim-jacket', vendorName: 'eBay', quantity: 1, unitPrice: 74.99, totalPrice: 74.99 },
    ]},
    { userId: customer3.id, addressId: addr3.id, orderNumber: 'ENYO-20260406-Q1R2S', status: 'PAYMENT_CONFIRMED' as const, subtotal: 159.98, items: [
      { productTitle: 'Running Shoes', productUrl: 'https://nike.com/running', vendorName: 'Nike', quantity: 1, unitPrice: 119.99, totalPrice: 119.99 },
      { productTitle: 'Sports Socks 3-Pack', productUrl: 'https://nike.com/socks', vendorName: 'Nike', quantity: 1, unitPrice: 39.99, totalPrice: 39.99 },
    ]},
    { userId: customer1.id, addressId: addr1.id, orderNumber: 'ENYO-20260407-T3U4V', status: 'IN_TRANSIT' as const, subtotal: 59.99, items: [
      { productTitle: 'Kindle Paperwhite', productUrl: 'https://amazon.com/kindle', vendorName: 'Amazon', quantity: 1, unitPrice: 59.99, totalPrice: 59.99 },
    ]},
    { userId: customer2.id, addressId: addr2.id, orderNumber: 'ENYO-20260408-W5X6Y', status: 'CANCELLED' as const, subtotal: 24.99, items: [
      { productTitle: 'Laptop Stand', productUrl: 'https://amazon.com/stand', vendorName: 'Amazon', quantity: 1, unitPrice: 24.99, totalPrice: 24.99 },
    ]},
    { userId: customer3.id, addressId: addr3.id, orderNumber: 'ENYO-20260409-Z7A8B', status: 'ORDERING_FROM_VENDOR' as const, subtotal: 449.00, items: [
      { productTitle: 'iPad Air', productUrl: 'https://apple.com/ipad', vendorName: 'Apple', quantity: 1, unitPrice: 449.00, totalPrice: 449.00 },
    ]},
    { userId: customer1.id, addressId: addr1.id, orderNumber: 'ENYO-20260410-C9D0E', status: 'REFUNDED' as const, subtotal: 34.99, items: [
      { productTitle: 'Wireless Mouse', productUrl: 'https://amazon.com/mouse', vendorName: 'Amazon', quantity: 1, unitPrice: 34.99, totalPrice: 34.99 },
    ]},
  ];

  const paymentMethods = ['CREDIT_CARD', 'CRYPTO_BITCOIN', 'CREDIT_CARD', 'CRYPTO_ETHEREUM', 'CREDIT_CARD', 'PROMPTPAY', 'CREDIT_CARD', 'CREDIT_CARD', 'CRYPTO_USDT', 'CREDIT_CARD'] as const;
  const paymentStatuses = ['CONFIRMED', 'CONFIRMED', 'CONFIRMED', 'PENDING', 'CONFIRMED', 'CONFIRMED', 'CONFIRMED', 'FAILED', 'PROCESSING', 'REFUNDED'] as const;

  for (let i = 0; i < orders.length; i++) {
    const o = orders[i];
    const serviceFee = Math.round(o.subtotal * 0.05 * 100) / 100;
    const total = o.subtotal + serviceFee;

    const order = await prisma.order.create({
      data: {
        orderNumber: o.orderNumber,
        userId: o.userId,
        addressId: o.addressId,
        status: o.status,
        subtotal: o.subtotal,
        serviceFee,
        total,
        currency: 'USD',
        items: { create: o.items },
        payment: {
          create: {
            method: paymentMethods[i],
            status: paymentStatuses[i],
            amount: total,
            currency: 'USD',
            paidAt: paymentStatuses[i] === 'CONFIRMED' ? new Date() : null,
          },
        },
        statusHistory: {
          create: [
            { status: 'PENDING_PAYMENT', note: 'Order created', createdAt: new Date(Date.now() - 7 * 86400000) },
            ...(o.status !== 'PENDING_PAYMENT' ? [{ status: 'PAYMENT_CONFIRMED' as const, note: 'Payment received', createdAt: new Date(Date.now() - 6 * 86400000) }] : []),
            ...((['PROCESSING', 'ORDERING_FROM_VENDOR', 'ORDERED_FROM_VENDOR', 'SHIPPED', 'IN_TRANSIT', 'DELIVERED'].includes(o.status)) ? [{ status: 'PROCESSING' as const, note: 'Processing order', createdAt: new Date(Date.now() - 5 * 86400000) }] : []),
            ...(o.status === 'DELIVERED' ? [{ status: 'SHIPPED' as const, note: 'Shipped', createdAt: new Date(Date.now() - 3 * 86400000) }, { status: 'DELIVERED' as const, note: 'Delivered', createdAt: new Date(Date.now() - 1 * 86400000) }] : []),
          ],
        },
      },
    });
  }

  // Returns
  const deliveredOrders = await prisma.order.findMany({
    where: { status: 'DELIVERED' },
    include: { items: true },
    take: 2,
  });

  if (deliveredOrders[0]) {
    await prisma.return.create({
      data: {
        returnNumber: 'RET-20260410-A1B2C',
        orderId: deliveredOrders[0].id,
        userId: deliveredOrders[0].userId,
        status: 'APPROVED',
        reason: 'Wrong size received',
        items: { create: [{ orderItemId: deliveredOrders[0].items[0].id, quantity: 1, reason: 'Wrong size' }] },
      },
    });
  }

  if (deliveredOrders[1]) {
    await prisma.return.create({
      data: {
        returnNumber: 'RET-20260410-D3E4F',
        orderId: deliveredOrders[1].id,
        userId: deliveredOrders[1].userId,
        status: 'REQUESTED',
        reason: 'Item not as described',
        items: { create: [{ orderItemId: deliveredOrders[1].items[0].id, quantity: 1, reason: 'Not as described' }] },
      },
    });
  }

  // Exchange rate settings
  const fxRates = [
    { currency: 'USD', type: 'fiat', baseRate: 1.0, surchargePercent: 0 },
    { currency: 'EUR', type: 'fiat', baseRate: 0.92, surchargePercent: 2 },
    { currency: 'GBP', type: 'fiat', baseRate: 0.79, surchargePercent: 2 },
    { currency: 'THB', type: 'fiat', baseRate: 34.50, surchargePercent: 3 },
    { currency: 'BTC', type: 'crypto', baseRate: 0.000015, surchargePercent: 1 },
    { currency: 'ETH', type: 'crypto', baseRate: 0.00029, surchargePercent: 1 },
    { currency: 'USDT', type: 'crypto', baseRate: 1.0, surchargePercent: 0.5 },
  ];

  for (const rate of fxRates) {
    await prisma.exchangeRateSetting.upsert({
      where: { currency: rate.currency },
      update: { baseRate: rate.baseRate, surchargePercent: rate.surchargePercent },
      create: rate,
    });
  }

  // App settings
  await prisma.appSetting.upsert({
    where: { key: 'serviceFeePercent' },
    update: { value: 5 },
    create: { key: 'serviceFeePercent', value: 5 },
  });

  await prisma.appSetting.upsert({
    where: { key: 'defaultCurrency' },
    update: { value: 'USD' },
    create: { key: 'defaultCurrency', value: 'USD' as unknown as never },
  });

  console.log('Seed complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
