import _ from 'lodash';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { PollingHistoryId } from './type';

interface GlobalState {
  pollingHistoryTx: {
    [chainId: number]: {
      [userAddr: string]: {
        [key in PollingHistoryId]?: string;
      };
    };
  };
  setPollingHistoryTx: (params: {
    userAddress: string;
    chainId: number;
    pollingHistoryId: PollingHistoryId;
    tx?: string;
  }) => void;
}

export const useGlobalStore = create<GlobalState>()(
  devtools(
    (set) => ({
      pollingHistoryTx: {},
      setPollingHistoryTx: ({ userAddress, chainId, pollingHistoryId, tx }) =>
        set((state) => {
          // Create a new state object to ensure re-render
          const newPollingHistoryTx = _.cloneDeep(state.pollingHistoryTx);
          _.set(newPollingHistoryTx, [chainId, userAddress, pollingHistoryId], tx);
          return { pollingHistoryTx: newPollingHistoryTx };
        }),
    }),
    {
      name: 'global-store',
    },
  ),
);
