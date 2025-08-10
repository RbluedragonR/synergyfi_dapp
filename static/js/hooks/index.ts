import { useMemo } from 'react';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';

import type { AppDispatch, AppState } from '@/features/store';

// Use throughout your app instead of plain `useDispatch` and `useSelector`
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<AppState> = useSelector;

export function useIsDetailPage(): boolean {
  const location = useLocation();
  const params = location.pathname.split('/');
  const isDetailPage = useMemo(() => {
    return params.length > 3;
  }, [params.length]);
  return isDetailPage;
}

export function useIsPlainBgPage(): boolean {
  const location = useLocation();
  return useMemo(() => {
    return (
      location?.pathname.startsWith('/campaign') ||
      location?.pathname.startsWith('/portfolio') ||
      location?.pathname.startsWith('/market') ||
      location.pathname.startsWith('/odyssey') ||
      location.pathname.startsWith('/tgp')
    );
  }, [location?.pathname]);
}

export function useIsShowReferralBgPage(): boolean {
  const location = useLocation();
  return useMemo(() => {
    return location?.pathname.startsWith('/referral');
  }, [location?.pathname]);
}

export function useIsEarnPage(): boolean {
  const location = useLocation();
  return useMemo(() => {
    return location?.pathname === '/earn';
  }, [location?.pathname]);
}

export function useQueryParam(key: string): string | null {
  const location = useLocation();
  return useMemo(() => {
    const params = new URLSearchParams(location.search);
    if (params) {
      return params.get(key);
    }
    return null;
  }, [key, location.search]);
}
