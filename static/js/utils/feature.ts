import { PERP } from '@/constants';

import { showProperDateString } from './timeUtils';

export function searchPair(
  query: string,
  baseSymbol: string | undefined,
  quoteSymbol: string | undefined,
  expiry: number,
): boolean {
  const pairString = baseSymbol + '' + quoteSymbol + '' + getDisplayExpiry(expiry);
  return pairString.toLowerCase().includes(query.toLowerCase());
}
export function getDisplayExpiry(expiry: number, format = 'MMDD'): string {
  return expiry === 0 ? PERP : showProperDateString({ expiry, format });
}
