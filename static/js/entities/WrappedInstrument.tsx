import { BlockInfo, CHAIN_ID } from '@derivation-tech/context';
import { BigNumber } from 'ethers';
import _ from 'lodash';

import { MARGIN_TYPE } from '@/types/global';
import { IMetaInstrument } from '@/types/pair';
import { TokenInfo } from '@/types/token';
import { bigNumberObjectCheck } from '@/utils';
import { toBN } from '@/utils/numberUtil';
import { getMarginTypeByFeeder, isInverseType } from '@/utils/pairs';
import { isNativeTokenInfo } from '@/utils/token';

import {
  Amm,
  BaseInfo,
  DexV2Feeder,
  FeederType,
  InstrumentCondition,
  Instrument as InstrumentInterface,
  InstrumentMarket,
  InstrumentSetting,
  MarketType,
  Status,
  TokenInfo as Token,
} from '@synfutures/sdks-perp';
import { WrappedBigNumber } from './WrappedBigNumber';
import { WrappedPair } from './WrappedPair';
import { WrappedQuote } from './WrappedQuote';

const UNSETTLED_PAIR_STATUS = [Status.TRADING, Status.SETTLING, Status.DORMANT];

export class WrappedInstrument implements InstrumentInterface {
  static instances: { [chainId: number]: { [instrumentId: string]: WrappedInstrument } } = {}; // chainId -> instrumentId -> WrappedFutures

  // redundant fields
  instrumentAddr: string;

  // basic fields
  symbol: string;
  market: InstrumentMarket;
  condition: InstrumentCondition;
  setting: InstrumentSetting;
  spotPrice: BigNumber;
  // expiry => amm
  amms: Map<number, Amm>;
  base: BaseInfo;
  quote: Token;
  displayBase: BaseInfo;
  displayQuote: Token;

  // additional fields
  instrumentType: FeederType;
  marketType: MarketType;
  minTradeValue: BigNumber;
  minOrderValue: BigNumber;
  minRangeValue: BigNumber;
  placePaused: boolean;
  fundingHour: number;
  minTickDelta: number;

  blockInfo?: BlockInfo;

  pairMap: Record<string, WrappedPair> = {};
  baseToken: TokenInfo;
  quoteToken: WrappedQuote;
  chainId: number;
  metaFutures: IMetaInstrument;

  customStableInstruments: string[] = [];
  constructor(metaFutures: IMetaInstrument, chainId: CHAIN_ID) {
    this.instrumentAddr = metaFutures.instrumentAddr;
    this.symbol = metaFutures.symbol;
    this.market = metaFutures.market;
    this.condition = metaFutures.condition;
    this.setting = metaFutures.setting;
    this.spotPrice = metaFutures.spotPrice;
    this.amms = new Map();

    metaFutures.amms.forEach((amm, expiry) => {
      this.amms.set(expiry, bigNumberObjectCheck(amm));
    });

    this.base = metaFutures.base;
    this.quote = metaFutures.quote;
    this.displayBase = metaFutures.displayBase;
    this.displayQuote = metaFutures.displayQuote;
    this.instrumentType = metaFutures.instrumentType;
    this.marketType = metaFutures.marketType;
    this.minTradeValue = metaFutures.minTradeValue;
    this.minOrderValue = metaFutures.minOrderValue;
    this.minRangeValue = metaFutures.minRangeValue;
    this.placePaused = metaFutures.placePaused;
    this.fundingHour = metaFutures.fundingHour;
    this.blockInfo = metaFutures.blockInfo;
    this.minTickDelta = metaFutures.minTickDelta;
    // super(
    //   metaFutures.info,
    //   metaFutures.market,
    //   { ...metaFutures.state, pairStates: new Map(), accounts: new Map() },
    //   metaFutures.spotPrice,
    // );
    this.chainId = chainId;
    this.metaFutures = metaFutures;
    this.baseToken = metaFutures.baseToken;
    this.quoteToken = WrappedQuote.wrapInstance({ metaToken: metaFutures.quoteToken, chainId });
  }

  static getInstance(instrumentId: string | undefined, chainId: CHAIN_ID | undefined): WrappedInstrument | undefined {
    return instrumentId && chainId ? _.get(WrappedInstrument.instances, [chainId, instrumentId]) : undefined;
  }

  static wrapInstance({
    metaFutures,
    chainId,
  }: {
    metaFutures: IMetaInstrument;
    chainId: CHAIN_ID;
  }): WrappedInstrument {
    let futures = WrappedInstrument.getInstance(metaFutures.id, chainId);
    if (futures) {
      futures.fillField(bigNumberObjectCheck(metaFutures));
    } else {
      futures = new WrappedInstrument(bigNumberObjectCheck(metaFutures), chainId);
      _.set(WrappedInstrument.instances, [chainId, metaFutures.id], futures);
    }
    return futures;
  }

  static getInstanceMap(chainId: CHAIN_ID | undefined): { [instrumentId: string]: WrappedInstrument } | undefined {
    return chainId ? _.get(WrappedInstrument.instances, [chainId], undefined) : undefined;
  }

  setMetaData(metaFutures: IMetaInstrument): void {
    this.instrumentAddr = metaFutures.instrumentAddr;
    this.symbol = metaFutures.symbol;
    this.market = metaFutures.market;
    this.condition = metaFutures.condition;
    this.setting = metaFutures.setting;
    this.spotPrice = metaFutures.spotPrice;

    if (!this.amms) this.amms = new Map();
    metaFutures.amms.forEach((amm, expiry) => {
      this.amms.set(expiry, bigNumberObjectCheck(amm));
    });

    this.base = metaFutures.base;
    this.quote = metaFutures.quote;
    this.instrumentType = metaFutures.instrumentType;
    this.marketType = metaFutures.marketType;
    this.minTradeValue = metaFutures.minTradeValue;
    this.minOrderValue = metaFutures.minOrderValue;
    this.minRangeValue = metaFutures.minRangeValue;
    this.blockInfo = metaFutures.blockInfo;
  }

  fillField(partialFutures: Partial<IMetaInstrument>): void {
    const futures = _.merge(
      {},
      this.metaFutures,
      {
        quoteToken: this.quoteToken,
      },
      partialFutures,
    );
    try {
      this.metaFutures = bigNumberObjectCheck(futures);
      this.setMetaData(futures);
    } catch (error) {
      console.error('🚀 ~ WrappedInstrument ~ fillField ~ error:', error, { partialFutures, futures });
    }
  }

  connectPair(expiry: number, pair: WrappedPair): void {
    if (pair.id) {
      this.pairMap[pair.id] = pair;
    }
  }

  setQuotePrice(priceInfo: { current: number; priceChangePercentage24h: number }): void {
    if (priceInfo) {
      this.quoteToken.setTokenPrice(priceInfo);
    }
  }

  /**
   * @returns {string} futures id (futures address)
   */
  get id(): string {
    return this.instrumentAddr.toLowerCase();
  }

  get isInverse(): boolean {
    if (this.metaFutures.isInverse) {
      return true;
    }

    return isInverseType(this.instrumentType);
  }

  get marginType(): MARGIN_TYPE {
    return getMarginTypeByFeeder(this.instrumentType);
  }

  get status(): InstrumentCondition {
    return this.condition;
  }

  get isNormalInstrument(): boolean {
    return this.status === InstrumentCondition.NORMAL || this.status === InstrumentCondition.RESOLVED;
  }

  /**
   * margin token
   *
   * @readonly
   * @type {TokenInfo}
   */
  get marginToken(): WrappedQuote {
    const token = this.quoteToken;

    return token;
    // return {
    //   ...this.marginTokenBalance,
    //   ...token,
    // };
  }

  get priceToken(): TokenInfo {
    return this.isInverse ? this.baseToken : this.quoteToken;
  }

  get unSettledPairs(): Map<string, WrappedPair> {
    return _.reduce(
      _.keys(this.pairMap),
      (acc, curr) => {
        const pair = this.pairMap[curr];
        if (pair && pair.isNormalPair) {
          acc.set(curr, pair);
        }
        return acc;
      },
      new Map(),
    );
  }

  get displayBaseToken(): TokenInfo {
    return this.isInverse ? this.quoteToken : this.baseToken;
  }

  get displayQuoteToken(): TokenInfo {
    return this.isInverse ? this.baseToken : this.quoteToken;
  }

  get initialMarginRatio(): number {
    return this.setting.initialMarginRatio;
  }

  get maintenanceMarginRatio(): number {
    return this.setting.maintenanceMarginRatio;
  }

  getWrappedPair(expiry: number): WrappedPair | undefined {
    return this.pairMap[`${this.id}-${expiry}`];
  }

  get displaySymbol(): string {
    if (this.isInverse) {
      return `${this.quoteToken.symbol}-${this.baseToken.symbol}-${this.market.info.type}`;
    }
    return `${this.baseToken.symbol}-${this.quoteToken.symbol}-${this.market.info.type}`;
  }

  get isStablePair(): boolean {
    if (this.customStableInstruments && this.customStableInstruments.includes(this.symbol)) {
      return true;
    }
    return this.instrumentType === FeederType.BOTH_STABLE;
  }

  set customStableInstrumentsList(list: string[]) {
    this.customStableInstruments = list;
  }
  get isQuoteStable(): boolean {
    return this.instrumentType === FeederType.BOTH_STABLE || this.instrumentType === FeederType.QUOTE_STABLE;
  }

  get dexV2PairAddr(): string | undefined {
    if ([MarketType.DEXV2].includes(this.marketType)) {
      const pairAddr = (this.market.feeder as DexV2Feeder).pair;
      return pairAddr;
    }
  }

  getPairByExpiry(expiry: number): WrappedPair | undefined {
    return this.pairMap[`${this.id}-${expiry}`];
  }

  getAllPairList(sort: 'asc' | 'desc' = 'asc'): WrappedPair[] {
    return _.orderBy(Object.values(this.pairMap), ['expiry'], [sort]);
  }

  getPair(pairId: string): WrappedPair | undefined {
    return this.pairMap[pairId];
  }

  /**
   * get unsettled pair list (TRADING/SETTLING/UNINITIALIZED)
   * @param sort
   * @returns
   */
  getUnsettledPairList(sort: 'asc' | 'desc' = 'asc'): WrappedPair[] {
    const allPairs = this.getAllPairList(sort);
    return allPairs.filter((pair) => UNSETTLED_PAIR_STATUS.includes(pair.status));
  }

  /**
   * get unsettled pair list (TRADING/SETTLING/UNINITIALIZED)
   * @param sort
   * @returns
   */
  getPairList(sort: 'asc' | 'desc' = 'asc'): WrappedPair[] {
    return this.getUnsettledPairList(sort);
  }

  wrapAttribute(prop: keyof WrappedInstrument): WrappedBigNumber {
    if (BigNumber.isBigNumber(this[prop])) {
      let bn = WrappedBigNumber.from(this[prop] as BigNumber);
      if (this.isInverse) {
        if (['spotPrice'].includes(prop)) {
          bn = WrappedBigNumber.from(toBN(1).dividedBy(bn));
        }
      }
      return bn;
    } else if (typeof this[prop] === 'string' || typeof this[prop] === 'number') {
      return WrappedBigNumber.from(this[prop] as unknown as string | number);
    }
    return WrappedBigNumber.ZERO;
  }

  isQuoteWrappedNative(): boolean {
    return isNativeTokenInfo(this.quoteToken);
  }

  /**
   * to JSON
   * @returns IFuturesCore
   */
  toJSON(): IMetaInstrument & {
    // pairs: Record<string, LinkedMetaPair>;
  } {
    return {
      ...this.metaFutures,
      // pairs: _.reduce(
      //   this.pairs,
      //   function (result, value, key) {
      //     result[key] = value.toWrappedJSON();
      //     return result;
      //   },
      //   {} as Record<string, LinkedMetaPair>,
      // ),
    };
  }

  toString(): string {
    return JSON.stringify(this.toJSON());
  }
}
