import _ from 'lodash';
import { useMemo } from 'react';

import { CHAIN_ID } from '@/constants/chain';
import { WrappedAccount } from '@/entities/WrappedAccount';
import { WrappedPair } from '@/entities/WrappedPair';
import { WrappedPortfolio } from '@/entities/WrappedPortfolio';
import { useAppSelector } from '@/hooks';
import { IMetaPortfolio } from '@/types/account';

import { useWrappedPair, useWrappedPairMap } from '../pair/hook';
import { useWrappedAccount, useWrappedAccountMap } from './accountHook';
import { selectMetaPortfolio, selectMetaPortfolioByPairId, selectPortfolioMap } from './slice';

export function useMetaPortfolioMap(
  chainId: CHAIN_ID | undefined,
  userAddr: string | undefined,
): { [portfolioId: string]: IMetaPortfolio } {
  const metaPortfolioMap = useAppSelector(selectPortfolioMap(chainId, userAddr));

  return metaPortfolioMap;
}

export function useMetaPortfolio(
  chainId: CHAIN_ID | undefined,
  userAddr: string | undefined,
  portfolioId: string | undefined,
): IMetaPortfolio | undefined {
  const metaPortfolio = useAppSelector(selectMetaPortfolio(chainId, userAddr, portfolioId));
  return metaPortfolio;
}

function useBlendWrappedPortfolio({
  metaPortfolio,
  wrappedPair,
  wrappedAccount,
  chainId,
  userAddr,
  portfolioId,
}: {
  metaPortfolio: IMetaPortfolio | undefined;
  wrappedPair: WrappedPair | undefined;
  wrappedAccount: WrappedAccount | undefined;
  chainId: CHAIN_ID | undefined;
  userAddr: string | undefined;
  portfolioId: string | undefined;
}): WrappedPortfolio | undefined {
  return useMemo(() => {
    if (!chainId || !portfolioId || !userAddr || !wrappedPair || !wrappedAccount) return undefined;
    const origin = metaPortfolio;
    if (origin) {
      const portfolio = WrappedPortfolio.getInstance(origin.id, chainId);
      if (!portfolio) {
        return WrappedPortfolio.wrapInstance({
          metaPortfolio: origin,
          rootPair: wrappedPair,
          rootAccount: wrappedAccount,
        });
      } else {
        portfolio.fillField(origin);
      }
      return portfolio;
    }
    return undefined;
  }, [chainId, metaPortfolio, portfolioId, userAddr, wrappedAccount, wrappedPair]);
}

/**
 * get wrapped portfolio by portfolioId
 * @param chainId
 * @param userAddr
 * @param portfolioId
 * @returns {WrappedPortfolio | undefined}
 */
export function useWrappedPortfolio(
  chainId: CHAIN_ID | undefined,
  userAddr: string | undefined,
  portfolioId: string | undefined,
): WrappedPortfolio | undefined {
  const metaPortfolio = useMetaPortfolio(chainId, userAddr, portfolioId);
  const wrappedPair = useWrappedPair(chainId, metaPortfolio?.pairId);
  const wrappedAccount = useWrappedAccount(chainId, userAddr, metaPortfolio?.accountId);
  return useBlendWrappedPortfolio({ chainId, userAddr, metaPortfolio, wrappedPair, wrappedAccount, portfolioId });
}

/**
 * get all wrapped portfolio map
 * @param chainId
 * @param userAddr
 * @returns
 */
export function useWrappedPortfolioMap(
  chainId: CHAIN_ID | undefined,
  userAddr: string | undefined,
): { [portfolioId: string]: WrappedPortfolio } {
  const portfolioMap = useMetaPortfolioMap(chainId, userAddr);
  const wrappedPairMap = useWrappedPairMap(chainId);
  const wrappedAccountMap = useWrappedAccountMap(chainId, userAddr);
  const res = useMemo(() => {
    if (!chainId || !portfolioMap || !wrappedPairMap || !wrappedAccountMap) return {};
    return _.reduce(
      portfolioMap,
      (res, origin) => {
        const wrappedPortfolio = WrappedPortfolio.getInstance(origin.id, chainId);
        if (!wrappedPortfolio) {
          if (wrappedPairMap[origin.pairId] && wrappedAccountMap[origin.accountId]) {
            res[origin.id] = WrappedPortfolio.wrapInstance({
              metaPortfolio: origin,
              rootPair: wrappedPairMap[origin.pairId],
              rootAccount: wrappedAccountMap[origin.accountId],
            });
          }
        } else {
          res[origin.id] = wrappedPortfolio;
        }
        return res;
      },
      {} as { [portfolioId: string]: WrappedPortfolio },
    );
  }, [chainId, portfolioMap, wrappedAccountMap, wrappedPairMap]);

  return res;
}

/**
 * get wrapped portfolio by pairId
 * @param chainId
 * @param userAddr
 * @param pairId
 * @returns {WrappedPortfolio | undefined}
 */
export function useWrappedPortfolioByPairId(
  chainId: CHAIN_ID | undefined,
  userAddr: string | undefined,
  pairId: string | undefined,
): WrappedPortfolio | undefined {
  const metaPortfolio = useAppSelector(selectMetaPortfolioByPairId(chainId, userAddr, pairId));
  const wrappedPair = useWrappedPair(chainId, pairId);
  const wrappedAccount = useWrappedAccount(chainId, userAddr, metaPortfolio?.accountId);
  const portfolio = useBlendWrappedPortfolio({
    chainId,
    userAddr,
    metaPortfolio,
    wrappedPair,
    wrappedAccount,
    portfolioId: metaPortfolio?.id,
  });

  return useMemo(() => {
    const hasWrappedInstance = WrappedPortfolio.hasAnyInstance(chainId);
    if (!portfolio && metaPortfolio && userAddr && wrappedPair && hasWrappedInstance) {
      return WrappedPortfolio.fromEmptyPortfolio(wrappedPair, userAddr);
    }

    return portfolio;
  }, [chainId, metaPortfolio, portfolio, userAddr, wrappedPair]);
}

export function useWrappedPortfolioList(
  chainId: CHAIN_ID | undefined,
  userAddr: string | undefined,
): WrappedPortfolio[] {
  const portfolioMap = useWrappedPortfolioMap(chainId, userAddr);
  return useMemo(() => {
    return _.values(portfolioMap);
  }, [portfolioMap]);
}
