import _ from 'lodash';

import { PAIR_PAGE_TYPE } from '@/constants/global';
import { LEVERAGE_CHOSEN, MOBILE_MINT_TOASTER, PAIR_CHOSEN } from '@/constants/storage';
import { WrappedBigNumber } from '@/entities/WrappedBigNumber';
import { ILeverageStorage, IMobileMintStorage, IPairStorage, LEVERAGE_KEY_TYPE } from '@/types/storage';

export function getLeverageChosen(): ILeverageStorage {
  const storageStr = localStorage.getItem(LEVERAGE_CHOSEN);
  return storageStr ? JSON.parse(storageStr) : {};
}

export function getSavedPairLeverage(
  userAddr: string | undefined,
  chainId: number | undefined,
  pairId: string | undefined,
  key: LEVERAGE_KEY_TYPE,
): string | undefined {
  const storage = getLeverageChosen();

  const leverage = _.get(storage, [chainId || '', userAddr || '', pairId || '', key]);
  if (WrappedBigNumber.from(leverage).eq(0)) {
    return;
  }
  return leverage;
}

export function savePairLeverage(
  userAddr: string,
  chainId: number,
  pairId: string,
  key: LEVERAGE_KEY_TYPE,
  leverage: string,
): void {
  const storage = getLeverageChosen();
  if (WrappedBigNumber.from(leverage).eq(0)) {
    return;
  }
  _.set(storage, [chainId, userAddr, pairId, key], leverage);
  localStorage.setItem(LEVERAGE_CHOSEN, JSON.stringify(storage));
}
export function getPairChosen(): IPairStorage {
  const storageStr = localStorage.getItem(PAIR_CHOSEN);
  return storageStr ? JSON.parse(storageStr) : {};
}

export function getSavedPairChosen(
  userAddr: string | undefined,
  chainId: number | undefined,
  key: PAIR_PAGE_TYPE,
): string | undefined {
  const storage = getPairChosen();
  return _.get(storage, [chainId || '', userAddr || '', key]);
}

export function savePairChosen(userAddr: string, chainId: number, pairSymbol: string, key: PAIR_PAGE_TYPE): void {
  const storage = getPairChosen();
  _.set(storage, [chainId, userAddr, key], pairSymbol);
  localStorage.setItem(PAIR_CHOSEN, JSON.stringify(storage));
}

export function getMobileMintStorage(): IMobileMintStorage {
  const storageStr = localStorage.getItem(MOBILE_MINT_TOASTER);
  return storageStr ? JSON.parse(storageStr) : {};
}

export function getMobileMint(chainId: number): boolean {
  const storage = getMobileMintStorage();
  return storage[chainId] || false;
}

export function saveMobileMint(chainId: number, hasMint: boolean): void {
  const storage = getMobileMintStorage();
  _.set(storage, [chainId], hasMint);
  localStorage.setItem(MOBILE_MINT_TOASTER, JSON.stringify(storage));
}
