import { CHAIN_ID } from '@derivation-tech/context';
import { useDebounceEffect, useDeepCompareEffect, useDocumentVisibility } from 'ahooks';
import { useEffect, useMemo } from 'react';

import { PAIR_PAGE_TYPE } from '@/constants/global';
import { QUERY_KEYS } from '@/constants/query';
import { useMetaAccountMap } from '@/features/account/accountHook';
import { updatePortfolio } from '@/features/account/actions';
import { changeTokenBalanceAction } from '@/features/balance/actions';
import { updateFuturesFromChain } from '@/features/futures/actions';
import { changeTokenAllowance } from '@/features/user/actions';
import { useSDK } from '@/features/web3/hook';
import { useAppDispatch } from '@/hooks';
import { useDappChainConfig, useUserAddr } from '@/hooks/web3/useChain';
import { queryClient } from '@/pages/App';
import { TokenInfo } from '@/types/token';
import {
  WorkerAllowanceResult,
  WorkerBalanceEventResult,
  WorkerDispatchGateEventResult,
  WorkerDispatchInstrumentEventResult,
  WorkerDispatchPortfolioEventResult,
  WorkerEventNames,
  WorkerFuturesResult,
  WorkerPortfolioResult,
} from '@/types/worker';
import { watchWorkerEvent } from '@/worker/helper';

// listener for user worker event
export function useUserWorkerEventListener(chainId: CHAIN_ID | undefined): void {
  const dispatch = useAppDispatch();
  const userAddr = useUserAddr();
  const sdk = useSDK(chainId);
  // worker balance event listener
  useEffect(() => {
    if (window.userWorker && chainId && userAddr) {
      watchWorkerEvent<WorkerBalanceEventResult>(
        window.userWorker,
        WorkerEventNames.BalanceEvent,
        (data) => {
          const result = data;
          dispatch(changeTokenBalanceAction(result));
        },
        {
          chainId,
          userAddr,
        },
      );

      watchWorkerEvent<WorkerAllowanceResult>(
        window.userWorker,
        WorkerEventNames.UpdateTokenAllowanceEvent,
        (data) => {
          const result = data;
          dispatch(
            changeTokenAllowance({
              token: result.token as TokenInfo,
              allowanceInfo: result.allowanceInfo,
              block: result.block,
              chainId: result.chainId,
              userAddr: result.userAddr,
              sdk: sdk,
            }),
          );
        },
        {
          chainId,
          userAddr,
        },
      );

      watchWorkerEvent<WorkerAllowanceResult>(
        window.userWorker,
        WorkerEventNames.ApprovalEvent,
        (data) => {
          const result = data;
          sdk &&
            dispatch(
              changeTokenAllowance({
                ...result,
                token: result.token as TokenInfo,
                sdk: sdk,
              }),
            );
        },
        {
          chainId,
          userAddr,
        },
      );
    }
  }, [chainId, dispatch, sdk, userAddr]);

  // // worker vault balance event listener
  // useEffect(() => {
  //   if (window.synWorker && chainId && userAddr) {
  //     watchWorkerEvent<WorkerGateBalanceResult>(
  //       window.synWorker,
  //       WorkerEventNames.UpdateGateBalanceEvent,
  //       (data) => {
  //         const result = data;
  //         dispatch(changeTokenGateBalanceAction(result));
  //       },
  //       {
  //         chainId,
  //         userAddr,
  //       },
  //     );
  //   }
  // }, [chainId, dispatch, userAddr]);
}

export function useListenSingleInstrumentEvent(
  chainId: CHAIN_ID | undefined,
  userAddr: string | undefined,
  instrumentAddr: string | undefined,
  pageType = PAIR_PAGE_TYPE.TRADE,
): void {
  const dispatch = useAppDispatch();
  const documentVisibility = useDocumentVisibility();
  const dappConfig = useDappChainConfig(chainId);

  const isDocVisibility = useMemo(() => {
    return documentVisibility === 'visible';
  }, [documentVisibility]);

  // trigger single instrument event listener, change pair will remove other instrument listener
  // trigger watch account event
  useDebounceEffect(
    () => {
      if (chainId && userAddr && instrumentAddr && isDocVisibility) {
        let needListener = true;
        if (dappConfig?.wssEventListener?.trade === false && pageType === PAIR_PAGE_TYPE.TRADE) {
          needListener = false;
        } else if (dappConfig?.wssEventListener?.earn === false && pageType === PAIR_PAGE_TYPE.EARN) {
          needListener = false;
        }
        if (needListener) {
          window.synWorker.postMessage({
            eventName: WorkerEventNames.InstrumentUpdateEvent,
            data: {
              chainId,
              userAddr,
              instrumentAddr,
            },
          });
        }
      }

      return () => {
        chainId &&
          window.synWorker?.postMessage({
            eventName: WorkerEventNames.RemoveAllInstrumentEventListener,
            data: {
              chainId,
            },
          });
      };
    },
    [chainId, dispatch, userAddr, instrumentAddr, isDocVisibility],
    { wait: 500 },
  );

  useEffect(() => {
    if (window.synWorker && userAddr && chainId && isDocVisibility) {
      watchWorkerEvent<WorkerPortfolioResult>(
        window.synWorker,
        WorkerEventNames.InstrumentUpdateEvent,
        (data) => {
          dispatch(updatePortfolio(data));
        },
        {
          chainId,
          userAddr,
        },
      );
    }
  }, [chainId, dispatch, userAddr, isDocVisibility]);

  useEffect(() => {
    return () => {
      chainId &&
        window.synWorker?.postMessage({
          eventName: WorkerEventNames.RemoveAllSocketEventListener,
          data: {
            chainId,
          },
        });
    };
  }, [chainId]);

  useEffect(() => {
    if (!isDocVisibility) {
      chainId &&
        window.synWorker?.postMessage({
          eventName: WorkerEventNames.RemoveAllSocketEventListener,
          data: {
            chainId,
          },
        });
    }
  }, [isDocVisibility]);

  // watch futures event listener
  useEffect(() => {
    if (window.synWorker && chainId) {
      watchWorkerEvent<WorkerFuturesResult>(
        window.synWorker,
        WorkerEventNames.UpdateFuturesEvent,
        (data) => {
          const result = data;
          dispatch(
            updateFuturesFromChain({
              chainId,
              block: result.block,
              futuresRecord: result.futuresRecord,
            }),
          );
        },
        {
          chainId,
        },
      );
    }
  }, [chainId, dispatch]);

  // watch futures event listener
  useEffect(() => {
    if (window.synWorker && chainId) {
      watchWorkerEvent<WorkerDispatchInstrumentEventResult>(
        window.synWorker,
        WorkerEventNames.DispatchInstrumentUpdateEvent,
        (data) => {
          const result = data;
          console.record('event', 'DispatchInstrumentEvent:', result.eventName, result);

          queryClient.invalidateQueries({ queryKey: QUERY_KEYS.FUTURES.INSTRUMENT(chainId, instrumentAddr) });
          queryClient.invalidateQueries({
            queryKey: QUERY_KEYS.FUTURES.PAIR_INFO(chainId, instrumentAddr, result.expiry),
          });
        },
        {
          chainId,
        },
      );
    }
  }, [chainId, dispatch]);

  // watch portfolio event listener
  useEffect(() => {
    if (window.synWorker && chainId) {
      watchWorkerEvent<WorkerDispatchPortfolioEventResult>(
        window.synWorker,
        WorkerEventNames.DispatchPortfolioUpdateEvent,
        (data) => {
          const result = data;
          console.record('event', 'DispatchPortfolioUpdateEvent:', result.eventName, result);

          queryClient.invalidateQueries({
            queryKey: QUERY_KEYS.PORTFOLIO.PORTFOLIO(chainId, userAddr, result.instrumentAddr, result.expiry),
          });
        },
        {
          chainId,
        },
      );
    }
  }, [chainId, dispatch]);

  // watch account event listener
  useEffect(() => {
    if (window.synWorker && userAddr && chainId) {
      watchWorkerEvent<WorkerPortfolioResult>(
        window.synWorker,
        WorkerEventNames.UpdatePortfolioEvent,
        (data) => {
          dispatch(updatePortfolio(data));
        },
        {
          chainId,
          userAddr,
        },
      );
    }
  }, [chainId, dispatch, userAddr]);
}

// listen all user's account event
export function useListenUserAccountsEvent(chainId: CHAIN_ID | undefined, userAddr: string | undefined): void {
  const dappConfig = useDappChainConfig(chainId);
  const documentVisibility = useDocumentVisibility();
  const accountMap = useMetaAccountMap(chainId, userAddr);
  const involvedInstrumentAddrList = useMemo(() => {
    return Object.values(accountMap || {}).map((account) => account.instrumentId);
  }, [accountMap]);

  const isDocVisibility = useMemo(() => {
    return documentVisibility === 'visible';
  }, [documentVisibility]);

  // only listen account change on instrument address change
  // also remove all event when doc is not visible
  useDeepCompareEffect(() => {
    if (chainId && userAddr && involvedInstrumentAddrList?.length && isDocVisibility) {
      let needListener = false;
      if (dappConfig?.wssEventListener?.portfolio === true) {
        needListener = true;
      }
      if (needListener) {
        involvedInstrumentAddrList.forEach((instrumentAddr) => {
          window.synWorker.postMessage({
            eventName: WorkerEventNames.InstrumentUpdateEvent,
            data: {
              chainId,
              userAddr,
              instrumentAddr,
            },
          });
        });
      }
    }

    return () => {
      chainId &&
        window.synWorker?.postMessage({
          eventName: WorkerEventNames.RemoveAllInstrumentEventListener,
          data: {
            chainId,
          },
        });
    };
  }, [chainId, userAddr, involvedInstrumentAddrList, isDocVisibility]);
}

export function useListenGateEvent(chainId: CHAIN_ID | undefined, userAddr: string | undefined): void {
  const dispatch = useAppDispatch();
  const documentVisibility = useDocumentVisibility();

  const isDocVisibility = useMemo(() => {
    return documentVisibility === 'visible';
  }, [documentVisibility]);

  useDebounceEffect(
    () => {
      if (chainId && userAddr) {
        window.synWorker.postMessage({
          eventName: WorkerEventNames.WatchGateEvent,
          data: {
            chainId,
            userAddr,
          },
        });
      }
      return () => {
        chainId &&
          window.synWorker?.postMessage({
            eventName: WorkerEventNames.RemoveAllGateEventListener,
            data: {
              chainId,
            },
          });
      };
    },
    [userAddr, chainId, dispatch],
    { wait: 500 },
  );

  useEffect(() => {
    if (window.synWorker && userAddr && chainId && isDocVisibility) {
      watchWorkerEvent<WorkerDispatchGateEventResult>(
        window.synWorker,
        WorkerEventNames.DispatchGateUpdateEvent,
        (data) => {
          const result = data;
          console.record('event', 'DispatchGateUpdateEvent:', result.eventName, result);
          result.chainId &&
            result.userAddr &&
            queryClient.invalidateQueries({
              queryKey: QUERY_KEYS.BALANCE.GATE(result.chainId, result.userAddr),
            });
        },
        {
          chainId,
          userAddr,
        },
      );
    }
  }, [chainId, dispatch, userAddr, isDocVisibility]);
}
