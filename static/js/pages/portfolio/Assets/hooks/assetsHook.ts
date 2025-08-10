import { CHAIN_ID } from '@derivation-tech/context';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { BALANCE_TYPE } from '@/constants';
import { WrappedBigNumber } from '@/entities/WrappedBigNumber';
import { WrappedPair } from '@/entities/WrappedPair';
import { WrappedQuote } from '@/entities/WrappedQuote';
import { useWrappedOrderListByUser } from '@/features/account/orderHook';
import { usePositionListByUser } from '@/features/account/positionHook';
import { useWrappedRangeListByUser } from '@/features/account/rangeHook';
import { useGateAccountState, useUserGateBalanceList } from '@/features/balance/hook';
import { useWrappedQuoteMap } from '@/features/chain/hook';
import { useBackendChainConfig } from '@/features/config/hook';
import { useTokenPrices } from '@/features/global/query';
import { useMarketList } from '@/features/market/hooks';
import { useFundFlows, useUserAllPendingTokens } from '@/features/portfolio/hook';
import { IAssetsBalance, IAssetsPnl, IAssetsTotals, IPairAssetsBalance } from '@/types/assets';
import { ISimulation } from '@/types/trade';
import _ from 'lodash';

export function useAssetsBalanceMap(
  chainId: CHAIN_ID | undefined,
  userAddr: string | undefined,
  filterOptions?: { isFilterLiq?: boolean },
): {
  [tokenAddr: string]: IAssetsBalance;
} {
  const gateBalanceList = useUserGateBalanceList(chainId, userAddr);

  const marginTokenMap = useWrappedQuoteMap(chainId);
  const positionList = usePositionListByUser(chainId, userAddr, false);
  const orderList = useWrappedOrderListByUser(chainId, userAddr, false);
  const rangeList = useWrappedRangeListByUser(chainId, userAddr, false);
  return useMemo(() => {
    const balanceList: {
      [tokenAddr: string]: IAssetsBalance;
    } = {};

    Object.values(marginTokenMap).forEach((marginToken) => {
      const balanceItem = balanceList[marginToken.address];
      if (!balanceItem) {
        balanceList[marginToken.address] = {
          quote: marginToken,
          balanceInOrder: WrappedBigNumber.ZERO,
          balanceInRange: WrappedBigNumber.ZERO,
          balanceInPosition: WrappedBigNumber.ZERO,
          gateBalance: WrappedBigNumber.ZERO,
          totalBalance: WrappedBigNumber.ZERO,
        };
      }
    });
    if (positionList) {
      positionList.forEach((position) => {
        const marginToken = position.rootInstrument.marginToken;
        const balanceItem = balanceList[marginToken.address];
        balanceItem.balanceInPosition = WrappedBigNumber.from(balanceItem?.balanceInPosition || 0).add(position.equity);
      });
    }
    if (orderList) {
      orderList.forEach((order) => {
        const marginToken = order.rootInstrument.marginToken;
        const balanceItem = balanceList[marginToken.address];
        balanceItem.balanceInOrder = WrappedBigNumber.from(balanceItem?.balanceInOrder || 0).add(order.balance);
      });
    }
    if (rangeList) {
      rangeList.forEach((range) => {
        const marginToken = range.rootInstrument.marginToken;
        const balanceItem = balanceList[marginToken.address];
        balanceItem.balanceInRange = WrappedBigNumber.from(balanceItem?.balanceInRange || 0).add(range.valueLocked);
      });
    }
    if (gateBalanceList) {
      gateBalanceList.forEach((gateBalance) => {
        const balanceItem = balanceList[gateBalance.address];
        balanceItem && (balanceItem.gateBalance = gateBalance.balance);
      });
    }

    Object.values(balanceList).forEach((balanceItem) => {
      balanceItem.totalBalance = WrappedBigNumber.from(0)
        .add(balanceItem?.balanceInPosition || 0)
        .add(balanceItem?.balanceInOrder || 0)
        .add(filterOptions?.isFilterLiq ? 0 : balanceItem?.balanceInRange || 0)
        .add(balanceItem?.gateBalance || 0);
    });
    return balanceList;
  }, [
    filterOptions?.isFilterLiq,
    JSON.stringify(marginTokenMap),
    JSON.stringify(orderList),
    JSON.stringify(positionList),
    JSON.stringify(rangeList),
    JSON.stringify(gateBalanceList),
  ]);
}

export function useAssetsBalanceList(
  chainId: CHAIN_ID | undefined,
  userAddr: string | undefined,
  filterOptions?: { isFilterLiq?: boolean },
  requiredIncludedInQuoteDisplayList?: boolean,
): IAssetsBalance[] {
  const balanceMap = useAssetsBalanceMap(chainId, userAddr, filterOptions);
  const assetBalanceList = useMemo(() => Object.values(balanceMap), [balanceMap]);
  const backendChainConfig = useBackendChainConfig(chainId);
  const { marketPairList } = useMarketList([chainId]);

  const filteredAssets = useMemo(() => {
    return (_.uniq(backendChainConfig?.quoteDisplayList) || []).reduce((acc, symbol) => {
      const asset = assetBalanceList.find((asset) => asset.quote.symbol === symbol);
      if (asset) {
        if (asset.quote) {
          // filter no balance and also not in market pair list
          if (
            marketPairList.some(
              (pair) => pair.quoteToken.address.toLowerCase() === asset.quote.address.toLowerCase(),
            ) ||
            asset.totalBalance?.gt(0)
          ) {
            acc.push(asset);
          }
        }

        // acc.push(asset);
      }
      return acc;
    }, [] as IAssetsBalance[]);
  }, [assetBalanceList, backendChainConfig?.quoteDisplayList, marketPairList]);

  if (!requiredIncludedInQuoteDisplayList) {
    return assetBalanceList;
  } else {
    return filteredAssets;
  }
}
export function useAssetsTotalsInUsd(
  chainId: CHAIN_ID | undefined,
  userAddr: string | undefined,
  filterOptions?: { isFilterLiq?: boolean },
): IAssetsTotals {
  const assetList = useAssetsBalanceList(chainId, userAddr, filterOptions);
  const { isLoading: isLoadingTokenPrices } = useTokenPrices({ chainId });

  const pendingLock = useTotalWithdrawPendingLocked(chainId, userAddr);
  return useMemo(() => {
    const totals = assetList.reduce(
      (acc, v) => {
        acc.inAccount = acc?.inAccount?.add(WrappedBigNumber.from(v.gateBalance || 0).times(v.quote.price || 0));
        acc.inPosition = acc.inPosition?.add(WrappedBigNumber.from(v.balanceInPosition || 0).times(v.quote.price || 0));
        acc.inOrder = acc.inOrder?.add(WrappedBigNumber.from(v.balanceInOrder || 0).times(v.quote.price || 0));
        acc.inLiq = acc.inLiq?.add(WrappedBigNumber.from(v.balanceInRange || 0).times(v.quote.price || 0));

        acc.totalValue = acc.totalValue?.add(WrappedBigNumber.from(v.totalBalance || 0).times(v.quote.price || 0));
        return acc;
      },
      {
        totalValue: WrappedBigNumber.ZERO,
        inPosition: WrappedBigNumber.ZERO,
        inOrder: WrappedBigNumber.ZERO,
        inAccount: WrappedBigNumber.ZERO,
        inLiq: WrappedBigNumber.ZERO,
        inWithdrawPendingLock: WrappedBigNumber.ZERO,
      } as IAssetsTotals,
    );
    if (pendingLock) {
      totals.inWithdrawPendingLock = pendingLock;
      //totals.totalValue = totals.totalValue?.add(pendingLock);
    }
    // show 0 if negative
    if (totals.totalValue?.lt(0)) {
      totals.totalValue = WrappedBigNumber.ZERO;
    }
    return totals;
    // should depend on this
  }, [assetList, pendingLock, isLoadingTokenPrices]);
}
type TAssetPriceAndBalanceMap = {
  [qouteAddress in string]: {
    quote: WrappedQuote;
    balance?: WrappedBigNumber;
  };
};
export function useAssetPnl(
  chainId: CHAIN_ID | undefined,
  userAddr: string | undefined,
): {
  total: WrappedBigNumber;
  list?: IAssetsPnl[];
} {
  const fundFlows = useFundFlows(userAddr, chainId);
  const assetList = useAssetsBalanceList(chainId, userAddr, undefined, true);
  const assetPriceAndBalanceMap: TAssetPriceAndBalanceMap = useMemo(() => {
    return assetList.reduce((prev, curr) => {
      return {
        ...prev,
        [curr.quote.address]: {
          quote: curr.quote,
          balance: curr.totalBalance,
        },
      };
    }, {} as TAssetPriceAndBalanceMap);
  }, [assetList]);
  const pnlDataListAndTotalPnl = useMemo(() => {
    let totalPnlUsd = WrappedBigNumber.ZERO;
    const pnlDataList = fundFlows?.map((flow) => {
      if (assetPriceAndBalanceMap?.[flow?.token?.address]) {
        const { quote, balance } = assetPriceAndBalanceMap?.[flow?.token?.address];
        if (balance && quote?.price) {
          // PnLInQuote(quote) = TotalWithdrawal[totalOut](quote) + totalBalanceValue(quote) - TotalDeposit[totalIn](quote)
          const pnlInToken = WrappedBigNumber.from(flow.totalOut.add(balance).minus(flow.totalIn));
          const pnlInUsd = pnlInToken.mul(quote.price);
          totalPnlUsd = totalPnlUsd.add(pnlInUsd);
          return {
            quote,
            pnlInUsd,
            pnlInToken,
          };
        }
      }

      return {
        quote: flow?.token,
        pnlInUsd: undefined,
        pnlInToken: undefined,
      };
    });
    return {
      total: totalPnlUsd,
      list: pnlDataList,
    };
  }, [assetPriceAndBalanceMap, fundFlows]);
  return pnlDataListAndTotalPnl;
}

export function useAccountDepositWithdrawCheck(
  inputAmount: WrappedBigNumber,
  availableMargin: WrappedBigNumber | undefined,
  walletBalance: WrappedBigNumber,
  type: BALANCE_TYPE,
  chainId: CHAIN_ID | undefined,
): ISimulation | undefined {
  const { t } = useTranslation();
  const { isOperating } = useGateAccountState(chainId);
  return useMemo(() => {
    if (inputAmount.eq(0) || isOperating) {
      return undefined;
    }
    if (type === BALANCE_TYPE.WITHDRAW) {
      if (!availableMargin || inputAmount.gt(availableMargin)) {
        return {
          chainId: chainId || 0,
          message: t('errors.account.insuffMar'),
        };
        return undefined;
      }
    } else {
      if (inputAmount.gt(walletBalance)) {
        return {
          chainId: chainId || 0,
          message: t('errors.account.insuffBal'),
        };
      }
    }
  }, [inputAmount, isOperating, type, availableMargin, chainId, t, walletBalance]);
}

export function usePairAssetBalanceList(
  chainId: CHAIN_ID | undefined,
  userAddr: string | undefined,
): IPairAssetsBalance[] {
  const positionList = usePositionListByUser(chainId, userAddr);
  const orderList = useWrappedOrderListByUser(chainId, userAddr);
  const rangeList = useWrappedRangeListByUser(chainId, userAddr);
  function initEmptyAssetInfo(pair: WrappedPair, assetInfoMap: { [pairId: string]: IPairAssetsBalance } = {}): void {
    if (!assetInfoMap[pair.id]) {
      const quoteToken = pair.rootInstrument.quoteToken;
      assetInfoMap[pair.id] = {
        quote: quoteToken,
        pair: pair,
        balanceInOrder: WrappedBigNumber.ZERO,
        balanceInRange: WrappedBigNumber.ZERO,
        balanceInPosition: WrappedBigNumber.ZERO,
        totalBalance: WrappedBigNumber.ZERO,
      };
    }
  }
  const data = useMemo(() => {
    if (positionList?.length || orderList?.length || rangeList?.length) {
      const assetInfoMap: { [pairId: string]: IPairAssetsBalance } = {};

      if (positionList?.length) {
        positionList.forEach((position) => {
          if (position.rootPair && position.balance.gt(0)) {
            initEmptyAssetInfo(position.rootPair, assetInfoMap);
            assetInfoMap[position.rootPair.id].balanceInPosition = assetInfoMap[
              position.rootPair.id
            ].balanceInPosition.add(position.equity);
          }
        });
      }

      if (orderList?.length) {
        orderList.forEach((order) => {
          if (order.rootPair && order.balance.gt(0)) {
            initEmptyAssetInfo(order.rootPair, assetInfoMap);
            assetInfoMap[order.rootPair.id].balanceInOrder = assetInfoMap[order.rootPair.id].balanceInOrder.add(
              order.balance,
            );
          }
        });
      }

      if (rangeList?.length) {
        rangeList.forEach((range) => {
          if (range.rootPair && range.balance.gt(0)) {
            initEmptyAssetInfo(range.rootPair, assetInfoMap);
            assetInfoMap[range.rootPair.id].balanceInRange = assetInfoMap[range.rootPair.id].balanceInRange.add(
              range.valueLocked,
            );
          }
        });
      }

      return Object.values(assetInfoMap).map((balanceItem) => {
        balanceItem.totalBalance = WrappedBigNumber.from(0)
          .add(balanceItem.balanceInPosition || 0)
          .add(balanceItem.balanceInOrder || 0)
          .add(balanceItem.balanceInRange || 0);
        return balanceItem;
      });
    }
    return [];
  }, [orderList, positionList, rangeList]);
  return data;
}

export function useTotalWithdrawPendingLocked(
  chainId: CHAIN_ID | undefined,
  userAddr: string | undefined,
): WrappedBigNumber | undefined {
  const pendingTokens = useUserAllPendingTokens(chainId, userAddr);
  const { data: priceInfoMap } = useTokenPrices({ chainId });
  return useMemo(() => {
    if (pendingTokens && priceInfoMap) {
      return pendingTokens.reduce((acc, token) => {
        const price = priceInfoMap[token.address]?.current || 0;
        return acc.add(WrappedBigNumber.from(token.pending.amount).times(price));
      }, WrappedBigNumber.ZERO);
    }
  }, [pendingTokens, priceInfoMap]);
}
