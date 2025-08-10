import { CHAIN_ID } from '@derivation-tech/context';
import { QuoteParam } from '@synfutures/sdks-perp';
import _ from 'lodash';

import { TokenInfo } from '@/types/token';
import { bigNumberObjectCheck } from '@/utils';

import { WrappedBigNumber } from './WrappedBigNumber';
import { WrappedToken } from './WrappedToken';

export class WrappedQuote extends WrappedToken {
  static instances: { [chainId: number]: { [quoteId: string]: WrappedQuote } } = {}; // chainId -> quoteId -> WrappedQuote
  quoteParam?: QuoteParam;
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
    super({ chainId, symbol, address, decimals, name, id });
  }

  static getInstance(quoteId: string | undefined, chainId: CHAIN_ID | undefined): WrappedQuote | undefined {
    return quoteId && chainId ? _.get(WrappedQuote.instances, [chainId, quoteId]) : undefined;
  }

  static wrapInstance({ metaToken, chainId }: { metaToken: TokenInfo; chainId: CHAIN_ID }): WrappedQuote {
    let quote = WrappedQuote.getInstance(metaToken.id, chainId);
    if (quote) {
      //   quote.fillField(bigNumberObjectCheck(metaToken));
    } else {
      quote = new WrappedQuote(bigNumberObjectCheck(metaToken));
      _.set(WrappedQuote.instances, [chainId, metaToken.id], quote);
    }
    return quote;
  }
  static getInstanceMap(chainId: CHAIN_ID | undefined): { [quoteId: string]: WrappedQuote } | undefined {
    return chainId ? _.get(WrappedQuote.instances, [chainId], undefined) : undefined;
  }

  setTokenPrice(priceInfo: { current: number; priceChangePercentage24h: number }): void {
    if (priceInfo) {
      this.price = WrappedBigNumber.from(priceInfo.current);
      this.price_change_percentage_24h = WrappedBigNumber.from(priceInfo.priceChangePercentage24h);
    }
  }

  setQuoteParam(quoteParam: QuoteParam | undefined): void {
    if (quoteParam) {
      this.quoteParam = quoteParam;
    }
  }

  toJSON(): TokenInfo & {
    price?: WrappedBigNumber;
    quoteParam?: QuoteParam;
  } {
    return {
      id: this.id,
      chainId: this.chainId,
      symbol: this.symbol,
      address: this.address,
      decimals: this.decimals,
      name: this.name,
      price: this.price,
      quoteParam: this.quoteParam,
    };
  }

  toString(): string {
    return JSON.stringify(this.toJSON());
  }
}
