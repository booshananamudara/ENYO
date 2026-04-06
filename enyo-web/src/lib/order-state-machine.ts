import type { OrderStatus } from '@/lib/types/order';
import { ConflictError } from '@/lib/errors';
import * as orderRepo from '@/lib/repositories/order.repository';

/** Side-effect callback invoked when an order transitions to a new status. */
type TransitionCallback = (orderId: string, newStatus: OrderStatus) => Promise<void>;

/** Configuration for a single order status node in the state machine. */
interface StatusNode {
  allowedNext: OrderStatus[];
  onTransition?: TransitionCallback;
}

/**
 * Declarative order status transition map.
 * Adding a new status only requires adding a new entry — nothing else changes.
 */
const ORDER_TRANSITIONS: Record<OrderStatus, StatusNode> = {
  PENDING_PAYMENT: {
    allowedNext: ['PAYMENT_CONFIRMED', 'CANCELLED'],
  },
  PAYMENT_CONFIRMED: {
    allowedNext: ['PROCESSING', 'CANCELLED', 'REFUNDED'],
  },
  PROCESSING: {
    allowedNext: ['ORDERING_FROM_VENDOR', 'CANCELLED', 'REFUNDED'],
  },
  ORDERING_FROM_VENDOR: {
    allowedNext: ['ORDERED_FROM_VENDOR', 'CANCELLED', 'REFUNDED'],
  },
  ORDERED_FROM_VENDOR: {
    allowedNext: ['SHIPPED', 'CANCELLED', 'REFUNDED'],
  },
  SHIPPED: {
    allowedNext: ['IN_TRANSIT', 'DELIVERED'],
  },
  IN_TRANSIT: {
    allowedNext: ['OUT_FOR_DELIVERY', 'DELIVERED'],
  },
  OUT_FOR_DELIVERY: {
    allowedNext: ['DELIVERED'],
  },
  DELIVERED: {
    allowedNext: ['REFUNDED'],
  },
  CANCELLED: {
    allowedNext: ['REFUNDED'],
  },
  REFUNDED: {
    allowedNext: [],
  },
};

/** Check whether a transition from one status to another is allowed. */
export function isValidTransition(from: OrderStatus, to: OrderStatus): boolean {
  const node = ORDER_TRANSITIONS[from];
  return node.allowedNext.includes(to);
}

/** Get the list of statuses reachable from the given status. */
export function getAllowedTransitions(from: OrderStatus): OrderStatus[] {
  return ORDER_TRANSITIONS[from].allowedNext;
}

/**
 * Transition an order to a new status.
 * Validates the transition, persists the change, records history, and
 * executes any registered side-effect callback.
 */
export async function transitionOrderStatus(
  orderId: string,
  newStatus: OrderStatus,
  changedBy?: string,
  note?: string,
): Promise<void> {
  const order = await orderRepo.findOrderById(orderId);
  if (!order) {
    throw new ConflictError(`Order ${orderId} not found`);
  }

  const currentStatus = order.status as OrderStatus;
  if (!isValidTransition(currentStatus, newStatus)) {
    throw new ConflictError(
      `Cannot transition order from ${currentStatus} to ${newStatus}`,
    );
  }

  await orderRepo.updateOrderStatus(orderId, newStatus, note, changedBy);

  const node = ORDER_TRANSITIONS[currentStatus];
  if (node.onTransition) {
    await node.onTransition(orderId, newStatus);
  }
}
