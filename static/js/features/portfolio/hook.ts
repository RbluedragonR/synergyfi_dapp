// eslint-disable-next-line simple-import-sort/imports
import { CHAIN_ID } from '@derivation-tech/context';
import { BigNumber } from 'ethers';
import { useEffect, useMemo } from 'react';

import { FETCHING_STATUS } from '@/constants';
import { WrappedPortfolio } from '@/entities/WrappedPortfolio';
import { useAppDispatch, useAppSelector } from '@/hooks';
import { useDappChainConfig } from '@/hooks/web3/useChain';
import { TokenInfo } from '@/types/token';

import { POLLING_USER_PENDING_WITHDRAWABLE } from '@/constants/polling';
import { QUERY_KEYS } from '@/constants/query';
import useSocket from '@/hooks/useSocket';
import { queryClient } from '@/pages/App';
import { IFundFlow, ITotalVolume, TQuoteHistoryPrices } from '@/types/portfolio';
import { ISocketPortfolioEvent, MESSAGE_TYPE, SUBSCRIBE_TYPE, UNSUBSCRIBE_TYPE } from '@/types/socket';
import { pollingFunc } from '@/utils';
import { reduceAccounts } from '@/utils/account';
import { currentUnixTime } from '@/utils/timeUtils';
import { isNativeTokenAddr } from '@/utils/token';
import { getAccountId, getPortfolioId } from '@/utils/transform/transformId';
import { Pending } from '@synfutures/sdks-perp';
import { updatePortfolio, updatePortfolioList } from '../account/actions';
import { useQuoteTokens } from '../chain/hook';
import { parseInstrumentToMeta } from '../futures/actions';
import { useSDK } from '../web3/hook';
import { getFundFlows, getTokenPendingParams, getUserPendings } from './actions';
import { useFetchPortfolioListFromApi, useFetchSinglePortfolioFromApi } from './query';
import {
  selectFundFlows,
  selectFundFlowsStatus,
  selectOperateToken,
  selectQuoteHistoryPriceList,
  selectQuoteHistoryPriceListStatus,
  selectSettleFetchingStatus,
  selectSettlePortfolioState,
  selectTokenWithdrawPendingParams,
  selectTotalVolume,
  selectTotalVolumeStatus,
  selectUserAllTokenWithdrawPendings,
  selectUserTokenWithdrawPendings,
  selectWithdrawPendingConfig,
} from './slice';

export function useSettlingPortfolio(
  chainId: CHAIN_ID | undefined,
  userAddr: string | undefined,
): WrappedPortfolio | undefined {
  const settlePortfolio = useAppSelector(selectSettlePortfolioState(chainId, userAddr));
  return settlePortfolio;
}

export function useSettlingStatus(chainId: CHAIN_ID | undefined, userAddr: string | undefined): FETCHING_STATUS {
  return useAppSelector(selectSettleFetchingStatus(chainId, userAddr));
}

export function usePortfolioOperateToken(
  chainId: CHAIN_ID | undefined,
  userAddr: string | undefined,
): TokenInfo | undefined {
  const operateToken = useAppSelector(selectOperateToken(chainId, userAddr));
  const chainConfig = useDappChainConfig(chainId);
  return useMemo(() => {
    if (operateToken) return operateToken;
    if (chainConfig) return chainConfig.wrappedNativeToken;
  }, [chainConfig, operateToken]);
}

export function useWithdrawPendingConfig(chainId: CHAIN_ID | undefined):
  | {
      pendingDuration: number;
    }
  | undefined {
  return useAppSelector(selectWithdrawPendingConfig(chainId));
}

export function useTokenWithdrawPendingParams(
  chainId: CHAIN_ID | undefined,
  tokenAddr: string | undefined,
): (TokenInfo & { threshold: BigNumber }) | undefined {
  return useAppSelector(selectTokenWithdrawPendingParams(chainId, tokenAddr));
}

export function useUserWithdrawPendingToken(
  chainId: CHAIN_ID | undefined,
  userAddr: string | undefined,
  tokenAddr: string | undefined,
): {
  pendingToken?: TokenInfo & { maxWithdrawable: BigNumber; pending: Pending };
  isShowClaim: boolean;
  isShowProgress: boolean;
} {
  const dappConfig = useDappChainConfig(chainId);
  tokenAddr = tokenAddr && isNativeTokenAddr(tokenAddr) ? dappConfig?.wrappedNativeToken?.address : tokenAddr;
  const withdrawPendingConfig = useWithdrawPendingConfig(chainId);
  const pendingToken = useAppSelector(selectUserTokenWithdrawPendings(chainId, userAddr, tokenAddr)) as TokenInfo & {
    maxWithdrawable: BigNumber;
    pending: Pending;
  };
  const isShowClaim = useMemo(() => {
    if (
      pendingToken?.pending?.amount?.gt(0) &&
      pendingToken?.pending?.timestamp &&
      withdrawPendingConfig?.pendingDuration
    ) {
      const currentTime = currentUnixTime();
      if (currentTime > pendingToken?.pending?.timestamp + withdrawPendingConfig?.pendingDuration) {
        return true;
      }
    }
    return false;
  }, [pendingToken?.pending?.amount, pendingToken?.pending?.timestamp, withdrawPendingConfig?.pendingDuration]);

  const isShowProgress = useMemo(() => {
    return pendingToken?.pending?.amount?.gt(0) || false;
  }, [pendingToken?.pending?.amount]);

  return {
    isShowClaim,
    isShowProgress,
    pendingToken,
  };
}

export function useUserAllPendingTokens(
  chainId: CHAIN_ID | undefined,
  userAddr: string | undefined,
): (TokenInfo & { maxWithdrawable: BigNumber; pending: Pending })[] | undefined {
  const tokenMap = useAppSelector(selectUserAllTokenWithdrawPendings(chainId, userAddr));

  return useMemo(() => {
    if (tokenMap) return Object.values(tokenMap);
  }, [tokenMap]);
}

let polling: NodeJS.Timeout | undefined = undefined;

export function useFetchWithdrawPendings(chainId: CHAIN_ID | undefined, userAddr: string | undefined): void {
  const dispatch = useAppDispatch();
  const marginTokens = useQuoteTokens(chainId);
  const sdkContext = useSDK(chainId);
  useEffect(() => {
    chainId &&
      sdkContext &&
      dispatch(
        getTokenPendingParams({
          chainId,
          sdkContext,
          marginTokens,
        }),
      );
  }, [chainId, dispatch, marginTokens, sdkContext]);
  useEffect(() => {
    if (polling) {
      clearTimeout(polling);
    }
    polling = pollingFunc(() => {
      chainId &&
        sdkContext &&
        userAddr &&
        dispatch(
          getUserPendings({
            chainId,
            sdkContext,
            userAddr,
            marginTokens,
          }),
        );
    }, POLLING_USER_PENDING_WITHDRAWABLE);

    return () => {
      if (polling) {
        clearTimeout(polling);
      }
    };
  }, [chainId, dispatch, marginTokens, sdkContext, userAddr]);
}

export function useWithdrawPendingDurationHourly(chainId: CHAIN_ID | undefined): number | undefined {
  const withdrawPendingConfig = useWithdrawPendingConfig(chainId);
  return useMemo(() => {
    if (withdrawPendingConfig?.pendingDuration) return withdrawPendingConfig?.pendingDuration / 3600;
  }, [withdrawPendingConfig?.pendingDuration]);
}

export function useFundFlows(userAddr: string | undefined, chainId: CHAIN_ID | undefined): IFundFlow[] | undefined {
  const flows = useAppSelector(selectFundFlows(chainId, userAddr));
  return useMemo(() => flows, [flows]);
}
export function useFundFlowsStatus(userAddr: string | undefined, chainId: CHAIN_ID | undefined): FETCHING_STATUS {
  const status = useAppSelector(selectFundFlowsStatus(chainId, userAddr));
  return useMemo(() => status, [status]);
}
export function useTotalVolume(userAddr: string | undefined, chainId: CHAIN_ID | undefined): ITotalVolume | undefined {
  const volume = useAppSelector(selectTotalVolume(chainId, userAddr));
  return useMemo(() => volume, [volume]);
}
export function useTotalVolumeStatus(userAddr: string | undefined, chainId: CHAIN_ID | undefined): FETCHING_STATUS {
  const status = useAppSelector(selectTotalVolumeStatus(chainId, userAddr));
  return useMemo(() => status, [status]);
}
export function useQuoteHistoryPriceList(): TQuoteHistoryPrices | undefined {
  const data = useAppSelector(selectQuoteHistoryPriceList());
  return useMemo(() => data, [data]);
}
export function useQuoteHistoryPriceListStatus(): FETCHING_STATUS {
  const status = useAppSelector(selectQuoteHistoryPriceListStatus());
  return useMemo(() => status, [status]);
}
let totalWithdrawPolling: NodeJS.Timeout | undefined = undefined;
export function useFetchFundFlows(chainId: CHAIN_ID | undefined, userAddr: string | undefined): void {
  const dispatch = useAppDispatch();
  const sdkContext = useSDK(chainId);
  const dappConfig = useDappChainConfig(chainId);
  const quoteTokens = useQuoteTokens(chainId);
  useEffect(() => {
    if (totalWithdrawPolling) {
      clearTimeout(totalWithdrawPolling);
    }
    totalWithdrawPolling = pollingFunc(() => {
      chainId &&
        sdkContext &&
        userAddr &&
        dappConfig &&
        quoteTokens &&
        dispatch(getFundFlows({ chainId, sdkContext, userAddr, quoteTokens }));
    }, POLLING_USER_PENDING_WITHDRAWABLE);

    return () => {
      if (totalWithdrawPolling) {
        clearTimeout(totalWithdrawPolling);
      }
    };
  }, [chainId, dappConfig, dispatch, quoteTokens, sdkContext, userAddr]);
}

export function useFetchPortfolioList(chainId: number | undefined, userAddr: string | undefined) {
  const { data: portfolioWithInstrumentList } = useFetchPortfolioListFromApi(chainId, userAddr);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (portfolioWithInstrumentList && chainId && userAddr) {
      if (portfolioWithInstrumentList?.instruments?.length) {
        dispatch(parseInstrumentToMeta({ chainId, instrumentList: portfolioWithInstrumentList?.instruments }));
      }
      const portfolios = portfolioWithInstrumentList?.portfolios;
      if (portfolios?.length) {
        const accountRecord = reduceAccounts(chainId, userAddr, portfolios);
        if (portfolios.length === 1) {
          const portfolio = portfolios[0];

          dispatch(
            updatePortfolio({
              chainId,
              userAddr,
              reducedPortfolio: accountRecord,
              instrumentAddr: portfolio.instrumentAddr,
              expiry: portfolio.expiry,
              block: portfolio?.blockInfo?.height || 0,
            }),
          );
        } else dispatch(updatePortfolioList({ chainId, userAddr, accountRecords: accountRecord }));
      }
    }
  }, [chainId, dispatch, portfolioWithInstrumentList, userAddr]);
}

export function useSinglePortfolio(
  chainId: number | undefined,
  userAddr: string | undefined,
  instrumentAddr: string | undefined,
  expiry: number | undefined,
) {
  const { data: portfolioWithInstrumentList } = useFetchSinglePortfolioFromApi(
    chainId,
    userAddr,
    instrumentAddr,
    expiry,
  );
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (portfolioWithInstrumentList && chainId && userAddr) {
      if (portfolioWithInstrumentList?.instruments?.length) {
        dispatch(parseInstrumentToMeta({ chainId, instrumentList: portfolioWithInstrumentList?.instruments }));
      }
      const portfolios = portfolioWithInstrumentList?.portfolios;
      if (portfolios?.length) {
        const accountRecord = reduceAccounts(chainId, userAddr, portfolios);
        if (portfolios.length === 1) {
          const portfolio = portfolios[0];

          dispatch(
            updatePortfolio({
              chainId,
              userAddr,
              reducedPortfolio: accountRecord,
              instrumentAddr: portfolio.instrumentAddr,
              expiry: portfolio.expiry,
              block: portfolio?.blockInfo?.height || 0,
            }),
          );
        } else dispatch(updatePortfolioList({ chainId, userAddr, accountRecords: accountRecord }));
      }
    }
  }, [chainId, dispatch, portfolioWithInstrumentList, userAddr]);

  const wrappedPortfolio = useMemo(() => {
    if (!chainId || !userAddr || !instrumentAddr || !expiry) return undefined;
    const portfolioId = getPortfolioId(getAccountId(userAddr, instrumentAddr), expiry);
    return WrappedPortfolio.getInstance(portfolioId, chainId);
  }, [chainId, expiry, instrumentAddr, userAddr]);

  return wrappedPortfolio;
}

export function useIsFetchedSinglePortfolio(
  chainId: number | undefined,
  userAddr: string | undefined,
  instrumentAddr: string | undefined,
  expiry: number | undefined,
) {
  const { isFetched } = useFetchSinglePortfolioFromApi(chainId, userAddr, instrumentAddr, expiry);
  return isFetched;
}

export function useIsFetchedPortfolioList(chainId: number | undefined, userAddr: string | undefined) {
  useEffect(() => {
    //
  }, [chainId, userAddr]);

  const { isFetched } = useFetchSinglePortfolioFromApi(chainId, userAddr, undefined, undefined);
  return isFetched;
}

export function useWatchPortfolioChange(chainId: number | undefined, userAddr: string | undefined) {
  const { socket } = useSocket();

  useEffect(() => {
    if (!socket || !chainId || !userAddr) return;
    socket.emit(SUBSCRIBE_TYPE.PORTFOLIO, { chainId: chainId, userAddr });

    socket.on(MESSAGE_TYPE.portfolio, (data: ISocketPortfolioEvent) => {
      console.record('event', MESSAGE_TYPE.portfolio, data);
      if (data.instrumentAddr && data.expiry) {
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.PORTFOLIO.PORTFOLIO(chainId, userAddr, data.instrumentAddr, data.expiry),
        });
      }
      if (data.userAddr) {
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.PORTFOLIO.PORTFOLIO(chainId, userAddr),
        });
      }
    });

    return () => {
      socket.off(MESSAGE_TYPE.portfolio);
      socket.emit(UNSUBSCRIBE_TYPE.PORTFOLIO, { chainId: chainId, userAddr });
    };
  }, [chainId, socket, userAddr]);
}
