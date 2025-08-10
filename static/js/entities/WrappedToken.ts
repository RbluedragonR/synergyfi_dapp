import { CHAIN_ID } from '@derivation-tech/context';

import { TokenInfo } from '@/types/token';

import { WrappedBigNumber } from './WrappedBigNumber';

export class WrappedToken implements TokenInfo {
  static instances: { [chainId: number]: { [quoteId: string]: WrappedToken } } = {}; // chainId -> quoteId -> WrappedToken
  id: string;
  chainId: CHAIN_ID;
  name?: string;
  symbol: string;
  address: string;
  decimals: number;
  price?: WrappedBigNumber;
  price_change_percentage_24h?: WrappedBigNumber;
  color?: string;
  constructor({
    chainId,
    symbol,
    address,
    decimals,
    name,
    id,
  }: {
    chainId: CHAIN_ID;
    symbol: string;
    address: string;
    decimals: number;
    name?: string;
    id: string;
  }) {
    this.chainId = chainId;
    this.symbol = symbol;
    this.address = address.toLowerCase();
    this.decimals = decimals;
    this.name = name;
    this.id = id;
  }

  setTokenPrice(priceInfo: { current: number; priceChangePercentage24h: number }): void {
    if (priceInfo) {
      this.price = WrappedBigNumber.from(priceInfo.current);
      this.price_change_percentage_24h = WrappedBigNumber.from(priceInfo.priceChangePercentage24h);
    }
  }

  toJSON(): TokenInfo & {
    price?: WrappedBigNumber;
  } {
    return {
      id: this.id,
      chainId: this.chainId,
      symbol: this.symbol,
      address: this.address,
      decimals: this.decimals,
      name: this.name,
      price: this.price,
    };
  }

  toString(): string {
    return JSON.stringify(this.toJSON());
  }
}
