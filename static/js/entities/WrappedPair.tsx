import { BlockInfo, CHAIN_ID } from '@derivation-tech/context';
import { BigNumber } from 'ethers';
import _ from 'lodash';

import { ZERO } from '@/constants';
import { DEFAULT_DECIMALS, PAIR_RATIO_BASE, TRADE_LEVERAGE_THRESHOLDS } from '@/constants/global';
import { IMarketPair, IMetaPair } from '@/types/pair';
import { bigNumberObjectCheck } from '@/utils';
import { getAdjustTradePrice } from '@/utils/pairs';
import { showProperDateString } from '@/utils/timeUtils';
import { getPairId } from '@/utils/transform/transformId';

import { DAPP_CHAIN_CONFIGS } from '@/constants/chain';
import { Amm as AmmInterface, PERP_EXPIRY, Q96, Status, utils, wdiv, wmul } from '@synfutures/sdks-perp';
import { WrappedBigNumber } from './WrappedBigNumber';
import { WrappedInstrument } from './WrappedInstrument';

export class WrappedPair implements AmmInterface {
  // basic fields
  // timestamp of the specified expiry
  expiry: number;
  // for futures, it's the timestamp of moment switched to SETTLING
  // for perpetual, it's the timestamp of last funding fee update
  timestamp: number;
  status: Status;
  tick: number; // current tick. tick = floor(log_{1.0001}(sqrtPX96))
  sqrtPX96: BigNumber; // current price
  liquidity: BigNumber;
  totalLiquidity: BigNumber;
  involvedFund: BigNumber;
  openInterests: BigNumber;
  feeIndex: BigNumber;
  protocolFee: BigNumber;
  totalLong: BigNumber;
  totalShort: BigNumber;
  longSocialLossIndex: BigNumber;
  shortSocialLossIndex: BigNumber;
  longFundingIndex: BigNumber;
  shortFundingIndex: BigNumber;
  insuranceFund: BigNumber;
  settlementPrice: BigNumber;
  // the last updated block number of timestamp
  timestampUpdatedAt?: number;
  // mark price
  markPrice: BigNumber;
  // redundant fields
  instrumentAddr: string;

  // additional fields
  fairPrice: BigNumber;

  blockInfo?: BlockInfo;
  static instances: { [chainId: number]: { [pairId: string]: WrappedPair } } = {}; // chainId -> pairId -> WrappedPair
  public readonly rootInstrument: WrappedInstrument;
  metaPair: IMetaPair;
  stats?: IMarketPair;
  constructor(metaPair: IMetaPair, rootInstrument: WrappedInstrument) {
    this.expiry = metaPair.expiry;
    this.timestamp = metaPair.timestamp;
    this.status = metaPair.status;
    this.tick = metaPair.tick;
    this.sqrtPX96 = metaPair.sqrtPX96;
    this.liquidity = metaPair.liquidity;
    this.totalLiquidity = metaPair.totalLiquidity;
    this.involvedFund = metaPair.involvedFund;
    this.openInterests = metaPair.openInterests;
    this.feeIndex = metaPair.feeIndex;
    this.protocolFee = metaPair.protocolFee;
    this.totalLong = metaPair.totalLong;
    this.totalShort = metaPair.totalShort;
    this.longSocialLossIndex = metaPair.longSocialLossIndex;
    this.shortSocialLossIndex = metaPair.shortSocialLossIndex;
    this.longFundingIndex = metaPair.longFundingIndex;
    this.shortFundingIndex = metaPair.shortFundingIndex;
    this.insuranceFund = metaPair.insuranceFund;
    this.settlementPrice = metaPair.settlementPrice;
    this.timestampUpdatedAt = metaPair.timestampUpdatedAt;
    this.markPrice = metaPair.markPrice;
    this.instrumentAddr = metaPair.instrumentAddr;
    this.fairPrice = metaPair.fairPrice;
    this.blockInfo = metaPair.blockInfo;

    this.metaPair = metaPair;
    this.rootInstrument = rootInstrument;
  }

  setPairStats(stats: IMarketPair): void {
    this.stats = stats;
  }

  static getInstance(pairId: string | undefined, chainId: CHAIN_ID | undefined): WrappedPair | undefined {
    return pairId && chainId ? _.get(WrappedPair.instances, [chainId, pairId]) : undefined;
  }

  static wrapInstance({
    metaPair,
    rootInstrument,
  }: {
    metaPair: IMetaPair;
    rootInstrument: WrappedInstrument;
  }): WrappedPair {
    let pair = WrappedPair.getInstance(metaPair.id, rootInstrument.chainId);
    if (pair) {
      pair.fillField(bigNumberObjectCheck(metaPair));
    } else {
      pair = new WrappedPair(bigNumberObjectCheck(metaPair), rootInstrument);
      _.set(WrappedPair.instances, [rootInstrument.chainId, metaPair.id], pair);
    }
    return pair;
  }

  static getInstanceMap(chainId: CHAIN_ID | undefined): { [pairId: string]: WrappedPair } | undefined {
    return chainId ? _.get(WrappedPair.instances, [chainId], undefined) : undefined;
  }

  setMetaData(metaPair: IMetaPair): void {
    this.expiry = metaPair.expiry;
    this.timestamp = metaPair.timestamp;
    this.status = metaPair.status;
    this.tick = metaPair.tick;
    this.sqrtPX96 = metaPair.sqrtPX96;
    this.liquidity = metaPair.liquidity;
    this.totalLiquidity = metaPair.totalLiquidity;
    this.involvedFund = metaPair.involvedFund;
    this.openInterests = metaPair.openInterests;
    this.feeIndex = metaPair.feeIndex;
    this.protocolFee = metaPair.protocolFee;
    this.totalLong = metaPair.totalLong;
    this.totalShort = metaPair.totalShort;
    this.longSocialLossIndex = metaPair.longSocialLossIndex;
    this.shortSocialLossIndex = metaPair.shortSocialLossIndex;
    this.longFundingIndex = metaPair.longFundingIndex;
    this.shortFundingIndex = metaPair.shortFundingIndex;
    this.insuranceFund = metaPair.insuranceFund;
    this.settlementPrice = metaPair.settlementPrice;
    this.timestampUpdatedAt = metaPair.timestampUpdatedAt;
    this.markPrice = metaPair.markPrice;
    this.instrumentAddr = metaPair.instrumentAddr;
    this.fairPrice = metaPair.fairPrice;
    this.blockInfo = metaPair.blockInfo;
  }

  fillField(partialPair: Partial<IMetaPair>): void {
    const pair = _.merge({}, this.metaPair, partialPair);
    this.metaPair = pair;
    this.setMetaData(pair);
  }
  wrapAttribute(
    prop:
      | keyof WrappedPair
      | 'openInterestsUSD'
      | 'liquidityUSD'
      | 'openInterests'
      | 'tvlUSD'
      | 'tvl'
      | 'liquidity'
      | 'expectedFundingRate'
      | 'fundingRatePerHour'
      | 'liquidityInQuote',
  ): WrappedBigNumber {
    if (BigNumber.isBigNumber(this[prop])) {
      const bn = WrappedBigNumber.from(this[prop] as BigNumber);
      return bn;
    } else if (typeof this[prop] === 'string' || typeof this[prop] === 'number') {
      return WrappedBigNumber.from(this[prop] as unknown as string | number);
    }
    return WrappedBigNumber.ZERO;
  }

  get displayExpiry(): string {
    return showProperDateString({ expiry: this.expiry, format: 'MMDD' });
  }

  get id(): string {
    return `${this.rootInstrument.id}-${this.expiry}`.toLowerCase();
  }

  get chainId(): CHAIN_ID {
    return this.rootInstrument.chainId;
  }

  get symbol(): string {
    return `${this.rootInstrument.symbol}-${showProperDateString({ expiry: this.expiry, format: 'MMDD' })}`;
  }

  get shortSymbol(): string {
    return `${this.rootInstrument.symbol}-${showProperDateString({
      expiry: this.expiry,
      format: 'MMDD',
      showShortPerp: true,
    })}`;
  }

  get isPerpetual(): boolean {
    return this.expiry === PERP_EXPIRY;
  }

  get isInverse(): boolean {
    return this.rootInstrument.isInverse;
  }

  get priceDecimal(): number {
    const chainConfig = DAPP_CHAIN_CONFIGS[this.chainId];
    return (
      _.get(chainConfig.pairPriceDecimals, [this.symbol]) || this.rootInstrument.priceToken.decimals || DEFAULT_DECIMALS
    );
  }

  /**
   * instrument is normal status and pair is normal status
   */
  get isNormalPair(): boolean {
    return this.rootInstrument.isNormalInstrument && this.status !== Status.SETTLED;
  }

  get openInterestsUSD(): WrappedBigNumber {
    if (this.rootInstrument?.marginToken?.price) {
      return WrappedBigNumber.from(this.getOpenInterestsValueUSD(this.rootInstrument?.marginToken?.price.wadValue));
    }

    return WrappedBigNumber.ZERO;
  }

  get expectedFundingRate(): BigNumber | undefined {
    return this.getFundingRate();
  }

  get effectLiqTvl(): WrappedBigNumber | undefined {
    return this.rootInstrument.quoteToken.price
      ?.mul(this.sqrtPX96)
      .mul(this.liquidity)
      .div(WrappedBigNumber.from(Q96))
      .mul(2);
  }

  get volume24h(): WrappedBigNumber | undefined {
    return this.stats?.volume24h ? WrappedBigNumber.from(this.stats?.volume24h) : undefined;
  }

  get volume24hUSD(): WrappedBigNumber | undefined {
    return this.stats?.volume24hUsd;
  }

  get liquidityUSD(): WrappedBigNumber {
    return this.getUSDValue(this.liquidity);
  }

  get tvl(): BigNumber {
    return this.involvedFund;
  }

  get tvlUSD(): WrappedBigNumber {
    return this.getUSDValue(this.involvedFund);
  }

  get liquidityInQuote(): BigNumber {
    const price =
      this.fairPrice?.eq(0) || !this.fairPrice
        ? this.rootInstrument.spotPrice?.eq(0)
          ? BigNumber.from(1)
          : this.rootInstrument.spotPrice
        : this.fairPrice;
    if (price.eq(0)) return ZERO;
    return wdiv(this.liquidity, price);
  }

  get maxLeverage(): number {
    if (this?.rootInstrument?.setting?.initialMarginRatio) {
      return Math.floor(PAIR_RATIO_BASE / this?.rootInstrument?.setting?.initialMarginRatio);
    }
    return TRADE_LEVERAGE_THRESHOLDS.MAX;
  }

  get mmr(): WrappedBigNumber {
    return WrappedBigNumber.from(this.rootInstrument.setting.maintenanceMarginRatio / PAIR_RATIO_BASE);
  }

  get imr(): WrappedBigNumber {
    return WrappedBigNumber.from(this.rootInstrument.setting.initialMarginRatio / PAIR_RATIO_BASE);
  }

  get longOpenInterest(): WrappedBigNumber {
    const totalLong = WrappedBigNumber.from(this.totalLong);
    if (this.isInverse) {
      // return WrappedBigNumber.from(this.totalShort);
    }
    return totalLong;
  }

  get shortOpenInterest(): WrappedBigNumber {
    const totalShort = WrappedBigNumber.from(this.totalShort);
    if (this.isInverse) {
      // return WrappedBigNumber.from(this.totalLong);
    }
    return totalShort;
  }

  get withinDeviationLimit(): boolean {
    return utils.ammWithinDeviationLimit(this, this.rootInstrument.initialMarginRatio);
  }

  get placeOrderLimit(): {
    upperTick: number;
    lowerTick: number;
  } {
    return utils.ammPlaceOrderLimit(this, this.rootInstrument.initialMarginRatio);
  }

  // calc pair funding rate: fairPrice / spotIndex - 1
  getFundingRate(): BigNumber | undefined {
    const funding = this.rootInstrument.spotPrice.eq(0)
      ? undefined
      : utils.getFundingRate(this.rootInstrument, this.expiry);
    return funding;
  }

  get fundingRatePerHour(): BigNumber | undefined {
    return this.expectedFundingRate ? this.expectedFundingRate.div(24) : undefined;
  }

  getUSDValue(value: BigNumber | undefined): WrappedBigNumber {
    if (this.rootInstrument?.marginToken?.price && value) {
      return WrappedBigNumber.from(value).mul(this.rootInstrument?.marginToken?.price);
    }

    return WrappedBigNumber.ZERO;
  }

  // priceInUSD: in wad
  getOpenInterestsValueUSD(price: BigNumber): BigNumber {
    return wmul(wmul(this.openInterests, this.fairPrice), price);
  }

  get fundingFeeRateForLongAndShort(): {
    long: WrappedBigNumber;
    short: WrappedBigNumber;
  } {
    const fundingRatePerHour = this.wrapAttribute('fundingRatePerHour');
    const totalLongPositionOI = this.longOpenInterest;
    const totalShortPositionOI = this.shortOpenInterest;
    let long = fundingRatePerHour.mul(-1).mul(totalShortPositionOI).div(totalLongPositionOI);
    let short = fundingRatePerHour;
    if (fundingRatePerHour.gte(0)) {
      long = fundingRatePerHour.mul(-1);
      short = fundingRatePerHour.mul(totalLongPositionOI).div(totalShortPositionOI);
    }

    return {
      short: short,
      long: long,
    };
  }

  get wrappedFairPrice(): WrappedBigNumber {
    return WrappedBigNumber.from(this.fairPrice);
  }

  toJSON() {
    return {
      ...this.metaPair,

      sqrtPX96: this.sqrtPX96._hex,
      liquidity: this.liquidity._hex,
      totalLiquidity: this.totalLiquidity._hex,
      involvedFund: this.involvedFund._hex,
      openInterests: this.openInterests._hex,
      feeIndex: this.feeIndex._hex,
      protocolFee: this.protocolFee._hex,
      totalLong: this.totalLong._hex,
      totalShort: this.totalShort._hex,
      longSocialLossIndex: this.longSocialLossIndex._hex,
      shortSocialLossIndex: this.shortSocialLossIndex._hex,
      longFundingIndex: this.longFundingIndex._hex,
      shortFundingIndex: this.shortFundingIndex._hex,
      insuranceFund: this.insuranceFund._hex,
      settlementPrice: this.settlementPrice._hex,
      markPrice: this.markPrice._hex,
      fairPrice: this.fairPrice._hex,
    };
  }

  toString(): string {
    return JSON.stringify(this.toJSON());
  }
}

export interface PairData {
  id: string;
  instrumentAddr: string;
  expiry: number;
  APY24h: BigNumber;
  poolFee24h: BigNumber;
  volume24h: BigNumber;
  volume24hUTC0: BigNumber;
  volume7d: BigNumber;
  priceChange24h: BigNumber;
  high24h: BigNumber;
  low24h: BigNumber;
}

export class WrappedPairData implements PairData {
  pair?: WrappedPair;
  id: string;
  instrumentAddr: string;
  expiry: number;
  APY24h: BigNumber;
  volume24h: BigNumber;
  volume24hUTC0: BigNumber;
  volume7d: BigNumber;
  priceChange24h: BigNumber;
  high24h: BigNumber;
  low24h: BigNumber;
  poolFee24h: BigNumber;
  constructor(value: PairData) {
    this.id = value.id;
    this.instrumentAddr = value.instrumentAddr;
    this.expiry = value.expiry;
    this.APY24h = BigNumber.from(value.APY24h);
    this.volume24h = BigNumber.from(value.volume24h);
    this.volume24hUTC0 = BigNumber.from(value.volume24hUTC0);
    this.volume7d = BigNumber.from(value.volume7d);
    this.priceChange24h = BigNumber.from(value.priceChange24h);
    this.high24h = BigNumber.from(value.high24h);
    this.low24h = BigNumber.from(value.low24h);
    this.poolFee24h = BigNumber.from(value.poolFee24h);
  }

  wrapAttribute(prop: keyof PairData): WrappedBigNumber {
    if (this[prop]) {
      return WrappedBigNumber.from(this[prop]);
    }
    return WrappedBigNumber.ZERO;
  }
  setPair(pair: WrappedPair): this {
    this.pair = pair;
    return this;
  }

  get adjustedHigh24(): WrappedBigNumber {
    let high24h = getAdjustTradePrice(this.high24h, this.pair?.rootInstrument.isInverse || false);
    if (this.pair?.fairPrice) {
      // set to current price if it is bigger then high24
      if (this.pair?.fairPrice.lt(high24h.wadValue)) {
        high24h = WrappedBigNumber.from(this.pair?.fairPrice);
      } else if (high24h.eq(0)) {
        high24h = WrappedBigNumber.from(this.pair?.fairPrice);
      }
    }
    return high24h;
  }

  get adjustedLow24(): WrappedBigNumber {
    let low24h = getAdjustTradePrice(this.low24h, this.pair?.rootInstrument.isInverse || false);
    if (this.pair?.fairPrice) {
      // set to current price if it is small then low24h
      if (this.pair?.fairPrice.gt(low24h.wadValue)) {
        low24h = WrappedBigNumber.from(this.pair?.fairPrice);
      } else if (low24h.eq(0)) {
        low24h = WrappedBigNumber.from(this.pair?.fairPrice);
      }
    }
    return low24h;
  }

  get displayChange24(): WrappedBigNumber {
    let change = this.wrapAttribute('priceChange24h');
    if (this.pair?.rootInstrument?.isInverse && change) {
      change = WrappedBigNumber.from(change).mul(-1);
    }
    return change;
  }

  get displayHigh24h(): WrappedBigNumber {
    const high24h = this.adjustedHigh24;

    if (this.pair?.rootInstrument?.isInverse) {
      return this.adjustedLow24;
    }
    return WrappedBigNumber.from(high24h);
  }

  get displayLow24h(): WrappedBigNumber {
    const low24h = this.adjustedLow24;

    if (this.pair?.rootInstrument?.isInverse) {
      return this.adjustedHigh24;
    }
    return WrappedBigNumber.from(low24h);
  }

  get displayAPY(): WrappedBigNumber {
    const apy = this.APY24h;
    return WrappedBigNumber.from(apy);
  }

  toJSON(): PairData {
    return {
      id: this.id,
      instrumentAddr: this.instrumentAddr,
      expiry: this.expiry,
      APY24h: this.APY24h,
      volume24h: this.volume24h,
      volume24hUTC0: this.volume24hUTC0,
      volume7d: this.volume7d,
      priceChange24h: this.priceChange24h,
      high24h: this.high24h,
      low24h: this.low24h,
      poolFee24h: this.poolFee24h,
    };
  }

  toString(): string {
    return JSON.stringify(this.toJSON());
  }
}

export function getEmptyPairFromInstrument(instrument: WrappedInstrument, expiry: number): WrappedPair {
  const pairId = getPairId(instrument.instrumentAddr, expiry);
  const chainId = instrument.chainId;
  let pair = WrappedPair.getInstance(pairId, chainId);
  if (!pair) {
    pair = WrappedPair.wrapInstance({
      rootInstrument: instrument,
      metaPair: {
        expiry: expiry,
        status: Status.DORMANT,
        markPrice: ZERO,
        instrumentId: instrument.id,
        id: pairId,
        instrumentAddr: instrument.instrumentAddr,
        totalLiquidity: ZERO,
        liquidity: ZERO,
        involvedFund: ZERO,
        openInterests: ZERO,
        feeIndex: ZERO,
        protocolFee: ZERO,
        totalLong: ZERO,
        totalShort: ZERO,
        longSocialLossIndex: ZERO,
        shortSocialLossIndex: ZERO,
        longFundingIndex: ZERO,
        shortFundingIndex: ZERO,
        insuranceFund: ZERO,
        sqrtPX96: ZERO,
        timestamp: 0,
        settlementPrice: ZERO,
        fairPrice: ZERO,
        tick: 0,

        blockInfo: instrument.blockInfo || { height: 0, timestamp: 0 },
      },
    });
  }

  return pair;
}
