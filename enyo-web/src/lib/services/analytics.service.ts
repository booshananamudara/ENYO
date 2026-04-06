import * as orderRepo from '@/lib/repositories/order.repository';
import * as paymentRepo from '@/lib/repositories/payment.repository';
import { prisma } from '@/lib/prisma';

/** Dashboard overview stats. */
export async function getDashboardStats() {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekStart = new Date(todayStart);
  weekStart.setDate(weekStart.getDate() - 7);
  const monthStart = new Date(todayStart);
  monthStart.setMonth(monthStart.getMonth() - 1);

  const [todayRevenue, weekRevenue, monthRevenue, pendingOrders, activeReturns, totalCustomers] =
    await Promise.all([
      orderRepo.getRevenueByDateRange(todayStart, now),
      orderRepo.getRevenueByDateRange(weekStart, now),
      orderRepo.getRevenueByDateRange(monthStart, now),
      prisma.order.count({ where: { status: 'PENDING_PAYMENT' } }),
      prisma.return.count({ where: { status: { in: ['REQUESTED', 'APPROVED', 'IN_TRANSIT'] } } }),
      prisma.user.count({ where: { role: 'CUSTOMER' } }),
    ]);

  return {
    todayOrders: todayRevenue.orderCount,
    todayRevenue: todayRevenue.totalRevenue,
    weekOrders: weekRevenue.orderCount,
    weekRevenue: weekRevenue.totalRevenue,
    monthOrders: monthRevenue.orderCount,
    monthRevenue: monthRevenue.totalRevenue,
    pendingOrders,
    activeReturns,
    totalCustomers,
  };
}

/** Revenue chart data for the last N days. */
export async function getRevenueChartData(days: number = 30) {
  const from = new Date();
  from.setDate(from.getDate() - days);
  return orderRepo.getDailyRevenue(from, new Date());
}

/** Top vendors by order count. */
export async function getTopVendors(limit: number = 10) {
  const vendors = await prisma.orderItem.groupBy({
    by: ['vendorName'],
    _count: { id: true },
    _sum: { totalPrice: true },
    orderBy: { _count: { id: 'desc' } },
    take: limit,
  });
  return vendors.map((v) => ({
    vendorName: v.vendorName,
    orderCount: v._count.id,
    totalRevenue: v._sum.totalPrice ? Number(v._sum.totalPrice) : 0,
  }));
}

/** Payment method distribution. */
export async function getPaymentMethodDistribution() {
  const methods = await prisma.payment.groupBy({
    by: ['method'],
    _count: { id: true },
    _sum: { amount: true },
  });
  return methods.map((m) => ({
    method: m.method,
    count: m._count.id,
    totalAmount: m._sum.amount ? Number(m._sum.amount) : 0,
  }));
}

/** Average order value over a period. */
export async function getAverageOrderValue(days: number = 30) {
  const from = new Date();
  from.setDate(from.getDate() - days);
  const result = await prisma.order.aggregate({
    where: {
      createdAt: { gte: from },
      status: { notIn: ['CANCELLED', 'REFUNDED'] },
    },
    _avg: { total: true },
  });
  return result._avg.total ? Number(result._avg.total) : 0;
}

/** Get payment stats for the admin dashboard. */
export async function getPaymentDashboardStats() {
  return paymentRepo.getPaymentStats();
}
