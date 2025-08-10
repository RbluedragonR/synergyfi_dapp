import { SPOT_KLINE_INTERVAL } from '@/constants/spot';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
// 0 sell 1 buy
interface SpotState {
  token0: TokenInfoInSpot;
  setToken0: (token: TokenInfoInSpot | undefined) => void;
  token1: TokenInfoInSpot;
  setToken1: (token: TokenInfoInSpot | undefined) => void;
  sellAmount: string;
  setSellAmount: (amount: string) => void;
  stepRatio: number;
  setStepRatio: (ratio: number) => void;
  swapping: boolean;
  setSwapping: (swapping: boolean) => void;
  simulationModalOpen: boolean;
  setSimulationModalOpen: (open: boolean) => void;
  poolsToExclude: PoolType[];
  setPoolsToExclude: (setPoolsToExclude: PoolType[]) => void;
  poolsToExcludeTemp: PoolType[];
  setPoolsToExcludeTemp: (setPoolsToExcludeTemp: PoolType[]) => void;
  spotKlineInterval: SPOT_KLINE_INTERVAL;
  setSpotKlineInterval: (interval: SPOT_KLINE_INTERVAL) => void;
  newTxHashForFetchingHistory: string | null;
  setNewTxHashForFetchingHistory: (hash: string | null) => void;
  mobileGraphOpen: boolean;
  setMobileGraphOpen: (open: boolean) => void;
  settingsOpen: boolean;
  setSettingsOpen: (open: boolean) => void;
}

import { PoolType } from '@synfutures/sdks-aggregator';
import { devtools } from 'zustand/middleware';
import { TokenInfoInSpot } from './types';

export const useSpotState = create<SpotState>()(
  devtools(
    persist(
      (set) => ({
        mobileGraphOpen: false,
        setMobileGraphOpen: (mobileGraphOpen) => set(() => ({ mobileGraphOpen })),
        settingsOpen: false,
        setSettingsOpen: (settingsOpen) => set(() => ({ settingsOpen })),
        token0: {
          name: 'USD Coin',
          address: '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913',
          symbol: 'USDC',
          decimals: 6,
          chainId: 8453,
          id: '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913',
          isSymbolDuplicated: false,
        },
        setToken0: (sellToken) => set(() => ({ token0: sellToken }), undefined, 'setToken0'),
        token1: {
          name: 'Wrapped Ether',
          address: '0x4200000000000000000000000000000000000006',
          symbol: 'WETH',
          decimals: 18,
          chainId: 8453,
          id: '0x4200000000000000000000000000000000000006',
          isSymbolDuplicated: false,
        },
        setToken1: (buyToken) => set(() => ({ token1: buyToken }), undefined, 'setToken1'),
        poolsToExclude: [], // Initialize with an empty array
        setPoolsToExclude: (poolsToExclude) => set(() => ({ poolsToExclude }), undefined, 'setPoolsToExclude'),
        poolsToExcludeTemp: [], // Initialize with an empty array
        setPoolsToExcludeTemp: (poolsToExcludeTemp) =>
          set(() => ({ poolsToExcludeTemp }), undefined, 'setPoolsToExcludeTemp'),
        sellAmount: '',
        setSellAmount: (amount) => set(() => ({ sellAmount: amount }), undefined, 'setAmount'),

        stepRatio: 10,
        setStepRatio: (stepRatio) => set(() => ({ stepRatio }), undefined, 'setStepRatio'),

        simulationModalOpen: false,
        setSimulationModalOpen: (simulationModalOpen) =>
          set(() => ({ simulationModalOpen }), undefined, 'setSimulationModalOpen'),

        spotKlineInterval: SPOT_KLINE_INTERVAL.D_1,
        setSpotKlineInterval: (interval) =>
          set(() => ({ spotKlineInterval: interval }), undefined, 'setSpotKlineInterval'),

        swapping: false,
        setSwapping: (swapping) => set(() => ({ swapping }), false, 'setSwapping'),

        newTxHashForFetchingHistory: null,
        setNewTxHashForFetchingHistory: (hash) =>
          set(() => ({ newTxHashForFetchingHistory: hash }), undefined, 'setNewTransactionHashForFetchingHistory'),
      }),
      {
        name: 'spot-storage',
        partialize: (state) => ({
          token0: state.token0,
          token1: state.token1,
          poolsToExclude: state.poolsToExclude,
          poolsToExcludeTemp: state.poolsToExclude,
        }),
        version: 0,
      },
    ),
    { name: 'spot-store' },
  ),
);
