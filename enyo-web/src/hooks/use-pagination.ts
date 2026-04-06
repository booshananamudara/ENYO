'use client';

import { useState, useMemo } from 'react';

/** Reusable pagination logic hook. */
export function usePagination(total: number, pageSize: number = 20) {
  const [page, setPage] = useState(1);
  const totalPages = useMemo(() => Math.ceil(total / pageSize), [total, pageSize]);

  function goToPage(p: number) {
    setPage(Math.max(1, Math.min(p, totalPages)));
  }

  function nextPage() {
    goToPage(page + 1);
  }

  function prevPage() {
    goToPage(page - 1);
  }

  return { page, totalPages, setPage: goToPage, nextPage, prevPage, pageSize };
}
