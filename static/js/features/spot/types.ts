import { TokenInfo } from '@/types/token';

export enum SPOT_TYPE {
  SWAP = 'swap',
}

export type TokenInfoInSpot = TokenInfo & {
  isSymbolDuplicated: boolean;
};
