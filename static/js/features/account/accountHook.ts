import { CHAIN_ID } from '@derivation-tech/context';
import _ from 'lodash';
import { useMemo } from 'react';

import { FETCHING_STATUS } from '@/constants';
import { WrappedAccount } from '@/entities/WrappedAccount';
import { useAppSelector } from '@/hooks';
import { IMetaAccount } from '@/types/account';
import { getAccountId } from '@/utils/transform/transformId';

import { useWrappedInstrument, useWrappedInstrumentMap } from '../futures/hooks';
import { useTokenPrices } from '../global/query';
import { useWrappedOrderListByUser } from './orderHook';
import { usePositionListByUser } from './positionHook';
import { useWrappedRangeListByUser } from './rangeHook';
import { selectAccountMap, selectAccountStatus, selectMetaAccount } from './slice';

export function useMetaAccountMap(
  chainId: CHAIN_ID | undefined,
  userAddr: string | undefined,
): {
  [accountId: string]: IMetaAccount;
} {
  const chainMetaAccount = useAppSelector(selectAccountMap(chainId, userAddr));

  return useMemo(() => {
    if (chainMetaAccount) return chainMetaAccount;
    return {};
  }, [chainMetaAccount]);
}

export function useAccountStatus(chainId: CHAIN_ID | undefined, userAddr: string | undefined): FETCHING_STATUS {
  const fetchingStatus = useAppSelector(selectAccountStatus(chainId, userAddr));

  return fetchingStatus;
}

export function useMetaAccount(
  chainId: CHAIN_ID | undefined,
  userAddr: string | undefined,
  accountId: string | undefined,
): IMetaAccount | undefined {
  const metaAccount = useAppSelector(selectMetaAccount(chainId, userAddr, accountId));
  return metaAccount;
}

export function useWrappedAccount(
  chainId: CHAIN_ID | undefined,
  userAddr: string | undefined,
  accountId: string | undefined,
): WrappedAccount | undefined {
  const metaAccount = useMetaAccount(chainId, userAddr, accountId);
  const wrappedInstrument = useWrappedInstrument(chainId, metaAccount?.instrumentId);
  return useMemo(() => {
    if (!chainId || !userAddr || !wrappedInstrument) return undefined;
    const origin = metaAccount;
    if (origin) {
      const account = WrappedAccount.getInstance(origin.id, chainId);
      if (!account) {
        return WrappedAccount.wrapInstance({ metaAccount: origin, rootInstrument: wrappedInstrument, chainId });
      } else {
        account.fillField(origin);
      }
      return account;
    }
    return undefined;
  }, [chainId, metaAccount, userAddr, wrappedInstrument]);
}

export function useWrappedAccountByinstrumentId(
  chainId: CHAIN_ID | undefined,
  userAddr: string | undefined,
  instrumentId: string | undefined,
): WrappedAccount | undefined {
  const metaAccount = useMetaAccount(
    chainId,
    userAddr,
    instrumentId && userAddr ? getAccountId(userAddr, instrumentId) : undefined,
  );
  return useWrappedAccount(chainId, userAddr, metaAccount?.id);
}

export function useWrappedAccountMap(
  chainId: CHAIN_ID | undefined,
  userAddr: string | undefined,
): {
  [accountId: string]: WrappedAccount;
} {
  const metaAccountMap = useMetaAccountMap(chainId, userAddr);

  const wrappedInstrumentMap = useWrappedInstrumentMap(chainId);

  return useMemo(() => {
    if (!chainId || !userAddr) return {};
    return _.reduce(
      metaAccountMap,
      (res, origin) => {
        const wrappedInstrument = wrappedInstrumentMap[origin.instrumentId];
        if (wrappedInstrument) {
          const account = WrappedAccount.wrapInstance({
            metaAccount: origin,
            chainId,
            rootInstrument: wrappedInstrument,
          });
          res[origin.id] = account;
        }
        return res;
      },
      {} as { [accountId: string]: WrappedAccount },
    );
  }, [chainId, userAddr, metaAccountMap, wrappedInstrumentMap]);
}

export function useWrappedAccountList(chainId: CHAIN_ID | undefined, userAddr: string | undefined): WrappedAccount[] {
  const accountMap = useWrappedAccountMap(chainId, userAddr);
  const { data: tokenPrices } = useTokenPrices({ chainId });
  useWrappedRangeListByUser(chainId, userAddr);
  usePositionListByUser(chainId, userAddr);
  useWrappedOrderListByUser(chainId, userAddr);
  return useMemo(() => {
    const list = Object.values(accountMap || {}).filter((a) => !!a) as WrappedAccount[];
    if (!accountMap || !tokenPrices) return list;
    _.forIn(accountMap, (account) => {
      const priceInfo = tokenPrices?.[account.rootInstrument?.marginToken?.address];
      if (priceInfo) {
        account.rootInstrument.setQuotePrice(priceInfo);
      }
    });
    return list;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accountMap, tokenPrices]);
}

export function useIsWrappingAccount(chainId: CHAIN_ID | undefined, userAddr: string | undefined): boolean {
  const metaAccountMap = useMetaAccountMap(chainId, userAddr);
  return useMemo(() => {
    if (!chainId || !userAddr) return false;
    const instances = WrappedAccount.getInstanceMap(chainId);

    return Object.keys(metaAccountMap).length > 0 && Object.keys(instances || {}).length === 0;
  }, [chainId, userAddr, metaAccountMap]);
}
