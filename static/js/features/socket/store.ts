import { ISocketBlockInfo } from '@/types/socket';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface BlockInfoState {
  blockInfo: Record<number, ISocketBlockInfo | undefined>;
  setBlockInfo: (chainId: number, block: ISocketBlockInfo) => void;
}

export const useBlockInfoStore = create<BlockInfoState>()(
  devtools(
    (set) => ({
      blockInfo: {},
      setBlockInfo: (chainId, block) =>
        set((state) => ({
          blockInfo: {
            ...state.blockInfo,
            [chainId]: block,
          },
        })),
    }),
    {
      name: 'block-info-store',
    },
  ),
);
