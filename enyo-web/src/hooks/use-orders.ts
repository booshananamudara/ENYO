'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiGet } from '@/lib/api-client';
import type { OrderSummary } from '@/lib/types/order';
import type { PaginatedResponse } from '@/lib/types/api';

/** Hook for fetching paginated orders. */
export function useOrders(initialPage = 1) {
  const [data, setData] = useState<OrderSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(initialPage);
  const [isLoading, setIsLoading] = useState(true);

  const fetchOrders = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await apiGet<PaginatedResponse<OrderSummary>>('/api/orders', {
        page: String(page),
        pageSize: '10',
      });
      setData(result.data);
      setTotal(result.total);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setIsLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  return { data, total, page, setPage, isLoading, refetch: fetchOrders };
}
