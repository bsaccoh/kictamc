import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

export interface PaginationState {
  page: number;
  limit: number;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  reset: () => void;
}

export const DEFAULT_PAGE_SIZE = 15;

export function usePagination(defaultLimit: number = DEFAULT_PAGE_SIZE): PaginationState {
  const [searchParams, setSearchParams] = useSearchParams();

  const page = useMemo(() => {
    const raw = Number(searchParams.get('page'));
    return Number.isFinite(raw) && raw > 0 ? Math.floor(raw) : 1;
  }, [searchParams]);

  const limit = useMemo(() => {
    const raw = Number(searchParams.get('limit'));
    return Number.isFinite(raw) && raw > 0 ? Math.floor(raw) : defaultLimit;
  }, [searchParams, defaultLimit]);

  const setPage = useCallback(
    (next: number) => {
      const params = new URLSearchParams(searchParams);
      if (next <= 1) {
        params.delete('page');
      } else {
        params.set('page', String(next));
      }
      setSearchParams(params, { replace: true });
    },
    [searchParams, setSearchParams]
  );

  const setLimit = useCallback(
    (next: number) => {
      const params = new URLSearchParams(searchParams);
      params.delete('page');
      if (next === defaultLimit) {
        params.delete('limit');
      } else {
        params.set('limit', String(next));
      }
      setSearchParams(params, { replace: true });
    },
    [searchParams, setSearchParams, defaultLimit]
  );

  const reset = useCallback(() => {
    const params = new URLSearchParams(searchParams);
    params.delete('page');
    params.delete('limit');
    setSearchParams(params, { replace: true });
  }, [searchParams, setSearchParams]);

  return { page, limit, setPage, setLimit, reset };
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
