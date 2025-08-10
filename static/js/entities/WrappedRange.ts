import { BlockInfo, CHAIN_ID } from '@derivation-tech/context';
import { BigNumber } from 'ethers';
import _ from 'lodash';

import { IMetaRange } from '@/types/account';
import { bigNumberObjectCheck } from '@/utils';

import { WrappedBigNumber } from './WrappedBigNumber';
import { WrappedInstrument } from './WrappedInstrument';
import { WrappedPair } from './WrappedPair';
import { WrappedPortfolio } from './WrappedPortfolio';

import { Range as RangeInterface, utils } from '@synfutures/sdks-perp';

export class WrappedRange implements RangeInterface {
  // basic fields
  liquidity: BigNumber;
  balance: BigNumber;
  sqrtEntryPX96: BigNumber;
  entryFeeIndex: BigNumber;
  tickLower: number;
  tickUpper: number;
  // redundant fields
  instrumentAddr: string;
  expiry: number;
  traderAddr: string;

  // additional fields
  rid: number;
  lowerPrice: BigNumber;
  upperPrice: BigNumber;
  entryPrice: BigNumber;

  blockInfo?: BlockInfo;

  static instances: { [chainId: number]: { [rangeId: string]: WrappedRange } } = {}; // chainId -> rangeId -> WrappedRange
  rootPortfolio: WrappedPortfolio;
  metaRange: IMetaRange;
  rootPair: WrappedPair;
  constructor(metaRange: IMetaRange, rootPortfolio: WrappedPortfolio) {
    this.balance = metaRange.balance;
    this.liquidity = metaRange.liquidity;
    this.sqrtEntryPX96 = metaRange.sqrtEntryPX96;
    this.entryFeeIndex = metaRange.entryFeeIndex;
    this.tickLower = metaRange.tickLower;
    this.tickUpper = metaRange.tickUpper;
    this.instrumentAddr = metaRange.instrumentAddr;
    this.expiry = metaRange.expiry;
    this.traderAddr = metaRange.traderAddr;
    this.rid = metaRange.rid;
    this.blockInfo = metaRange.blockInfo;
    this.lowerPrice = metaRange.lowerPrice;
    this.upperPrice = metaRange.upperPrice;
    this.entryPrice = metaRange.entryPrice;

    this.metaRange = metaRange;
    this.rootPortfolio = rootPortfolio;
    this.rootPair = rootPortfolio.rootPair;
  }

  static getInstance(positionId: string, chainId: CHAIN_ID | undefined): WrappedRange | undefined {
    return positionId && chainId ? _.get(WrappedRange.instances, [chainId, positionId]) : undefined;
  }

  static wrapInstance({
    metaRange,
    rootPortfolio,
  }: {
    metaRange: IMetaRange;
    rootPortfolio: WrappedPortfolio;
  }): WrappedRange {
    let instance = WrappedRange.getInstance(metaRange.id, rootPortfolio.rootPair.chainId);
    if (instance) {
      instance.fillField(bigNumberObjectCheck(metaRange));
    } else {
      instance = new WrappedRange(bigNumberObjectCheck(metaRange), rootPortfolio);
      _.set(WrappedRange.instances, [rootPortfolio.rootPair.chainId, metaRange.id], instance);
    }
    return instance;
  }

  static getInstanceMap(chainId: CHAIN_ID | undefined): { [positionId: string]: WrappedRange } | undefined {
    return chainId ? _.get(WrappedRange.instances, [chainId], undefined) : undefined;
  }

  setMetaData(metaRange: IMetaRange): void {
    this.balance = metaRange.balance;
    this.liquidity = metaRange.liquidity;
    this.sqrtEntryPX96 = metaRange.sqrtEntryPX96;
    this.entryFeeIndex = metaRange.entryFeeIndex;
    this.tickLower = metaRange.tickLower;
    this.tickUpper = metaRange.tickUpper;
    this.instrumentAddr = metaRange.instrumentAddr;
    this.expiry = metaRange.expiry;
    this.traderAddr = metaRange.traderAddr;
    this.rid = metaRange.rid;
    this.blockInfo = metaRange.blockInfo;
    this.lowerPrice = metaRange.lowerPrice;
    this.upperPrice = metaRange.upperPrice;
    this.entryPrice = metaRange.entryPrice;
    this.metaRange = metaRange;
  }

  fillField(partialPosition: Partial<IMetaRange>): void {
    const metaRange = _.merge({}, this.metaRange, bigNumberObjectCheck(partialPosition));
    this.metaRange = metaRange;
    this.setMetaData(metaRange);
  }
  wrapAttribute(prop: keyof WrappedRange): WrappedBigNumber {
    if (BigNumber.isBigNumber(this[prop])) {
      const bn = WrappedBigNumber.from(this[prop] as BigNumber);
      if (this.rootInstrument.isInverse) {
        // if (['size'].includes(prop)) {
        //   bn = bn.mul(-1);
        // }
        if (['lowerPrice', 'upperPrice'].includes(prop)) {
          // const price =
          //   prop === 'lowerPrice' ? WrappedBigNumber.from(this.upperPrice) : WrappedBigNumber.from(this.lowerPrice);
          // bn = getAdjustTradePrice(price, this.rootPair.isInverse);
        }
      }
      return bn;
    } else if (typeof this[prop] === 'string' || typeof this[prop] === 'number') {
      return WrappedBigNumber.from(this[prop] as unknown as string | number);
    }
    return WrappedBigNumber.ZERO;
  }

  /**
   * @returns {string} position id in the format of `${userAddr}-${instrumentAddr}-${expiry}-${rid}`
   */
  get id(): string {
    return this.metaRange.id.toLowerCase();
  }

  get rootInstrument(): WrappedInstrument {
    return this.rootPair.rootInstrument;
  }

  get valueLocked(): WrappedBigNumber {
    const value = utils.rangeValueLocked(this, this.rootPair);
    return WrappedBigNumber.from(value);
  }

  get upperPositionModelIfRemove() {
    const rawPosition = utils.rangeUpperPositionIfRemove(this, this.rootPair);
    const position = utils.factory.createPosition({
      ...rawPosition,
      instrumentAddr: this.instrumentAddr,
      expiry: this.expiry,
      traderAddr: this.traderAddr,
    });
    return position;
  }

  get lowerPositionModelIfRemove() {
    const rawPosition = utils.rangeLowerPositionIfRemove(this, this.rootPair);
    const position = utils.factory.createPosition({
      ...rawPosition,
      instrumentAddr: this.instrumentAddr,
      expiry: this.expiry,
      traderAddr: this.traderAddr,
    });
    return position;
  }

  get upperPositionLiquidationPrice() {
    return utils.positionLiquidationPrice(
      this.upperPositionModelIfRemove,
      this.rootPair,
      this.rootPair.rootInstrument.setting.maintenanceMarginRatio,
    );
  }

  get lowerPositionLiquidationPrice() {
    return utils.positionLiquidationPrice(
      this.lowerPositionModelIfRemove,
      this.rootPair,
      this.rootPair.rootInstrument.setting.maintenanceMarginRatio,
    );
  }

  get wrappedLowerLiqPrice(): WrappedBigNumber {
    return this.rootPair.isInverse
      ? // ? getAdjustTradePrice(this.upperPositionLiquidationPrice, this.rootPair.isInverse)
        WrappedBigNumber.from(this.upperPositionLiquidationPrice)
      : WrappedBigNumber.from(this.lowerPositionLiquidationPrice);
  }

  get wrappedUpperLiqPrice(): WrappedBigNumber {
    return this.rootPair.isInverse
      ? // ? getAdjustTradePrice(this.lowerPositionLiquidationPrice, this.rootPair.isInverse)
        WrappedBigNumber.from(this.lowerPositionLiquidationPrice)
      : WrappedBigNumber.from(this.upperPositionLiquidationPrice);
  }

  get wrappedLowerPosition() {
    return this.rootPair.isInverse ? this.upperPositionModelIfRemove : this.lowerPositionModelIfRemove;
  }

  get wrappedUpperPosition() {
    return this.rootPair.isInverse ? this.lowerPositionModelIfRemove : this.upperPositionModelIfRemove;
  }

  get feeEarned() {
    return utils.rangeFeeEarned(this, this.rootPair);
  }

  get isInverse(): boolean {
    return this.rootInstrument.isInverse;
  }

  toJSON(): IMetaRange {
    return this.metaRange;
  }

  toString(): string {
    return JSON.stringify(this.toJSON());
  }
}
